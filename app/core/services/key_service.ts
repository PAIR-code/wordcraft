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
import {Service} from './service';
import {testApi} from '../../models/genai/api';

interface ServiceProvider {
  localStorageService: LocalStorageService;
}

/**
 * The KeyService class is responsible for managing and checking API Keys
 */
export class KeyService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get localStorageService() {
    return this.serviceProvider.localStorageService;
  }

  apiKey: string = '';
  isEnvApiKey = false;
  isLocalStorageApiKey = false;

  get hasApiKey() {
    return this.apiKey !== '';
  }

  initialize() {
    // First, check if there's a key in the .env file
    const envKey = process.env.PALM_API_KEY;
    if (envKey) {
      this.apiKey = envKey;
      this.isEnvApiKey = true;
      return;
    }
    // Then check localStorage
    const localStorageKey = this.localStorageService.getApiKey();
    console.log(localStorageKey);
    if (localStorageKey) {
      this.apiKey = localStorageKey;
      this.isLocalStorageApiKey = true;
    }
  }

  async checkApiKey(apiKey: string): Promise<boolean> {
    const res = await testApi(apiKey);
    return res.ok;
  }
}

decorate(KeyService, {
  apiKey: observable,
  isEnvApiKey: observable,
  isLocalStorageApiKey: observable,
  hasApiKey: computed,
});
