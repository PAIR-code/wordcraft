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
import '@material/mwc-icon-button';
import './loading';
import './onboarding';
import './sidebar_right';
import './text_editor';
import './welcome_dialog';

import {MobxLitElement} from '@adobe/lit-mobx';
import {Dialog} from '@material/mwc-dialog';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {SnackbarComponent} from '@components/shared_components/primitives/snackbar';
import {wordcraftCore} from '@core/wordcraft_core';
import {AppService} from '@services/app_service';
import {DialogService} from '@services/dialog_service';
import {KeyboardService} from '@services/keyboard_service';
import {LocalStorageService} from '@services/local_storage_service';
import {KeyCommand} from '@core/shared/keyboard';
import {DocumentStoreService} from '@services/document_store_service';

import {styles} from './app.css';
import {styles as sharedStyles} from './shared.css';

/**
 * Root component for the wordcraft app
 */
@customElement('wordcraft-app')
export class AppComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, styles];
  }

  private readonly appService = wordcraftCore.getService(AppService);
  private readonly dialogService = wordcraftCore.getService(DialogService);
  private readonly documentStoreService =
    wordcraftCore.getService(DocumentStoreService);
  private readonly keyboardService = wordcraftCore.getService(KeyboardService);
  private readonly localStorageService =
    wordcraftCore.getService(LocalStorageService);

  private registerDialog(id: string) {
    const dialog = this.shadowRoot!.getElementById(id) as Dialog;
    if (dialog) this.dialogService.registerDialog(id, dialog);
  }

  private registerSnackbar(id: string) {
    const snackbar = this.shadowRoot!.getElementById(id) as SnackbarComponent;
    if (snackbar) this.dialogService.registerSnackbar(id, snackbar);
  }

  override firstUpdated() {
    this.registerDialog('message-dialog');
    this.registerDialog('welcome-dialog');
    this.registerDialog('confirm');

    this.registerSnackbar('bot-warning-snackbar');
    this.registerSnackbar('message-snackbar');
    this.registerSnackbar('error-snackbar');
  }

  override render() {
    return html`
      <div id="wordcraft-app">
        ${this.renderContent()} ${this.renderDialogs()}
        ${this.renderSnackbars()}
      </div>
    `;
  }

  renderContent() {
    if (!this.appService.isReady) {
      return;
    }

    const {lifeCycleState} = this.appService;

    if (lifeCycleState === 'ONBOARDING') {
      return this.renderOnboarding();
    } else if (lifeCycleState === 'INITIALIZING') {
      return this.renderLoading();
    } else if (lifeCycleState === 'EDITING') {
      return this.renderApp();
    }
    return '';
  }

  renderDialogs() {
    const primaryConfirmButtonStyle = styleMap({
      marginLeft: '20px',
    });

    return html`
      <mwc-dialog
        id="message-dialog"
        heading="${this.dialogService.messageHeader}"
        hideActions
      >
        ${this.dialogService.messageBody}
      </mwc-dialog>
      <mwc-dialog id="welcome-dialog" hideActions>
        <wordcraft-welcome-dialog
          .close=${() => void this.dialogService.closeWelcomeDialog()}
        ></wordcraft-welcome-dialog>
      </mwc-dialog>
      <mwc-dialog id="confirm">
        ${this.dialogService.messageBody}
        <button
          slot="primaryAction"
          dialogAction="confirm"
          style=${primaryConfirmButtonStyle}
        >
          OK
        </button>
        <button slot="secondaryAction" dialogAction="cancel">Cancel</button>
      </mwc-dialog>
    `;
  }

  renderSnackbars() {
    return html`
      <wordcraft-snackbar id="bot-warning-snackbar" leading>
        <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
      </wordcraft-snackbar>
      <wordcraft-snackbar id="message-snackbar" leading>
        <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
      </wordcraft-snackbar>
      <wordcraft-snackbar id="error-snackbar" leading>
        <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
      </wordcraft-snackbar>
    `;
  }

  renderOnboarding() {
    return html`<wordcraft-onboarding></wordcraft-onboarding>`;
  }

  renderLoading() {
    return html`<wordcraft-loading-screen></wordcraft-loading-screen> `;
  }

  renderApp() {
    return html`
      <div id="main-panel">${this.renderEditor()}</div>
      <div id="sidebar-right">
        <wordcraft-sidebar-right></wordcraft-sidebar-right>
      </div>
    `;
  }

  renderEditor() {
    const keyboardServiceHelper = this.keyboardService.makeHelper('textEditor');

    const onInitialized = () => {
      if (!this.localStorageService.hasBeenWelcomed()) {
        this.dialogService.openWelcomeDialog();
      } else {
        this.dialogService.openDoNotTrustTheBotSnackbar();
      }
      const keyCommand = new KeyCommand('s', true);
      keyboardServiceHelper.registerKeyHandler(keyCommand, () => {
        this.documentStoreService.saveDocument();
      });

      this.documentStoreService.startAutoSave();
    };

    const onDisconnect = () => {
      keyboardServiceHelper.unregisterKeyHandlers();
      this.documentStoreService.endAutoSave();
    };

    const onDisabledOverlayClick = () => {
      this.dialogService.openPendingChoiceSnackbar();
    };

    return html`
      <wordcraft-text-editor
        ?showWordCount=${true}
        placeholder=${'Once upon a time...'}
        .onInitialized=${onInitialized}
        .onDisconnect=${onDisconnect}
        .onDisabledOverlayClick=${onDisabledOverlayClick}
      ></wordcraft-text-editor>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-app': AppComponent;
  }
}
