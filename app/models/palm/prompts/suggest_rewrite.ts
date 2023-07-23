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

import {SuggestRewritePromptParams} from '@core/shared/interfaces';
import {SuggestRewriteExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {TextType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(text: string, toRewrite: string) {
    const prefix = model.getStoryPrefix();
    const instruction = `Here's the sentence to rewrite: `;

    const storyText = `${prefix} ${model.wrap(
      text
    )}\n${instruction} ${model.wrap(toRewrite)}`;

    return `${storyText}\nHere's a suggested way to rewrite: `;
  }

  function makePromptContext(textType: TextType) {
    const examples = context.getExampleData<SuggestRewriteExample>(
      OperationType.SUGGEST_REWRITE
    );

    let promptContext = model.getPromptPreamble();
    examples.forEach(({text, sizes}) => {
      const {target, toRewrite} = sizes[textType];
      const prompt = generatePrompt(text, toRewrite);

      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });

    return promptContext;
  }

  return async function suggestRewritePrompt(
    params: SuggestRewritePromptParams
  ) {
    const {text, toRewrite, textType} = params;

    const promptContext = makePromptContext(textType);

    const prompt = generatePrompt(text, toRewrite);
    const modelParams = {};
    const shouldParse = false;
    const inputText = promptContext + prompt;
    const results = await model.query(inputText, modelParams, shouldParse);

    return model.parseResults(results);
  };
}
