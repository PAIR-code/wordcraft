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
import {computed, decorate} from 'mobx';

import {createModelResult} from '@models/utils';
import * as helpers from '../operation_data/helpers';
import {
  ModelResult,
  OperationSite,
  OperationTrigger,
  OperationType,
  TextType,
} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {ServiceProvider} from './operation';
import {TextInputControl} from './operation_controls';
import {ControlsStep} from './steps';
import {SuggestRewriteOperation} from './suggest_rewrite_operation';

class SuggestRewriteSelectionOperation extends SuggestRewriteOperation {
  getTextType() {
    const selectedText = this.getTextToRewrite();
    const words = selectedText.split(' ').filter((x) => x.length > 0);
    return words.length === 1 ? TextType.WORD : TextType.PHRASE;
  }

  getTextToRewrite() {
    const operationData = this.getOperationData();
    return helpers.getSelectedText(operationData);
  }

  async onSelectChoice(choice: ModelResult) {
    // When the user selects a prompt, we're going to trigger a new freeform
    // prompt operation using the selected prompt. We'll do this by running
    // a new operation on the resolution of this operation's promise.
    this.onFinish(() => {
      this.operationsService.startOperation(
        () =>
          new RewriteSelectionOperation(
            this.serviceProvider,
            OperationTrigger.OPERATION,
            choice.data.payload
          ),
        OperationTrigger.OPERATION
      );
    });
  }
}

/**
 * An operation that rewrites the selected word/phrase.
 */
export class RewriteSelectionOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.SELECTION;
  }

  constructor(
    serviceProvider: ServiceProvider,
    trigger: OperationTrigger,
    howToRewrite: string = ''
  ) {
    super(serviceProvider, trigger);
    if (howToRewrite) {
      this.instantiatedWithHowToRewrite = true;
      this.instanceControls.howToRewrite.value = howToRewrite;
    }
  }

  static override id = OperationType.REWRITE_SELECTION;

  private readonly instantiatedWithHowToRewrite: boolean = false;

  static override getDescription() {
    return 'Rewrite the selected text in a specific way.';
  }

  static override getButtonLabel() {
    return 'rewrite selection';
  }

  get howToRewrite(): string {
    return this.instantiatedWithHowToRewrite
      ? this.instanceControls.howToRewrite.value
      : RewriteSelectionOperation.controls.howToRewrite.value;
  }

  getLoadingMessage() {
    return `Rewriting selection...`;
  }

  override async beforeStart() {
    // If the operation was instantiated with a prompt, then there's no need to
    // move into the text input step;
    if (this.instantiatedWithHowToRewrite) {
      return;
    }

    // Only if the operation was triggered by key command do we move into the
    // controls step to get the prompt from a user input.
    if (this.trigger !== OperationTrigger.KEY_COMMAND) return;

    const controlsStep = new ControlsStep(
      this.serviceProvider,
      RewriteSelectionOperation.controls,
      'Rewrite the text'
    );
    this.setCurrentStep(controlsStep);
    return controlsStep.getPromise();
  }

  async run() {
    const operationData = this.getOperationData();
    const selectedText = helpers.getSelectedText(operationData);
    const selectionRange = this.textEditorService.getRange();

    const insertPosition = this.textEditorService.deleteRange(selectionRange);
    this.textEditorService.insertSelectionAtom(insertPosition, selectedText);

    const controls = {howToRewrite: this.howToRewrite};
    const params = this.dataProcessor.rewriteSelection(operationData, controls);
    const results = await this.getModel().rewriteSelection(params);

    // Keep the original text as the first option.
    const originalChoice = createModelResult(selectedText);
    this.setChoices(results, originalChoice);
  }

  onPendingChoice(choice: ModelResult) {
    const selectionRange = this.textEditorService.getRange();
    const insertPosition = this.textEditorService.deleteRange(selectionRange);

    this.textEditorService.insertChoiceAtom(choice.text, insertPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const selectionRange = this.textEditorService.getRange();
    const insertPosition = this.textEditorService.deleteRange(selectionRange);

    this.textEditorService.insertGeneratedText(choice.text, insertPosition);
  }

  override instanceControls = {
    howToRewrite: new TextInputControl({
      prefix: 'rewrite the text',
      description: 'Instructions for how to rewrite the text.',
      value: RewriteSelectionOperation.controls.howToRewrite.value,
    }),
  };

  static override controls = {
    howToRewrite: new TextInputControl({
      prefix: 'rewrite the text',
      description: 'Instructions for how to rewrite the text',
      value: 'to be more descriptive',
      helperOperation: SuggestRewriteSelectionOperation,
    }),
  };
}

decorate(RewriteSelectionOperation, {
  howToRewrite: computed,
});
