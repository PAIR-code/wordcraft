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

import {ContinuePromptParams} from '@core/shared/interfaces';
import {ContinueExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(text: string) {
    const prefix = model.getStoryPrefix();
    const suffix = 'Continue the story: ';

    return `${prefix} ${model.wrap(text)}\n${suffix} `;
  }

  function getPromptContext() {
    const examples = context.getExampleData<ContinueExample>(
      OperationType.CONTINUE
    );
    let promptContext = model.getPromptPreamble();
    examples.forEach(({input, target}) => {
      const prompt = generatePrompt(input);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  /** Return the actual prompt handler */
  return async function continuation(params: ContinuePromptParams) {
    const promptContext = getPromptContext();
    const prompt = generatePrompt(params.text);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
