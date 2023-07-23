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
import {decorate, observable} from 'mobx';

import {StateSnapshot} from '@lib/mobiledoc';
import {Service} from './service';
import {
  AppService,
  DialogService,
  LocalStorageService,
  StarredResultsService,
  TextEditorService,
} from './services';
import {ModelResult} from '../shared/types';
import {delay} from '@lib/utils';

interface ServiceProvider {
  appService: AppService;
  dialogService: DialogService;
  localStorageService: LocalStorageService;
  starredResultsService: StarredResultsService;
  textEditorService: TextEditorService;
}

export interface SavedDocument {
  stateSnapshotJson: string;
  text: string;
  starred: ModelResult[];
  timestamp: number;
  id: string;
}

/**
 * Responsible for managing loading and saving of documents (stories)
 */
export class DocumentStoreService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private autoSaveIntervalId = 0;
  private lastSavedText = '';

  isDeleting = false;
  isLoading = false;
  isSaving = false;
  documentId: string | null = null;
  userDocuments: SavedDocument[] = [];

  private get appService(): AppService {
    return this.serviceProvider.appService;
  }

  private get dialogService(): DialogService {
    return this.serviceProvider.dialogService;
  }

  private get localStorageService() {
    return this.serviceProvider.localStorageService;
  }

  private get starredResultsService() {
    return this.serviceProvider.starredResultsService;
  }

  private get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  setDocumentId(documentId: string | null) {
    this.documentId = documentId;
  }

  async loadUserDocuments(): Promise<SavedDocument[]> {
    return this.wrapIsLoading(async () => {
      const rawUserDocuments = this.localStorageService.loadDocuments();

      // Process documents to make sure they match the schema - history,
      // authorship and conversations arrays might not be present on document,
      // so initialize them as empty and then overwrite with ...document if
      // present.
      let userDocuments = rawUserDocuments.map((document) => {
        return {
          history: [],
          authorship: [],
          conversations: [],
          // tslint:disable-next-line:no-any
          ...(document as any),
        };
      }) as SavedDocument[];
      userDocuments = userDocuments.filter((doc) => {
        return doc.text && doc.text.length > 0;
      });
      this.userDocuments = userDocuments;

      return this.userDocuments;
    });
  }

  async loadSavedDocument(document: SavedDocument) {
    let stateSnapshot: StateSnapshot | null = null;
    try {
      stateSnapshot = JSON.parse(document.stateSnapshotJson) as StateSnapshot;
    } catch (err: unknown) {
      // Noop;
    }
    this.textEditorService.initializeFromLocalStorage(stateSnapshot);

    this.documentId = document.id;
    this.lastSavedText = document.text;

    this.localStorageService.setDocumentId(document.id);
    this.starredResultsService.initializeFromLocalStorage(
      document.starred || []
    );
    this.appService.goToEditor();
  }

  async loadAllDocuments(): Promise<SavedDocument[]> {
    return this.wrapIsLoading(async () => {
      return this.localStorageService.loadDocuments();
    });
  }

  async deleteCurrentDocument() {
    if (this.documentId) {
      return this.deleteDocument(this.documentId);
    }
  }

  async deleteDocument(documentId: string) {
    if (this.isDeleting) return;

    const confirmed = await this.dialogService.openConfirmDialog(
      "Are you sure you want to delete this story? This can't be undone."
    );
    if (confirmed) {
      this.isDeleting = true;
      this.userDocuments = this.userDocuments.filter(
        (doc) => doc.id !== documentId
      );
      this.localStorageService.deleteDocument(documentId);
      this.isDeleting = false;
    }
  }

  private async wrapIsLoading<T>(fn: () => Promise<T>) {
    this.isLoading = true;
    const result = await fn();
    this.isLoading = false;
    return result;
  }

  private createDocumentToSave(): Omit<SavedDocument, 'id'> {
    const text = this.textEditorService.getPlainText();
    const starred = this.starredResultsService.starredResults;

    return {
      stateSnapshotJson: JSON.stringify(
        this.textEditorService.getStateSnapshot()
      ),
      text,
      timestamp: Date.now(),
      starred,
    };
  }

  async saveDocument() {
    const documentData = this.createDocumentToSave();
    this.lastSavedText = documentData.text;

    // Don't save stories with no text
    if (documentData.text === '') {
      return;
    }

    this.isSaving = true;
    await delay(Math.random() * 500);
    const documentId = this.localStorageService.saveDocument(
      documentData,
      this.documentId
    );

    this.documentId = documentId;
    this.localStorageService.setDocumentId(this.documentId);

    this.isSaving = false;
  }

  startAutoSave() {
    this.autoSaveIntervalId = window.setInterval(() => {
      const text = this.textEditorService.getPlainText();
      // Only automatically save when the document has changed
      if (text !== this.lastSavedText) {
        this.saveDocument();
      }
    }, 10000);
  }

  endAutoSave() {
    clearInterval(this.autoSaveIntervalId);
  }
}

decorate(DocumentStoreService, {
  isDeleting: observable,
  isLoading: observable,
  isSaving: observable,
  userDocuments: observable,
});
