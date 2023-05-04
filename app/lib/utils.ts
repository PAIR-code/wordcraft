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

/** Simple debounce function */
export function debounce(fn: () => void, wait: number, immediate = false) {
  let timeout: number | undefined;
  return (...args: []) => {
    function later() {
      timeout = undefined;
      if (!immediate) fn(...args);
    }
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (callNow) fn(...args);
  };
}

/** Shuffles an array, returning a new array */
export function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/** Flattens a 2D array, returning a new array */
export function flatten2D<T>(array: T[][]): T[] {
  const output = [];
  for (let i = 0; i < array.length; i++) {
    output.push(...array[i]);
  }
  return output;
}

/** Reverses a string */
export function reverseString(str: string) {
  return str.split('').reverse().join('');
}

/** Normalizes sentence spaces between words to use a single space */
export function normalizeSentenceSpaces(sentence: string) {
  return sentence
    .split(' ')
    .filter((x) => x)
    .join(' ');
}

/** Capitalizes the first letter in a string */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Simple delaying promise */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => void resolve(), ms);
  });
}

/** Wraps a mouse handler with event propagation disabled */
export function preventDefault(fn: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    fn(event);
  };
}
