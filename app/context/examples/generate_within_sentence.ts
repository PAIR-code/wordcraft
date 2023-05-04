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

export interface GenerateWithinSentenceExample {
  sentences: string[];
  targetSentenceIndex: number;
  target: string;
}

export const exampleData: GenerateWithinSentenceExample[] = [
  {
    sentences: storyData['kentucky'].sentences,
    targetSentenceIndex: 1,
    target:
      'to play the guitar so that he could hear the guitar sing along to him, ',
  },
  {
    sentences: storyData['secretary'].sentences,
    targetSentenceIndex: 0,
    target: 'from Chicago to New York City',
  },
  {
    sentences: storyData['deathbed'].sentences.slice(0, 3),
    targetSentenceIndex: 0,
    target: 'on his deathbed, the only thing he ',
  },
  {
    sentences: storyData['explorers'].sentences.slice(2),
    targetSentenceIndex: 0,
    target: 'It was at night, and',
  },
  {
    sentences: storyData['datacenter'].sentences,
    targetSentenceIndex: 3,
    target: 'fluorescent artificial',
  },
];

class GenerateWithinSentenceExamples extends Examples<GenerateWithinSentenceExample> {}

export const examples = new GenerateWithinSentenceExamples(exampleData);
