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

import { NewCharacterPromptParams } from '@core/shared/interfaces';
import { NewCharacterExample, WordcraftContext } from '../../../context';
import { OperationType } from '@core/shared/types';
import { PalmModel } from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function getPromptContext() {
    const examples = context.getExampleData<NewCharacterExample>(
      OperationType.NEW_CHARACTER
    );
    let promptContext = model.getPromptPreamble();
    examples.forEach((example) => {
      const { character, target } = example;
      const prompt = generatePrompt(character);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  function generatePrompt(character: string) {
    const prefix = "Here's a character description: ";
    const suffix = "Introduce this character in the story.";

    if (character.trim() === '') {
      return 'Introduce a new character to the story.';
    } else {
      return `${prefix}${model.wrap(character)}\n${suffix}`;
    }
  }

  return async function storySeed(params: NewCharacterPromptParams) {
    const { character } = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(character);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
