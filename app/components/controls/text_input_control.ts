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
import '@material/mwc-icon';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {TextInputControl} from '@operations/operation_controls';
import {styles as sharedStyles} from '../shared.css';

import {styles} from './controls.css';

/**
 * A component that displays an input text control for an operation
 */
@customElement('wc-text-input-control')
export class TextInputControlComponent extends MobxLitElement {
  @property({type: Object}) control!: TextInputControl;
  @property({type: Object}) onEnter = () => {};
  @property({type: Object}) onClickHelper = () => {};
  @property({type: Object}) onHover = (
    isHovered: string | TemplateResult
  ) => {};
  @property({type: Boolean}) override autofocus = false;

  static override get styles() {
    return [sharedStyles, styles];
  }

  override firstUpdated() {
    const input = this.shadowRoot!.querySelector('input.autofocus');
    if (input instanceof HTMLInputElement) {
      input.focus();

      // Reset the value to the current value in order to make the cursor appear
      // at the end of the input
      const val = input.value;
      input.value = '';
      input.value = val;
    }
  }

  override render() {
    const inputClasses = classMap({
      autofocus: this.autofocus,
      'text-input-control': true,
    });

    const {control} = this;
    const hoverTooltip = control.getDescription();

    // clang-format off
    return html`
      <div class="row">
        <div class="operation-control-prefix"
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        >${control.getPrefix()} :</div>
        <div class="operation-control-input">
          <input
            type='text'
            class=${inputClasses}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.onEnter();
                return false;
              }
              return true;
            }}
            @input=${
              // tslint:disable-next-line:no-any
              (e: any) => (control.value = e.target.value)
            }
            value='${control.value}'
            placeholder='${control.placeholder}'
            @mouseenter=${() => void this.onHover(hoverTooltip)}
            @mouseleave=${() => void this.onHover('')}
            ></input>
          </div>
      </div>
      ${this.renderHelperOperationButton()}
    `;
    // clang-format on
  }

  renderHelperOperationButton() {
    const {control} = this;

    if (!control.hasHelperOperation()) return '';
    const hoverTooltip = control.helperOperation!.getDescription();

    // clang-format off
    return html`
      <div class="row">
        <div class="operation-control-prefix"></div>
        <span class="helper-operation-container">
          or...
          <button
            type="button"
            class="helper-operation"
            @click=${() => {
              this.onClickHelper();
            }}
            @mouseenter=${() => void this.onHover(hoverTooltip)}
            @mouseleave=${() => void this.onHover('')}
          >
            ${control.helperOperation!.getButtonLabel()}
          </button>
        </span>
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-text-input-control': TextInputControlComponent;
  }
}
