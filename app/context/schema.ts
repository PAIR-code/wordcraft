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

export const continueSchema = z.object({
  input: z.string(),
  target: z.string(),
});

export const elaborateSchema = z.object({
  text: z.string(),
  toElaborate: z.string(),
  target: z.string(),
});

export const firstSentenceSchema = z.object({
  fullText: z.string(),
});

export const freeformSchema = z.object({
  prefix: z.string(),
  instruction: z.string(),
  text: z.string(),
  target: z.string(),
});

export const generateWithinSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
  target: z.string(),
});

export const metaPromptSchema = z.object({
  text: z.string(),
  question: z.string(),
  target: z.string(),
});

export const newStorySchema = z.object({
  topic: z.string(),
  target: z.string(),
});

export const nextSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
});

export const replaceSchema = z.object({
  pre: z.string(),
  toReplace: z.string(),
  post: z.string(),
  targets: z.array(z.string()),
});

export const rewriteEndOfSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
  targetSentenceCharacterOffset: z.number(),
});

export const rewriteSelectionSchema = z.object({
  pre: z.string(),
  toRewrite: z.string(),
  post: z.string(),
  nWords: z.string(),
  howToRewrite: z.string(),
  target: z.string(),
});

export const rewriteSentenceSchema = z.object({
  pre: z.string(),
  toRewrite: z.string(),
  post: z.string(),
  howToRewrite: z.string(),
  target: z.string(),
});

const sizeSchema = z.object({
  toRewrite: z.string(),
  target: z.string(),
});

export const suggestRewriteSchema = z.object({
  text: z.string(),
  sizes: z.object({
    text: sizeSchema,
    sentence: sizeSchema,
    phrase: sizeSchema,
    word: sizeSchema,
  }),
});
