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

import {NewStoryPromptParams} from '@core/shared/interfaces';
import {NewStoryExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function getPromptContext() {
    const examples = context.getExampleData<NewStoryExample>(
      OperationType.NEW_STORY
    );
    let promptContext = model.getPromptPreamble();
    examples.forEach((example) => {
      const {topic, target} = example;
      const prompt = generatePrompt(topic);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  function generatePrompt(topic: string) {
    const prefix = "Here's a story topic: ";
    const suffix = 'Tell me a new beginning of a story: ';

    if (topic.trim() === '') {
      return suffix;
    } else {
      return `${prefix}${model.wrap(topic)}\n${suffix}`;
    }
  }

  return async function storySeed(params: NewStoryPromptParams) {
    const {topic} = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(topic);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
