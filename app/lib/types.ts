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
 * Generic wrapper type for constructors, used in the DI system.
 */
// tslint:disable-next-line:interface-over-type-literal
export type Constructor<T> = {
  // tslint:disable-next-line:no-any
  new (...args: any[]): T;
};

/** The Model Message Array Entry */
export interface ModelMessage {
  text: string;
}

/** The Model Response JSON */
export interface ModelResponse {
  messages: ModelMessage[];
  stats: {};
}

/** The Infill Response JSON */
export interface InfillResponse {
  results: string[];
}

// tslint:disable:no-any
/** Argument type helper */
export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;

/** Class method type helper */
export type TypeOfClassMethod<T, M extends keyof T> = T[M] extends (
  ...args: any
) => any
  ? T[M]
  : never;
// tslint:enable:no-any

/** Method type helper */
export type MethodTypes<T, M extends keyof T> = ArgumentTypes<
  TypeOfClassMethod<T, M>
>;
