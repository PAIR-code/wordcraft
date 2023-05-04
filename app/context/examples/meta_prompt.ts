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

export interface MetaPromptExample {
  text: string;
  question: string;
  instruction: string;
}

export const exampleData: MetaPromptExample[] = [
  {
    text: 'A long time ago, in the beginning of time, beautiful crystalline frog people inhabited the earth. Their king, the crystal king, had mysteriously disappeared on a trip to the sea.',
    question: 'What were the frog people like?',
    instruction: 'Tell me more about the frog people.',
  },
  {
    text: 'The green knight rode atop his majestic, beautiful horse, across fields of pure green. In his palm was a magical, sparkling golden sword.',
    question: 'What happened next?',
    instruction: 'Tell me what happened next.',
  },
  {
    text: 'Ninja schools are where the ninjas are trained for their missions. Some are trained in the forests and snowy mountains and others are given the ultimate training in the hottest palace in the land.',
    question: 'What were the ninjas like?',
    instruction: 'Tell me about the ninjas',
  },
  {
    text: 'The witch doctor had a large pile of magic stones. All the magic stones had a power - healing magic, shapeshifting, seeing into the past.',
    question: 'What did the witch doctor do with them?',
    instruction: 'Tell me what the witch doctor did with them.',
  },
  {
    text: 'The desert sun beat down on the sand, and tiny bits of sand flew with every step. The two young travelers trudged onward. They were tired, but they knew they had to go forward.',
    question: 'What were the two travelers like?',
    instruction: 'Tell me more about the two travelers.',
  },
  {
    text: 'A prince and princess from the future set out in search of the mythical land of the unicorns. They had heard tale of magical unicorn dust that could heal any wound.',
    question: 'What was their journey like?',
    instruction: 'Tell me what their journey was like.',
  },
  {
    text: 'A giant monster was chasing after a woman and yelling at her to get away. The woman ran, knowing that she was in horrible danger.',
    question: 'Why was the monster chasing her?',
    instruction: 'Tell me why the monster was chasing her.',
  },
];

class MetaPromptExamples extends Examples<MetaPromptExample> {}

export const examples = new MetaPromptExamples(exampleData);
