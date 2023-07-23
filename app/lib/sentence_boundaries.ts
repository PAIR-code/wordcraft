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
 * @fileoverview A suite of pure functions meant to aid in processing sentence
 * boundaries.
 */

import {isWhitespaceOnly, parseSentences} from '@lib/parse_sentences';

/**
 * A class that describes the sentence boundaries in a paragraph of text.
 * It can either represent a sentence or the space between two sentences.
 */
export class TextSpan {
  constructor(public text: string, public start: number, public end: number) {}
}

/** A span of text consisting of a sentence */
export class SentenceSpan extends TextSpan {
  constructor(text: string, start: number, end: number, isOpen = false) {
    super(text, start, end);
  }
}

/** A span of text between sentences */
export class BoundarySpan extends TextSpan {
  constructor(text: string, start: number, end: number) {
    super(text, start, end);
  }
}

/** ParagraphData representes a collection of processed paragraphs */
export interface ParagraphData {
  text: string;
  sentenceSpans: TextSpan[];
}

/**
 * A function that parses plain text into ParagraphData, representing the
 * spans covering sentences and the boundaries between them.
 */
export function getSentenceBoundaries(text: string): TextSpan[] {
  const sentences = parseSentences(text);

  const sentenceSpans: TextSpan[] = [];

  let currentSentenceStart = 0;
  let currentSentenceEnd = 0;
  let currentSentence: string;

  if (isWhitespaceOnly(text) || text.length === 0) {
    sentenceSpans.push(new BoundarySpan(text, 0, text.length));
  }

  for (let i = 0; i < sentences.length; i++) {
    const isLastSentence = i === sentences.length - 1;
    currentSentence = sentences[i];
    const sentenceLength = currentSentence.length;
    currentSentenceEnd += sentenceLength;

    // In order to determine whether we're inside of sentence, we'll need to
    // find the "true" sentence bounds by trimming off any leading or trailing
    // whitespace.
    const whitespaceFront = currentSentence.search(/\S|$/);
    const whitespaceBack = currentSentence
      .split('')
      .reverse()
      .join('')
      .search(/\S|$/);

    // Add in any empty bounds in the front of the parsed sentence
    if (whitespaceFront || i === 0) {
      const start = currentSentenceStart;
      const end = currentSentenceStart + whitespaceFront;
      const range = new BoundarySpan(text.slice(start, end), start, end);
      sentenceSpans.push(range);
    }

    // Add the parsed sentence. The final sentence is a special case - we need
    // a way to tell if the sentence is unfinished - we do this by appending a
    // phrase with punctuation to the end of the string and reparsing. If it
    // parses as two sentences then we know that our text is still open and
    // hasn't been completed as a sentence.

    let isOpen = false;
    if (isLastSentence) {
      const sentencePlus = currentSentence + ' and a few more things.';
      const sentencePlusParsed = parseSentences(sentencePlus);
      isOpen = sentencePlusParsed.length === 1;
    }

    const start = currentSentenceStart + whitespaceFront;
    const end = currentSentenceEnd - whitespaceBack;
    const range = new SentenceSpan(text.slice(start, end), start, end, isOpen);
    sentenceSpans.push(range);

    if (whitespaceBack || isLastSentence) {
      const start = currentSentenceEnd - whitespaceBack;
      const end = currentSentenceEnd;
      const range = new BoundarySpan(text.slice(start, end), start, end);
      sentenceSpans.push(range);
    }

    currentSentenceStart += sentenceLength;
  }

  return sentenceSpans;
}

/**
 * Gets the TextSpan that contains a given offset.
 */
export function getSpanForOffset(spans: TextSpan[], offset: number) {
  for (let index = 0; index < spans.length; index++) {
    const span = spans[index];
    const {start, end} = span;
    if (offset === start && offset === end) {
      return {index, span};
    } else if (
      offset >= start &&
      offset <= end &&
      span instanceof BoundarySpan
    ) {
      return {index, span};
    } else if (
      offset >= start &&
      offset < end &&
      span instanceof SentenceSpan
    ) {
      return {index, span};
    }
  }

  const index = spans.length - 1;
  return {index, span: spans[index]};
}
