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

/** Returns default Mobiledoc Options for the editor */
export function getMobiledocOptions(
  defaultText: string,
  // tslint:disable-next-line:no-any
  pasteHandler: (node: Node, builder: any, env: any) => void = () => {}
) {
  const loadingAtom = {
    name: 'loading',
    type: 'dom',
    render: () => {
      const element = document.createElement('span');
      element.innerText = 'Loading...';
      element.className = 'loading-atom';
      return element;
    },
  };

  const selectionAtom = {
    name: 'selection',
    type: 'dom',
    render: (data: {value: string}) => {
      const {value} = data;
      const element = document.createElement('span');
      element.innerText = value;
      element.className = 'selection-atom ';
      return element;
    },
  };

  const choiceAtom = {
    name: 'choice',
    type: 'dom',
    render: (data: {value: string}) => {
      const {value} = data;
      const element = document.createElement('span');
      element.innerText = value;
      element.className = 'choice-atom';
      return element;
    },
  };

  const initialDoc = {
    version: '0.3.1',
    markups: [],
    atoms: ['loading', 'choice', 'selection'],
    cards: [],
    sections: [[1, 'p', [[0, [], 0, defaultText]]]],
  };
  return {
    mobiledoc: initialDoc,
    spellcheck: true,
    autofocus: false,
    atoms: [loadingAtom, choiceAtom, selectionAtom],
    parserPlugins: [pasteHandler],
  };
}

/** A serialized range */
export interface SerializedRange {
  head: [number, number];
  tail: [number, number];
  direction: number;
}

/** A snapshot of the editor state */
export interface StateSnapshot {
  doc: SerializedMobileDoc;
  text: string;
  range: SerializedRange;
}

/** A shorthand for Mobiledoc Position */
export type Position = Mobiledoc.Position;

/** A shorthand for Mobiledoc Range */
export type Range = Mobiledoc.Range;

type SerializedMarkup = string[];
// tslint:disable:no-any
type SerializedAtom = [string, string, any];
type SerializedCard = [string, any];
// tslint:enable:no-any
type SerializedSection = [number, string, SerializedMarker[]];
type SerializedMarker = [number, number[], number, string];

/** The serialized MobileDoc format  */
export interface SerializedMobileDoc {
  version: string[];
  markups: SerializedMarkup[];
  atoms: SerializedAtom[];
  cards: SerializedCard[];
  sections: SerializedSection[];
}

/**
 * Clears all markup and atoms from a serialized MobileDoc object.
 * This code parses raw Mobiledoc JSON serialized documents, which is documented
 * here: https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md
 */
export function clearAllMarkupFromSnapshot(doc: SerializedMobileDoc) {
  // Clear all atoms from section markers
  doc.atoms = [];
  for (const section of doc.sections) {
    // section[2] is the individual markers, only keep 0-type markers (text)
    section[2] = section[2].filter((marker) => {
      return marker[0] === 0;
    });
  }

  // Clear the markup start/ends from all section markers
  doc.markups = [];
  for (const section of doc.sections) {
    for (const marker of section[2]) {
      marker[1] = [];
      marker[2] = 0;
    }
  }

  return doc;
}

/** Finds a given MobileDoc Section's index */
export function findMobiledocSectionIndex(
  post: Mobiledoc.Post,
  section: Mobiledoc.Section
) {
  let index = 0;
  post.walkAllLeafSections((otherSection, otherIndex) => {
    if (section === otherSection) {
      index = otherIndex;
    }
  });
  return index;
}

/** Finds a given MobileDoc Section at a specified index */
export function findMobiledocSectionAtIndex(
  post: Mobiledoc.Post,
  index: number
) {
  let section: Mobiledoc.Section;

  post.walkAllLeafSections((otherSection, otherIndex) => {
    if (index === otherIndex) {
      section = otherSection;
    }
  });
  //tslint:disable-next-line:no-unnecessary-type-assertion
  return section!;
}

/** Returns the last MobileDoc Section and its index */
export function getLastMobiledocSectionAndIndex(post: Mobiledoc.Post) {
  let section: Mobiledoc.Section;
  let index = 0;

  post.walkAllLeafSections((otherSection, otherIndex) => {
    section = otherSection;
    index = otherIndex;
  });
  //tslint:disable-next-line:no-unnecessary-type-assertion
  return {section: section!, index};
}

/**
 * Because the current text parsing logic doesn't properly handle newlines,
 * we need a way to reliably filter them out of the paragraph text for
 * serialization.
 **/
export function getPlainText(doc: SerializedMobileDoc) {
  const paragraphs: string[] = [];
  for (const section of doc.sections) {
    let text = '';
    // Check to make sure the section tag is 'p'
    if (section[1] === 'p') {
      // section[2] is the individual markers, only keep 0-type markers (text)
      for (const marker of section[2]) {
        if (marker[0] === 0) text += marker[3].split('\n').join('');
      }
    }
    paragraphs.push(text);
  }

  return paragraphs.join('\n');
}
