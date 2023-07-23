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
import {z} from 'zod';
import {parseSentences} from '../../third_party/sbd';

/**
 * Constructs schema indirectly from the stories defined in the JSON context.
 */

import {
  jsonSchema,
  continueSchema,
  firstSentenceSchema,
  generateWithinSentenceSchema,
  nextSentenceSchema,
  rewriteEndOfSentenceSchema,
} from './schema';

type JsonData = z.infer<typeof jsonSchema>;

function selectRandom<T>(arr: T[]): [T, number] {
  const index = Math.floor(Math.random() * arr.length);
  return [arr[index], index];
}

function splitAtRandomWord(text: string): [string, string] {
  const words = text.split(' ');
  const [_, wordIndex] = selectRandom(words);
  const before = words.slice(0, wordIndex).join(' ');
  const after = words.slice(wordIndex).join(' ');
  return [before, after];
}

export function buildContinueExamples(
  jsonData: JsonData
): Array<z.infer<typeof continueSchema>> {
  const output: Array<z.infer<typeof continueSchema>> = [];
  for (const key of Object.keys(jsonData.stories)) {
    const story = jsonData.stories[key];
    // Select a random sentence from the story.
    const sentences = parseSentences(story);
    const [sentence, sentenceIndex] = selectRandom(sentences);
    const [before, after] = splitAtRandomWord(sentence);
    const allBefore = sentences.slice(0, sentenceIndex).join(' ') + before;
    const allAfter = after + sentences.slice(sentenceIndex + 1).join(' ');
    output.push({
      input: allBefore,
      target: allAfter,
    });
  }
  return output;
}

export function buildFirstSentenceExamples(
  jsonData: JsonData
): Array<z.infer<typeof firstSentenceSchema>> {
  const output: Array<z.infer<typeof firstSentenceSchema>> = [];
  for (const key of Object.keys(jsonData.stories)) {
    const story = jsonData.stories[key];
    output.push({
      fullText: story,
    });
  }
  return output;
}

export function buildGenerateWithinSentenceExamples(
  jsonData: JsonData
): Array<z.infer<typeof generateWithinSentenceSchema>> {
  const output: Array<z.infer<typeof generateWithinSentenceSchema>> = [];
  for (const key of Object.keys(jsonData.stories)) {
    const story = jsonData.stories[key];
    // Select a random sentence from the story.
    const sentences = parseSentences(story);
    const [sentence, sentenceIndex] = selectRandom(sentences);
    const words = sentence.split(' ');
    const [, indexA] = selectRandom(words);
    const [, indexB] = selectRandom(words);
    const [start, end] = [Math.min(indexA, indexB), Math.max(indexA, indexB)];
    const randomSubstring = words.slice(start, end).join(' ');

    output.push({
      fullText: story,
      targetSentenceIndex: sentenceIndex,
      target: randomSubstring,
    });
  }
  return output;
}

export function buildNextSentenceExamples(
  jsonData: JsonData
): Array<z.infer<typeof nextSentenceSchema>> {
  const output: Array<z.infer<typeof nextSentenceSchema>> = [];
  for (const key of Object.keys(jsonData.stories)) {
    const story = jsonData.stories[key];
    // Select a random sentence from the story.
    const sentences = parseSentences(story);
    const [, sentenceIndex] = selectRandom(sentences);

    output.push({
      fullText: story,
      targetSentenceIndex: sentenceIndex,
    });
  }
  return output;
}

export function buildRewriteEndOfSentenceExamples(
  jsonData: JsonData
): Array<z.infer<typeof rewriteEndOfSentenceSchema>> {
  const output: Array<z.infer<typeof rewriteEndOfSentenceSchema>> = [];
  for (const key of Object.keys(jsonData.stories)) {
    const story = jsonData.stories[key];
    // Select a random sentence from the story.
    const sentences = parseSentences(story);
    const [sentence, sentenceIndex] = selectRandom(sentences);
    const words = sentence.split(' ');
    const [word] = selectRandom(words);
    const targetSentenceCharacterOffset = sentence.indexOf(word);

    output.push({
      fullText: story,
      targetSentenceIndex: sentenceIndex,
      targetSentenceCharacterOffset,
    });
  }
  return output;
}
