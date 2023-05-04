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

export interface RewriteEndOfSentenceExample {
  sentences: string[];
  targetSentenceCharacterOffset: number;
  targetSentenceIndex: number;
}

export const exampleData = [
  {
    sentences: storyData['kentucky'].sentences,
    targetSentenceCharacterOffset: 39,
    targetSentenceIndex: 1,
  },
  {
    sentences: storyData['secretary'].sentences,
    targetSentenceCharacterOffset: 39,
    targetSentenceIndex: 0,
  },
  {
    sentences: storyData['deathbed'].sentences.slice(0, 3),
    targetSentenceCharacterOffset: 15,
    targetSentenceIndex: 1,
  },
  {
    sentences: storyData['explorers'].sentences.slice(2),
    targetSentenceCharacterOffset: 81,
    targetSentenceIndex: 0,
  },
  {
    sentences: storyData['datacenter'].sentences,
    targetSentenceCharacterOffset: 21,
    targetSentenceIndex: 2,
  },
];

class RewriteEndOfSentenceExamples extends Examples<RewriteEndOfSentenceExample> {}

export const examples = new RewriteEndOfSentenceExamples(exampleData);
