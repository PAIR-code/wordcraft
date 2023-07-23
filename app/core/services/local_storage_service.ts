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
import {StateSnapshot} from '@lib/mobiledoc';
import {ModelResult, SerializedLog} from '../shared/types';
import {SavedDocument} from '../services/document_store_service';
import {uuid} from '@lib/uuid';

import {Service} from './service';

type SavedDocuments = {[key: string]: SavedDocument};

export interface LocalStorageState {
  hasBeenWelcomed: boolean;
  editor: StateSnapshot | null;
  meta: {};
  starred: ModelResult[];
  documentId: string | null;
  savedDocuments: SavedDocuments;
}

const STATE_PREFIX = 'wordcraft-state';
const EDITOR_SNAPSHOT_KEY = STATE_PREFIX + '@editor-snapshot';
const HAS_BEEN_WELCOMED_KEY = STATE_PREFIX + '@has-been-welcomed';
const LOG_KEY = STATE_PREFIX + '@log';
const META_TEXT_KEY = STATE_PREFIX + '@meta-text';
const STARRED_RESULTS_KEY = STATE_PREFIX + '@starred-results';
const DOCUMENT_ID = STATE_PREFIX + '@document-id';
const SAVED_DOCUMENTS = STATE_PREFIX + '@saved-documents';

/**
 * Responsible for reading to and from local storage
 */
export class LocalStorageService extends Service {
  clearDocumentState() {
    const keysToClear = [DOCUMENT_ID, EDITOR_SNAPSHOT_KEY, STATE_PREFIX];
    for (const key of keysToClear) {
      window.localStorage.removeItem(key);
    }
  }

  clearAll() {
    const keysToClear = [
      STATE_PREFIX,
      EDITOR_SNAPSHOT_KEY,
      LOG_KEY,
      STARRED_RESULTS_KEY,
      DOCUMENT_ID,
      SAVED_DOCUMENTS,
    ];
    for (const key of keysToClear) {
      window.localStorage.removeItem(key);
    }
  }

  setEditorStateSnapshot(stateSnapshot: StateSnapshot) {
    this.setState(EDITOR_SNAPSHOT_KEY, stateSnapshot);
  }

  setHasBeenWelcomed(hasBeenWelcomed = true) {
    this.setState(HAS_BEEN_WELCOMED_KEY, hasBeenWelcomed);
  }

  hasBeenWelcomed() {
    return this.getData<boolean>(HAS_BEEN_WELCOMED_KEY, false);
  }

  setLog(log: SerializedLog) {
    this.setState(LOG_KEY, log);
  }

  setMetaText(metaText: {}) {
    this.setState(META_TEXT_KEY, metaText);
  }

  setStarredResults(starredResults: ModelResult[]) {
    this.setState(STARRED_RESULTS_KEY, starredResults);
  }

  setDocumentId(documentId: string) {
    this.setState(DOCUMENT_ID, documentId);
  }

  getDocumentId(): string | null {
    return this.getState().documentId;
  }

  loadDocuments() {
    const savedDocuments = this.getData<SavedDocuments>(SAVED_DOCUMENTS, {});
    return Object.keys(savedDocuments).map((key) => savedDocuments[key]);
  }

  deleteDocument(documentId: string) {
    const savedDocuments = this.getData<SavedDocuments>(SAVED_DOCUMENTS, {});
    delete savedDocuments[documentId];
    this.setState(SAVED_DOCUMENTS, savedDocuments);
    return documentId;
  }

  saveDocument(
    documentToSave: Omit<SavedDocument, 'id'>,
    maybeId?: string
  ): string {
    const documentId = maybeId ? maybeId : uuid();
    (documentToSave as SavedDocument).id = documentId;
    const savedDocuments = this.getData<SavedDocuments>(SAVED_DOCUMENTS, {});
    savedDocuments[documentId] = documentToSave as SavedDocument;
    this.setState(SAVED_DOCUMENTS, savedDocuments);
    return documentId;
  }

  private setState(key: string, stateObj: {}) {
    const stateString = JSON.stringify(stateObj);
    window.localStorage.setItem(key, stateString);
  }
  private getData<T>(key: string, defaultValue: T): T {
    const dataString = window.localStorage.getItem(key);
    if (dataString) {
      return JSON.parse(dataString) as T;
    } else {
      return defaultValue;
    }
  }

  getState(): LocalStorageState {
    return {
      hasBeenWelcomed: this.getData<boolean>(HAS_BEEN_WELCOMED_KEY, false),
      editor: this.getData<StateSnapshot | null>(EDITOR_SNAPSHOT_KEY, null),
      meta: this.getData<{}>(META_TEXT_KEY, {}),
      starred: this.getData<ModelResult[]>(STARRED_RESULTS_KEY, []),
      documentId: this.getData<string | null>(DOCUMENT_ID, null),
      savedDocuments: this.getData<SavedDocuments>(SAVED_DOCUMENTS, {}),
    };
  }
}
