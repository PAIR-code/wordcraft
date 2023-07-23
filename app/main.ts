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

import {AppComponent} from './components/app';
import {wordcraftCore} from '@core/wordcraft_core';

import * as Operations from '@core/operations';

import {ModelService} from '@services/model_service';
import {OperationsService} from '@services/operations_service';

import {WordcraftContext} from './context';
import {makeServiceProvider} from './service_provider';
import {InitializationService} from '@services/initialization_service';
import {PalmModel} from '@models/palm';
import {PalmDialogModel} from '@models/palm/dialog';

wordcraftCore.initialize(makeServiceProvider);

const initializationService = wordcraftCore.getService(InitializationService);
const context = new WordcraftContext();
initializationService.initialize(context);

// Register Operations
const operationsService = wordcraftCore.getService(OperationsService);
operationsService.registerOperations(
  Operations.ContinuationOperation,
  Operations.ElaborationOperation,
  Operations.FirstSentenceOperation,
  Operations.FreeformOperation,
  Operations.GenerateWithinSentenceOperation,
  Operations.NextSentenceOperation,
  Operations.NewStoryOperation,
  Operations.ReplaceOperation,
  Operations.RewriteEndOfSentenceOperation,
  Operations.RewriteSelectionOperation,
  Operations.RewriteSentenceOperation
);

// Register prompts with models
const modelService = wordcraftCore.getService(ModelService);
modelService.useModel(PalmModel);
modelService.useDialogModel(PalmDialogModel);

// Initialize the app after page load, so that all of the javascript is present
// before we build the app.
window.addEventListener('load', () => {
  const appComponent = new AppComponent();
  document.body.appendChild(appComponent);
});
