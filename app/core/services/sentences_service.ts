/**
 * @license
 *
 * Copyright 2023 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==============================================================================
 */
import * as Mobiledoc from 'mobiledoc-kit';
import {computed, decorate, observable} from 'mobx';

import {SerializedRange} from '@lib/mobiledoc';
import {parseSentences} from '@lib/parse_sentences';
import {
  getSentenceBoundaries,
  getSpanForOffset,
  ParagraphData,
  SentenceSpan,
} from '@lib/sentence_boundaries';
import {CursorService, TextEditorService} from './services';

import {Service} from './service';

export interface ServiceProvider {
  cursorService: CursorService;
  textEditorService: TextEditorService;
}

/**
 * Service for tracking sentence boundaries and managing edits to those
 * boundaries, in order to best understand the intent of the author when
 * they're writing text.
 */
export class SentencesService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get cursorService() {
    return this.serviceProvider.cursorService;
  }

  private get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  paragraphData: ParagraphData[] = [];
  initialized = false;

  get currentSentence(): string {
    if (!this.cursorSpan) return '';
    return this.isCursorWithinSentence ? this.cursorSpan.span.text : '';
  }

  get currentSentenceSerializedRange(): SerializedRange | null {
    if (!this.isCursorWithinSentence) return null;
    const sectionIndex = this.cursorService.currentSectionIndex;
    if (!this.cursorSpan) return null;
    const {start, end} = this.cursorSpan.span;

    return {
      head: [sectionIndex, start],
      tail: [sectionIndex, end],
      direction: 1,
    };
  }

  get currentSentenceIndex(): number {
    if (!this.isCursorWithinSentence) return -1;
    const paragraphData = this.getParagraphDataAtCursor();
    if (paragraphData == null) return -1;

    let index = 0;
    for (const span of paragraphData.sentenceSpans) {
      if (this.cursorSpan && this.cursorSpan.span === span) {
        return index;
      }
      if (span instanceof SentenceSpan) {
        index += 1;
      }
    }

    return -1;
  }

  getSentenceBeforeCursor(): string {
    const paragraphData = this.getParagraphDataAtCursor();
    if (paragraphData == null) return '';

    let previousSentence = '';
    for (const span of paragraphData.sentenceSpans) {
      if (this.cursorSpan && this.cursorSpan.span === span) {
        return previousSentence;
      }
      if (span instanceof SentenceSpan) {
        previousSentence = span.text;
      }
    }

    return '';
  }

  get cursorSpan() {
    const paragraph = this.getParagraphDataAtCursor();
    if (!paragraph) return null;

    const offset = this.cursorService.cursorOffset;
    const {sentenceSpans} = paragraph;

    return getSpanForOffset(sentenceSpans, offset);
  }

  get isLastCursorSpan() {
    const {cursorSpan} = this;
    if (cursorSpan == null) return false;
    const paragraph = this.getParagraphDataAtCursor();
    if (paragraph == null) return false;
    return cursorSpan.index === paragraph.sentenceSpans.length - 1;
  }

  get isFirstCursorSpan() {
    const {cursorSpan} = this;
    if (cursorSpan == null) return false;
    return cursorSpan.index === 0;
  }

  /**
   * Computes whether or not the cursor is in a position fully inside of a
   * sentence, or whether it's on the boundary.
   */
  get isCursorWithinSentence() {
    const {cursorSpan} = this;
    if (cursorSpan == null) return false;

    return cursorSpan.span instanceof SentenceSpan;
  }

  /**
   * Computes whether the cursor is actually between sentences and not at the
   * beginning or the end of the paragraph.
   */
  get isCursorBetweenSentences() {
    return (
      !this.isCursorWithinSentence &&
      !this.isLastCursorSpan &&
      !this.isFirstCursorSpan
    );
  }

  /**
   * If the cursor is within a sentence, the next position to generate at is at
   * the end of that sentence. Otherwise, it's where the cursor is (either in
   * between or at the start/end) of a sentence.
   */
  get nextSentenceOffset() {
    const {serializedRange} = this.cursorService;
    if (this.isCursorWithinSentence && this.cursorSpan != null) {
      const {span} = this.cursorSpan;
      return span.end;
    } else {
      return serializedRange.head[1];
    }
  }

  getNextSentenceRange(): Mobiledoc.Range {
    const offset = this.nextSentenceOffset;
    const sectionIndex = this.cursorService.currentSectionIndex;

    const serialized = {
      head: [sectionIndex, offset] as [number, number],
      tail: [sectionIndex, offset] as [number, number],
      direction: 1,
    };

    return this.cursorService.makeMobiledocRangeFromSerialized(serialized);
  }

  getCurrentSentenceRange(): Mobiledoc.Range {
    const {currentSentenceSerializedRange} = this;
    return this.cursorService.makeMobiledocRangeFromSerialized(
      currentSentenceSerializedRange
    );
  }

  initialize() {
    this.processText();

    if (this.initialized === true) {
      return;
    }

    this.textEditorService.onUpdate(() => {
      // We'll eventuall refactor sentence parsing / tracking logic to be
      // handled on updates to the text, rather than handled on cursor change.
      this.processText();
    });

    this.initialized = true;
  }

  getSentencesForSection(sectionIndex: number): string[] {
    const paragraphs = this.textEditorService.getParagraphs();
    const paragraph = paragraphs[sectionIndex];
    return parseSentences(paragraph);
  }

  private stringEquals(a: string, b: string) {
    return a.length === b.length && a === b;
  }

  // Helps eliminate mobx out-of-bounds read errors on the observable
  // paragraph.
  private getParagraphDataAtIndex(i: number) {
    return i <= this.paragraphData.length - 1
      ? this.paragraphData[i]
      : undefined;
  }

  private getParagraphDataAtCursor() {
    const {serializedRange, isCursorCollapsed} = this.cursorService;
    if (!serializedRange) return null;
    if (!isCursorCollapsed) return null;

    const [sectionIndex] = serializedRange.head;
    const paragraph = this.getParagraphDataAtIndex(sectionIndex);
    return paragraph || null;
  }

  private processText() {
    const textParagraphs = this.textEditorService.getParagraphs();

    // We're going to update the sentence boundary data every time we make a
    // change to a paragraph.
    this.paragraphData = textParagraphs.map((text, paragraphIndex) => {
      const existing = this.getParagraphDataAtIndex(paragraphIndex);
      if (!existing || !this.stringEquals(existing.text, text)) {
        const sentenceSpans = getSentenceBoundaries(text);
        return {sentenceSpans, text};
      }
      return existing;
    });
  }

  /**
   * Attempt to highlight the sentence that the cursor is currently in.
   * We need to pass in a serialized range because we're using this method
   * right after setting the state of the editor, which nullifies the post on
   * the last range object from the old post, and this causes a few downstream
   * errors.
   */
  highlightCurrentSentence() {
    const {isCursorCollapsed, serializedRange} = this.cursorService;
    const {isCursorWithinSentence} = this;

    this.textEditorService.clearCurrentSentenceHighlight();

    if (isCursorCollapsed && isCursorWithinSentence) {
      if (!this.currentSentenceSerializedRange) return;
      const {head, tail} = this.currentSentenceSerializedRange;

      const [sectionIndex, currentSentenceStart] = head;
      const [, currentSentenceEnd] = tail;

      const markupSerializedRange = {
        head: [sectionIndex, currentSentenceStart] as [number, number],
        tail: [sectionIndex, currentSentenceEnd] as [number, number],
        direction: serializedRange.direction,
      };
      const markupRange = this.cursorService.makeMobiledocRangeFromSerialized(
        markupSerializedRange
      );

      this.textEditorService.setCurrentSentenceHighlight(markupRange);
    }

    // Reset the cursor from the serialized range
    const cursorRange =
      this.cursorService.makeMobiledocRangeFromSerialized(serializedRange);
    this.textEditorService.setCursorRange(cursorRange);
  }
}

decorate(SentencesService, {
  cursorSpan: computed,
  currentSentence: computed,
  currentSentenceIndex: computed,
  currentSentenceSerializedRange: computed,
  nextSentenceOffset: computed,
  paragraphData: observable.shallow,
});
