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
import {computed, decorate, observable, reaction} from 'mobx';

import {LocalStorageService} from './services';
import {ModelResult} from '../shared/types';

import {Service} from './service';

interface ServiceProvider {
  localStorageService: LocalStorageService;
}

/**
 * The StarredResultsService class is responsible for managing starred results.
 */
export class StarredResultsService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
    reaction(
      () => this.starredResults,
      () => {
        this.syncToLocalStorage();
      }
    );
  }

  private get localStorageService() {
    return this.serviceProvider.localStorageService;
  }

  private syncToLocalStorage() {
    this.localStorageService.setStarredResults(this.starredResults);
  }

  entries = new Map<string, ModelResult>();
  /**
   * We only want to show the starred tab in the sidebar when the user has
   * actually starred something. We turn this flag on, and never turn it off
   * because the user could remove all starred entries while in the tab and it's
   * a bit awkward to then hide the tab...
   */
  shouldShowStarredTab = false;

  get starredResults(): ModelResult[] {
    return [...this.entries.values()];
  }

  hasStarred(result: ModelResult) {
    return this.entries.has(result.uuid);
  }

  initializeFromLocalStorage(starred: ModelResult[]) {
    const entries: Array<[string, ModelResult]> = starred.map((result) => {
      return [result.uuid, result];
    });
    this.entries = new Map<string, ModelResult>(entries);
    if (this.entries.size > 0) {
      this.shouldShowStarredTab = true;
    }
  }

  star(result: ModelResult) {
    this.entries.set(result.uuid, result);
    this.shouldShowStarredTab = true;
  }

  unstar(result: ModelResult) {
    this.entries.delete(result.uuid);
  }

  toggle(result: ModelResult) {
    if (this.hasStarred(result)) {
      this.unstar(result);
    } else {
      this.star(result);
    }
  }
}

decorate(StarredResultsService, {
  entries: observable,
  starredResults: computed,
  shouldShowStarredTab: observable,
});
