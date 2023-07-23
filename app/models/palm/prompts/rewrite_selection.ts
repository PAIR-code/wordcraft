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

import {shuffle} from '@lib/utils';
import {RewriteSelectionPromptParams} from '@core/shared/interfaces';
import {RewriteSelectionExample, WordcraftContext} from '../../../context';
import {OperationType} from '@core/shared/types';
import {PalmModel} from '..';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function makePromptHandler(model: PalmModel, context: WordcraftContext) {
  function insertBlank(pre: string, post: string) {
    return `${pre}${model.getBlank()}${post}`;
  }

  function makeRewrittenPiece(
    textToBeReplaced: string,
    nWords?: string,
    howToRewrite?: string
  ) {
    const nWordsToBeReplaced = textToBeReplaced.split(' ').length;
    const wordOrPhrase = nWordsToBeReplaced === 1 ? 'word' : 'phrase';
    const adjString = howToRewrite ? `${howToRewrite}` : '';
    const nWordsString = nWords ? ` with ${nWords} ` : '';

    return `The ${wordOrPhrase} rewritten ${nWordsString}${adjString}: `;
  }

  function makePromptContext() {
    const examples = context.getExampleData<RewriteSelectionExample>(
      OperationType.REWRITE_SELECTION
    );
    const shuffled = shuffle(examples);
    let promptContext = model.getPromptPreamble();
    for (let i = 0; i < shuffled.length; i++) {
      const example = shuffled[i];
      const prompt = makePrompt(example);
      promptContext += `${prompt} ${model.wrap(example.target)}\n\n`;
    }

    return promptContext;
  }

  function makePrompt(example: Omit<RewriteSelectionExample, 'target'>) {
    const {pre, post, toRewrite, howToRewrite, nWords} = example;

    const nWordsToBeReplaced = toRewrite.split(' ').length;
    const wordOrPhrase = nWordsToBeReplaced === 1 ? 'word' : 'phrase';

    const textWithBlank = insertBlank(pre, post);
    const prefix = model.getStoryPrefix();
    const suffix = `The ${wordOrPhrase} to be rewritten that fills in the blank: `;

    const rewrittenPiece = makeRewrittenPiece(toRewrite, nWords, howToRewrite);

    return `${prefix} ${model.wrap(textWithBlank)}\n${suffix} ${model.wrap(
      toRewrite
    )}\n${rewrittenPiece}`;
  }

  return async function rewriteSelection(params: RewriteSelectionPromptParams) {
    console.log('rewrite selection prompt');
    const {pre, post, toRewrite, howToRewrite} = params;
    const promptContext = makePromptContext();
    const prompt = makePrompt({
      pre,
      post,
      toRewrite,
      howToRewrite,
      nWords: '',
    });

    const inputText = promptContext + prompt;
    return model.query(inputText);
  };
}
