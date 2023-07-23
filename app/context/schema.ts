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

/**
 * The following schema are directly written in the JSON.
 */
export const elaborateSchema = z.object({
  text: z.string(),
  toElaborate: z.string(),
  target: z.string(),
});

export const freeformSchema = z.object({
  textType: z.string(),
  instruction: z.string(),
  text: z.string(),
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

export const replaceSchema = z.object({
  pre: z.string(),
  toReplace: z.string(),
  post: z.string(),
  targets: z.array(z.string()),
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

export const jsonSchema = z.object({
  documentType: z.string(),
  preamble: z.string(),
  stories: z.record(z.string(), z.string()),
  examples: z.object({
    elaborate: z.array(elaborateSchema),
    freeform: z.array(freeformSchema),
    metaPrompt: z.array(metaPromptSchema),
    newStory: z.array(newStorySchema),
    replace: z.array(replaceSchema),
    rewriteSelection: z.array(rewriteSelectionSchema),
    rewriteSentence: z.array(rewriteSentenceSchema),
    suggestRewrite: z.array(suggestRewriteSchema),
  }),
});

/**
 * The following schema are dynamically parsed from the JSON stories data.
 */

export const continueSchema = z.object({
  input: z.string(),
  target: z.string(),
});

export const firstSentenceSchema = z.object({
  fullText: z.string(),
});

export const generateWithinSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
  target: z.string(),
});

export const nextSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
});

export const rewriteEndOfSentenceSchema = z.object({
  fullText: z.string(),
  targetSentenceIndex: z.number(),
  targetSentenceCharacterOffset: z.number(),
});
