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
import './operation';
import './controls/key_command';
import './operation_controls';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {Operation} from '@operations/operation';
import {ConfigService} from '@services/config_service';
import {OperationsService} from '@services/operations_service';
import {commandKeys} from '@services/text_editor_service';
import {OperationClass} from '@core/shared/interfaces';
import {KeyCommand} from '@core/shared/keyboard';
import {OperationTrigger} from '@core/shared/types';

import {styles} from './operations.css';
import {styles as sharedStyles} from './shared.css';

/**
 * The sidebar component that displays available operations.
 */
@customElement('wordcraft-operations')
export class OperationsComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  private readonly operationsService =
    wordcraftCore.getService(OperationsService);

  override firstUpdated() {
    this.operationsService.clearHoverTooltip();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.operationsService.clearHoverTooltip();
  }

  override render() {
    return html`
      ${this.renderAvailableOperations()} ${this.renderOperationHint()}
    `;
  }

  renderAvailableOperations() {
    const availableOperations = this.operationsService.availableOperations;
    const renderedOperations = availableOperations.map(
      (operationClass, index) => {
        const buttonLabel = operationClass.getButtonLabel();
        const keyCommand = new KeyCommand(commandKeys[index], true);

        // clang-format off
        return html`
          <div class="operation-row">
            <wordcraft-key-command
              message=${buttonLabel}
              .keyCommand=${keyCommand}
              .action=${(triggerSource: OperationTrigger) => {
                this.operationsService.triggerOperation(
                  operationClass,
                  triggerSource
                );
              }}
              .onHover=${(isHovered: boolean) => {
                if (isHovered) {
                  const tooltip = operationClass.getDescription();
                  this.operationsService.setHoverTooltip(tooltip);
                } else {
                  this.operationsService.clearHoverTooltip();
                }
              }}
            ></wordcraft-key-command>
            ${this.renderOperationControls(operationClass)}
          </div>
        `;
        // clang-format on
      }
    );

    return html`
      <div class="available-operations">${renderedOperations}</div>
    `;
  }

  renderOperationControls(operationClass: OperationClass) {
    if (!operationClass.controls) {
      return html``;
    }

    // clang-format off
    return html`
      <wc-operation-controls
        .controls=${operationClass.controls}
        .onEnter=${() => {
          this.operationsService.triggerOperation(
            operationClass,
            OperationTrigger.CONTROL
          );
        }}
      ></wc-operation-controls>
    `;
    // clang-format on
  }

  renderOperationHint() {
    return html`
      <div class="operation-hint">${this.operationsService.hoverTooltip}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-operations': OperationsComponent;
  }
}
