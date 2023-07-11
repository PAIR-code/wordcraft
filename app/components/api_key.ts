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
import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {styles as sharedStyles} from './shared.css';
import {styles as inputStyles} from './controls/controls.css';

/**
 * A welcome dialog.
 */
@customElement('wordcraft-api-key-dialog')
export class ApiKeyComponent extends MobxLitElement {
  static override get styles() {
    return [
      sharedStyles,
      inputStyles,
      css`
        .main {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .title {
          font-size: 22px;
        }

        .input-wrapper {
          margin: 30px 0;
          width: 100%;
          display: flex;
          gap: 16px;
        }

        button {
          width: 250px;
        }
      `,
    ];
  }

  @property({attribute: false}) apiKey = '';

  private submitApiKey() {
    const apiKey = this.apiKey;
  }

  override render() {
    const inputStyle = styleMap({
      width: '100%',
    });

    // clang-format off
    return html`
      <div class="dialog-wrapper">
        <div class="main">
          <div class="title">Please enter your PaLM API Key</div>
          <div class="subtitle">In order to run Wordcraft, you'll need a PaLM API key. Please follow the
instructions at
<a href="https://developers.generativeai.google/tutorials/setup" target="_blank">developers.generativeai.google/tutorials/setup</a>. This API Key will be stored locally and won't be shared.

          <div class="input-wrapper">
          <input
            type='text'
            style=${inputStyle}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.submitApiKey();
                return false;
              }
              return true;
            }}
            @input=${
              // tslint:disable-next-line:no-any
              (e: any) => (this.apiKey = e.target.value)
            }
            value=${this.apiKey}
            ></input>
            <button type="button" ?disabled=${this.apiKey === ''}>
              ✨✍️ Get Started
            </button>
          </div>
        </div>
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-api-key-dialog': ApiKeyComponent;
  }
}
