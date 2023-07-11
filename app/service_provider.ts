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

// Core Services
import {WordcraftCore} from './core/wordcraft_core';
import {AppService} from './core/services/app_service';
import {ChatService} from './core/services/chat_service';
import {ConfigService} from './core/services/config_service';
import {ContextService} from './core/services/context_service';
import {CursorService} from './core/services/cursor_service';
import {DialogService} from './core/services/dialog_service';
import {DocumentStoreService} from './core/services/document_store_service';
import {FeatureFlagsService} from './core/services/feature_flags_service';
import {InitializationService} from './core/services/initialization_service';
import {KeyService} from './core/services/key_service';
import {KeyboardService} from './core/services/keyboard_service';
import {LocalStorageService} from './core/services/local_storage_service';
import {MetaTextService} from './core/services/meta_text_service';
import {ModelService} from './core/services/model_service';
import {OperationsService} from './core/services/operations_service';
import {RouteService} from './core/services/route_service';
import {SentencesService} from './core/services/sentences_service';
import {StarredResultsService} from './core/services/starred_results_service';
import {StatusService} from './core/services/status_service';
import {TextEditorService} from './core/services/text_editor_service';

/**
 * Defines a map of services to their identifier
 */
export function makeServiceProvider(self: WordcraftCore) {
  const serviceProvider = {
    get appService() {
      return self.getService(AppService);
    },
    get chatService() {
      return self.getService(ChatService);
    },
    get configService() {
      return self.getService(ConfigService);
    },
    get contextService() {
      return self.getService(ContextService);
    },
    get cursorService() {
      return self.getService(CursorService);
    },
    get dialogService() {
      return self.getService(DialogService);
    },
    get documentStoreService() {
      return self.getService(DocumentStoreService);
    },
    get featureFlagsService() {
      return self.getService(FeatureFlagsService);
    },
    get initializationService() {
      return self.getService(InitializationService);
    },
    get keyService() {
      return self.getService(KeyService);
    },
    get keyboardService() {
      return self.getService(KeyboardService);
    },
    get localStorageService() {
      return self.getService(LocalStorageService);
    },
    get metaTextService() {
      return self.getService(MetaTextService);
    },
    get modelService() {
      return self.getService(ModelService);
    },
    get operationsService() {
      return self.getService(OperationsService);
    },
    get routeService() {
      return self.getService(RouteService);
    },
    get sentencesService() {
      return self.getService(SentencesService);
    },
    get starredResultsService() {
      return self.getService(StarredResultsService);
    },
    get statusService() {
      return self.getService(StatusService);
    },
    get textEditorService() {
      return self.getService(TextEditorService);
    },
  };

  return serviceProvider;
}
