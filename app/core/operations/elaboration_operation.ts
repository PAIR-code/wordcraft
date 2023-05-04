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

import * as helpers from '../operation_data/helpers';
import {ModelResult, OperationSite, OperationType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';

/**
 * An Elaboration operation describes a selected word/phrase in more detail, by
 * appending it to the end of the current section.
 */
export class ElaborationOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.SELECTION;
  }

  getLoadingMessage() {
    const operationData = this.getOperationData();
    const selectedText = helpers.getSelectedText(operationData);
    return `Elaborating on "${selectedText}"...`;
  }

  static override id = OperationType.ELABORATE;

  static override getDescription() {
    return 'Elaborate on the selected text.';
  }

  static override getButtonLabel() {
    return 'elaborate selection';
  }

  private getInsertionPosition(): Mobiledoc.Position {
    return this.textEditorService.getEndOfCurrentSection();
  }

  private getSelectionPosition(): Mobiledoc.Position {
    const selectionRange = this.textEditorService.getRange();
    return selectionRange.head;
  }

  async run() {
    const selectionRange = this.textEditorService.getRange();
    const selectionPosition = this.getSelectionPosition();

    const operationData = this.getOperationData();
    const selectedText = helpers.getSelectedText(operationData);

    this.textEditorService.deleteRange(selectionRange);
    this.textEditorService.insertSelectionAtom(selectionPosition, selectedText);

    const params = this.dataProcessor.elaborate(operationData);
    const elaborations = await this.getModel().elaborate(params);
    this.setChoices(elaborations);
  }

  onPendingChoice(choice: ModelResult) {
    const insertPosition = this.getInsertionPosition();
    this.textEditorService.insertChoiceAtom(choice.text, insertPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const insertPosition = this.getInsertionPosition();
    this.textEditorService.insertGeneratedText(choice.text, insertPosition);
  }
}
