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
import {Examples} from './examples/base';

import {
  continueExamples,
  elaborateExamples,
  firstSentenceExamples,
  freeformExamples,
  generateWithinSentenceExamples,
  metaPromptExamples,
  newStoryExamples,
  nextSentenceExamples,
  replaceExamples,
  rewriteEndOfSentenceExamples,
  rewriteSelectionExamples,
  rewriteSentenceExamples,
  suggestRewriteSentenceExamples,
} from './examples/index';

import {OperationType} from '../core/shared/types';

export class WordcraftContext {
  constructor() {
    this.registerExamples(OperationType.CONTINUE, continueExamples);
    this.registerExamples(OperationType.ELABORATE, elaborateExamples);
    this.registerExamples(OperationType.FIRST_SENTENCE, firstSentenceExamples);
    this.registerExamples(OperationType.FREEFORM, freeformExamples);
    this.registerExamples(
      OperationType.GENERATE_WITHIN_SENTENCE,
      generateWithinSentenceExamples
    );
    this.registerExamples(OperationType.META_PROMPT, metaPromptExamples);
    this.registerExamples(OperationType.NEW_STORY, newStoryExamples);
    this.registerExamples(OperationType.NEXT_SENTENCE, nextSentenceExamples);
    this.registerExamples(OperationType.REPLACE, replaceExamples);
    this.registerExamples(
      OperationType.REWRITE_END_OF_SENTENCE,
      rewriteEndOfSentenceExamples
    );
    this.registerExamples(
      OperationType.REWRITE_SELECTION,
      rewriteSelectionExamples
    );
    this.registerExamples(
      OperationType.REWRITE_SENTENCE,
      rewriteSentenceExamples
    );
    this.registerExamples(
      OperationType.SUGGEST_REWRITE,
      suggestRewriteSentenceExamples
    );
  }

  private readonly examples = new Map<OperationType, Examples<any>>();
  private registerExamples<T>(
    operationType: OperationType,
    examples: Examples<T>
  ) {
    this.examples.set(operationType, examples);
  }

  getExampleData<T>(operationType: OperationType, ...args: any[]): T[] {
    if (!this.examples.has(operationType)) {
      throw new Error(
        `No examples registered for operation (${operationType})`
      );
    }
    const examples = this.examples.get(operationType) as Examples<T>;
    return examples.getExampleData(...args);
  }

  get documentType() {
    return 'story';
  }
}
