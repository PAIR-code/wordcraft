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

import {createModelResult} from '@models/utils';
import * as helpers from '../operation_data/helpers';
import {ModelResult, OperationSite, OperationType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {Operation} from './operation';

/**
 * An operation which rewrites the end of a given sentence from the cursor
 * position.
 */
export class RewriteEndOfSentenceOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.WITHIN_SENTENCE;
  }

  getLoadingMessage() {
    return 'Completing sentence...';
  }

  static override id = OperationType.REWRITE_END_OF_SENTENCE;

  static override getButtonLabel() {
    return 'rewrite end of sentence';
  }

  static override getDescription() {
    return 'Rewrite the end of the sentence from the cursor position.';
  }

  override get lookahead() {
    return Operation.globalControls.lookahead.value;
  }

  private getContinueSentenceRange(): Mobiledoc.Range {
    const {tail: sentenceTail} =
      this.sentencesService.currentSentenceSerializedRange;
    const {head: cursorPosition} = this.cursorService.serializedRange;

    const sectionIndex = sentenceTail[0];
    const headOffset = cursorPosition[1];
    const tailOffset = sentenceTail[1];

    const serializedRange = {
      head: [sectionIndex, headOffset] as [number, number],
      tail: [sectionIndex, tailOffset] as [number, number],
      direction: 1,
    };

    return this.cursorService.makeMobiledocRangeFromSerialized(serializedRange);
  }

  async run() {
    const operationData = this.getOperationData();
    const currentSentence = helpers.getCurrentSentence(operationData);
    const sentenceOffset = helpers.getCurrentSentenceOffset(operationData);
    const endOfSentence = currentSentence.substring(sentenceOffset);

    const selectionRange = this.getContinueSentenceRange();
    const operatingPosition =
      this.textEditorService.deleteRange(selectionRange);
    this.textEditorService.insertSelectionAtom(
      operatingPosition,
      endOfSentence
    );

    const params = this.dataProcessor.rewriteEndOfSentence(operationData);
    const continuations = await this.getModel().rewriteEndOfSentence(params);

    const original = createModelResult(endOfSentence);
    this.setChoices(continuations, original);
  }

  onPendingChoice(choice: ModelResult) {
    const selectionRange = this.getContinueSentenceRange();
    const operatingPosition =
      this.textEditorService.deleteRange(selectionRange);
    this.textEditorService.insertChoiceAtom(choice.text, operatingPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const selectionRange = this.getContinueSentenceRange();
    const operatingPosition =
      this.textEditorService.deleteRange(selectionRange);
    this.textEditorService.insertGeneratedText(choice.text, operatingPosition);
  }
}
