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
import {wordinessOptions} from '@models/shared';
import {
  ModelResult,
  OperationSite,
  OperationTrigger,
  OperationType,
} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {ServiceProvider} from './operation';
import {StepSliderControl} from './operation_controls';
import {ControlsStep} from './steps';

const defaultNWords = wordinessOptions[1].text;

/**
 * A "replace" operation deletes the selected word/phrase
 * and rewrites it from scratch using the surrounding context.
 */
export class ReplaceOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.SELECTION;
  }

  constructor(serviceProvider: ServiceProvider, trigger: OperationTrigger) {
    super(serviceProvider, trigger);
  }

  static override id = OperationType.REPLACE;

  static override getDescription() {
    return 'Replace the selected text.';
  }

  get nWords() {
    const index = ReplaceOperation.controls.nWords.value;
    return wordinessOptions[index].max;
  }

  get nWordsMessage() {
    return ReplaceOperation.controls.nWords.getStepValue();
  }

  getLoadingMessage() {
    return `Replacing with ${this.nWordsMessage}...`;
  }

  static override getButtonLabel() {
    return 'replace selection';
  }

  override async beforeStart() {
    // Only if the operation was triggered by key command do we move into the
    // controls step to get the prompt from a user input.
    if (this.trigger !== OperationTrigger.KEY_COMMAND) return;

    const controlsStep = new ControlsStep(
      this.serviceProvider,
      ReplaceOperation.controls,
      'Replace the text'
    );
    this.setCurrentStep(controlsStep);
    return controlsStep.getPromise();
  }

  private getSelectionRange() {
    const selectionRange = this.textEditorService.getRange();
    return selectionRange;
  }

  async run() {
    const operationData = this.getOperationData();
    const selectedText = helpers.getSelectedText(operationData);

    const insertPosition = this.textEditorService.deleteRange(
      this.getSelectionRange()
    );
    this.textEditorService.insertSelectionAtom(insertPosition, selectedText);

    const controls = {nWords: this.nWords};
    const params = this.dataProcessor.replace(operationData, controls);
    const choices = await this.getModel().replace(params);

    // Keep the original text as the first option.
    const original = createModelResult(selectedText);
    this.setChoices(choices, original);
  }

  onPendingChoice(choice: ModelResult) {
    const insertPosition = this.textEditorService.deleteRange(
      this.getSelectionRange()
    );

    this.textEditorService.insertChoiceAtom(choice.text, insertPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const insertPosition = this.textEditorService.deleteRange(
      this.getSelectionRange()
    );
    this.textEditorService.insertGeneratedText(choice.text, insertPosition);
  }

  static nWordsChoices = wordinessOptions.map((e) => e.text);

  static override controls = {
    nWords: new StepSliderControl<string>({
      prefix: 'replace with',
      suffix: (control) => {
        const stepControl = control as StepSliderControl<string>;
        return stepControl.getStepValue();
      },
      description: 'How long the suggestions should be.',
      value: ReplaceOperation.nWordsChoices.indexOf(defaultNWords),
      steps: ReplaceOperation.nWordsChoices,
    }),
  };
}

decorate(ReplaceOperation, {
  nWords: computed,
});
