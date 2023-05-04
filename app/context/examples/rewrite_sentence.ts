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

export interface RewriteSentenceExample {
  pre: string;
  toRewrite: string;
  post: string;
  howToRewrite: string;
  target: string;
}

export const exampleData: RewriteSentenceExample[] = [
  {
    pre: 'An elderly man was sitting alone on a dark path. ',
    toRewrite:
      'The man looked down at his feet, and realized he was standing next to a box.',
    post: ' It was a plain pine box and looked as if it had been there for a long time. The man was afraid to look inside the box.',
    howToRewrite: 'to be more evocative',
    target:
      'The man nearly gasped as he peered down at his feet, suddenly realizing he was standing next to a mysterious box.',
  },
  {
    pre: 'An elderly man was sitting alone on a dark path. The darkness turned to light as a figure ran up to him. ',
    toRewrite: 'The figure was holding a sword.',
    post: " The older man recognized the young man as a dear friend, who he hadn't seen in some time. The young man said he had had the strangest dream.",
    howToRewrite: 'to use more descriptive language',
    target:
      'The shadowy figure held in his hand a shining sword that glimmered in the darkness.',
  },
  {
    pre: "There once was a man named Kentucky, who could play the guitar like nobody's business.",
    toRewrite:
      "He loved to play the guitar so that he could hear the guitar sing along to him, to hear the guitar's melodic hum.",
    post: 'Kentucky was a lonely man living in a lonely house in the middle of nowhere with only his favorite guitar to keep him company. Now this guitar had been owned by many-a-man, and all of them had come to the same fate. They played the guitar until the guitar played them.',
    howToRewrite: 'to be more melancholy',
    target:
      "He loved playing sad songs on his weathered guitar, so he could drown out his loneliness with the guitar's melodic hum.",
  },
  {
    pre: 'A small group of explorers landed in China, and were amazed by the beautiful, sparkling buildings. They wondered how such a beautiful country could ever be as scary as they had heard. It was at night, and the explorers were deep in the heart of the forbidden city, their flashlights not strong enough to reach the bottom of the narrow, dark hallways.',
    toRewrite: 'Suddenly, a terrifying sound echoed through the halls.',
    post: '',
    howToRewrite: 'to use more interesting words',
    target:
      'Out of nowhere, a thunderous cacophony reverberated through the halls.',
  },
];

class RewriteSentenceExamples extends Examples<RewriteSentenceExample> {}

export const examples = new RewriteSentenceExamples(exampleData);
