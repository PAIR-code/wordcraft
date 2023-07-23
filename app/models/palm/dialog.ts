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
import {DialogModel} from '../dialog_model';
import {callDialogModel, ModelParams} from './api';
import {createModelResults} from '../utils';

import {ContextService, StatusService} from '@services/services';

interface ServiceProvider {
  contextService: ContextService;
  statusService: StatusService;
}
/**
 * A Model representing PaLM Dialog API.
 */
export class PalmDialogModel extends DialogModel {
  constructor(serviceProvider: ServiceProvider) {
    super(serviceProvider);
  }

  override async query(
    params: DialogParams,
    modelParams: Partial<ModelParams> = {}
  ) {
    let temperature = (params as any).temperature;
    temperature = temperature === undefined ? 0.7 : temperature;

    const queryParams = {
      ...modelParams,
      candidateCount: 1,
      prompt: {
        messages: params.messages,
      },
      temperature: temperature,
    };

    const res = await callDialogModel(queryParams);
    const response = await res.json();
    console.log('🚀 model results: ', response);

    const responseText = response.candidates?.length
      ? response.candidates.map((candidate) => candidate.content)
      : [];

    const results = createModelResults(responseText);
    return results;
  }
}
