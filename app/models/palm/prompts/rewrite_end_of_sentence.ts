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
import {RewriteEndOfSentencePromptParams} from '@core/shared/interfaces';
import {RewriteEndOfSentenceExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(
    textBeforeBlank: string,
    textAfterBlank: string,
    beginningOfSentence: string
  ) {
    const blank = model.getBlank();
    const textWithBlank = `${textBeforeBlank} ${blank} ${textAfterBlank}`;
    const sentenceWithBlank = `${beginningOfSentence} ${blank}.`;

    const prefix = model.getStoryPrefix();
    const wrappedTextWithBlank = model.wrap(textWithBlank);
    const wrappedSentence = model.wrap(sentenceWithBlank);
    const suffix = `Sentence with blank: ${wrappedSentence}\nSentence with blank filled in:`;

    return `${prefix} ${wrappedTextWithBlank} ${suffix}`;
  }

  function makePromptContext() {
    const examples = context.getExampleData<RewriteEndOfSentenceExample>(
      OperationType.REWRITE_END_OF_SENTENCE
    );
    let promptContext = model.getPromptPreamble();
    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      const {fullText, targetSentenceIndex, targetSentenceCharacterOffset} =
        example;
      const sentences = parseSentences(fullText);
      let textBeforeBlank = '';
      let textAfterBlank = '';

      const targetSentence = sentences[targetSentenceIndex];
      const beginningOfSentence = targetSentence.substring(
        0,
        targetSentenceCharacterOffset
      );

      textBeforeBlank += sentences
        .slice(0, targetSentenceIndex)
        .reduce((text, sentence) => {
          return (text += sentence + ' ');
        }, '');

      const start = targetSentenceCharacterOffset;
      const sentence = sentences[targetSentenceIndex];
      const end = sentence.length - 1;

      textBeforeBlank += sentence.substring(0, start);
      textAfterBlank += sentence.substring(end);

      textAfterBlank += sentences
        .slice(targetSentenceIndex + 1)
        .reduce((text, sentence) => {
          return (text += sentence + ' ');
        }, '');

      const target = sentences[targetSentenceIndex];
      const prompt = generatePrompt(
        textBeforeBlank,
        textAfterBlank,
        beginningOfSentence
      );

      promptContext += `${prompt} ${model.wrap(target)}\n\n`;
    }
    return promptContext;
  }

  return async function rewriteEndOfSentence(
    params: RewriteEndOfSentencePromptParams
  ) {
    console.log('rewrite end of sentence prompt');
    const {pre, post, beginningOfSentence} = params;
    const promptContext = makePromptContext();
    const prompt = generatePrompt(pre, post, beginningOfSentence);
    const inputText = promptContext + prompt;
    const results = await model.query(inputText);

    return results
      .filter((result) => {
        return result.text.indexOf(beginningOfSentence) === 0;
      })
      .map((result) => {
        const sentences = parseSentences(result.text);
        const sentence = sentences[0];
        const text = sentence.replace(beginningOfSentence, '') + ' ';
        return {
          text,
          uuid: result.uuid,
        };
      });
  };
}
