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

import {
  ContinuePromptParams,
  ElaboratePromptParams,
  FirstSentencePromptParams,
  FreeformPromptParams,
  GenerateWithinSentencePromptParams,
  MetaPromptPromptParams,
  NextSentencePromptParams,
  NewStoryPromptParams,
  ReplacePromptParams,
  RewriteEndOfSentencePromptParams,
  RewriteSelectionPromptParams,
  RewriteSentencePromptParams,
  SuggestRewritePromptParams,
} from '@core/shared/interfaces';
import {WordcraftContext} from '../context';
import {ContextService, StatusService} from '@services/services';
import {ModelResults} from '@core/shared/types';

import {dedupeResults} from './utils';

interface ServiceProvider {
  contextService: ContextService;
  statusService: StatusService;
}

export type MakePromptHandlerFn<T> = (
  model: Model,
  context: WordcraftContext
) => (params: T) => Promise<ModelResults>;

/**
 * A base class for all Models queried by the wordcraft app
 */
// tslint:disable:no-any
export abstract class Model {
  constructor(private readonly serviceProvider: ServiceProvider) {
    this.makePromptHandler = this.makePromptHandler.bind(this);
  }

  wrap(text: string) {
    return text;
  }

  getBlank() {
    return '';
  }

  abstract getStoryPrefix(): string;

  insertBlank(pre: string, post: string) {
    return `${pre}${this.getBlank()}${post}`;
  }

  get contextService() {
    return this.serviceProvider.contextService;
  }

  get statusService() {
    return this.serviceProvider.statusService;
  }

  get context() {
    return this.contextService.getContext();
  }

  makePromptHandler<T>(
    makePromptHandlerFn: MakePromptHandlerFn<T>
  ): (params: T) => Promise<ModelResults> {
    const promptHandlerFn = makePromptHandlerFn(this, this.context);
    return async function promptHandler(params: T) {
      const results = await promptHandlerFn(params);
      return dedupeResults(results);
    };
  }

  parseResults(results: ModelResults) {
    return results;
  }

  // tslint:disable-next-line:no-any
  query(prompt: string | string[]): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async continue(params: ContinuePromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async elaborate(params: ElaboratePromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async firstSentence(
    params: FirstSentencePromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async freeform(params: FreeformPromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async generateWithinSentence(
    params: GenerateWithinSentencePromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async metaPrompt(params: MetaPromptPromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async nextSentence(params: NextSentencePromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async newStory(params: NewStoryPromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async refine(): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async replace(params: ReplacePromptParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async rewriteEndOfSentence(
    params: RewriteEndOfSentencePromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async rewriteSelection(
    params: RewriteSelectionPromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async rewriteSentence(
    params: RewriteSentencePromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }

  async suggestRewrite(
    params: SuggestRewritePromptParams
  ): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export type ModelConstructor = typeof Model;
