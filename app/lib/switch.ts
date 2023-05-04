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

interface SwitchDict<T> {
  [key: string]: T;
}

/**
 * A helper function for making a dict-based switch, which makes looking up a
 * value for a certain key a little bit easier than a big nest of if/else
 * statements. Use it like:
 *
 * const getOption = makeSwitch({
 *   a: 'flerp',
 *   b: 'derp',
 * }, '');
 *
 * conts option = getOption('a');
 */
export function makeSwitch<T>(dict: SwitchDict<T>, defaultValue: T) {
  return (key: string) => {
    // tslint:disable-next-line:no-any
    const variant = (dict as any)[key];
    if (variant) return variant;
    return defaultValue;
  };
}
