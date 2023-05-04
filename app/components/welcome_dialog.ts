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
import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles as sharedStyles} from './shared.css';
import {styles} from './welcome_dialog.css';

/**
 * A welcome dialog.
 */
@customElement('wordcraft-welcome-dialog')
export class WelcomeDialogComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  @property({type: Boolean}) hasBeenWelcomed = false;
  @property({type: Object}) close = () => {};

  override render() {
    const welcomeMessage = this.hasBeenWelcomed
      ? 'About Wordcraft'
      : 'Welcome to Wordcraft!';

    // clang-format off
    return html`
      <div class="dialog-wrapper">
        <div class="controls">
          <mwc-icon @click=${() => void this.close()}>close</mwc-icon>
        </div>
        <div class="main">
          <div class="title">✨✍️${welcomeMessage}</div>
          <p>
            Wordcraft is a text editor that enables collaborative writing with a
            powerful language model, with a suite of built-in controls: from
            generating new content to rewriting text, even suggesting what to
            try next.
          </p>
          <p>
            These controls are in the right-hand sidebar. The controls change
            depending on where your cursor is, and whether you’ve selected any
            text. Try clicking
            <button class="inline no-interaction" type="button">
              generate text
            </button>
            to add text at the cursor position.
          </p>
          <p>
            Then, <span class="selection">select some text</span> and try out
            the new controls that appear. You can even ask the model for
            suggestions of what to try by clicking on the "get suggested"
            buttons.
          </p>
          <p>
            There's also a sidebar tab called "Chat", where you can have a
            conversation with the AI about your story to develop new ideas and
            get feedback.
          </p>
          <p>❤️ - Wordcraft</p>
        </div>
        ${this.renderGetStarted()}
      </div>
    `;
    // clang-format on
  }

  renderGetStarted() {
    if (this.hasBeenWelcomed) return '';

    return html`
      <div class="get-started">
        <button type="button" @click=${() => void this.close()}>
          ✨✍️ Get Started
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-welcome-dialog': WelcomeDialogComponent;
  }
}
