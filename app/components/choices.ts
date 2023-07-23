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
import '@material/mwc-fab';
import './controls/key_command_small';
import './operation_controls';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {preventDefault} from '@lib/utils';
import {ChoiceOperation, Operation} from '@core/operations';
import {ChoiceStep} from '@operations/steps';
import {KeyboardService} from '@services/keyboard_service';
import {OperationsService} from '@services/operations_service';
import {StarredResultsService} from '@services/starred_results_service';
import {OperationClass, OperationControls} from '@core/shared/interfaces';
import {KeyCommand} from '@core/shared/keyboard';

import {styles} from './choices.css';
import {styles as sharedStyles} from './shared.css';

/**
 * A component that displays the choices available for the current choice step
 * in the wordcraft sidebar.
 */
@customElement('wordcraft-choices')
export class ChoicesComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  private readonly keyboardService = wordcraftCore.getService(KeyboardService);
  private readonly starredResultsService = wordcraftCore.getService(
    StarredResultsService
  );
  private readonly operationsService =
    wordcraftCore.getService(OperationsService);

  @property({type: Object}) choiceStep!: ChoiceStep;

  private readonly keyboardServiceHelper =
    this.keyboardService.makeHelper('choiceStep');

  override firstUpdated() {
    const {choices, firstChoiceIsOrigional} = this.choiceStep;
    firstChoiceIsOrigional && !this.isEmpty() && choices.setIndex(1);

    this.keyboardServiceHelper.registerKeyHandler('ArrowDown', () => {
      choices.incrementIndex();
    });
    this.keyboardServiceHelper.registerKeyHandler('ArrowUp', () => {
      choices.decrementIndex();
    });
  }

  override disconnectedCallback() {
    this.keyboardServiceHelper.unregisterKeyHandlers();
  }

  private get choiceOperation(): ChoiceOperation {
    return this.operationsService.currentOperation! as ChoiceOperation;
  }

  override render() {
    const operation = this.operationsService.currentOperation;
    if (!(operation instanceof ChoiceOperation)) return;

    const isEmpty = this.isEmpty();

    return html`
      <div class="choices-controls-container">
        ${this.renderOperationMessage(operation)}
        ${this.renderOperationControls(operation)}
        ${this.renderActions(operation)} ${this.renderArrowInstructions()}
      </div>
      <div class="choices-container">
        ${this.renderChoices()} ${isEmpty ? this.renderEmptyMessage() : ''}
      </div>
    `;
  }

  renderOperationMessage(operation: Operation) {
    const message = operation.getMessage();
    if (!message) return '';

    return html` <div class="operation-message">${message}</div> `;
  }

  renderActions(operation: ChoiceOperation) {
    const isEmpty = this.isEmpty();
    const canRewriteChoice = operation.canRewriteChoice && !isEmpty;

    const actions = {
      choose: {
        message: 'choose',
        keyCommand: new KeyCommand('Enter'),
        keyLabel: 'enter',
        action: () => {
          this.choiceStep.chooseCurrentIndex();
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
      refresh: {
        message: 'refresh',
        keyCommand: new KeyCommand('Tab'),
        keyLabel: 'tab',
        action: () => {
          operation.restart();
        },
      },
      rewrite: {
        message: 'rewrite',
        keyCommand: new KeyCommand('e', true),
        keyLabel: 'e',
        action: () => {
          this.operationsService.rewriteCurrentChoice();
        },
      },
    };

    return html`
      <div class="actions-container">
        ${isEmpty ? '' : this.renderAction(actions.choose)}
        ${this.renderAction(actions.cancel)}
        ${this.renderAction(actions.refresh)}
        ${canRewriteChoice ? this.renderAction(actions.rewrite) : ''}
      </div>
    `;
  }

  renderAction(params: {
    message: string;
    keyCommand: KeyCommand;
    keyLabel: string;
    action: () => void;
  }) {
    const {message, keyCommand, keyLabel, action} = params;
    return html`
      <div class="action-button-wrapper">
        <wordcraft-key-command-small
          message=${message}
          .keyCommand=${keyCommand}
          keyLabel=${keyLabel}
          .action=${action}
        >
        </wordcraft-key-command-small>
      </div>
    `;
  }

  renderArrowInstructions() {
    const nChoices = this.choiceStep.choices.getNEntries();
    if (nChoices < 2) return;

    const choiceIndex = this.choiceStep.choices.getIndex();
    return html`
      <div class="choices-instructions">
        <span class="key-command key-command-small">⬆</span>
        <span class="key-command key-command-small">⬇</span>
        to cycle through choices (${choiceIndex + 1}/${nChoices})
      </div>
    `;
  }

  renderChoices() {
    const canStar = this.choiceOperation.canStarChoice;
    const {choices, firstChoiceIsOrigional} = this.choiceStep;

    return choices.getEntries().map((choice, index) => {
      const selectIndex = (index: number) =>
        preventDefault(() => void choices.setIndex(index));

      const isSelected = choices.getIndex() === index;
      const choiceClasses = classMap({
        choice: true,
        selected: isSelected,
      });

      const isOrigText = firstChoiceIsOrigional && index === 0;
      const origTextLabel = html`<div class="orig-text-label">
        Original text
      </div>`;

      const choose = preventDefault(() => {
        this.choiceStep.chooseIndex(index);
      });
      const remove = preventDefault(() => {
        this.choiceStep.removeChoiceIndex(index);
      });
      const onClickStar = preventDefault(() => {
        if (this.starredResultsService.hasStarred(choice)) {
          this.starredResultsService.unstar(choice);
        } else {
          this.starredResultsService.star(choice);
        }
      });

      const renderChoiceButtons = () => {
        const hasStarred = this.starredResultsService.hasStarred(choice);
        const starIcon = hasStarred ? 'star_rate' : 'star_border';

        // clang-format off
        return html`
          <div class="choice-buttons">
            <mwc-fab
              class="add-remove"
              mini
              icon="close"
              @click=${remove}
              title="remove"
            ></mwc-fab>
            ${canStar
              ? html`<mwc-fab
                  class="add-remove"
                  title="star result"
                  mini
                  icon=${starIcon}
                  @click=${onClickStar}
                >
                </mwc-fab>`
              : ''}
            <mwc-fab
              class="choose"
              title="select"
              mini
              icon="done"
              @click=${choose}
            >
            </mwc-fab>
          </div>
        `;
        // clang-format on
      };

      // clang-format off
      return html`
        <div
          class=${choiceClasses}
          @click=${selectIndex(index)}
          @dblclick=${choose}
        >
          ${isOrigText ? origTextLabel : ''} ${this.renderText(choice.text)}
          ${isSelected ? renderChoiceButtons() : ''}
        </div>
      `;
      // clang-format on
    });
  }

  private renderText(text: string) {
    const brokenOnNewlines = text.split('\n');
    return brokenOnNewlines.map((p) => {
      return html`<p class="choice-paragraph">${p}</p>`;
    });
  }

  renderOperationControls(operation: Operation) {
    let controls: OperationControls;
    if (operation.hasInstanceControls()) {
      controls = operation.instanceControls;
    } else {
      const operationConstructor = operation.constructor as OperationClass;
      controls = operationConstructor.controls;
    }

    return html`
      <wc-operation-controls
        .controls=${controls}
        .onEnter=${() => operation.restart()}
      ></wc-operation-controls>
    `;
  }

  renderEmptyMessage() {
    return html`
      <div class="empty-choices">No results for the given prompt.</div>
    `;
  }

  isEmpty() {
    return this.choiceStep.choices.getNEntries() === 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-choices': ChoicesComponent;
  }
}
