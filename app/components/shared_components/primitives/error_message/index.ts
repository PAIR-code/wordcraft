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
import {css, html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * A generic error message component usable in different contexts in the app.
 */
@customElement('wordcraft-error-message')
export class ErrorMessageComponent extends MobxLitElement {
  @property({type: Object}) onClose = () => {};
  @property({type: Object}) getMessage: () => TemplateResult = () => html``;

  static override get styles() {
    return css`
      .error {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 20px;
        color: red;
        background-color: #fdd;
        font-size: var(--mdc-typography-body2-font-size, 0.875rem);
        -webkit-font-smoothing: antialiased;
        line-height: var(--mdc-typography-body2-line-height, 1.25rem);
        padding: 14px 8px 14px 16px;
        width: 100%;
        flex-grow: 1;
        box-sizing: border-box;
        justify-content: space-between;
        border-radius: var(--mdc-shape-small, 4px);
        box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
          0px 6px 10px 0px rgba(0, 0, 0, 0.14),
          0px 1px 18px 0px rgba(0, 0, 0, 0.12);
      }

      mwc-icon {
        cursor: pointer;
      }
    `;
  }

  override render() {
    // clang-format off
    return html`
      <div class="error">
        <span> ${this.getMessage()} </span>
        <mwc-icon
          @click=${() => {
            this.onClose();
          }}
          >close</mwc-icon
        >
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-error-message': ErrorMessageComponent;
  }
}
