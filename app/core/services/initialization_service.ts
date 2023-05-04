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
import {Service} from './service';
import {
  AppService,
  ContextService,
  DialogService,
  LocalStorageService,
  MetaTextService,
  ModelService,
  OperationsService,
  RouteService,
  SentencesService,
  StarredResultsService,
  TextEditorService,
} from './services';
import {ConfigService} from './config_service';
import {WordcraftContext} from '../../context';

import {DocumentStoreService} from './document_store_service';

interface ServiceProvider {
  appService: AppService;
  configService: ConfigService;
  dialogService: DialogService;
  contextService: ContextService;
  documentStoreService: DocumentStoreService;
  localStorageService: LocalStorageService;
  metaTextService: MetaTextService;
  modelService: ModelService;
  operationsService: OperationsService;
  routeService: RouteService;
  sentencesService: SentencesService;
  starredResultsService: StarredResultsService;
  textEditorService: TextEditorService;
}

/**
 * Responsible for initializing all other services upon app initialization.
 */
export class InitializationService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get documentStoreService(): DocumentStoreService {
    return this.serviceProvider.documentStoreService;
  }

  private isResetting = false;
  private beforeUnload = () => {};

  initialize(context: WordcraftContext) {
    const {
      appService,
      contextService,
      dialogService,
      documentStoreService,
      localStorageService,
      metaTextService,
      operationsService,
      routeService,
      textEditorService,
      starredResultsService,
    } = this.serviceProvider;

    contextService.initialize(context);
    dialogService.initialize();

    routeService.initialize();

    const localStorageState = localStorageService.getState();
    const shouldInitializeFromLocalStorage = localStorageState.editor !== null;

    if (shouldInitializeFromLocalStorage) {
      textEditorService.initializeFromLocalStorage(localStorageState.editor);
      metaTextService.initializeFromLocalStorage(localStorageState);
      starredResultsService.initializeFromLocalStorage(
        localStorageState.starred
      );

      // We'll only go directly to the editor if there exists a documentId
      const {documentId} = localStorageState;
      if (documentId != null) {
        documentStoreService.setDocumentId(documentId);
        appService.goToEditor();
      }
    }

    this.beforeUnload = () => {
      if (
        appService.lifeCycleState === 'EDITING' &&
        !operationsService.isInOperation
      ) {
        textEditorService.setLastSnapshot();
      }
    };

    window.addEventListener('beforeunload', this.beforeUnload);

    // Finally, declare the app ready
    appService.isReady = true;
  }

  private clearDocumentAndReload() {
    const {localStorageService} = this.serviceProvider;
    localStorageService.clearDocumentState();

    // Even though there's logic in the handler to ensure that we're only
    // setting the last snapshot when we're reloading the page during editing,
    // we don't want this handler to fire when we're manually reloading the page
    // since it can cause issues with our manual clearing of local storage.
    window.removeEventListener('beforeunload', this.beforeUnload);
    window.location.reload();
  }

  async reset(automaticallySave = true) {
    if (this.isResetting) {
      return;
    }

    this.isResetting = true;

    try {
      if (automaticallySave) {
        await this.documentStoreService.saveDocument();
      }
    } catch (e: unknown) {
      // Noop, just log the error
      console.error(e);
    }
    this.isResetting = false;
    this.clearDocumentAndReload();
  }
}
