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
import {OperationData} from '../shared/data';
import {
  ContinuePromptParams,
  ElaboratePromptParams,
  FirstSentencePromptParams,
  FreeformPromptParams,
  GenerateWithinSentencePromptParams,
  MetaPromptPromptParams,
  NextSentencePromptParams,
  ReplacePromptParams,
  RewriteEndOfSentencePromptParams,
  RewriteSelectionPromptParams,
  RewriteSentencePromptParams,
} from '../shared/interfaces';

import * as helpers from './helpers';

const LOOKAHEAD = true;

/**
 * An OperationDataProcessor parses raw serializable OperationData objects into
 * the parameters needed for constructing model prompts.
 */
export class OperationDataProcessor {
  constructor(private readonly tokenLimit = 1000) {}

  /** Assume that the average word consists of N_TOKENS_PER_WORD tokens */
  get wordLimit(): number {
    const N_TOKENS_PER_WORD = 1.75;
    return Math.floor(this.tokenLimit / N_TOKENS_PER_WORD);
  }

  get ellipsis(): string {
    return '...';
  }

  private truncateBeginning(text: string, wordLimit = this.wordLimit) {
    const words = text.split(' ');
    const start = words.length - wordLimit;
    if (start > 0) {
      const truncated = words.slice(start).join(' ');
      return this.ellipsis + truncated;
    }
    return text;
  }

  private truncateEnd(text: string, wordLimit = this.wordLimit) {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      const truncated = words.slice(0, wordLimit).join(' ');
      return truncated + this.ellipsis;
    }
    return text;
  }

  private getTruncatedBeforeAndAfter(beforeText: string, afterText: string) {
    const nWordsBefore = beforeText.split(' ').length;
    const nWordsAfter = afterText.split(' ').length;

    const halfLimit = Math.floor(this.wordLimit / 2);

    // If both directions exceed the halfLimit, truncate both to the half limit.
    // If one direction exceeds the halfLimit, truncate it but with the extra
    // words from the other direction.
    if (nWordsBefore > halfLimit && nWordsAfter > halfLimit) {
      const beforeTruncated = this.truncateBeginning(beforeText, halfLimit);
      const afterTruncated = this.truncateEnd(afterText, halfLimit);
      return {before: beforeTruncated, after: afterTruncated};
    } else if (nWordsBefore > halfLimit && nWordsAfter <= halfLimit) {
      const delta = halfLimit - nWordsAfter;
      const beforeTruncated = this.truncateBeginning(
        beforeText,
        halfLimit + delta
      );
      return {before: beforeTruncated, after: afterText};
    } else if (nWordsAfter > halfLimit && nWordsBefore <= halfLimit) {
      const delta = halfLimit - nWordsBefore;
      const afterTruncated = this.truncateEnd(afterText, halfLimit + delta);
      return {before: beforeText, after: afterTruncated};
    }
    return {before: beforeText, after: afterText};
  }

  private truncateAroundCursor(operationData: OperationData) {
    const beforeText = helpers.getTextBeforeCursor(operationData);
    const afterText = helpers.getTextAfterCursor(operationData);
    const {before, after} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );
    return before + after;
  }

  continue(operationData: OperationData): ContinuePromptParams {
    const text = helpers.getTextBeforeCursor(operationData);
    return {text: this.truncateBeginning(text)};
  }

  elaborate(operationData: OperationData): ElaboratePromptParams {
    const toElaborate = helpers.getSelectedText(operationData);
    const text = helpers.getAllText(operationData);

    return {toElaborate, text};
  }

  firstSentence(operationData: OperationData): FirstSentencePromptParams {
    const span = helpers.getCurrentSpan(operationData);
    const post = operationData.text.slice(span.end);

    const text = LOOKAHEAD ? post : '';
    const truncated = this.truncateEnd(text);
    return {text: truncated};
  }

  freeform(
    operationData: OperationData,
    controls: {instruction: string}
  ): FreeformPromptParams {
    const text = this.truncateAroundCursor(operationData);
    const {instruction} = controls;
    return {text, instruction};
  }

  generateWithinSentence(
    operationData: OperationData
  ): GenerateWithinSentencePromptParams {
    const currentSentence = helpers.getCurrentSentence(operationData);
    const sentenceOffset = helpers.getCurrentSentenceOffset(operationData);

    const beginningOfSentence = currentSentence.substring(0, sentenceOffset);
    const endOfSentence = currentSentence.substring(sentenceOffset);

    const beforeCursor = helpers.getTextBeforeCursor(operationData);
    const afterCursor = helpers.getTextAfterCursor(operationData);

    const beforeText = beforeCursor;
    const afterText = LOOKAHEAD ? afterCursor : endOfSentence;

    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {pre, post, beginningOfSentence, endOfSentence};
  }

  metaPrompt(operationData: OperationData): MetaPromptPromptParams {
    const text = this.truncateAroundCursor(operationData);
    return {text};
  }

  nextSentence(operationData: OperationData): NextSentencePromptParams {
    const nextBoundarySpan = helpers.getNextBoundarySpan(operationData);
    const previousSentenceSpan =
      helpers.getSentenceSpanBeforeCursor(operationData);
    const {text} = operationData;

    const beforeText = text.substring(0, nextBoundarySpan.start);
    let afterText = text.substring(nextBoundarySpan.end);
    const previousSentence = text.substring(
      previousSentenceSpan.start,
      previousSentenceSpan.end
    );

    afterText = LOOKAHEAD ? afterText : '';
    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {pre, post, previousSentence};
  }

  replace(
    operationData: OperationData,
    controls: {nWords: number}
  ): ReplacePromptParams {
    const beforeText = helpers.getTextBeforeCursor(operationData);
    const afterText = helpers.getTextAfterCursor(operationData);

    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {pre, post, nWords: controls.nWords};
  }

  rewriteEndOfSentence(
    operationData: OperationData
  ): RewriteEndOfSentencePromptParams {
    const {text} = operationData;
    const currentSentence = helpers.getCurrentSentence(operationData);
    const sentenceOffset = helpers.getCurrentSentenceOffset(operationData);

    const beginningOfSentence = currentSentence.substring(0, sentenceOffset);

    const sentenceSpan = helpers.getCurrentSpan(operationData);
    const afterCurrentSentence = text.substring(sentenceSpan.end);

    const beforeText = helpers.getTextBeforeCursor(operationData);
    const afterText = LOOKAHEAD ? afterCurrentSentence : '';

    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {pre, post, beginningOfSentence};
  }

  rewriteSelection(
    operationData: OperationData,
    controls: {
      howToRewrite: string;
    }
  ): RewriteSelectionPromptParams {
    /** How much to clip the context by, in sentences */
    const SENTENCE_CLIP = 2;

    let beforeText = helpers.getTextBeforeCursor(operationData);
    beforeText = helpers.clipSentencesFromEnd(beforeText, SENTENCE_CLIP);

    let afterText = helpers.getTextAfterCursor(operationData);
    afterText = helpers.clipSentencesFromStart(afterText, SENTENCE_CLIP);

    const toRewrite = helpers.getSelectedText(operationData);

    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {
      pre,
      post,
      toRewrite,
      howToRewrite: controls.howToRewrite,
    };
  }

  rewriteSentence(
    operationData: OperationData,
    controls: {
      howToRewrite: string;
    }
  ): RewriteSentencePromptParams {
    const {text} = operationData;
    const toRewrite = helpers.getCurrentSentence(operationData);
    const sentenceSpan = helpers.getCurrentSpan(operationData);
    const beforeText = text.slice(0, sentenceSpan.start);
    const afterText = text.slice(sentenceSpan.end);

    const {before: pre, after: post} = this.getTruncatedBeforeAndAfter(
      beforeText,
      afterText
    );

    return {
      pre,
      post,
      toRewrite,
      howToRewrite: controls.howToRewrite,
    };
  }
}
