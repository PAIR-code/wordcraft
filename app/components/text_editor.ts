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
import {classMap} from 'lit/directives/class-map.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {TextEditorService} from '@services/text_editor_service';

import {styles} from './text_editor.css';

/**
 * The rich text editor component. The actual text and contents of the editor
 * container (#text-editor) are maintained imperatively by the TextEditorService
 * which is a wrapper for the Mobiledoc-kit library.
 */
@customElement('wordcraft-text-editor')
export class TextEditorComponent extends MobxLitElement {
  static override get styles() {
    return [styles];
  }

  private readonly textEditorService =
    wordcraftCore.getService(TextEditorService);

  @property({type: Boolean}) showWordCount = false;
  @property({type: String}) defaultText = '';
  @property({type: String}) placeholder = '';
  @property({type: Object}) onInitialized = () => {};
  @property({type: Object}) onDisconnect = () => {};
  @property({type: Object}) onDisabledOverlayClick = () => {};

  override firstUpdated() {
    const element = this.shadowRoot!.getElementById('text-editor')!;

    const config = {
      element,
      defaultText: this.defaultText,
      placeholder: this.placeholder,
    };
    this.textEditorService.initialize(config);

    this.onInitialized();
  }

  override disconnectedCallback() {
    this.onDisconnect();
  }

  override render() {
    const disabled = !this.textEditorService.isEnabled;
    const editorWrapperClass = classMap({
      disabled,
    });

    return html`
      <div id="editor-wrapper" class=${editorWrapperClass}>
        <div
          id="text-editor-wrapper"
          class="text-editor-font-styles"
          @click=${this.handleWrapperMouseClick}
        >
          ${disabled ? this.renderEditorDisabled() : ''}
          <div id="text-editor"></div>
          <div id="editor-buffer"></div>
          ${this.renderWordCount()}
        </div>
      </div>
    `;
  }

  renderWordCount() {
    if (!this.showWordCount) return '';
    return html`
      <div id="word-counter">
        ${this.textEditorService.wordCount}
        ${this.textEditorService.wordCount !== 1 ? 'words' : 'word'}
      </div>
    `;
  }

  private handleWrapperMouseClick(event: MouseEvent) {
    // Give focus back to the editor when we click *directly* below the editor.
    const path = event.composedPath();
    const first = path[0];
    const isEditorWrapperOrBuffer = (element: HTMLElement) => {
      return (
        element.id === 'text-editor-wrapper' || element.id === 'editor-buffer'
      );
    };

    if (first instanceof HTMLElement && isEditorWrapperOrBuffer(first)) {
      this.textEditorService.moveCursorToEnd();
    }
  }

  renderEditorDisabled() {
    return html`
      <div
        id="editor-disabled-overlay"
        @click=${() => void this.onDisabledOverlayClick()}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-text-editor': TextEditorComponent;
  }
}
