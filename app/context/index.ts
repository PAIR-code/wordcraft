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
import contextJson from './context.json';
import {jsonSchema} from './schema';
import {
  buildContinueExamples,
  buildFirstSentenceExamples,
  buildGenerateWithinSentenceExamples,
  buildNextSentenceExamples,
  buildRewriteEndOfSentenceExamples,
} from './examples_from_stories';

import {OperationType} from '@core/shared/types';

export class WordcraftContext {
  constructor() {
    // Parse the context JSON
    const context = jsonSchema.parse(contextJson);

    this.preamble = context.preamble;
    this.documentType = context.documentType;

    // Now, register the examples for operation types that are directly
    // configured in the context JSON.
    this.registerExamples(
      OperationType.ELABORATE,
      elaborateSchema,
      context.examples.elaborate
    );
    this.registerExamples(
      OperationType.FREEFORM,
      freeformSchema,
      context.examples.freeform
    );
    this.registerExamples(
      OperationType.META_PROMPT,
      metaPromptSchema,
      context.examples.metaPrompt
    );
    this.registerExamples(
      OperationType.NEW_STORY,
      newStorySchema,
      context.examples.newStory
    );
    this.registerExamples(
      OperationType.REPLACE,
      replaceSchema,
      context.examples.replace
    );
    this.registerExamples(
      OperationType.REWRITE_SELECTION,
      rewriteSelectionSchema,
      context.examples.rewriteSelection
    );
    this.registerExamples(
      OperationType.REWRITE_SENTENCE,
      rewriteSentenceSchema,
      context.examples.rewriteSentence
    );
    this.registerExamples(
      OperationType.SUGGEST_REWRITE,
      suggestRewriteSchema,
      context.examples.suggestRewrite
    );

    // Finall, register the examples for operation types that are indirectly
    // constructed from the `stories` fields in the context JSON.
    const continueExamples = buildContinueExamples(context);
    this.registerExamples(
      OperationType.CONTINUE,
      continueSchema,
      continueExamples
    );

    const firstSentenceExamples = buildFirstSentenceExamples(context);
    this.registerExamples(
      OperationType.FIRST_SENTENCE,
      firstSentenceSchema,
      firstSentenceExamples
    );

    const generateWithinSentenceExamples =
      buildGenerateWithinSentenceExamples(context);
    this.registerExamples(
      OperationType.GENERATE_WITHIN_SENTENCE,
      generateWithinSentenceSchema,
      generateWithinSentenceExamples
    );

    const nextSentenceExamples = buildNextSentenceExamples(context);
    this.registerExamples(
      OperationType.NEXT_SENTENCE,
      nextSentenceSchema,
      nextSentenceExamples
    );

    const rewriteEndOfSentenceExamples = buildRewriteEndOfSentenceExamples(context);
    this.registerExamples(
      OperationType.REWRITE_END_OF_SENTENCE,
      rewriteEndOfSentenceSchema,
      rewriteEndOfSentenceExamples
    );
  }

  readonly preamble: string;
  readonly documentType: string;

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
