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
/**
 * @fileoverview A set of utility functions for extracting data from an
 * OperationData interface, in order to move the functionality from the
 * operation relying on TextEditorService, CursorService, etc and simply use
 * the underlying OperationData.
 */

import {SerializedRange} from '@lib/mobiledoc';
import {parseSentences} from '@lib/parse_sentences';
import {
  BoundarySpan,
  getSentenceBoundaries,
  getSpanForOffset,
  SentenceSpan,
  TextSpan,
} from '@lib/sentence_boundaries';
import {OperationData} from '../shared/data';

/** Returns all text from the serialized OperationData */
export function getAllText(operationData: OperationData) {
  return operationData.text;
}

/** Returns the currently selected text in the serialized OperationData */
export function getSelectedText(operationData: OperationData) {
  const {text, cursorStart, cursorEnd} = operationData;
  return text.substring(cursorStart, cursorEnd);
}

/** Returns the text before the cursor in the serialized OperationData */
export function getTextBeforeCursor(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  return text.substring(0, cursorStart);
}

/** Returns the text after the cursor in the serialized OperationData */
export function getTextAfterCursor(operationData: OperationData) {
  const {text, cursorEnd} = operationData;
  return text.substring(cursorEnd);
}

/**
 * Returns the current paragraph and relative offset for raw text and an
 * absolute offset
 */
export function getCursorParagraphAndOffset(
  documentText: string,
  absoluteOffset: number
) {
  const paragraphs = getParagraphs(documentText);
  let paragraph = paragraphs[0];
  let offset = 0;
  let index = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    index = i;
    paragraph = paragraphs[index];

    const nextOffset = offset + paragraph.length + 1; // Account for newlines

    if (offset <= absoluteOffset && nextOffset > absoluteOffset) {
      return {paragraph, offset: absoluteOffset - offset, index};
    }

    offset = nextOffset;
  }

  return {paragraph, offset: 0, index};
}

/**
 * Gets all paragraphs from raw text.
 */
export function getParagraphs(text: string) {
  return text.split('\n');
}

/**
 * Adjusts a TextSpan, which is relative to a paragraph to a TextSpan that's
 * relative to the entire text.
 */
export function makeDocumentTextSpan(
  span: TextSpan,
  text: string,
  paragraphIndex: number
) {
  const paragraphs = getParagraphs(text);
  let offset = 0;
  for (let i = 0; i < paragraphIndex; i++) {
    offset += paragraphs[i].length + 1; // Account for the newline
  }
  return {start: span.start + offset, end: span.end + offset};
}

/**
 * Returns the dcoument span for the sentence the cursor is over.
 */
export function getCurrentSpan(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  const {
    paragraph,
    index: paragraphIndex,
    offset,
  } = getCursorParagraphAndOffset(text, cursorStart);
  const spans = getSentenceBoundaries(paragraph);
  const {span} = getSpanForOffset(spans, offset);
  return makeDocumentTextSpan(span, text, paragraphIndex);
}

/**
 * Returns the dcoument sentence span before the cursor
 */
export function getSentenceSpanBeforeCursor(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  const {
    paragraph,
    index: paragraphIndex,
    offset,
  } = getCursorParagraphAndOffset(text, cursorStart);
  const spans = getSentenceBoundaries(paragraph);
  const {span, index} = getSpanForOffset(spans, offset);
  if (span instanceof SentenceSpan) {
    return makeDocumentTextSpan(spans[index], text, paragraphIndex);
  } else {
    return makeDocumentTextSpan(spans[index - 1], text, paragraphIndex);
  }
}

/**
 * Returns the span after the sentence the cursor is over.
 */
export function getNextBoundarySpan(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  const {
    paragraph,
    index: paragraphIndex,
    offset,
  } = getCursorParagraphAndOffset(text, cursorStart);
  const spans = getSentenceBoundaries(paragraph);
  const {span, index} = getSpanForOffset(spans, offset);
  if (span instanceof BoundarySpan) {
    return makeDocumentTextSpan(spans[index], text, paragraphIndex);
  } else {
    return makeDocumentTextSpan(spans[index + 1], text, paragraphIndex);
  }
}

/**
 * Returns the sentence the cursor is over.
 */
export function getCurrentSentence(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  const {paragraph, offset} = getCursorParagraphAndOffset(text, cursorStart);
  const spans = getSentenceBoundaries(paragraph);
  const {span} = getSpanForOffset(spans, offset);
  return paragraph.slice(span.start, span.end);
}

/**
 * Returns text for a given range
 */
export function getTextForRange(
  operationData: OperationData,
  serializedRange: SerializedRange
) {
  const {text} = operationData;
  const paragraphs = getParagraphs(text);
  const [startIndex, startOffset] = serializedRange.head;
  const [endIndex, endOffset] = serializedRange.tail;

  const textSpans: string[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const paragraph = paragraphs[i];
    if (i === startIndex && i === endIndex) {
      textSpans.push(paragraph.substring(startOffset, endOffset));
    } else if (i === startIndex) {
      textSpans.push(paragraph.substring(startOffset));
    } else if (i === endIndex) {
      textSpans.push(paragraph.substring(0, endIndex));
    } else {
      textSpans.push(paragraph);
    }
  }
  return textSpans.join('\n');
}

/**
 * Gets the relative cursor offset within the current sentence.
 */
export function getCurrentSentenceOffset(operationData: OperationData) {
  const {text, cursorStart} = operationData;
  const {paragraph, offset} = getCursorParagraphAndOffset(text, cursorStart);
  const spans = getSentenceBoundaries(paragraph);
  const {span} = getSpanForOffset(spans, offset);

  const sentenceOffset = offset - span.start;
  return sentenceOffset;
}

/**
 * Trims a piece of text to n sentences, starting at the beginning.
 */
export function clipSentencesFromStart(text: string, nSentences: number) {
  const sentences = parseSentences(text);
  return sentences.slice(0, nSentences).join('');
}

/**
 * Trims a piece of text to n sentences, starting at the end.
 */
export function clipSentencesFromEnd(text: string, nSentences: number) {
  const sentences = parseSentences(text);
  const index = Math.max(0, sentences.length - 1 - nSentences);
  return sentences.slice(index).join('');
}
