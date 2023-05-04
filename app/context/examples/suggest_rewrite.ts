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

export interface SuggestRewriteExample {
  text: string;
  sentence: string;
  toRewrite: string;
  target: string;
}

const baseExamples = [
  {
    text: 'A long time ago, in the beginning of time, beautiful crystalline frog people inhabited the earth. Their king, the crystal king, had mysteriously disappeared on a trip to the sea.',
    sentence:
      'Their king, the crystal king, had mysteriously disappeared on a trip to the sea.',
    target: 'to be more interesting',
  },
  {
    text: 'The green knight rode atop his majestic, beautiful horse, across fields of pure green. In his palm was a magical, sparkling golden sword.',
    sentence:
      'The green knight rode atop his majestic, beautiful horse, across fields of pure green.',
    target: 'to be more descriptive',
  },
  {
    text: 'Ninja schools are where the ninjas are trained for their missions. Some are trained in the forests and snowy mountains and others are given the ultimate training in the hottest palace in the land.',
    sentence:
      'Some are trained in the forests and snowy mountains and others are given the ultimate training in the hottest palace in the land.',
    target: 'to be shorter',
  },
  {
    text: 'The witch doctor had a large pile of magic stones. All the magic stones had a power - healing magic, shapeshifting, seeing into the past.',
    sentence: 'The witch doctor had a large pile of magic stones.',
    target: 'to be much longer',
  },
  {
    text: 'The desert sun beat down on the sand, and tiny bits of sand flew with every step. The two young travelers trudged onward. They were tired, but they knew they had to go forward.',
    sentence: 'They were tired, but they knew they had to go forward.',
    target: 'to be more dramatic',
  },
  {
    text: 'A prince and princess from the future set out in search of the mythical land of the unicorns. They had heard tales of magical unicorn dust that could heal any wound.',
    sentence:
      'They had heard tales of magical unicorn dust that could heal any wound.',
    target: 'to use more unique descriptions',
  },
  {
    text: 'A giant monster was chasing after a woman and yelling at her to get away. The woman ran, knowing that she was in horrible danger.',
    sentence:
      'A giant monster was chasing after a woman and yelling at her to get away.',
    target: 'to be more humorous',
  },
];

/** Examples for suggestions of how to rewrite sentences */
export const rewriteSentenceExampleData: SuggestRewriteExample[] = mergeObjects(
  baseExamples,
  [
    {
      toRewrite:
        'Their king, the crystal king, had mysteriously disappeared on a trip to the sea.',
      target: 'to be more interesting',
    },
    {
      toRewrite:
        'The green knight rode atop his majestic, beautiful horse, across fields of pure green.',
      target: 'to be more descriptive',
    },
    {
      toRewrite:
        'Some are trained in the forests and snowy mountains and others are given the ultimate training in the hottest palace in the land.',
      target: 'to be shorter',
    },
    {
      toRewrite: 'The witch doctor had a large pile of magic stones.',
      target: 'to be much longer',
    },
    {
      toRewrite: 'They were tired, but they knew they had to go forward.',
      target: 'to be more dramatic',
    },
    {
      toRewrite:
        'They had heard tales of magical unicorn dust that could heal any wound.',
      target: 'to use more unique descriptions',
    },
    {
      toRewrite:
        'A giant monster was chasing after a woman and yelling at her to get away.',
      target: 'to be more humorous',
    },
  ]
);

/** Examples for suggestions of how to rewrite phrases */
export const rewritePhraseExampleData: SuggestRewriteExample[] = mergeObjects(
  baseExamples,
  [
    {
      toRewrite: 'the crystal king',
      target: 'to be more interesting',
    },
    {
      toRewrite: 'fields of pure green',
      target: 'to be more descriptive',
    },
    {
      toRewrite: 'Some are trained in the forests and snowy mountains',
      target: 'to be shorter',
    },
    {
      toRewrite: 'The witch doctor',
      target: 'to be much longer',
    },
    {
      toRewrite: 'They were tired',
      target: 'to be more dramatic',
    },
    {
      toRewrite: 'magical unicorn dust',
      target: 'to use more unique descriptions',
    },
    {
      toRewrite: 'yelling at her to get away.',
      target: 'to be more humorous',
    },
  ]
);

/** Examples for suggestions of how to rewrite words */
export const rewriteWordExampleData: SuggestRewriteExample[] = mergeObjects(
  baseExamples,
  [
    {
      toRewrite: 'crystal',
      target: 'to be more interesting',
    },
    {
      toRewrite: 'horse',
      target: 'to be more descriptive',
    },
    {
      toRewrite: 'hottest',
      target: 'to use a more descriptive word',
    },
    {
      toRewrite: 'magic',
      target: 'to use a few interesting words',
    },
    {
      toRewrite: 'tired',
      target: 'to be more dramatic',
    },
    {
      toRewrite: 'tales',
      target: 'to use more fanciful word',
    },
    {
      toRewrite: 'monster',
      target: 'to be more humorous',
    },
  ]
);

/** Examples for suggestions of how to rewrite text */
export const rewriteTextExampleData: SuggestRewriteExample[] = mergeObjects(
  baseExamples,
  [
    {
      toRewrite: 'Their king, the crystal king',
      target: 'to be more interesting',
    },
    {
      toRewrite: 'The green knight rode atop his majestic, beautiful horse',
      target: 'to be more descriptive',
    },
    {
      toRewrite:
        'Some are trained in the forests and snowy mountains and others are given the ultimate training in the hottest palace in the land.',
      target: 'to be shorter',
    },
    {
      toRewrite: 'a large pile of magic stones.',
      target: 'to be much longer',
    },
    {
      toRewrite: 'They were tired, but they knew they had to go forward.',
      target: 'to be more dramatic',
    },
    {
      toRewrite: 'magical unicorn dust',
      target: 'to use more unique descriptions',
    },
    {
      toRewrite: 'A giant monster was chasing after a woman and yelling',
      target: 'to be more humorous',
    },
  ]
);

class SuggestRewriteExamples extends Examples<SuggestRewriteExample> {}

export const suggestRewriteSentenceExamples = new SuggestRewriteExamples(
  rewriteSentenceExampleData
);
export const suggestRewritePhraseExamples = new SuggestRewriteExamples(
  rewritePhraseExampleData
);
export const suggestRewriteWordExamples = new SuggestRewriteExamples(
  rewriteWordExampleData
);
export const suggestRewriteTextExamples = new SuggestRewriteExamples(
  rewriteTextExampleData
);

function mergeObjects<A, B>(a: A[], b: B[]): Array<A & B> {
  const merged: Array<A & B> = [];
  for (let i = 0; i < a.length; i++) {
    merged.push({...a[i], ...b[i]});
  }
  return merged;
}
