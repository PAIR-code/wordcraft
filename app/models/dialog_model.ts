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
import {DialogParams} from '@core/shared/interfaces';
import {ContextService, StatusService} from '@services/services';
import {ModelResults} from '@core/shared/types';

interface ServiceProvider {
  contextService: ContextService;
  statusService: StatusService;
}

/**
 * A base class for the dialog model used in the chat feature of the Wordcraft
 * app.
 */
// tslint:disable:no-any
export abstract class DialogModel {
  constructor(private readonly serviceProvider: ServiceProvider) {}

  get contextService() {
    return this.serviceProvider.contextService;
  }

  get statusService() {
    return this.serviceProvider.statusService;
  }

  get context() {
    return this.contextService.getContext();
  }

  async query(params: DialogParams): Promise<ModelResults> {
    throw new Error('Not yet implemented');
  }
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export type DialogModelConstructor = typeof DialogModel;
