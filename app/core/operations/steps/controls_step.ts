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
import {OperationControls} from '../../shared/interfaces';
import {KeyboardService} from '../../services/keyboard_service';
import {Step} from './step';

export interface ServiceProvider {
  keyboardService: KeyboardService;
}

export class ControlsStep extends Step {
  constructor(
    private readonly serviceProvider: ServiceProvider,
    public controls: OperationControls,
    public title: string,
    public subtitle?: string
  ) {
    super();
  }

  keyboardServiceHelper = this.keyboardService.makeHelper('controlsStep');

  get keyboardService() {
    return this.serviceProvider.keyboardService;
  }

  override setup() {}

  override cleanup() {}
}
