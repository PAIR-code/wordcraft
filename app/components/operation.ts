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
import '@material/mwc-circular-progress-four-color';
import './choices';
import './operation_controls';
import './controls/key_command_small';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {ChoiceStep, ControlsStep, LoadingStep} from '@operations/steps';
import {OperationsService} from '@services/operations_service';
import {Operation} from '@operations/operation';
import {KeyCommand} from '@core/shared/keyboard';

import {styles} from './operation.css';
import {styles as sharedStyles} from './shared.css';

/**
 * A component that displays the current operation in the wordcraft sidebar
 */
@customElement('wordcraft-operation')
export class OperationComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  private readonly operationsService =
    wordcraftCore.getService(OperationsService);

  override render() {
    const operation = this.operationsService.currentOperation;
    if (operation == null) return '';

    const currentStep = operation.currentStep;

    if (currentStep instanceof LoadingStep) {
      return this.renderLoadingMessage(currentStep);
    }

    if (currentStep instanceof ChoiceStep) {
      return html`
        <wordcraft-choices .choiceStep=${currentStep}></wordcraft-choices>
      `;
    }

    if (currentStep instanceof ControlsStep) {
      return this.renderControlsStep(currentStep);
    }

    return '';
  }

  renderLoadingMessage(currentStep: LoadingStep) {
    return html`
      <div class="operation-loading-container">
        <div class="operation-spinner-container">
          <mwc-circular-progress-four-color density=${3} indeterminate>
          </mwc-circular-progress-four-color>
        </div>
        <div class="operation-loading-message">${currentStep.message}</div>
      </div>
    `;
  }

  renderControlsStep(currentStep: ControlsStep) {
    const operation = this.operationsService.currentOperation!;

    const subtitle = currentStep.subtitle
      ? html`<div class="controls-step-subtitle">${currentStep.subtitle}</div>`
      : '';

    return html`
      <div class="controls-step-title">${currentStep.title} ${subtitle}</div>
      ${this.renderControls(currentStep)}
      <div class="buttons-container">${this.renderButtons(operation)}</div>
    `;
  }

  renderControls(currentStep: ControlsStep) {
    // clang-format off
    return html`
      <wc-operation-controls
        .controls=${currentStep.controls}
        .onEnter=${() => {
          currentStep.finish();
        }}
        autofocus
      ></wc-operation-controls>
    `;
    // clang-format on
  }

  renderButtons(operation: Operation) {
    const actions = {
      go: {
        message: 'go',
        keyCommand: new KeyCommand('Enter'),
        keyLabel: 'enter',
        action: () => {
          operation.currentStep.finish();
        },
      },
      cancel: {
        message: 'cancel',
        keyCommand: new KeyCommand('Escape'),
        keyLabel: 'esc',
        action: () => {
          operation.cancel();
        },
      },
    };

    // clang-format off
    return [
      this.renderKeyCommand(actions.go),
      this.renderKeyCommand(actions.cancel),
    ];
    // clang-format on
  }

  renderKeyCommand(params: {
    message: string;
    keyCommand: KeyCommand;
    keyLabel: string;
    action: () => void;
  }) {
    const {message, keyCommand, keyLabel, action} = params;
    return html`
      <wordcraft-key-command-small
        message=${message}
        .keyCommand=${keyCommand}
        keyLabel=${keyLabel}
        .action=${action}
      >
      </wordcraft-key-command-small>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-operation': OperationComponent;
  }
}
