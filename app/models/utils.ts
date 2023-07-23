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

import {uuid} from '@lib/uuid';
import {ModelResult, ModelResults} from '@core/shared/types';

/** Dedupes results with identical text field */
export function dedupeResults(results: ModelResults) {
  const textEntries = new Set<string>();
  return results.filter((result) => {
    const {text} = result;
    if (textEntries.has(text)) {
      return false;
    }
    textEntries.add(text);
    return true;
  });
}

/** Creates an array of ModelResults from an input text array */
export function createModelResults(responseText: string[]): ModelResults {
  return responseText.map((text) => {
    return createModelResult(text);
  });
}

/** Creates a ModelResult from an input text */
export function createModelResult(text: string): ModelResult {
  return {
    text,
    uuid: uuid(),
  };
}

/** Get text between two delimiters */
export function getTextBetweenDelimiters(txt: string, d0: string, d1: string) {
  // Note: s flag indicates a "single line", which counts newlines as characters
  // allowing the regex to capture multi-line output
  const re = new RegExp(`(?<=${d0})(.*?)(?=${d1})`, 's');
  const matches = txt.match(re);
  return matches ? matches[0] : null;
}

const SPECIAL_CHARACTERS = ['{', '}', '[', ']', '|'];
/**
 * Check to see if the output text contains any special characters, which are
 * usually not desirable to have in the output.
 **/
export function textContainsSpecialCharacters(text: string) {
  return SPECIAL_CHARACTERS.some((character) => text.includes(character));
}

/** Remove duplicates from an array of strings */
export function dedupeStrings(results: string[]): string[] {
  return [...new Set(results).values()];
}
