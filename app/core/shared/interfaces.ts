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
import {TemplateResult} from 'lit';

import {Operation} from '../operations/operation';
import {Model} from '@models/model';
import {WordcraftContext} from '../../context';

import {
  ModelResults,
  OperationSite,
  OperationTrigger,
  StepLifecycle,
  TextType,
} from './types';

export type MakePromptHandlerFn<T> = (
  model: Model,
  context: WordcraftContext
) => (params: T) => Promise<ModelResults>;

export interface ModelQueryParams {
  temperature?: number;
  topK?: number;
}

export interface OperationClass {
  // tslint:disable:no-any
  new (
    serviceProvider: any,
    trigger: OperationTrigger,
    ...params: any[]
  ): Operation;
  getButtonLabel(...params: any[]): string | TemplateResult;
  getDescription(...params: any[]): string | TemplateResult;
  // tslint:enable:no-any
  controls: OperationControls;
  globalControls: OperationControls;
  isAvailable(operationSite: OperationSite): boolean;
  id: string;
}

export type ControlPrefix = string | ((control: OperationControl) => string);

export interface OperationControl {
  value: string | number | boolean;
  getPrefix(): string | TemplateResult;
  getDescription(): string | TemplateResult;
}

export interface OperationControls {
  [key: string]: OperationControl;
}

export interface Step {
  state: StepLifecycle;
  resolve: () => void;
  // tslint:disable-next-line:no-any
  reject: (e: any) => void;
  readonly isFinished: boolean;
  setup(): void;
  cleanup(): void;
  pause(): void;
  unpause(): void;
  getPromise(): Promise<void>;
  cancelPromise(): void;
  start(): void;
  onStart(callback: () => void): void;
  cancel(): void;
  onCancel(callback: () => void): void;
  cancelOperation(): void;
  restart(): void;
  onRestart(callback: () => void): void;
  finish(): void;
  onFinish(callback: () => void): void;
}

/**
 * Prompt Parameter Interfaces
 */
export interface ContinuePromptParams {
  text: string;
}

export interface ElaboratePromptParams {
  text: string;
  toElaborate: string;
}

export interface FirstSentencePromptParams {
  text: string;
}

export interface FreeformPromptParams {
  text: string;
  instruction: string;
}

export interface GenerateWithinSentencePromptParams {
  pre: string;
  post: string;
  beginningOfSentence: string;
  endOfSentence: string;
}

export interface MetaPromptPromptParams {
  text: string;
}

export interface NewStoryPromptParams {
  topic: string;
}

export interface NextSentencePromptParams {
  pre: string;
  post: string;
  previousSentence: string;
}

export interface ReplacePromptParams {
  pre: string;
  post: string;
  nWords: number;
}

export interface RewriteEndOfSentencePromptParams {
  pre: string;
  post: string;
  beginningOfSentence: string;
}

export interface RewriteSelectionPromptParams {
  pre: string;
  post: string;
  toRewrite: string;
  howToRewrite: string;
}

export interface RewriteSentencePromptParams {
  pre: string;
  post: string;
  toRewrite: string;
  howToRewrite: string;
}

export interface SuggestRewritePromptParams {
  text: string;
  toRewrite: string;
  textType: TextType;
}

export interface DialogMessage {
  content: string;
  author: 'model' | 'user';
}

export interface DialogParams {
  messages: DialogMessage[];
}
