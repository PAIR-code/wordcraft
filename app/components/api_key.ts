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
import '@material/mwc-circular-progress';

import {MobxLitElement} from '@adobe/lit-mobx';
import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {wordcraftCore} from '../core/wordcraft_core';
import {KeyService} from '../core/services/key_service';
import {delay} from '../lib/utils';

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
        }

        .title {
          font-size: 22px;
          margin-bottom: 20px;
        }

        .subtitle {
          margin-bottom: 20px;
        }

        .input-wrapper {
          margin: 30px 0 0 0;
          width: 100%;
          display: flex;
          gap: 16px;
        }

        button {
          width: 250px;
        }

        .error-message {
          margin-top: 10px;
          color: var(--red);
        }
      `,
    ];
  }

  private readonly keyService = wordcraftCore.getService(KeyService);

  @property({attribute: false}) apiKey = '';
  @property({attribute: false}) isCheckingApiKey = false;
  @property({attribute: false}) errorMessage = '';

  private async submitApiKey() {
    this.isCheckingApiKey = true;
    const apiKey = this.apiKey;
    const isValid = await this.keyService.checkApiKey(apiKey);
    if (!isValid) {
      await delay(1000);
      this.errorMessage = '⚠️ Invalid API Key';
    }
    this.isCheckingApiKey = false;
  }

  override render() {
    const inputStyle = styleMap({
      width: '100%',
    });

    const isDisabled = this.isCheckingApiKey;

    const renderButtonContent = () => {
      if (this.isCheckingApiKey) {
        return html`Checking...`;
      } else {
        return html`✨✍️ Get Started`;
      }
    };

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
            ?disabled=${isDisabled}
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
            <button type="button" ?disabled=${
              this.apiKey === '' || isDisabled
            } @click=${this.submitApiKey}>
              ${renderButtonContent()}
            </button>
          </div>
          <div class="error-message">${this.errorMessage}</div>
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
