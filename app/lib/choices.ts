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

import {decorate, observable, runInAction} from 'mobx';

/**
 * A handy observable data structure for supporting choosing from a list of
 * choices (e.g. continuations). This encapsulates the super common pattern of
 * cycling through a list of entries.
 */
export class Choices<T> {
  constructor(public entries: T[] = []) {}

  index = 0;

  getEntries() {
    return [...this.entries];
  }

  getNEntries() {
    return this.entries.length;
  }

  getEntry(index: number) {
    return this.isWithinRange(index) ? this.getEntries()[index] : null;
  }

  getCurrentEntry() {
    return this.getEntry(this.index);
  }

  getIndex() {
    return this.index;
  }

  private isWithinRange(index: number) {
    const entries = this.getEntries();
    return index >= 0 && index < entries.length;
  }

  private deltaIndex(delta: number) {
    const entries = this.getEntries();
    const index = this.getIndex();
    let nextIndex = index + delta;
    if (nextIndex >= entries.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = entries.length - 1;
    }
    this.index = nextIndex;
  }

  incrementIndex() {
    this.deltaIndex(+1);
  }

  decrementIndex() {
    this.deltaIndex(-1);
  }

  removeAtIndex(index: number) {
    runInAction(() => {
      if (index >= 0 && index < this.entries.length) {
        this.entries.splice(index, 1);
        if (this.index > 0 && this.index > this.entries.length - 1) {
          this.index = this.entries.length - 1;
        }
      }
    });
  }

  setIndex(index: number) {
    this.index = index;
  }

  setEntries(entries: T[]) {
    this.entries = entries;
    this.index = 0;
  }

  clear() {
    this.setEntries([]);
  }

  updateEntry(index: number, entry: T) {
    this.entries[index] = entry;
  }
}

decorate(Choices, {
  entries: observable.shallow,
  index: observable,
});
