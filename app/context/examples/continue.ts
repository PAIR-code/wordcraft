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

export interface ContinueExample {
  input: string;
  target: string;
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export const exampleData = [
  {
    input: 'A young boy was sitting on the sidewalk.',
    target: 'He was holding a lantern and looking ahead up the road.‌',
  },
  {
    input: 'The preacher took a long breath, and let it out',
    target:
      'slowly through his nose. "It wasn\'t long ago," he said, "that those boys would\'ve been dead and buried.',
  },
  {
    input: 'The leaves had begun to change to a deep',
    target:
      'auburn. A single, golden leaf had floated to the ground; caught in the sudden windstorm. The day had seemed so serene and peaceful just moments before.',
  },
  {
    input: 'The clock chimed again,',
    target:
      'bringing her back to reality. The sound had become a constant companion since she had arrived that morning, a welcome companion in an empty house.',
  },
];

class ContinueExamples extends Examples<ContinueExample> {}

export const examples = new ContinueExamples(exampleData);
