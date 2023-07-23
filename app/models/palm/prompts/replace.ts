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

import {parseSentences} from '@lib/parse_sentences';
import {wordinessOptions, WordinessOption} from '../../shared';
import {ReplacePromptParams} from '@core/shared/interfaces';
import {ReplaceExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

function nWordsToWordiness(length: number) {
  const index =
    wordinessOptions.findIndex((opt: WordinessOption) => length <= opt.max) ||
    0;
  return {text: wordinessOptions[index], index};
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(
    storyBeforeBlank: string,
    storyAfterBlank: string,
    nWords: number,
    blankText: string
  ) {
    const fullText = `${storyBeforeBlank} ${blankText} ${storyAfterBlank}`;
    const blankedSentIndex = parseSentences(storyBeforeBlank).length - 1;
    const sentence = parseSentences(fullText)[blankedSentIndex];

    const wordiness = nWordsToWordiness(nWords).text;
    const prefix = model.getStoryPrefix();
    const instruction = `Sentence with blank: ${model.wrap(
      sentence
    )}\nFill in the blank with ${
      wordiness.text
    }, and make sure it's new and interesting.`;

    return `${prefix} ${model.wrap(fullText)}\n${instruction}`;
  }

  function makePromptContext(examples: ReplaceExample[], nWords: number) {
    const blankText = model.getBlank();
    let promptContext = model.getPromptPreamble();
    examples.forEach(({pre, targets, post}) => {
      const wordiness = nWordsToWordiness(nWords);
      const toReplace = targets[wordiness.index];

      const prompt = generatePrompt(pre, post, nWords, blankText);
      promptContext += `${prompt} ${model.wrap(toReplace)}\n\n`;
    });
    return promptContext;
  }

  return async function replace(params: ReplacePromptParams) {
    console.log('replace prompt');
    const {pre, post, nWords} = params;
    const examples = context.getExampleData<ReplaceExample>(
      OperationType.REPLACE
    );
    const promptContext = makePromptContext(examples, nWords);
    const blankText = model.getBlank();
    const prompt = generatePrompt(pre, post, nWords, blankText);
    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
