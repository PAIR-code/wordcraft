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
import '@components/shared_components/primitives/error_message';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {AppService} from '@services/app_service';
import {DocumentStoreService} from '@services/document_store_service';

import {styles} from './onboarding.css';
import {styles as sharedStyles} from './shared.css';

/**
 * The wordcraft onboarding flow - allows the user to choose what to "seed"
 * their story with.
 */
@customElement('wordcraft-onboarding')
export class OnboardingComponent extends MobxLitElement {
  private readonly appService = wordcraftCore.getService(AppService);
  private readonly documentStoreService =
    wordcraftCore.getService(DocumentStoreService);

  static override get styles() {
    return [sharedStyles, styles];
  }

  override firstUpdated() {
    this.documentStoreService.loadUserDocuments();
  }

  override render() {
    return html`
      <div class="onboarding-wrapper">
        <h1><span class="text">Wordcraft</span> ✨✍️</h1>
        ${this.renderDescription()} ${this.renderGetStarted()}
        ${this.renderUserStories()}
      </div>
    `;
  }

  renderDescription() {
    return html`
      <div class="wordcraft-description">
        Wordcraft is an AI-assisted text editor for writing stories.
      </div>
    `;
  }

  renderGetStarted() {
    const getStarted = () => {
      this.appService.initializeEditor();
    };

    return html`
      <div class="get-started">
        <button @click=${getStarted}>Start a New Story</button>
      </div>
    `;
  }

  renderUserStories() {
    const {isLoading, userDocuments} = this.documentStoreService;

    let contents = html``;
    if (isLoading) {
      contents = html`
        <mwc-circular-progress-four-color density=${3} indeterminate>
        </mwc-circular-progress-four-color>
      `;
    }

    if (userDocuments.length) {
      // clang-format off
      contents = html`
        <div class="user-stories-header">Or load an existing story...</div>
        <div class="user-stories-list">
          ${userDocuments.map((doc) => {
            const onClick = () => {
              this.documentStoreService.loadSavedDocument(doc);
            };
            return html`
              <div @click=${onClick} class="story-preview">
                ${doc.text.split('\n').map((p) => html`<p>${p}</p>`)}
                <mwc-icon
                  class="delete-icon"
                  @click=${async (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.documentStoreService.deleteDocument(doc.id);
                  }}
                >
                  clear
                </mwc-icon>
              </div>
            `;
          })}
        </div>
      `;
      // clang-format on
    }

    return html` <div class="user-stories-container">${contents}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-onboarding': OnboardingComponent;
  }
}
