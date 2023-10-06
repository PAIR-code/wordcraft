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
import { html } from 'lit';
import * as Mobiledoc from 'mobiledoc-kit';

import { ChoiceOperation } from './choice_operation';
import { TextareaControl } from './operation_controls';
import { ModelResult, OperationSite, OperationType } from '../shared/types';

/**
 * An Operation to add a new character to the story from a prompt.
 */
export class NewCharacterOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return (
      operationSite === OperationSite.END_OF_SECTION ||
      operationSite === OperationSite.EMPTY_SECTION
    );
  }

  getLoadingMessage() {
    return 'Generating text...';
  }

  static override id = OperationType.NEW_CHARACTER;

  static override getButtonLabel() {
    return 'introduce character';
  }

  static override getDescription() {
    return 'Introduce a new character at the cursor.';
  }

  private get character(): string {
    return NewCharacterOperation.controls.character.value;
  }

  private getOperatingPosition(): Mobiledoc.Position {
    const range = this.textEditorService.getRange();
    return range.head;
  }

  async run() {
    const params = { character: this.character };
    const choices = await this.getModel().newCharacter(params);

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

  static override controls = {
    character: new TextareaControl({
      prefix: 'prompt',
      description: 'A prompt to introduce a new character.',
      value: 'A new character.',
    }),
  };
}
