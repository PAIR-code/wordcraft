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

import {shuffle} from '@lib/utils';
import {RewriteSentencePromptParams} from '@core/shared/interfaces';
import {RewriteSentenceExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function insertBlank(pre: string, post: string) {
    return `${pre}${model.getBlank()}${post}`;
  }

  function makePromptContext() {
    const examples = context.getExampleData<RewriteSentenceExample>(
      OperationType.REWRITE_SENTENCE
    );

    let promptContext = model.getPromptPreamble();
    const shuffled = shuffle(examples);
    for (let i = 0; i < shuffled.length; i++) {
      const example = shuffled[i];
      const {pre, post, toRewrite, howToRewrite, target} = example;

      const prompt = makePrompt(pre, post, toRewrite, howToRewrite);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    }

    return promptContext;
  }

  function makePrompt(
    pre: string,
    post: string,
    toRewrite: string,
    howToRewrite: string
  ) {
    const storyWithBlank = insertBlank(pre, post);
    const prefix = model.getStoryPrefix();
    const sentenceStatement = 'Sentence in the blank:';
    const sentenceInstruction = `Rewrite this sentence to ${howToRewrite}, only rewriting this specific sentence and nothing more:`;

    return `${prefix} ${model.wrap(
      storyWithBlank
    )}\n${sentenceStatement} ${model.wrap(toRewrite)}\n${sentenceInstruction}`;
  }

  return async function query(params: RewriteSentencePromptParams) {
    console.log('rewrite sentence');
    const {pre, post, toRewrite, howToRewrite} = params;
    const promptContext = makePromptContext();
    const prompt = makePrompt(pre, post, toRewrite, howToRewrite);
    const inputText = promptContext + prompt;

    return model.query(inputText);
  };
}
