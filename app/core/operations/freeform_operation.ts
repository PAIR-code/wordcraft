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
import {html} from 'lit';
import * as Mobiledoc from 'mobiledoc-kit';

import {
  ModelResult,
  OperationSite,
  OperationTrigger,
  OperationType,
} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {MetaPromptOperation} from './meta_prompt_operation';
import {ServiceProvider} from './operation';
import {TextInputControl} from './operation_controls';
import {ControlsStep} from './steps';

class FreeformMetaPromptOperation extends MetaPromptOperation {
  async onSelectChoice(choice: ModelResult) {
    // When the user selects a prompt, we're going to trigger a new freeform
    // prompt operation using the selected prompt. We'll do this by running
    // a new operation on the resolution of this operation's promise.
    this.onFinish(() => {
      this.operationsService.startOperation(
        () =>
          new FreeformOperation(
            this.serviceProvider,
            OperationTrigger.OPERATION,
            choice.text
          ),
        OperationTrigger.OPERATION
      );
    });
  }
}

/**
 * A freeform text operation, which lets the user pose a question directly to
 * the model.
 */
export class FreeformOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return (
      operationSite === OperationSite.END_OF_SECTION ||
      operationSite === OperationSite.EMPTY_SECTION
    );
  }

  constructor(
    serviceProvider: ServiceProvider,
    trigger: OperationTrigger,
    instancePrompt: string = ''
  ) {
    super(serviceProvider, trigger);
    if (instancePrompt) {
      this.instantiatedWithPromptText = true;
      this.instanceControls.instruction.value = instancePrompt;
    }
  }

  static override id = OperationType.FREEFORM;

  static override getDescription() {
    return 'Use your own prompt to control what the model generates.';
  }

  static override getButtonLabel() {
    return 'generate text with custom prompt';
  }

  getLoadingMessage() {
    return html`
      Using the prompt: <br /><br />
      <i>${this.instruction}</i>...
    `;
  }

  override canRewriteChoice = true;
  instantiatedWithPromptText = false;

  /**
   * If this operation is constructed with a prompt rather than using the
   * static control prompt that persists across instances, use the prompt that
   * the instance is constructed with.
   */
  get instruction() {
    return this.instantiatedWithPromptText
      ? this.instanceControls.instruction.value
      : FreeformOperation.controls.instruction.value;
  }

  private getInsertPosition(): Mobiledoc.Position {
    return this.textEditorService.getEndOfCurrentSection();
  }

  override async beforeStart() {
    // If the operation was instantiated with a prompt, then there's no need to
    // move into the text input step;
    if (this.instantiatedWithPromptText) {
      return;
    }

    // Only if the operation was triggered by key command do we move into the
    // controls step to get the prompt from a user input.
    if (this.trigger !== OperationTrigger.KEY_COMMAND) return;

    const controlsStep = new ControlsStep(
      this.serviceProvider,
      FreeformOperation.controls,
      'Use your own prompt'
    );
    this.setCurrentStep(controlsStep);
    return controlsStep.getPromise();
  }

  async run() {
    const insertPosition = this.getInsertPosition();

    this.textEditorService.insertLoadingAtom(insertPosition);

    const operationData = this.getOperationData();
    const controls = {instruction: this.instruction};
    const params = this.dataProcessor.freeform(operationData, controls);
    const responses = await this.getModel().freeform(params);

    this.setChoices(responses);
  }

  onPendingChoice(choice: ModelResult) {
    const insertPosition = this.getInsertPosition();
    this.textEditorService.insertChoiceAtom(choice.text, insertPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const insertPosition = this.getInsertPosition();
    this.textEditorService.insertGeneratedText(choice.text, insertPosition);
  }

  override instanceControls = {
    instruction: new TextInputControl({
      prefix: 'prompt',
      description:
        'A custom prompt for instructing the model what to generate next.',
      value: FreeformOperation.controls.instruction.value,
    }),
  };

  static override controls = {
    instruction: new TextInputControl({
      prefix: 'prompt',
      description:
        'A custom prompt for instructing the model what to generate next.',
      value: 'Tell me what happens next.',
      helperOperation: FreeformMetaPromptOperation,
    }),
  };
}
