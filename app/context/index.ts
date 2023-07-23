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

import {
  continueSchema,
  elaborateSchema,
  firstSentenceSchema,
  freeformSchema,
  generateWithinSentenceSchema,
  metaPromptSchema,
  newStorySchema,
  nextSentenceSchema,
  replaceSchema,
  rewriteEndOfSentenceSchema,
  rewriteSelectionSchema,
  rewriteSentenceSchema,
  suggestRewriteSchema,
} from './schema';

import continueJson from './json/continue.json';
import elaborateJson from './json/elaborate.json';
import firstSentenceJson from './json/first_sentence.json';
import freeformJson from './json/freeform.json';
import generateWithinSentenceJson from './json/generate_within_sentence.json';
import metaPromptJson from './json/meta_prompt.json';
import newStoryJson from './json/new_story.json';
import nextSentenceJson from './json/next_sentence.json';
import replaceJson from './json/replace.json';
import rewriteEndOfSentenceJson from './json/rewrite_end_of_sentence.json';
import rewriteSelectionJson from './json/rewrite_selection.json';
import rewriteSentenceJson from './json/rewrite_sentence.json';
import suggestRewriteJson from './json/suggest_rewrite.json';

import {OperationType} from '@core/shared/types';

export class WordcraftContext {
  constructor() {
    this.registerExamples(OperationType.CONTINUE, continueSchema, continueJson);
    this.registerExamples(
      OperationType.ELABORATE,
      elaborateSchema,
      elaborateJson
    );
    this.registerExamples(
      OperationType.FIRST_SENTENCE,
      firstSentenceSchema,
      firstSentenceJson
    );
    this.registerExamples(OperationType.FREEFORM, freeformSchema, freeformJson);
    this.registerExamples(
      OperationType.GENERATE_WITHIN_SENTENCE,
      generateWithinSentenceSchema,
      generateWithinSentenceJson
    );
    this.registerExamples(
      OperationType.META_PROMPT,
      metaPromptSchema,
      metaPromptJson
    );
    this.registerExamples(
      OperationType.NEW_STORY,
      newStorySchema,
      newStoryJson
    );
    this.registerExamples(
      OperationType.NEXT_SENTENCE,
      nextSentenceSchema,
      nextSentenceJson
    );
    this.registerExamples(OperationType.REPLACE, replaceSchema, replaceJson);
    this.registerExamples(
      OperationType.REWRITE_END_OF_SENTENCE,
      rewriteEndOfSentenceSchema,
      rewriteEndOfSentenceJson
    );
    this.registerExamples(
      OperationType.REWRITE_SELECTION,
      rewriteSelectionSchema,
      rewriteSelectionJson
    );
    this.registerExamples(
      OperationType.REWRITE_SENTENCE,
      rewriteSentenceSchema,
      rewriteSentenceJson
    );
    this.registerExamples(
      OperationType.SUGGEST_REWRITE,
      suggestRewriteSchema,
      suggestRewriteJson
    );
  }

  private readonly examples = new Map<OperationType, Examples<any>>();

  private registerExamples<T extends z.ZodRawShape>(
    operationType: OperationType,
    schema: z.ZodObject<T>,
    json: any
  ) {
    try {
      // First, validate the JSON data that's being supplied.
      const DataSchema = z.array(schema);
      const examplesData = DataSchema.parse(json);
      type ExampleType = z.infer<typeof schema>;

      // Next, create a class that extends the inferred type of the schema.
      class ExamplesClass extends Examples<ExampleType> {}
      const examples = new ExamplesClass(examplesData);

      this.examples.set(operationType, examples);
    } catch (e) {
      console.error(`Error registering JSON examples for ${operationType}`);
      for (const i in e.issues) {
        // Remove the array index
        const issue = e.issues[i];
        const path = issue.path.slice(1).join('.');
        const message = `Example index ${i}: expected type "${issue.expected}" at exampe.${path}, received "${issue.received}"`;
        console.error(message);
      }
    }
  }

  getExampleData<T>(operationType: OperationType): T[] {
    if (!this.examples.has(operationType)) {
      throw new Error(
        `No examples registered for operation (${operationType})`
      );
    }
    const examples = this.examples.get(operationType) as Examples<T>;
    return examples.getExampleData();
  }

  get documentType() {
    return 'story';
  }
}

abstract class Examples<T> {
  constructor(private readonly exampleData: T[]) {}

  getExampleData(): T[] {
    return [...this.exampleData];
  }
}

// Export all schema types for use across the app
export type ContinueExample = z.infer<typeof continueSchema>;
export type ElaborateExample = z.infer<typeof elaborateSchema>;
export type FirstSentenceExample = z.infer<typeof firstSentenceSchema>;
export type FreeformExample = z.infer<typeof freeformSchema>;
export type GenerateWithinSentenceExample = z.infer<
  typeof generateWithinSentenceSchema
>;
export type MetaPromptExample = z.infer<typeof metaPromptSchema>;
export type NewStoryExample = z.infer<typeof newStorySchema>;
export type NextSentenceExample = z.infer<typeof nextSentenceSchema>;
export type ReplaceExample = z.infer<typeof replaceSchema>;
export type RewriteEndOfSentenceExample = z.infer<
  typeof rewriteEndOfSentenceSchema
>;
export type RewriteSelectionExample = z.infer<typeof rewriteSelectionSchema>;
export type RewriteSentenceExample = z.infer<typeof rewriteSentenceSchema>;
export type SuggestRewriteExample = z.infer<typeof suggestRewriteSchema>;
