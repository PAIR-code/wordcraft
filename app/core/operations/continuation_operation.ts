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

/**
 * A Continuation appends text to the end of the current section.
 */
export class ContinuationOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return (
      operationSite === OperationSite.END_OF_SECTION ||
      operationSite === OperationSite.EMPTY_SECTION
    );
  }

  getLoadingMessage() {
    return 'Generating text...';
  }

  static override id = OperationType.CONTINUE;

  static override getButtonLabel() {
    return 'generate text';
  }

  static override getDescription() {
    return 'Generate text from the cursor.';
  }

  private getOperatingPosition(): Mobiledoc.Position {
    const range = this.textEditorService.getRange();

    if (range === null) {
      return this.textEditorService.getEndOfCurrentSection();
    } else {
      return range.head;
    }
  }

  async run() {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertLoadingAtom(operatingPosition);

    const operationData = this.getOperationData();
    const params = this.dataProcessor.continue(operationData);
    const choices = await this.getModel().continue(params);

    this.setChoices(choices);
  }

  onPendingChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertChoiceAtom(choice.text, operatingPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertGeneratedText(choice.text, operatingPosition);
  }

  static operationType = OperationType.CONTINUE;
}
