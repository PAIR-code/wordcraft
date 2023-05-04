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

// prettier-ignore
export const abbreviations = [
  'al',   'adj',  'assn', 'Ave',  'BSc',  'MSc',   'Cell', 'Ch',   'Co',
  'cc',   'Corp', 'Dem',  'Dept', 'ed',   'eg',    'e.g',  'Eq',   'Eqs',
  'er',   'est',  'est',  'et',   'etc',  'Ex',
  'ext',  // + number?
  'Fig',  'fig',  'Figs', 'figs', 'i.e',  'ie',    'Inc',  'inc',  'Jan',
  'Feb',  'Mar',  'Apr',  'Jun',  'Jul',  'Aug',   'Sep',  'Sept', 'Oct',
  'Nov',  'Dec',  'jr',   'ltd',  'mi',   'Miss',  'Mrs',  'Mr',   'Ms',
  'Mol',  'mt',   'mts',  'no',   'Nos',  'PhD',   'MD',   'BA',   'MA',
  'MM',   'pl',   'pop',  'pp',   'Prof', 'Dr',    'pt',   'Ref',  'Refs',
  'Rep',  'repr', 'rev',  'Sec',  'Secs', 'shri',  'Sgt',  'Col',  'Gen',
  'Rep',  'Sen',  'Gov',  'Lt',   'Maj',  'Capt',  'St',   'pvt',  'smt',
  'Sr',   'sr',   'Jr',   'jr',   'Rev',  'Sun',   'Mon',  'Tu',   'Tue',
  'Tues', 'Wed',  'Th',   'Thu',  'Thur', 'Thurs', 'Fri',  'Sat',  'trans',
  'Univ', 'Viz',  'Vol',  'vs',   'v',
];
