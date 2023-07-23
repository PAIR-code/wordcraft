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
import './controls/key_command_small';
import './operation_controls';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {ChatService} from '@services/chat_service';
import {ConfigService} from '@services/config_service';

import {styles} from './chat.css';
import {styles as sharedStyles} from './shared.css';

/**
 * A component that displays a chat interface for basic back and
 * forth conversation with an AI agent.
 */
@customElement('wordcraft-chat')
export class ChatComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  private readonly chatService = wordcraftCore.getService(ChatService);
  private nMessages = 0;

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.chatService.sendMessage();
      return false;
    }
    return true;
  };

  override updated() {
    if (this.chatService.messages.length !== this.nMessages) {
      const messagesContainer = this.shadowRoot!.querySelector(
        '.messages-container'
      )!;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      this.nMessages = this.chatService.messages.length;
    }
  }

  override render() {
    const {isLoading, currentMessage} = this.chatService;

    const inputContainerClasses = classMap({
      'input-container': true,
      disabled: this.chatService.isLoading,
    });

    const isSendButtonDisabled = isLoading || currentMessage.length === 0;

    const placeholder = 'Say something to Wordcraft...';
    const toggleLabel = 'Let Wordcraft read your story';

    // clang-format off
    return html`
      <div class="messages-container">${this.renderMessages()}</div>
      <div class=${inputContainerClasses}>
        <div class="row">
          <textarea
            ?disabled=${isLoading}
            type="text"
            class="text-input"
            @keydown=${this.onKeyDown}
            .value="${currentMessage}"
            @input=${
              // tslint:disable-next-line:no-any
              (e: any) => (this.chatService.currentMessage = e.target.value)
            }
            placeholder=${placeholder}
          >
          </textarea>
          <div class="buttons-container">
            <button
              type="button"
              ?disabled=${isSendButtonDisabled}
              @click=${() => {
                this.chatService.sendMessage();
              }}
            >
              <mwc-icon>send</mwc-icon>
            </button>
            <button
              type="button"
              ?disabled=${isLoading}
              @click=${() => {
                this.chatService.undoLastTurn();
              }}
            >
              <mwc-icon>undo</mwc-icon>
            </button>
            <button
              type="button"
              ?disabled=${isLoading}
              @click=${() => {
                this.chatService.reset();
              }}
            >
              <mwc-icon>refresh</mwc-icon>
            </button>
          </div>
        </div>
        <div class="row centered">
          <mwc-checkbox
            ?checked=${this.chatService.shouldIncludeStory}
            reducedTouchTarget
            @change=${
              // tslint:disable-next-line:no-any
              (e: any) => {
                this.chatService.shouldIncludeStory = e.currentTarget.checked;
              }
            }
          ></mwc-checkbox>
          <div class="toggle-label">${toggleLabel}</div>
        </div>
      </div>
    `;
    // clang-format on
  }

  private renderMessages() {
    const messages = this.chatService.messagesToDisplay.map(
      (message, index) => {
        const isModelMessage = index % 2 === 0;
        const sideClass = isModelMessage ? 'left-side-msg' : 'right-side-msg';
        const bubbleClass = isModelMessage ? 'agent-msg' : 'usr-msg';
        return html`
          <div class=${sideClass}>
            <div class="bubble-text ${bubbleClass}">${message}</div>
          </div>
        `;
      }
    );

    if (this.chatService.isLoading) {
      const loadingBubble = html`
        <div class="left-side-msg">
          <div class="bubble-text agent-msg">
            <div class="loading-wrapper">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
      `;
      messages.push(loadingBubble);
    }

    return messages;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-chat': ChatComponent;
  }
}
