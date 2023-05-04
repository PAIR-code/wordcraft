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
import {computed, decorate, observable} from 'mobx';

import {DialogService} from './services';

import {Service} from './service';

const TIMEOUT_MS = 5000;

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export interface ServiceProvider {
  dialogService: DialogService;
}

/**
 * A singleton class that handles all API error status messages.
 */
export class StatusService extends Service {
  private errorId: number = 0;
  /**
   * An observable map of error messages by error id.
   */
  errorEvents = new Map<number, string>();
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get dialogService() {
    return this.serviceProvider.dialogService;
  }

  get errorMessages() {
    return [...this.errorEvents.values()];
  }

  get hasError() {
    return this.errorMessages.length > 0;
  }

  get errorMessage() {
    return `${this.errorMessages.join('\n')}. See console for more details)`;
  }

  addError(message: string, clearAfterTimeout = true) {
    const id = this.errorId;
    this.errorEvents.set(id, message);

    console.error(message);
    this.dialogService.openErrorSnackbar(message);

    if (clearAfterTimeout) {
      window.setTimeout(() => {
        this.clearError(id);
      }, TIMEOUT_MS);
      this.errorId += 1;
    }
  }

  clearError(id: number) {
    this.errorEvents.delete(id);
  }
}

decorate(StatusService, {
  errorEvents: observable,
  errorMessage: computed,
  errorMessages: computed,
  hasError: computed,
});
