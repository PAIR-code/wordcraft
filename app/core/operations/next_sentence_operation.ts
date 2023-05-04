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

import {ModelResult, OperationSite, OperationType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {Operation} from './operation';

/**
 * This operation appends text to the next valid spot, either the next sentence
 * or the end of the current sentence.
 */
export class NextSentenceOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.BETWEEN_SENTENCES;
  }

  getLoadingMessage() {
    return 'Generating text...';
  }

  static override id = OperationType.NEXT_SENTENCE;

  static override getButtonLabel() {
    return 'generate text';
  }

  static override getDescription() {
    return 'Generate text from the cursor.';
  }

  override get lookahead() {
    return Operation.globalControls.lookahead.value;
  }

  // We're going to insert the text at the next sentence insert position
  private getOperatingPosition(): Mobiledoc.Position {
    const range = this.sentencesService.getNextSentenceRange();
    return range.head;
  }

  async run() {
    const operationData = this.getOperationData();

    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertLoadingAtom(operatingPosition);

    const params = this.dataProcessor.nextSentence(operationData);
    const continuations = await this.getModel().nextSentence(params);

    this.setChoices(continuations);
  }

  onPendingChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertChoiceAtom(choice.text, operatingPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertGeneratedText(choice.text, operatingPosition);
  }
}
