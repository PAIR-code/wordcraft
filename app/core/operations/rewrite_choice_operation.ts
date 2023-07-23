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
import {styleMap} from 'lit/directives/style-map.js';

import {createModelResult} from '@models/utils';
import {ModelResult, OperationType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {TextInputControl} from './operation_controls';
import {ControlsStep} from './steps';

/**
 * An operation to rewrite a choice in a particular way.
 */
export class RewriteChoiceOperation extends ChoiceOperation {
  override isHelperOperation = true;
  choiceToRewrite = '';
  static override id = OperationType.REWRITE_CHOICE;

  initialize(choiceToRewrite: string) {
    this.choiceToRewrite = choiceToRewrite;
  }

  getLoadingMessage() {
    return `Rewriting choice...`;
  }

  static override getButtonLabel() {
    return 'rewrite choice';
  }

  override getMessage() {
    const spanStyle = styleMap({
      fontStyle: 'italic',
    });
    return html`
      Rewriting choice: <span style=${spanStyle}>${this.choiceToRewrite}</span>
    `;
  }

  static override getDescription() {
    return 'Rewrite a choice in a particular way';
  }

  get howToRewrite() {
    return RewriteChoiceOperation.controls.howToRewrite.value;
  }

  override async beforeStart() {
    const controlsStep = new ControlsStep(
      this.serviceProvider,
      RewriteChoiceOperation.controls,
      'Rewrite the choice',
      this.choiceToRewrite
    );
    this.setCurrentStep(controlsStep);
    return controlsStep.getPromise();
  }

  async run() {
    // We're hacking the operation data as if the entire text is the choice, and
    // it's selected.
    const operationData = this.getOperationData();
    operationData.text = this.choiceToRewrite;
    operationData.cursorStart = 0;
    operationData.cursorEnd = this.choiceToRewrite.length;
    const controls = {
      howToRewrite: this.howToRewrite,
    };
    const params = this.dataProcessor.rewriteSelection(operationData, controls);
    const results = await this.getModel().rewriteSelection(params);

    // Keep the original text as the first option.
    const original = createModelResult(this.choiceToRewrite);
    this.setChoices(results, original);
  }

  onPendingChoice(choice: ModelResult, index: number) {}
  async onSelectChoice(choice: ModelResult, index: number) {}

  done() {
    this.resolve();
  }

  static override controls = {
    howToRewrite: new TextInputControl({
      prefix: 'make the text',
      description: 'Instructions for how to rewrite the current choice.',
      value: 'more descriptive',
    }),
  };
}
