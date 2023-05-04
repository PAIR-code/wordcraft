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

export interface NextSentenceExample {
  sentences: string[];
  targetSentenceIndex: number;
}

export const exampleData: NextSentenceExample[] = [
  {
    sentences: storyData['kentucky'].sentences,
    targetSentenceIndex: 1,
  },
  {
    sentences: storyData['deathbed'].sentences,
    targetSentenceIndex: 5,
  },
  {
    sentences: storyData['explorers'].sentences,
    targetSentenceIndex: 3,
  },
  {
    sentences: storyData['datacenter'].sentences,
    targetSentenceIndex: 2,
  },
];

class NextSentenceExamples extends Examples<NextSentenceExample> {}

export const examples = new NextSentenceExamples(exampleData);
