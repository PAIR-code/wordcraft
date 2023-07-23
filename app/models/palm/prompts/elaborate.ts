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

import {ElaboratePromptParams} from '@core/shared/interfaces';
import {ElaborateExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(text: string, subject: string) {
    const prefix = model.getStoryPrefix();
    const suffix = `Describe "${subject}" in more detail.`;
    return `${prefix} ${model.wrap(text)}\n${suffix}`;
  }

  function getPromptContext() {
    const examples = context.getExampleData<ElaborateExample>(
      OperationType.ELABORATE
    );
    let promptContext = model.getPromptPreamble();
    examples.forEach(({text, toElaborate, target}) => {
      const prompt = generatePrompt(text, toElaborate);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  return async function elaborate(params: ElaboratePromptParams) {
    const {text, toElaborate} = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(text, toElaborate);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
