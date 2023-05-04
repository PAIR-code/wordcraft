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

import {abbreviations} from './abbreviations';

//tslint:disable:enforce-comments-on-exported-symbols
export function isCapitalized(str: string) {
  return /^[A-Z][a-z].*/.test(str) || isNumber(str);
}

// Start with opening quotes or capitalized letter
export function isSentenceStarter(str: string) {
  return isCapitalized(str) || /``|"|'/.test(str.substring(0, 2));
}

export function isCommonAbbreviation(str: string) {
  const noSymbols = str.replace(
    /[-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi,
    ''
  );

  return ~abbreviations.indexOf(noSymbols);
}

// This is going towards too much rule based
export function isTimeAbbreviation(word: string, next: string) {
  if (word === 'a.m.' || word === 'p.m.') {
    const tmp = next.replace(/\W+/g, '').slice(-3).toLowerCase();

    if (tmp === 'day') {
      return true;
    }
  }

  return false;
}

export function isDottedAbbreviation(word: string) {
  const matches = word.replace(/[\(\)\[\]\{\}]/g, '').match(/(.\.)*/);
  return matches && matches[0].length > 0;
}

// TODO look for next words, if multiple are capitalized,
// then it's probably not a sentence ending
export function isCustomAbbreviation(str: string) {
  if (str.length <= 3) {
    return true;
  }

  return isCapitalized(str);
}

// Uses current word count in sentence and next few words to check if it is
// more likely an abbreviation + name or new sentence.
export function isNameAbbreviation(wordCount: number, words: string[]) {
  if (words.length > 0) {
    if (wordCount < 5 && words[0].length < 6 && isCapitalized(words[0])) {
      return true;
    }

    const capitalized = words.filter((str) => {
      return /[A-Z]/.test(str.charAt(0));
    });

    return capitalized.length >= 3;
  }

  return false;
}

export function isNumber(str: string, dotPos?: number) {
  if (dotPos) {
    str = str.slice(dotPos - 1, dotPos + 2);
  }

  return !isNaN(str as unknown as number);
}

// Phone number matching
// http://stackoverflow.com/a/123666/951517
export function isPhoneNr(str: string) {
  return str.match(
    /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/
  );
}

// Match urls / emails
// http://stackoverflow.com/a/3809435/951517
export function isURL(str: string) {
  return str.match(
    /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
  );
}

// Starting a new sentence if beginning with capital letter
// Exception: The word is enclosed in brackets
export function isConcatenated(word: string) {
  let i = 0;

  if (
    (i = word.indexOf('.')) > -1 ||
    (i = word.indexOf('!')) > -1 ||
    (i = word.indexOf('?')) > -1
  ) {
    const c = word.charAt(i + 1);

    // Check if the next word starts with a letter
    if (c.match(/[a-zA-Z].*/)) {
      return [word.slice(0, i), word.slice(i + 1), word.charAt(i)];
    }
  }

  return false;
}

export function isBoundaryChar(word: string) {
  return word === '.' || word === '!' || word === '?';
}

export function endsWithChar(word: string, c: string) {
  if (c.length > 1) {
    return c.indexOf(word.slice(-1)) > -1;
  }

  return word.slice(-1) === c;
}

export function endsWith(word: string, end: string) {
  return word.slice(word.length - end.length) === end;
}

const PUNCTUATION_MARKS = ['.', ',', ':', ';', '!', '?', '-'];

export function endsWithPunctuation(str: string) {
  return PUNCTUATION_MARKS.includes(str.slice(-1));
}

export function startsWithPunctuation(str: string) {
  return PUNCTUATION_MARKS.includes(str.slice(0, 1));
}
