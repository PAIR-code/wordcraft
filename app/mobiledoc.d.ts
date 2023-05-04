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

declare module 'mobiledoc-kit' {
  export class Editor {
    constructor(options?: EditorOptions);
    get activeMarkups(): Markup[];
    get activeSections(): Section[];
    get activeSection(): Section;
    get activeSectionAttributes(): Object;
    get builder(): PostNodeBuilder;
    get cursor(): Cursor;
    get isEditable(): boolean;
    get keyCommands(): KeyCommand[];
    get range(): Range | null;

    mobiledoc: any;
    post: Post;

    _hasFocus: () => boolean;
    _hasSelection: () => boolean;
    beforeToggleMarkup: (callback: Callback) => void;
    createMarkup: (markup: string) => Markup;
    cursorDidChange: (callback: Callback) => void;
    deleteAtPosition: () => void;
    deleteRange: (range: Range) => void;
    destroy: () => void;
    didRender: (callback: Callback) => void;
    didUpdatePost: (callback: Callback) => void;
    disableEditing: () => void;
    disableLogging: () => void;
    displayCard: (cardSection: CardSection) => void;
    editCard: (cardSection: CardSection) => void;
    enableEditing: () => void;
    enableLogTypes: (...logTypes: string[]) => void;
    hasActiveMarkup: (markup: Markup | string) => boolean;
    hasCursor(): boolean;
    inputModeDidChange: (callback: Callback) => void;
    insertAtom: (
      atomName: string,
      atomText?: string,
      atomPayload?: Object
    ) => Atom;
    insertCard: (
      cardName: string,
      cardPayload?: Object,
      inEditMode?: boolean
    ) => Card;
    insertText: (text: string) => void;
    loadPost: () => Post;
    onTextInput: (handler: InputHandler) => void;
    positionAtPoint: (x: number, y: number) => Position | null;
    postDidChange: (callback: Callback) => void;
    registerKeyCommand: (keyCommand: KeyCommand) => void;
    removeAttribute: (key: string) => void;
    render: (element: HTMLElement) => void;
    run: <T>(callback: (postEditor: PostEditor) => T) => T;
    selectRange: (range: Range | Position) => void;
    serialize: (version: string) => MobileDoc;
    serializeTo: <T>(format: string) => T;
    setAttribute: (key: string, value: string) => void;
    toggleMarkup: (markup: String, attributes: Object) => void;
    toggleSection: (tagName: string) => void;
    unregisterAllTextInputHandlers: () => void;
    unregisterKeyCommands: (name: string) => void;
    unregisterTextInputHandler: (name: string) => void;
    willDelete: (callback: Callback) => void;
    willHandleNewLine: (callback: Callback) => void;
    willRender: (callback: Callback) => void;
  }

  interface EditorOptions {
    mobiledoc?: any;
    html?: string;
    parserPlugins?: any[];
    cards?: any[];
    atoms?: any[];
    unknownCardHandler?: Callback;
    unknownAtomHandler?: Callback;
    placeholder?: string;
    spellcheck?: boolean;
    autofocus?: boolean;
    showLinkTooltips?: boolean;
    undoDepth?: number;
  }

  type Callback = (...args: any[]) => any;

  export class Atom {}

  export class CardSection {}

  export class InputHandler {
    name: string;
    text?: string;
    match?: RegExp;
    run: Callback;
  }

  export class KeyCommand {
    name?: string;
    str?: string;
    run: Callback;
  }

  export class Key {
    isPrintable: () => boolean;
    isShift: () => boolean;
  }

  export class Cursor {
    hasCursor: () => boolean;
  }

  export type Direction = number;

  export class Markup {
    constructor(tagName: string, attributes?: {});
    tagName: string;
    getAttribute(name: string): any;
  }

  export class MobileDoc {}

  export class Position {
    marker: Marker;
    offset: number;
    section: Section;
    leafSectionIndex: number;

    get isBlank(): boolean;

    isHead: () => boolean;
    isHeadOfPost: () => boolean;
    isTail: () => boolean;
    isTailOfPost: () => boolean;
    markerIn: (direction: Direction) => Marker | undefined;
    move: (units: number) => Position;
    moveWord: (direction: Direction) => Position;
    toRange: (tail?: Position) => Range;

    static atPoint: (x: number, y: number, editor: Editor) => Position | null;
    static blankPosition(): Position;
  }

  export class Post {
    hasContent: boolean;

    headPosition: () => Position;
    markersContainedBy: (range: Range) => Marker[];
    tailPosition: () => Position;
    toRange: () => Range;
    trimTo: (range: Range) => Post;
    walkAllLeafSections: (
      fn: (section: Section, index: number) => void
    ) => void;
  }

  export class PostEditor {
    builder: PostNodeBuilder;

    addMarkupToRange: (range: Range, markup: Markup) => void;
    deleteAtPosition: (
      position: Position,
      direction?: Direction,
      options?: DeleteOptions
    ) => Position;
    deleteFrom: (position: Position, direction?: Direction) => Position;
    deleteRange: (range: Range) => Position;
    insertMarkers: (position: Position, markers: Marker[]) => Position;
    insertSection: (section: Section) => Position;
    insertSectionAtEnd: (section: Section) => Position;
    insertSectionBefore: (
      collection: Section[],
      section: Section,
      beforeSection?: Section
    ) => Position;
    insertText: (position: Position | Range, text: string) => Position;
    insertTextWithMarkup: (
      position: Position,
      text: string,
      markups: Markup[]
    ) => Position;
    migrateSectionsFromPost: (post: Post) => void;
    moveSectionDown: (section: Section) => void;
    moveSectionUp: (section: Section) => void;
    removeAllSections: () => void;
    removeMarkupFromRange: (range: Range, markup: Markup) => void;
    removeSection: (section: Section) => void;
    replaceSection: (section: Section, newSection: Section) => void;
    schedule: (callback: Callback, once?: boolean) => void;
    scheduleDidUpdate: () => void;
    scheduleOnce: (callback: Callback) => void;
    scheduleRerender: () => void;
    setRange: (range: Range) => void;
    splitSection: (position: Position) => Section[];
    toggleMarkup: (
      markupOrString: Markup | string,
      range: Range | Position
    ) => void;
    toggleSection: (sectionTagName: string, range: Range | Position) => void;
  }

  interface DeleteOptions {
    unit: 'char' | 'word';
  }

  export class Card {}
  export class Marker {}

  export class PostNodeBuilder {
    createAtom: (atomName: string, atomText?: string, atomPayload?: {}) => Atom;
    createCardSection: (cardName: string, cardPayload?: {}) => Card;
    createMarker: (value: string, markups: Markup[]) => Marker;
    createMarkup: (value: string, attributes?: {}) => Markup;
    createMarkupSection: (value: string, markups: Markup[]) => Section;
    createPost: () => Post;
  }

  export class Range {
    constructor(head: Position, tail?: Position, direction?: Direction);
    direction: Direction;
    head: Position;
    tail?: Position;

    get isCollapsed(): boolean;
    get isBlank(): boolean;

    expandByMarker: (detectMarker: Callback) => Range;
    extend: (units: number) => Range;
    move: (units: number) => Range;

    static blankRange(): Range;
    static create(
      headSection: Section,
      headOffset: number,
      tailSection?: Section,
      tailOffset?: number,
      direction?: Direction
    ): Range;
  }

  export class Section {
    text: string;

    get isBlank(): boolean;
    get length(): number;
    get post(): Post;

    headPosition: () => Position;
    tailPosition: () => Position;
    toPosition: (offset: number) => Position;
    toRange: () => Range;
    nextLeafSection: () => Section | null;
    immediatelyNextMarkerableSection: () => Section | null;
    previousLeafSection: () => Section | null;
  }
}
