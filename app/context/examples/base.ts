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
type GetExamplesFn<T> = (...args: any[]) => T[];

export abstract class Examples<T> {
  constructor(
    exampleDataOrGetter: T[] | GetExamplesFn<T>,
    fieldNames?: string[]
  ) {
    if (exampleDataOrGetter instanceof Array) {
      this.exampleData = exampleDataOrGetter;
      this.fieldNames = Object.keys(exampleDataOrGetter[0]);
    } else {
      this._getExampleData = exampleDataOrGetter;
    }
  }

  fieldNames: string[] = [];
  private exampleData: T[];

  private readonly _getExampleData?: () => T[];

  getExampleData(...args: any[]): T[] {
    if (this._getExampleData) {
      return this.getExampleData(...args);
    }
    return [...this.exampleData];
  }
}
