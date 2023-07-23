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

import {MetaPromptPromptParams} from '@core/shared/interfaces';
import {MetaPromptExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {endsWithPunctuation} from '@lib/parse_sentences/utils';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(text: string) {
    const prefix = model.getStoryPrefix();
    const suffix = 'Next prompt:';
    return `${prefix} ${model.wrap(text)}\n${suffix}`;
  }

  function makePromptContext(examples: MetaPromptExample[]) {
    let promptContext = model.getPromptPreamble();
    examples.forEach(({text, target}) => {
      const prompt = generatePrompt(text);
      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    });
    return promptContext;
  }

  function doExamplesEndWithPunctuation(examples: MetaPromptExample[]) {
    for (const example of examples) {
      const {target} = example;
      if (endsWithPunctuation(target)) {
        return true;
      }
    }
    return false;
  }

  return async function metaPrompt(params: MetaPromptPromptParams) {
    const examples = context.getExampleData<MetaPromptExample>(
      OperationType.META_PROMPT
    );
    const promptContext = makePromptContext(examples);
    // Ensure we add a trailing '.' to the prompt if it doesn't contain one,
    // in order to match the formatting of the examples. We'll also be parsing
    // away any accidental trailing '.'s in the generated outputs.
    let promptText = params.text.trim();
    if (
      doExamplesEndWithPunctuation(examples) &&
      !endsWithPunctuation(promptText)
    ) {
      promptText += '.';
    }
    const prompt = generatePrompt(promptText);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
