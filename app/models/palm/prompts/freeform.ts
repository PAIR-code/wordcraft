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
import {FreeformPromptParams} from '@core/shared/interfaces';
import {FreeformExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function getPromptContext() {
    const examples = context.getExampleData<FreeformExample>(
      OperationType.FREEFORM
    );
    const selected = shuffle(examples).slice(0, 4);
    let promptContext = model.getPromptPreamble();
    selected.forEach((example: FreeformExample) => {
      const prefix = example.prefix;
      const instruction = example.instruction;
      const {text, target} = example;

      promptContext += `${prefix} ${model.wrap(
        text
      )}\n${instruction} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  function generatePrompt(text: string, instruction: string) {
    const prefix = model.getStoryPrefix();
    return `${prefix} ${text}\n${instruction}`;
  }

  return async function freeform(params: FreeformPromptParams) {
    const {text, instruction} = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(text, instruction);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
