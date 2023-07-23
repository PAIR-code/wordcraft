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

import {delay} from '@lib/utils';
import {
  ConfigService,
  InitializationService,
  OperationsService,
} from './services';

import {Lifecycle} from '../shared/types';

import {Service} from './service';

interface ServiceProvider {
  configService: ConfigService;
  initializationService: InitializationService;
  operationsService: OperationsService;
}

/**
 * The AppService class is responsible for managing the overall state of the
 * app. This includes
 * - Lifecycles
 * - Onboarding
 * - Overlay visibility
 */
export class AppService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  initialize() {
    console.log('initialize app!');
    this.isReady = true;
  }

  private get operationsService() {
    return this.serviceProvider.operationsService;
  }

  isReady = false;
  lifeCycleState: Lifecycle = 'ONBOARDING';
  activeSidebarTabIndex = 0;

  get areSidebarTabsDisabled() {
    return this.operationsService.isInOperation;
  }

  goToEditor() {
    this.lifeCycleState = 'EDITING';
  }

  /**
   * Initialize the editor (perhaps by loading preset prompts or fetching some
   * sort of state from the server), but for now fake it because switching to
   * the editor instantly after onboarding is a bit jarring.
   */
  async initializeEditor() {
    this.lifeCycleState = 'INITIALIZING';

    const delayMs = Math.random() * 3000 + 1000;
    await delay(delayMs);

    this.lifeCycleState = 'EDITING';
  }

  getDefaultText() {
    return 'An elderly man was sitting alone on a dark path. ';
  }
}

decorate(AppService, {
  activeSidebarTabIndex: observable,
  isReady: observable,
  lifeCycleState: observable,
});
