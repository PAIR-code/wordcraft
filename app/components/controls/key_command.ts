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
import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {KeyboardService} from '@services/keyboard_service';
import {getMetaKeyString, KeyCommand} from '@core/shared/keyboard';
import {OperationTrigger} from '@core/shared/types';
import {styles as sharedStyles} from '../shared.css';

import {styles as controlsStyles} from './controls.css';
import {styles} from './key_command.css';

/**
 * The sidebar component that displays a key command and button control
 */
@customElement('wordcraft-key-command')
export class KeyCommandComponent extends MobxLitElement {
  @property({type: String}) message = '';
  @property({type: Object}) keyCommand = new KeyCommand('notImplemented');
  @property({type: String}) keyLabel = '';
  @property({type: Object}) action = (triggerSource: OperationTrigger) => {};
  @property({type: Object}) onHover = (isHovered: boolean) => {};

  static override get styles() {
    return [sharedStyles, controlsStyles, styles];
  }

  private readonly keyboardService = wordcraftCore.getService(KeyboardService);

  private clearKeyHandler = () => {};

  override firstUpdated() {
    this.clearKeyHandler = this.keyboardService.registerKeyHandler(
      this.keyCommand,
      () => {
        this.action(OperationTrigger.KEY_COMMAND);
      }
    );
  }

  override disconnectedCallback() {
    this.clearKeyHandler();
  }

  override render() {
    const {message, keyCommand, keyLabel} = this;
    const modifier = getMetaKeyString();

    const renderModifier = () =>
      keyCommand.metaKey
        ? html`<span class="key-command">${modifier}</span>${' + '}`
        : '';

    const key = keyLabel ? keyLabel : keyCommand.key;

    // clang-format off
    return html`
      <div class="row">
        <div class="key-command-container">
          ${renderModifier()}
          <span class="key-command">${key}</span>
        </div>
        <button
          type="button"
          @mousedown=${(event: MouseEvent) => {
            event.preventDefault();
            this.action(OperationTrigger.BUTTON);
            return false;
          }}
          @mouseenter=${() => void this.onHover(true)}
          @mouseleave=${() => void this.onHover(false)}
        >
          ${message}
        </button>
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-key-command': KeyCommandComponent;
  }
}
