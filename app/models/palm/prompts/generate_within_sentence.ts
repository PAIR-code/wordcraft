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

import {isWhitespaceOnly, parseSentences} from '@lib/parse_sentences';
import {normalizeSentenceSpaces, reverseString, shuffle} from '@lib/utils';
import {GenerateWithinSentencePromptParams} from '@core/shared/interfaces';
import {
  GenerateWithinSentenceExample,
  WordcraftContext,
} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(
    textBeforeBlank: string,
    textAfterBlank: string,
    sentenceBeforeBlank: string,
    sentenceAfterBlank: string
  ) {
    const blank = model.getBlank();
    const textWithBlank = `${textBeforeBlank} ${blank} ${textAfterBlank}`;
    const sentenceWithBlank = `${sentenceBeforeBlank} ${blank} ${sentenceAfterBlank}`;

    const prefix = model.getStoryPrefix();
    const suffix = `Sentence with blank: ${model.wrap(
      sentenceWithBlank
    )}\nSentence with blank filled in:`;

    return `${prefix} ${model.wrap(textWithBlank)}\n${suffix}`;
  }

  function getPromptContext() {
    const examples = context.getExampleData<GenerateWithinSentenceExample>(
      OperationType.GENERATE_WITHIN_SENTENCE
    );
    let promptContext = model.getPromptPreamble();
    const shuffled = shuffle(examples);
    for (let i = 0; i < shuffled.length; i++) {
      const example = shuffled[i];
      const {fullText, targetSentenceIndex, target} = example;
      let textBeforeBlank = '';
      let textAfterBlank = '';
      const sentences = parseSentences(fullText);
      const targetSentence = sentences[targetSentenceIndex];

      const start = targetSentence.indexOf(target);
      const end = start + target.length;

      const sentenceBeforeBlank = targetSentence.substring(0, start);
      const sentenceAfterBlank = targetSentence.substring(end);

      textBeforeBlank += sentences
        .slice(0, targetSentenceIndex)
        .reduce((text, sentence) => {
          return (text += sentence + ' ');
        }, '');

      const sentence = sentences[targetSentenceIndex];

      textBeforeBlank += sentence.substring(0, start);
      textAfterBlank += sentence.substring(end) + ' ';

      textAfterBlank += sentences
        .slice(targetSentenceIndex + 1)
        .reduce((text, sentence) => {
          return (text += sentence + ' ');
        }, '');

      const prompt = generatePrompt(
        textBeforeBlank,
        textAfterBlank,
        sentenceBeforeBlank,
        sentenceAfterBlank
      );
      promptContext += `${prompt} ${model.wrap(targetSentence)}\n\n`;
    }
    return promptContext;
  }

  return async function generateWithinSentence(
    params: GenerateWithinSentencePromptParams
  ) {
    console.log('generate within sentence prompt');
    let {pre, post, beginningOfSentence, endOfSentence} = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(
      pre,
      post,
      beginningOfSentence,
      endOfSentence
    );
    const inputText = promptContext + prompt;
    const results = await model.query(inputText);

    // When trying to copy a sentence with abnormal whitespaces (ie 2 spaces),
    // the model will only return output with 1 space between words. This makes
    // it weird to compare the diff of the input text and model output, so we'll
    // need to adjust that.
    beginningOfSentence = normalizeSentenceSpaces(beginningOfSentence);
    endOfSentence = normalizeSentenceSpaces(endOfSentence);

    // The prompt that we're using (generateWithinSentence) returns text with
    // the beginning and the end of the given sentence, so we need to parse out
    // only the middle of the sentence. We also need to filter sentences that
    // don't match that format.
    // TODO: Maybe we can consider applying the diff of the two sentences?
    const endReversed = reverseString(endOfSentence);
    const output = results
      .map((result) => {
        // Parse out the first sentence of the generated text, and
        // normalize the spaces.
        const sentences = parseSentences(result.text);
        const firstSentence = sentences[0];
        const text = normalizeSentenceSpaces(firstSentence);
        return {...result, text};
      })
      .filter((result) => {
        // Ensure that the resulting text contains the beginning of the
        // sentence we're generating within.
        return result.text.indexOf(beginningOfSentence) >= 0;
      })
      .map((result) => {
        // Splice out the end of the sentence we're generating from.
        const choice = result.text.replace(beginningOfSentence, '') + ' ';
        const choiceReversed = reverseString(choice);
        const replaced = choiceReversed.replace(endReversed, '');
        const text = reverseString(replaced);
        return {...result, text};
      })
      .filter((result) => {
        return !isWhitespaceOnly(result.text);
      });

    return output;
  };
}
