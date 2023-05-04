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

export interface WordinessOption {
  text: string;
  max: number;
}

export const wordinessOptions: WordinessOption[] = [
  {text: 'a word', max: 1},
  {text: 'a phrase', max: 5},
  {text: 'a long phrase', max: 15},
  {text: 'about twenty words', max: 20},
  {text: 'many many words', max: Infinity},
];
