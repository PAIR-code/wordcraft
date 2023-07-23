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

import {NextSentencePromptParams} from '@core/shared/interfaces';
import {NextSentenceExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';
import {parseSentences} from '@lib/parse_sentences';

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function generatePrompt(
    textBeforeBlank: string,
    textAfterBlank: string,
    sentenceBeforeBlank: string
  ) {
    const prefix = model.getStoryPrefix();
    const blank = model.getBlank();

    if (textAfterBlank && textBeforeBlank) {
      const storyWithBlank = `${textBeforeBlank} ${blank} ${textAfterBlank}`;
      const wrappedStory = model.wrap(storyWithBlank);
      const wrappedSentence = model.wrap(sentenceBeforeBlank);
      const suffix = `Sentence that comes after ${wrappedSentence}:`;

      return `${prefix} ${wrappedStory}\n${suffix}`;
    } else if (textBeforeBlank) {
      const wrappedStory = model.wrap(textBeforeBlank);
      const suffix = 'Next sentence:';
      return `${prefix} ${wrappedStory}\n${suffix}`;
    } else {
      const wrappedStory = model.wrap(textAfterBlank);
      const suffix = 'First sentence';
      return `${prefix} ${wrappedStory}\n${suffix}`;
    }
  }

  function getPromptContext() {
    const examples = context.getExampleData<NextSentenceExample>(
      OperationType.NEXT_SENTENCE
    );

    let promptContext = model.getPromptPreamble();
    for (let i = 0; i < examples.length; i++) {
      const data = examples[i];
      const {fullText, targetSentenceIndex} = data;
      const sentences = parseSentences(fullText);

      const textBeforeBlank = sentences
        .slice(0, targetSentenceIndex)
        .reduce((text, sentence) => {
          return text + sentence + ' ';
        }, '');
      const textAfterBlank = sentences
        .slice(targetSentenceIndex + 1)
        .reduce((text, sentence) => {
          return text + sentence + ' ';
        }, '');
      const sentenceBeforeBlank = sentences[targetSentenceIndex - 1] || '';
      const targetSentence = sentences[targetSentenceIndex];

      const prompt = generatePrompt(
        textBeforeBlank,
        textAfterBlank,
        sentenceBeforeBlank
      );
      promptContext += `${prompt} ${model.wrap(targetSentence)}\n\n`;
    }
    return promptContext;
  }

  return async function nextSentence(params: NextSentencePromptParams) {
    console.log('next sentence prompt');
    const {pre, post, previousSentence} = params;
    const promptContext = getPromptContext();
    const prompt = generatePrompt(pre, post, previousSentence);
    const inputText = promptContext + prompt;
    const results = await model.query(inputText);

    // Since the prompt expects the model to continue from the previous
    // sentence, we need to post-process the results by removing the text
    // of that sentence. We'll also want to filter out results that are
    // already part of the story.
    return results
      .map((result) => {
        const text = result.text.trim().replace(previousSentence.trim(), '');
        return {
          ...result,
          text,
        };
      })
      .filter((result) => {
        return !`${pre} ${post}`.includes(result.text);
      });
  };
}
