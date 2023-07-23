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
import {customElement} from 'lit/decorators.js';
import {computed, decorate, observable} from 'mobx';

import {getRandomLoadingMessage} from '@lib/loading_messages';

import {styles} from './loading.css';
import {styles as sharedStyles} from './shared.css';

/**
 * Loading screen for the wordcraft editor
 */
@customElement('wordcraft-loading-screen')
export class LoadingScreenComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  currentMessage = getRandomLoadingMessage();
  nPeriods = 3;

  private messageTimeout: number = -1;

  get loadingMessage() {
    const periods = [...new Array(this.nPeriods)].map(() => '.').join('');
    return `${this.currentMessage}${periods}`;
  }

  override firstUpdated() {
    this.updateMessage();
  }

  override disconnectedCallback() {
    clearTimeout(this.messageTimeout);
  }

  updateMessage() {
    const MS_DELAY = Math.random() * 2000 + 500;
    this.messageTimeout = window.setTimeout(() => {
      this.currentMessage = getRandomLoadingMessage();
      this.updateMessage();
    }, MS_DELAY);
  }

  override render() {
    return html`
      <div class="loading-wrapper">
        <div class="loading-message">${this.loadingMessage}</div>
      </div>
    `;
  }
}

decorate(LoadingScreenComponent, {
  currentMessage: observable,
  loadingMessage: computed,
});

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-loading-scrsen': LoadingScreenComponent;
  }
}
