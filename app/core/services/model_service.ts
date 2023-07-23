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
import {Constructor} from '@lib/types';
import {Model, DialogModel} from '../../models';
import {ConfigService} from './config_service';

import {Service} from './service';

interface ServiceProvider {
  configService: ConfigService;
}

/**
 * Responsible for managing models and their relationship to various operations
 */
export class ModelService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  protected get configService() {
    return this.serviceProvider.configService;
  }

  private model: Model;
  private dialogModel?: DialogModel;

  useModel(modelClass: Constructor<Model>) {
    const model = new modelClass(this.serviceProvider);
    this.model = model;
  }

  getModel() {
    if (!this.model) {
      throw new Error(`No model registered!`);
    }
    return this.model;
  }

  useDialogModel(modelClass: Constructor<DialogModel>) {
    const dialogModel = new modelClass(this.serviceProvider);
    this.dialogModel = dialogModel;
  }

  get hasDialogModel() {
    return this.dialogModel != null;
  }

  getDialogModel() {
    return this.dialogModel;
  }
}
