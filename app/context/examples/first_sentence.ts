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
import {Examples} from './base';
import {storyData} from './story_data';

export interface FirstSentenceExample {
  firstSentence: string;
  nextSentences: string;
}

export const exampleData: FirstSentenceExample[] = [
  {
    firstSentence: storyData['kentucky'].sentences[0],
    nextSentences: storyData['kentucky'].sentences.slice(1).join('. '),
  },
  {
    firstSentence: storyData['deathbed'].sentences[0],
    nextSentences: storyData['deathbed'].sentences.slice(1).join('. '),
  },
  {
    firstSentence: storyData['explorers'].sentences[0],
    nextSentences: storyData['explorers'].sentences.slice(1).join('. '),
  },
  {
    firstSentence: storyData['datacenter'].sentences[0],
    nextSentences: storyData['datacenter'].sentences.slice(1).join('. '),
  },
];

class FirstSentenceExamples extends Examples<FirstSentenceExample> {}

export const examples = new FirstSentenceExamples(exampleData);
