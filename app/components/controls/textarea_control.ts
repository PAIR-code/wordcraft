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
import {html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {TextareaControl} from '@operations/operation_controls';
import {styles as sharedStyles} from '../shared.css';

import {styles} from './controls.css';

/**
 * A component that displays a textarea control for an operation
 */
@customElement('wc-textarea-control')
export class TextareaControlComponent extends MobxLitElement {
  @property({type: Object, reflect: true}) control!: TextareaControl;
  @property({type: Object, attribute: false})
  onCopy: (e: ClipboardEvent) => void = (e: ClipboardEvent) => {};
  @property({type: Object}) onEnter = () => {};
  @property({type: Object}) onClickHelper = () => {};
  @property({type: Object}) onHover = (
    isHovered: string | TemplateResult
  ) => {};
  @property({type: Boolean}) override autofocus = false;

  static override get styles() {
    return [sharedStyles, styles];
  }

  override render() {
    const {control} = this;
    const hoverTooltip = control.getDescription();

    // clang-format off
    return html`
      <div class="row">
        <div class="operation-control-prefix">${control.getPrefix()} :</div>
        <div class="operation-control-input">
          <textarea
            placeholder=${control.placeholder}
            class="textarea-control"
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
            @mouseenter=${() => void this.onHover(hoverTooltip)}
            @mouseleave=${() => void this.onHover('')}
            @copy=${(e: ClipboardEvent) => {
              this.onCopy(e);
            }}
          >
${control.value}</textarea
          >
          ${this.renderHelperOperationButton()}
        </div>
      </div>
    `;
    // clang-format on
  }

  renderHelperOperationButton() {
    const {control} = this;

    if (!control.hasHelperOperation()) return '';
    const hoverTooltip = control.helperOperation!.getDescription();

    // clang-format off
    return html`
      <button
        type="button"
        @click=${() => {
          this.onClickHelper();
        }}
        @mouseenter=${() => void this.onHover(hoverTooltip)}
        @mouseleave=${() => void this.onHover('')}
      >
        <mwc-icon>auto_awesome</mwc-icon>
      </button>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-textarea-control': TextareaControlComponent;
  }
}
