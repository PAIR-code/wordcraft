/**
 * @license
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2012 Fabiën Tesselaar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This code is adapted from the sbd library (https://github.com/Tessmore/sbd/)
 * It implements a few bugfixes around boundary detection while preserving
 * whitespace, and adds in a number of additional abbreviations.
 */

import * as utils from './utils';

// tslint:disable-next-line:enforce-name-casing
const newlinePlaceholder = ' @~@ ';
const newlinePlaceholderTrimmed = newlinePlaceholder.trim();

const whiteSpaceCheck = new RegExp('\\S', '');
const splitIntoWords = new RegExp('\\S+|\\n', 'g');

/** Checks to see if a string is only whitespace */
export function isWhitespaceOnly(text: string) {
  return !whiteSpaceCheck.test(text);
}

/** Parses text into individual sentences */
export function parseSentences(text: string) {
  if (!text || typeof text !== 'string' || !text.length) {
    return [];
  }

  if (!whiteSpaceCheck.test(text)) {
    // whitespace-only string has no sentences
    return [];
  }

  const options = {
    preserveWhitespace: true,
    abbreviations: null,
  };

  // Split the text into words
  let words: string[] = [];
  let tokens: string[] = [];

  // Split the text into words
  if (options.preserveWhitespace) {
    // <br> tags are the odd man out, as whitespace is allowed inside the tag
    tokens = text.split(/(<br\s*\/?>|\S+|\n+)/);

    // every other token is a word
    words = tokens.filter((token: string, i: number) => {
      return i % 2;
    });
  } else {
    // - see http://blog.tompawlak.org/split-string-into-tokens-javascript
    const results = text.trim().match(splitIntoWords);
    if (results) {
      words = [...results];
    }
  }

  let wordCount = 0;
  let index = 0;
  let sentences: string[][] = [];
  let current: string[] = [];

  // If given text is only whitespace (or nothing of \S+)
  if (!words || !words.length) {
    return [];
  }

  const len = words.length;
  let tokenIndex = -1;
  for (let i = 0; i < len; i++) {
    wordCount++;
    tokenIndex += 2;

    // Add the word to current sentence
    current.push(words[i]);

    // Sub-sentences, reset counter
    if (~words[i].indexOf(',')) {
      wordCount = 0;
    }

    if (
      utils.isBoundaryChar(words[i]) ||
      utils.endsWithChar(words[i], '?!') ||
      words[i] === newlinePlaceholderTrimmed
    ) {
      sentences.push(current);

      wordCount = 0;
      current = [];

      continue;
    }

    if (
      utils.endsWithChar(words[i], '"') ||
      utils.endsWithChar(words[i], '”')
    ) {
      words[i] = words[i].slice(0, -1);
    }

    // A dot might indicate the end of sentence
    // Exception: The next sentence starts with a word (non abbreviation)
    //            that has a capital letter.
    if (utils.endsWithChar(words[i], '.')) {
      // Check if there is a next word
      if (i + 1 < len) {
        // Single character abbr.
        if (
          words[i].length === 2 &&
          isNaN(words[i].charAt(0) as unknown as number)
        ) {
          continue;
        }

        // Common abbr. that often do not end sentences
        if (utils.isCommonAbbreviation(words[i])) {
          continue;
        }

        // Next word starts with capital word, but current sentence is
        // quite short
        if (utils.isSentenceStarter(words[i + 1])) {
          if (utils.isTimeAbbreviation(words[i], words[i + 1])) {
            continue;
          }

          // Dealing with names at the start of sentences
          if (utils.isNameAbbreviation(wordCount, words.slice(i, 6))) {
            continue;
          }

          if (utils.isNumber(words[i + 1])) {
            if (utils.isCustomAbbreviation(words[i])) {
              continue;
            }
          }
        } else {
          // Skip ellipsis
          if (utils.endsWith(words[i], '..')) {
            continue;
          }

          //// Skip abbreviations
          // Short words + dot or a dot after each letter
          if (utils.isDottedAbbreviation(words[i])) {
            continue;
          }

          if (utils.isNameAbbreviation(wordCount, words.slice(i, 5))) {
            continue;
          }
        }
      }

      sentences.push(current);
      current = [];
      wordCount = 0;

      continue;
    }

    // Check if the word has a dot in it
    if ((index = words[i].indexOf('.')) > -1) {
      if (utils.isNumber(words[i], index)) {
        continue;
      }

      // Custom dotted abbreviations (like K.L.M or I.C.T)
      if (utils.isDottedAbbreviation(words[i])) {
        continue;
      }

      // Skip urls / emails and the like
      if (utils.isURL(words[i]) || utils.isPhoneNr(words[i])) {
        continue;
      }
    }

    const splitWords = utils.isConcatenated(words[i]);
    if (splitWords) {
      const [a, b, delimiter] = splitWords;
      current.pop();
      current.push(a + delimiter);
      sentences.push(current);

      current = [];
      wordCount = 0;
      current.push(b);

      // Insert the split words plus an empty '' token back into the tokens list
      // to accoun for joining the tokens back with proper whitespace if
      // configured.
      tokens.splice(tokenIndex, 1, a + delimiter, '', b);
      tokenIndex += 2;
    }
  }

  if (current.length) {
    sentences.push(current);
  }

  // Clear "empty" sentences
  sentences = sentences.filter((s) => {
    return s.length > 0;
  });

  const result = sentences.slice(1).reduce(
    (out, sentence) => {
      const lastSentence = out[out.length - 1];

      // Single words, could be "enumeration lists"
      if (lastSentence.length === 1 && /^.{1,2}[.]$/.test(lastSentence[0])) {
        // Check if there is a next sentence
        // It should not be another list item
        if (!/[.]/.test(sentence[0])) {
          out.pop();
          out.push(lastSentence.concat(sentence));
          return out;
        }
      }

      out.push(sentence);
      return out;
    },
    [sentences[0]]
  );

  // join tokens back together
  const output = result.map((sentence, ii) => {
    if (options.preserveWhitespace) {
      // tokens looks like so: [leading-space token, non-space token, space
      // token, non-space token, space token... ]. In other words, the first
      // item is the leading space (or the empty string), and the rest of
      // the tokens are [non-space, space] token pairs.
      let tokenCount = sentence.length * 2;

      if (ii === 0) {
        tokenCount += 1;
      }

      const spliced = tokens.splice(0, tokenCount).join('');
      return spliced;
    }

    return sentence.join(' ');
  });

  return output;
}
