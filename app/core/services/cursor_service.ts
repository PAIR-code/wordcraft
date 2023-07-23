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

import {
  findMobiledocSectionAtIndex,
  findMobiledocSectionIndex,
  SerializedRange,
} from '@lib/mobiledoc';
import {SentencesService, TextEditorService} from './services';

import {Service} from './service';

interface ServiceProvider {
  sentencesService: SentencesService;
  textEditorService: TextEditorService;
}
/**
 * CursorService is a sister class to TextEditorService which is used to handle
 * all cursor tracking related logic.
 */
export class CursorService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get sentencesService() {
    return this.serviceProvider.sentencesService;
  }

  private get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  selectedText = '';

  get isCursorCollapsed() {
    const {head, tail} = this.serializedRange;
    return head[0] === tail[0] && head[1] === tail[1];
  }

  get isCursorSelection() {
    return !this.isCursorCollapsed;
  }

  get isCursorInOneSection(): boolean {
    const {head, tail} = this.serializedRange;
    return head[0] === tail[0];
  }

  get isCursorInMiddle() {
    const {
      isCursorCollapsed,
      isCurrentSectionEmpty,
      isCursorAtEndOfSection,
      isCursorAtStartOfSection,
    } = this;

    if (!isCursorCollapsed || isCurrentSectionEmpty) {
      return false;
    }

    return !isCursorAtStartOfSection && !isCursorAtEndOfSection;
  }

  get isCursorAtEndOfText() {
    const {currentSectionIndex, isCursorAtEndOfSection} = this;
    const nParagraphs = this.textEditorService.getParagraphs().length;
    const isLastSection = nParagraphs - 1 === currentSectionIndex;
    return isCursorAtEndOfSection && isLastSection;
  }

  get isCurrentSectionEmpty() {
    const sectionIndex = this.serializedRange.head[0];
    const paragraphs = this.textEditorService.getParagraphs();
    return paragraphs[sectionIndex].length === 0;
  }

  get isCursorAtEndOfSection() {
    return this.isCursorCollapsed && this.sentencesService.isLastCursorSpan;
  }

  get isCursorAtStartOfSection() {
    return this.isCursorCollapsed && this.sentencesService.isFirstCursorSpan;
  }

  get currentSectionIndex() {
    if (this.isCursorCollapsed) {
      const {serializedRange} = this;
      const [sectionIndex] = serializedRange.head;
      return sectionIndex;
    }
    return -1;
  }

  get cursorOffset() {
    return this.isCursorCollapsed ? this.serializedRange.head[1] : 0;
  }

  private getOffsetFromSerializedPosition(
    serializedPosition: [number, number]
  ) {
    const paragraphs = this.textEditorService.getParagraphs();
    const [paragraphIndex, paragraphOffset] = serializedPosition;
    let offset = 0;
    for (let i = 0; i < paragraphIndex; i++) {
      offset += paragraphs[i].length + 1; // account for the newline in between
    }
    offset += paragraphOffset;
    return offset;
  }

  getOffsetRange() {
    const {head, tail} = this.serializedRange;
    const start = this.getOffsetFromSerializedPosition(head);
    const end = this.getOffsetFromSerializedPosition(tail);
    return {start, end};
  }

  /**
   * Because we're using serialized state to reset the text editor, we can't
   * just track the range object because it has pointers to the original
   * document that it exists in. Therefore we'll maintain it as a serialized
   * range and convert back and forth as we update our document.
   */
  serializedRange: SerializedRange = makeEmptySerializedRange();
  setSerializedRange(serializedRange: SerializedRange) {
    this.serializedRange = serializedRange;
  }
  getSerializedRange() {
    return this.serializedRange;
  }

  getMobiledocRange(): Mobiledoc.Range {
    const {serializedRange: lastSerializedRange} = this;
    return lastSerializedRange
      ? this.makeMobiledocRangeFromSerialized(lastSerializedRange)
      : Mobiledoc.Range.blankRange();
  }
  setRangeFromMobiledoc(range: Mobiledoc.Range | null) {
    if (range) {
      this.serializedRange =
        this.textEditorService.makeSerializedRangeFromMobileDoc(range);
    } else {
      this.serializedRange = makeEmptySerializedRange();
    }
  }

  makeMobiledocRangeFromSerialized(
    serializedRange: SerializedRange | null
  ): Mobiledoc.Range {
    if (!serializedRange) return Mobiledoc.Range.blankRange();

    const editor = this.textEditorService.getEditor();
    try {
      const {head, tail, direction} = serializedRange;
      const [headSectionIndex, headOffset] = head;
      const [tailSectionIndex, tailOffset] = tail;

      const headSection = findMobiledocSectionAtIndex(
        editor.post,
        headSectionIndex
      );
      const tailSection = findMobiledocSectionAtIndex(
        editor.post,
        tailSectionIndex
      );

      const headPosition = headSection.toPosition(headOffset);
      const tailPosition = tailSection.toPosition(tailOffset);

      const range = headPosition.toRange(tailPosition);
      range.direction = direction;

      return range;
    } catch (err: unknown) {
      console.error(err);
      return Mobiledoc.Range.blankRange();
    }
  }

  getPreAndPostPositionText(position: Mobiledoc.Position) {
    const range = new Mobiledoc.Range(position, position);
    return this.getPreAndPostSelectionText(range);
  }

  getPreAndPostSelectionText(
    selectionRange: Mobiledoc.Range
  ): [string, string] {
    const plainText = this.textEditorService.getPlainText();
    const paragraphs = this.textEditorService.getParagraphs();
    let computedHeadOffset = plainText.length;
    let computedTailOffset = computedHeadOffset;
    if (selectionRange !== null) {
      if (!selectionRange.head || !selectionRange.tail) return ['', ''];
      // Compute the offset to take into consideration the sections (which are
      // separated by newlines)...
      const headSection = selectionRange.head.section;
      const tailSection = selectionRange.tail.section;
      const headSectionIndex = findMobiledocSectionIndex(
        headSection.post,
        headSection
      );
      const tailSectionIndex = findMobiledocSectionIndex(
        tailSection.post,
        tailSection
      );

      computedHeadOffset = 0;
      for (let i = 0; i < headSectionIndex; i++) {
        computedHeadOffset += paragraphs[i].length + 1; // For the newline
      }
      computedHeadOffset += selectionRange.head.offset;

      computedTailOffset = 0;
      for (let i = 0; i < tailSectionIndex; i++) {
        computedTailOffset += paragraphs[i].length + 1; // For the newline
      }
      computedTailOffset += selectionRange.tail.offset;
    }

    const preText = plainText.slice(0, computedHeadOffset);
    const postText = plainText.slice(computedTailOffset);
    return [preText, postText];
  }
}

function makeEmptySerializedRange(): SerializedRange {
  return {head: [0, 0], tail: [0, 0], direction: 1};
}

decorate(CursorService, {
  currentSectionIndex: computed,
  cursorOffset: computed,
  isCursorAtEndOfSection: computed,
  isCursorAtStartOfSection: computed,
  isCurrentSectionEmpty: computed,
  isCursorInOneSection: computed,
  isCursorInMiddle: computed,
  isCursorAtEndOfText: computed,
  selectedText: observable,
  serializedRange: observable,
});
