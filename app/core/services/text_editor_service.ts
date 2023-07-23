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
import * as Mobiledoc from 'mobiledoc-kit';
import {computed, decorate, observable} from 'mobx';

import {
  clearAllMarkupFromSnapshot,
  findMobiledocSectionAtIndex,
  findMobiledocSectionIndex,
  getLastMobiledocSectionAndIndex,
  getMobiledocOptions,
  getPlainText,
  SerializedMobileDoc,
  SerializedRange,
  StateSnapshot,
} from '@lib/mobiledoc';
import {UndoManager} from '@lib/undo_manager';
import {uuid} from '@lib/uuid';
import {
  CursorService,
  LocalStorageService,
  MetaTextService,
  OperationsService,
  SentencesService,
} from './services';

import {Service} from './service';

interface ServiceProvider {
  cursorService: CursorService;
  localStorageService: LocalStorageService;
  metaTextService: MetaTextService;
  operationsService: OperationsService;
  sentencesService: SentencesService;
}

interface TextEditorConfig {
  element: HTMLElement;
  defaultText?: string;
  placeholder?: string;
}

/**
 * Responsible for managing the MobileDoc Text Editor, including registering
 * key commands and managing serialization.
 *
 * MobileDoc is a fairly lightweight and flexible Rich Text Editor library
 * that does almosty everything we need in the context of the Wordcraft Editor.
 */
export class TextEditorService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();

    // tslint:disable-next-line:no-any
    this.undoManager.onApplyState((stateSnapshot: StateSnapshot) => {
      this.applyStateSnapshot(stateSnapshot);
    });

    this.undoManager.getStateSnapshot = () => {
      return this.getStateSnapshot();
    };
  }

  private readonly undoManager = new UndoManager<StateSnapshot>();
  get isUndoingOrRedoing() {
    return this.undoManager.isUndoingOrRedoing;
  }
  get isUndoing() {
    return this.undoManager.isUndoing;
  }
  get isRedoing() {
    return this.undoManager.isRedoing;
  }

  private get cursorService() {
    return this.serviceProvider.cursorService;
  }

  private get localStorageService() {
    return this.serviceProvider.localStorageService;
  }

  private get operationsService() {
    return this.serviceProvider.operationsService;
  }

  private get sentencesService() {
    return this.serviceProvider.sentencesService;
  }

  isEnabled = true;
  private editor!: Mobiledoc.Editor;
  private element!: HTMLElement;

  editorInFocus = false;

  lastGeneratedText = '';
  defaultText = '';

  readonly documentId = uuid();

  initialize(config: TextEditorConfig) {
    const {element, defaultText, placeholder} = config;
    this.element = element;
    if (defaultText) {
      this.defaultText = defaultText;
    }

    const options = getMobiledocOptions(this.defaultText);
    this.editor = new Mobiledoc.Editor({
      ...options,
      placeholder,
    });

    patchGetSelection();
    this.editor.render(element);

    // Set the cursor to the end of the range
    this.editor.run((postEditor: Mobiledoc.PostEditor) => {
      const position = this.getEndOfCurrentSection();
      postEditor.setRange(position.toRange());
    });
    this.element.focus();

    this.registerKeyCommands();

    if (this.stateSnapshotForInitialization) {
      // Ensure that there's no pseudo selection by clearing all markup
      this.stateSnapshotForInitialization.doc = clearAllMarkupFromSnapshot(
        this.stateSnapshotForInitialization.doc
      );
      this.applyStateSnapshot(this.stateSnapshotForInitialization);
    }

    // Sets up handling updates of the post, in order to manage the undo stack.
    this.setupUpdateHandler();
    this.setupCursorChangeHandler();

    this.sentencesService.initialize();
  }

  focus() {
    this.element?.focus();
  }

  getEditor() {
    return this.editor;
  }

  private stateSnapshotForInitialization: StateSnapshot | null = null;
  initializeFromLocalStorage(stateSnapshot: StateSnapshot | null) {
    this.stateSnapshotForInitialization = stateSnapshot;
  }

  applyStateSnapshot(stateSnapshot: StateSnapshot) {
    this.editor.run((postEditor: Mobiledoc.PostEditor) => {
      this.editor.mobiledoc = stateSnapshot.doc;
      const post = this.editor.loadPost();
      postEditor.removeAllSections();
      postEditor.migrateSectionsFromPost(post);
      const range = this.cursorService.makeMobiledocRangeFromSerialized(
        stateSnapshot.range
      );
      postEditor.setRange(range);
    });
  }

  lastSnapshot!: StateSnapshot;
  private readonly snapshotDebounce = 750;
  private lastSetSnapshotTime = 0;
  nextChangeTriggersUndoSnapshot = false;

  private shouldIgnoreUpdate = false;

  plainText = '';
  private paragraphs: string[] = [];
  private updatePlainText(): string {
    this.plainText = getPlainText(this.getSerializedDoc());
    this.paragraphs = this.plainText.split('\n');
    return this.plainText;
  }

  getPlainText() {
    return this.plainText;
  }

  getParagraphs() {
    return this.paragraphs;
  }

  get isEmpty(): boolean {
    const text = this.plainText;
    return text.trim().length === 0;
  }

  get wordCount(): number {
    return this.plainText.split(' ').filter((word) => word.length > 0).length;
  }

  get selectedWordCount(): number {
    if (this.cursorService.isCursorSelection) {
      return this.cursorService.selectedText
        .split(' ')
        .filter((word) => word.length > 0).length;
    } else if (this.sentencesService.isCursorWithinSentence) {
      return this.sentencesService.currentSentence
        .split(' ')
        .filter((word) => word.length > 0).length;
    } else {
      return 0;
    }
  }

  private setupUpdateHandler() {
    this.setLastSnapshot();
    this.updatePlainText();

    this.editor.postDidChange(() => {
      if (this.shouldIgnoreUpdate || !this.isEnabled) return;

      const text = this.updatePlainText();

      // Only set up the debounced undo/redo stack setup if we're not in the
      // middle of an operation, or undoing or redoing...
      const notInOperation = !this.operationsService.isInOperation;
      const isUndoingOrRedoing = this.undoManager.isUndoingOrRedoing;
      const hasChanged = this.lastSnapshot.text !== text;

      this.triggerUpdateCallbacks();

      if (notInOperation && !isUndoingOrRedoing && hasChanged) {
        const now = Date.now();
        const delta = now - this.lastSetSnapshotTime;
        if (
          delta > this.snapshotDebounce ||
          this.nextChangeTriggersUndoSnapshot
        ) {
          this.undoManager.setUndoStateSnapshot(this.lastSnapshot);
          this.nextChangeTriggersUndoSnapshot = false;
        }
        // We need to move this to the next tick to finish the resolution of the
        // new post sections in Mobiledoc, in the case the user has hit "enter"
        // and created a new section. Otherwise, the cursor serialization will
        // throw an error.
        setTimeout(() => {
          this.setLastSnapshot(now);
        }, 0);
      }
    });
  }

  private readonly updateCallbacks = new Set<() => void>();
  onUpdate(updateCallback: () => void) {
    this.updateCallbacks.add(updateCallback);
    return () => void this.updateCallbacks.delete(updateCallback);
  }
  triggerUpdateCallbacks() {
    for (const callback of this.updateCallbacks.values()) {
      callback();
    }
  }

  runWithoutUpdate(fn: () => void) {
    this.shouldIgnoreUpdate = true;
    fn();
    this.shouldIgnoreUpdate = false;
  }

  setupCursorChangeHandler() {
    this.editor.cursorDidChange(() => {
      if (!this.editor.isEditable) {
        return;
      }

      // Because setting the state triggers a cursor update, we'll want to
      // ignore any cursor update callbacks that are triggered by calling
      // setState (which we use to clear all transient formatting on the doc)
      if (this.shouldIgnoreUpdate) {
        return;
      }

      this.updateCursorState();
    });

    this.updateCursorState();
  }

  setUndo() {
    this.setLastSnapshot();
    this.undoManager.setUndoStateSnapshot(this.lastSnapshot);
  }

  undo() {
    this.undoManager.undo();
  }

  redo() {
    this.undoManager.redo();
  }

  setLastSnapshot(now = Date.now()) {
    const snapshot = this.getStateSnapshot();
    if (this.lastSnapshot == null || snapshot.text !== this.lastSnapshot.text) {
      this.lastSnapshot = snapshot;
      this.lastSetSnapshotTime = now;
      this.localStorageService.setEditorStateSnapshot(snapshot);
    }
  }

  updateLastSnapshotRange(range: SerializedRange) {
    this.lastSnapshot.range = range;
  }

  getStateSnapshot(): StateSnapshot {
    return {
      doc: this.getSerializedDoc(),
      text: this.getPlainText(),
      range: this.getSerializedRangeFromEditor(),
    };
  }

  getSerializedDoc(): SerializedMobileDoc {
    return this.editor.serializeTo<SerializedMobileDoc>('mobiledoc');
  }

  setStateFromSnapshot(stateSnapshot: StateSnapshot) {
    this.applyStateSnapshot(stateSnapshot);
  }

  registerKeyCommands() {
    this.editor.registerKeyCommand({
      str: 'META+Z',
      run: () => {
        this.undoManager.undo();
        this.setLastSnapshot();
      },
    });

    this.editor.registerKeyCommand({
      str: 'SHIFT+META+Z',
      run: () => {
        this.undoManager.redo();
        this.setLastSnapshot();
      },
    });

    // Register no-op key commands for common formatting (bold, italic, etc)
    this.editor.registerKeyCommand({
      str: 'META+B',
      run: () => {},
    });
    this.editor.registerKeyCommand({
      str: 'META+I',
      run: () => {},
    });
    this.editor.registerKeyCommand({
      str: 'META+U',
      run: () => {},
    });
  }

  moveCursorToEnd() {
    const {section} = getLastMobiledocSectionAndIndex(this.editor.post);
    const endPosition = section.tailPosition();
    const range = endPosition.toRange(endPosition);
    this.editor.run((postEditor) => {
      postEditor.setRange(range);
    });
  }

  disableEditor() {
    this.editor.disableEditing();
    this.isEnabled = false;
  }

  enableEditor() {
    this.editor.enableEditing();
    this.element.focus();
    this.isEnabled = true;
    this.updateCursorState();
  }

  selectAll() {
    this.selectRange(this.editor.post.toRange());
  }

  getStartOfDocument(): Mobiledoc.Position {
    const section = findMobiledocSectionAtIndex(this.editor.post, 0);
    return section.headPosition();
  }

  getEndOfDocument(): Mobiledoc.Position {
    const {section} = getLastMobiledocSectionAndIndex(this.editor.post);
    return section.tailPosition();
  }

  getEndOfCurrentSection(): Mobiledoc.Position {
    // If we have no cursor, get the end of the document
    const range = this.cursorService.getMobiledocRange();
    const noCursor = range === null;
    const emptyCursor = range && range.head.isBlank;
    const blankRange = noCursor || emptyCursor;

    if (blankRange) {
      return this.getEndOfDocument();
    }

    if (range == null || range.head == null || range.tail == null) {
      const {section: lastSection} = getLastMobiledocSectionAndIndex(
        this.editor.post
      );
      return lastSection.tailPosition();
    }

    const section = range.head.section;
    return section.tailPosition();
  }

  getCurrentSection(): Mobiledoc.Section {
    const lastRange = this.cursorService.getMobiledocRange();
    const {section: lastSection} = getLastMobiledocSectionAndIndex(
      this.editor.post
    );

    // If we have no cursor, get the end of the document
    if (lastRange === null) {
      return lastSection;
    }
    if (lastRange.head == null || lastRange.tail == null) {
      return lastSection;
    }

    // Make sure the cursor is in a single section
    if (lastRange.head.section === lastRange.tail.section) {
      return lastRange.tail.section;
    }

    return lastSection;
  }

  getTextForRange(range: Mobiledoc.Range) {
    const allText = this.getPlainText();
    const sectionedText = allText.split('\n');

    if (range.head == null || range.tail == null) {
      return '';
    }

    const headSectionIndex = range.head.leafSectionIndex;
    const tailSectionIndex = range.tail.leafSectionIndex;

    if (headSectionIndex !== tailSectionIndex) {
      throw new Error('Need to implement multi-section range text');
    }

    const text = sectionedText[headSectionIndex];
    const substring = text.substring(range.head.offset, range.tail.offset);

    return substring;
  }

  makeSerializedRangeFromMobileDoc(range: Mobiledoc.Range): SerializedRange {
    const {head, tail} = range;

    return {
      head: head ? [head.leafSectionIndex, head.offset] : [0, 0],
      tail: tail ? [tail.leafSectionIndex, tail.offset] : [0, 0],
      direction: range.direction,
    };
  }

  getSerializedRangeFromEditor(): SerializedRange {
    let {range, cursor} = this.editor;
    if (range == null) {
      range = Mobiledoc.Range.blankRange();
    }

    if (cursor.hasCursor() && !range.isBlank) {
      return this.makeSerializedRangeFromMobileDoc(range);
    }

    // If there's no cursor or the range is blank, set the serialized range to
    // the end of the post.
    const {section: lastSection, index} = getLastMobiledocSectionAndIndex(
      this.editor.post
    );
    const position = lastSection.tailPosition();

    return {
      head: [index, position.offset],
      tail: [index, position.offset],
      direction: range.direction,
    };
  }

  updateCursorState() {
    const range = this.editor.range;
    if (range == null) {
      return;
    }

    // First, check if we need to clear the pseudo selection.
    this.maybeClearPseudoSelection(range);

    // If we've lost focus of the editor, set focused to false and highlight
    // the last selected text, using the `em` tag to highlight the text
    // that is selected and being operated on.
    const {isBlank} = range;
    if (isBlank) {
      this.editorInFocus = false;
      this.maybeMakePseudoSelection();
      return;
    }

    const serializedRange = this.makeSerializedRangeFromMobileDoc(range);

    this.runWithoutUpdate(() => {
      this.cursorService.setSerializedRange(serializedRange);
      this.sentencesService.highlightCurrentSentence();
    });

    // tslint:disable-next-line:no-any
    this.cursorService.selectedText = (window as any).getSelection().toString();
    this.updateLastSnapshotRange(this.cursorService.getSerializedRange());
    this.editorInFocus = true;
  }

  /**
   * PseudoSelections keep a range "selected" as the user moves their focus
   * to other widgets, such as the sidebar text input. Since an html page can't
   * maintain multiple real selections, we achieve this by highlighting some
   * text with the 'em' tag to make a virtual selection, then clearing it when
   * the text editor regains focus.
   */
  private shouldClearPseudoSelection = false;
  maybeMakePseudoSelection() {
    const range = this.cursorService.getMobiledocRange();

    if (range && !range.isBlank && !range.isCollapsed) {
      const focusedElement = document.activeElement as HTMLElement;
      this.setPseudoSelection(range);

      focusedElement.focus?.();
      if (focusedElement.hasOwnProperty('select')) {
        // tslint:disable-next-line:no-any
        (focusedElement as any).select();
      }

      this.shouldClearPseudoSelection = true;
    }
  }

  private maybeClearPseudoSelection(nextRange: Mobiledoc.Range) {
    if (this.shouldClearPseudoSelection) {
      const range = this.cursorService.getMobiledocRange();
      if (range) {
        this.clearPseudoSelection(range, nextRange);
        this.shouldClearPseudoSelection = false;
      }
    }
  }

  setPseudoSelection(range: Mobiledoc.Range) {
    this.editor.run((postEditor) => {
      const markup = this.editor.builder.createMarkup('em');
      postEditor.addMarkupToRange(range, markup);
      const head = Mobiledoc.Position.blankPosition();
      const tail = Mobiledoc.Position.blankPosition();
      const emptyRange = new Mobiledoc.Range(head, tail);
      postEditor.setRange(emptyRange);
    });
  }

  clearPseudoSelection(range: Mobiledoc.Range, nextRange: Mobiledoc.Range) {
    this.editor.run((postEditor) => {
      const markup = this.editor.builder.createMarkup('em');
      postEditor.removeMarkupFromRange(range, markup);
      postEditor.setRange(nextRange);
    });
  }

  setCurrentSentenceHighlight(sentenceRange: Mobiledoc.Range) {
    this.editor.run((postEditor) => {
      const markup = this.editor.builder.createMarkup('b');
      postEditor.addMarkupToRange(sentenceRange, markup);
    });
  }

  clearCurrentSentenceHighlight() {
    this.editor.run((postEditor) => {
      // Add markup to the entire document, then turn it off before adding it
      // to the specific sentence
      const start = this.getStartOfDocument();
      const end = this.getEndOfDocument();
      const allRange = start.toRange(end);
      const markup = this.editor.builder.createMarkup('b');
      postEditor.addMarkupToRange(allRange, markup);
      postEditor.toggleMarkup(markup, allRange);
    });
  }

  setCursorRange(cursorRange: Mobiledoc.Range) {
    this.editor.run((postEditor) => {
      postEditor.setRange(cursorRange);
    });
  }

  selectRange(range: Mobiledoc.Range) {
    this.editor.selectRange(range);
    this.cursorService.setRangeFromMobiledoc(this.editor.range);
    // tslint:disable-next-line:no-any
    this.cursorService.selectedText = (window as any).getSelection().toString();
  }

  deleteDocument() {
    const range = this.editor.post.toRange();
    return this.deleteRange(range);
  }

  deleteRange(range: Mobiledoc.Range): Mobiledoc.Position {
    return this.editor.run((postEditor) => {
      return postEditor.deleteRange(range);
    });
  }

  insertGeneratedTextAtEndOfDoc(text: string) {
    const {section} = getLastMobiledocSectionAndIndex(this.editor.post);
    const isEmpty = section.text === '';
    let position = section.tailPosition();

    return this.editor.run((postEditor) => {
      if (!isEmpty) {
        const emptySection = postEditor.builder.createMarkupSection('p', []);
        postEditor.insertSectionAtEnd(emptySection);

        const {section} = getLastMobiledocSectionAndIndex(this.editor.post);
        position = section.tailPosition();
      }

      return postEditor.insertText(position, text);
    });
  }

  insertGeneratedText(text: string, position: Mobiledoc.Position) {
    this.lastGeneratedText = text;

    const sectionsToInsert = text.split('\n').filter((t) => t);

    for (let i = 0; i < sectionsToInsert.length; i++) {
      const sectionText = sectionsToInsert[i];
      if (i === 0) {
        position = this.insertText(sectionText, position);
      } else {
        position = this.insertSection();
        position = this.insertText(sectionText, position);
      }
    }

    this.updatePlainText();
  }

  insertSection() {
    return this.editor.run((postEditor) => {
      const section = this.editor.builder.createMarkupSection('p', []);
      postEditor.insertSection(section);
      return section.headPosition();
    });
  }

  insertText(text: string, position: Mobiledoc.Position) {
    return this.editor.run((postEditor) => {
      return postEditor.insertText(position, text);
    });
  }

  insertSelectionAtom(
    insertPosition: Mobiledoc.Position,
    text: string
  ): () => Mobiledoc.Position {
    const atom = this.buildAtom('selection', text);
    const position = this.insertAtom(atom, insertPosition);
    return () => this.deleteAtPosition(position);
  }

  insertLoadingAtom(
    insertPosition: Mobiledoc.Position
  ): () => Mobiledoc.Position {
    const atom = this.buildAtom('loading');
    const position = this.insertAtom(atom, insertPosition);
    return () => this.deleteAtPosition(position);
  }

  insertChoiceAtom(
    text: string,
    insertPosition: Mobiledoc.Position
  ): () => Mobiledoc.Position {
    const atom = this.buildAtom('choice', text);
    const position = this.insertAtom(atom, insertPosition);
    return () => this.deleteAtPosition(position);
  }

  // tslint:disable-next-line:no-any
  private buildAtom(
    atomName: string,
    atomText?: string,
    atomPayload?: {}
  ): Mobiledoc.Atom {
    return this.editor.run((postEditor) => {
      return postEditor.builder.createAtom(atomName, atomText, atomPayload);
    });
  }

  private insertAtom(
    atom: Mobiledoc.Atom,
    position: Mobiledoc.Position
  ): Mobiledoc.Position {
    return this.editor.run((postEditor) => {
      return postEditor.insertMarkers(position, [atom]);
    });
  }

  private deleteAtPosition(position: Mobiledoc.Position): Mobiledoc.Position {
    return this.editor.run((postEditor) => {
      return postEditor.deleteAtPosition(position);
    });
  }

  getRange(): Mobiledoc.Range {
    const range = this.cursorService.getMobiledocRange();
    return range ? range : Mobiledoc.Range.blankRange();
  }

  /**
   * Runs a function while temporarily reenabling a disabled text editor, for
   * instance when in an operation.
   */
  run(fn: () => void) {
    this.enableEditor();
    fn();
    this.disableEditor();
  }
}

/**
 * Easier and more ergonomic keyboard shortcuts... just arranged on the right
 * side of the keyboard.
 */
export const commandKeys = ['j', 'k', 'l', 'u', 'i', 'o', 'p', 'h', 'n', 'm'];

/**
 * We need to hack the window.getSelection method to use the shadow DOM,
 * since the mobiledoc editor internals need to get the selection to detect
 * cursor changes. First, we walk down into the shadow DOM to find the
 * actual focused element. Then, we get the root node of the active element
 * (either the shadow root or the document itself) and call that root's
 * getSelection method.
 */
function patchGetSelection() {
  const oldGetSelection = window.getSelection.bind(window);
  window.getSelection = (useOld: boolean = false) => {
    const activeElement = findActiveElementWithinShadow();
    const shadowRootOrDocument: ShadowRoot | Document = activeElement
      ? (activeElement.getRootNode() as ShadowRoot | Document)
      : document;
    const selection = (shadowRootOrDocument as any).getSelection();

    if (!selection || useOld) return oldGetSelection();
    return selection;
  };
}

/**
 * Recursively walks down the DOM tree to find the active element within any
 * shadow DOM that it might be contained in.
 */
function findActiveElementWithinShadow(
  element: Element | null = document.activeElement
): Element | null {
  if (element?.shadowRoot) {
    return findActiveElementWithinShadow(element.shadowRoot.activeElement);
  }
  return element;
}

decorate(TextEditorService, {
  editorInFocus: observable,
  isEmpty: computed,
  isEnabled: observable,
  isUndoingOrRedoing: computed,
  lastGeneratedText: observable,
  plainText: observable,
  wordCount: computed,
  selectedWordCount: computed,
});
