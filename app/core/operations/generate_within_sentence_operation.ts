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
 * An operation which generates text from the cursor position within a sentence,
 * and attempts to intelligently splice it into the sentence.
 */
export class GenerateWithinSentenceOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.WITHIN_SENTENCE;
  }

  getLoadingMessage() {
    return 'Generating text...';
  }

  static override id = OperationType.GENERATE_WITHIN_SENTENCE;

  static override getButtonLabel() {
    return 'generate text';
  }

  static override getDescription() {
    return 'Generate text from the cursor.';
  }

  override get lookahead() {
    return Operation.globalControls.lookahead.value;
  }

  private getOperationPosition() {
    const range = this.textEditorService.getRange();
    return range.head;
  }

  async run() {
    const operationData = this.getOperationData();

    const operatingPosition = this.getOperationPosition();
    this.textEditorService.insertLoadingAtom(operatingPosition);

    const params = this.dataProcessor.generateWithinSentence(operationData);
    const continuations = await this.getModel().generateWithinSentence(params);

    this.setChoices(continuations);
  }

  private getOperatingPosition(): Mobiledoc.Position {
    const range = this.textEditorService.getRange();
    return range.head;
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
