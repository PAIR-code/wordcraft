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

/**
 * An enum describing all operations in the Wordcraft App.
 */
export const enum OperationType {
  CONTINUE = 'CONTINUE',
  ELABORATE = 'ELABORATE',
  FIRST_SENTENCE = 'FIRST_SENTENCE',
  FREEFORM = 'FREEFORM',
  GENERATE_WITHIN_SENTENCE = 'GENERATE_WITHIN_SENTENCE',
  META_PROMPT = 'META_PROMPT',
  NEW_STORY = 'NEW_STORY',
  NEXT_SENTENCE = 'NEXT_SENTENCE',
  REPLACE = 'REPLACE',
  REWRITE_CHOICE = 'REWRITE_CHOICE',
  REWRITE_END_OF_SENTENCE = 'REWRITE_END_OF_SENTENCE',
  REWRITE_SELECTION = 'REWRITE_SELECTION',
  REWRITE_SENTENCE = 'REWRITE_SENTENCE',
  SUGGEST_REWRITE = 'SUGGEST_REWRITE',
  // Default to NONE
  NONE = 'NONE',
}

/**
 * A representation of what the state of the cursor is, in order to determine
 * which operations are available.
 */
export const enum OperationSite {
  SELECTION = 'SELECTION',
  EMPTY_DOCUMENT = 'EMPTY_DOCUMENT',
  EMPTY_SECTION = 'EMPTY_SECTION',
  START_OF_SECTION = 'START_OF_SECTION',
  END_OF_SECTION = 'END_OF_SECTION',
  WITHIN_SENTENCE = 'WITHIN_SENTENCE',
  BETWEEN_SENTENCES = 'BETWEEN_SENTENCES',
  NONE = 'NONE',
}

export const enum OperationTrigger {
  BUTTON = 'BUTTON',
  CONTROL = 'CONTROL',
  KEY_COMMAND = 'KEY_COMMAND',
  OPERATION = 'OPERATION', // Triggered by another operation
  APP = 'APP', // Triggered by the app lifecyle, such as onboarding
}

export const enum StepLifecycle {
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

export const enum TextType {
  WORD = 'word', // A single word or entity (e.g. cat, city-state)
  PHRASE = 'phrase', // Semantically grouped words (e.g. the big red dog)
  SENTENCE = 'sentence', // A complete sentence
  TEXT = 'text', // Unstructured text
}

export interface EditorMetaText {
  title: string;
  outline: string;
}

export type Lifecycle = 'ONBOARDING' | 'INITIALIZING' | 'EDITING';

export interface ModelResult {
  text: string;
  uuid: string;
  // tslint:disable-next-line:no-any
  data?: any;
}

export type ModelResults = ModelResult[];

export interface InfillResponse {
  results: string[];
}

export type DidQueryModelCallback =
  // tslint:disable-next-line:no-any
  (data: any, results: ModelResults) => void;

// Types for the TrackService
export type Author = 'user' | 'model';
export type AnnotatedText = Array<{span: string; author: Author}>;

export type Edit = 'insert' | 'delete';

export interface LogEvent {
  name: Edit;
  timestamp: number;
  position: number;
  isUndo: boolean;
  isRedo: boolean;
  author?: string;
  content?: string;
  deletedContent?: string;
}

export interface LogAPIEvent {
  name: 'api';
  timestamp: number;
  modelId: string;
  input: string[];
  response: string[];
  removedResponses?: Array<{index: number; text: string}>; // Responses removed from the sidebar.
  selection?: string; // What the user ultimately selects.
  correction?: AnnotatedText; // Corrections the user makes to their selection.
}

export interface AnnotatedLogEvent extends LogEvent {
  api?: LogAPIEvent;
}

export type Log = Array<LogEvent | LogAPIEvent>;

export interface ChatConversation {
  messages: string[];
}

export interface SerializedLog {
  // An edit event log.
  history: AnnotatedLogEvent[];
  // The final story annotated by authorship.
  authorship: AnnotatedText;
  // A history of conversations between user and model.
  conversations: ChatConversation[];
}
