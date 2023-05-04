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
import {Snackbar} from '@material/mwc-snackbar';
import {html, TemplateResult} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {style} from './snackbar_styles';

/**
 * A forked version of the mwc-snackbar component that lets us pass in strings
 * or html template results in as the content.
 */
@customElement('wordcraft-snackbar')
export class SnackbarComponent extends Snackbar {
  static override get styles() {
    return [style];
  }

  @query('.mdc-snackbar') protected override mdcRoot!: HTMLElement;

  @query('.mdc-snackbar__label') protected override labelElement!: HTMLElement;

  @property({type: Boolean, reflect: true}) override open = false;
  @property({type: Boolean}) isWarning = false;
  @property({type: Number}) override timeoutMs = 5000;
  @property({type: Boolean}) override closeOnEscape = false;

  @property({type: Object}) content: TemplateResult = html``;
  @property({type: Boolean}) override stacked = false;
  @property({type: Boolean}) override leading = false;

  protected override reason = '';

  override render() {
    const classes = {
      'mdc-snackbar--stacked': this.stacked,
      'mdc-snackbar--leading': this.leading,
      'is-warning': this.isWarning,
    };
    return html` <div
      class="mdc-snackbar ${classMap(classes)}"
      @keydown="${this.handleKeydown}"
    >
      <div class="mdc-snackbar__surface">
        <div class="mdc-snackbar__label" role="status">${this.content}</div>
        <div class="mdc-snackbar__actions">
          <slot name="action" @click="${this.handleActionClick}"></slot>
          <slot name="dismiss" @click="${this.handleDismissClick}"></slot>
        </div>
      </div>
    </div>`;
  }

  /** @export */
  override show() {
    this.open = true;
  }

  /** @export */
  override close(reason = '') {
    this.reason = reason;
    this.open = false;
  }

  protected override firstUpdated() {
    super.firstUpdated();
    if (this.open) {
      this.mdcFoundation.open();
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    this.mdcFoundation.handleKeyDown(e);
  }

  private handleActionClick(e: MouseEvent) {
    this.mdcFoundation.handleActionButtonClick(e);
  }

  private handleDismissClick(e: MouseEvent) {
    this.mdcFoundation.handleActionIconClick(e);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-snackbar': SnackbarComponent;
  }
}
