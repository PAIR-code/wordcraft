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

import {FirstSentencePromptParams} from '@core/shared/interfaces';
import {FirstSentenceExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';
import {parseSentences} from '@lib/parse_sentences';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(textAfterBlank: string) {
    const prefix = model.getStoryPrefix();
    const suffix = 'Tell me the first sentence that fills in the blank: ';
    const withBlank = `${model.getBlank()} ${textAfterBlank}`;

    return `${prefix} ${withBlank}\n${suffix}`;
  }

  function getPromptContext() {
    const examples = context.getExampleData<FirstSentenceExample>(
      OperationType.FIRST_SENTENCE
    );

    let promptContext = model.getPromptPreamble();
    for (let i = 0; i < examples.length; i++) {
      const data = examples[i];
      const {fullText} = data;
      const sentences = parseSentences(fullText);
      const [firstSentence, ...nextSentencesArr] = sentences;
      const nextSentences = nextSentencesArr.join(' ');
      const prompt = generatePrompt(nextSentences);
      promptContext += `${prompt} ${model.wrap(firstSentence)}\n\n`;
    }
    return promptContext;
  }

  return async function firstSentence(params: FirstSentencePromptParams) {
    const promptContext = getPromptContext();
    const prompt = generatePrompt(params.text);
    const inputText = promptContext + prompt;
    const results = await model.query(inputText);

    // Since the prompt expects the model to continue from the previous
    // sentence, we need to post-process the results by removing the text
    // of that sentence. We'll also want to filter out results that are
    // already part of the text.
    return results
      .map((result) => {
        const resultText = result.text.trim();
        return {...result, text: resultText};
      })
      .filter((result) => {
        return !params.text.includes(result.text);
      });
  };
}
