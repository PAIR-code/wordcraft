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
import {Dialog} from '@material/mwc-dialog';
import {html, TemplateResult} from 'lit';
import {decorate, observable} from 'mobx';

import {SnackbarComponent} from '@components/shared_components/primitives/snackbar';
import {
  KeyboardService,
  KeyboardServiceHelper,
} from '../services/keyboard_service';
import {LocalStorageService, TextEditorService} from './services';

import {Service} from './service';

interface ServiceProvider {
  keyboardService: KeyboardService;
  localStorageService: LocalStorageService;
  textEditorService: TextEditorService;
}

/**
 * Manages dialogs, snackbars, and other alerts/notifications
 */
export class DialogService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  initialize() {
    const {keyboardService} = this.serviceProvider;
    this.keyboardServiceHelper = keyboardService.makeHelper('dialogs');
  }

  private keyboardServiceHelper!: KeyboardServiceHelper;

  private get localStorageService(): LocalStorageService {
    return this.serviceProvider.localStorageService;
  }

  private get textEditorService(): TextEditorService {
    return this.serviceProvider.textEditorService;
  }

  messageBody: string | TemplateResult = '';
  messageHeader: string | TemplateResult = '';

  private readonly dialogs = new Map<string, Dialog>();
  registerDialog(id: string, dialog: Dialog) {
    this.dialogs.set(id, dialog);
  }

  private readonly snackbars = new Map<string, SnackbarComponent>();
  registerSnackbar(id: string, snackbar: SnackbarComponent) {
    this.snackbars.set(id, snackbar);
  }

  openMessageDialog(messageBody: string | TemplateResult, messageHeader = '') {
    this.messageBody = messageBody;
    const dialog = this.dialogs.get('message-dialog');
    if (dialog instanceof Dialog) {
      this.openDialog(dialog);
    }
  }

  closeWelcomeDialog() {
    const dialog = this.dialogs.get('welcome-dialog');
    if (dialog instanceof Dialog) {
      dialog.close();
    }
  }

  private wasConfirmEventListenerAdded = false;
  private resolveConfirmDialog: (confirmed: boolean) => void = () => {};

  async openConfirmDialog(
    messageBody: string | TemplateResult,
    messageHeader = ''
  ): Promise<boolean> {
    this.messageBody = messageBody;
    const dialog = this.dialogs.get('confirm');
    if (dialog instanceof Dialog) {
      this.openDialog(dialog);

      if (!this.wasConfirmEventListenerAdded) {
        dialog.addEventListener('closed', (event) => {
          // tslint:disable-next-line:no-any
          if ((event as any).detail.action === 'confirm') {
            this.resolveConfirmDialog(true);
          } else {
            this.resolveConfirmDialog(false);
          }
          this.resolveConfirmDialog = () => {};
        });
        this.wasConfirmEventListenerAdded = true;
      }

      return new Promise((resolve) => {
        this.resolveConfirmDialog = resolve;
      });
    }

    return Promise.resolve(false);
  }

  openWelcomeDialog() {
    const hasBeenWelcomed = this.localStorageService.hasBeenWelcomed();
    const dialog = this.dialogs.get('welcome-dialog');
    if (dialog instanceof Dialog) {
      const welcomeComponent =
        // tslint:disable-next-line:no-any no-unnecessary-type-assertion
        dialog.querySelector('wordcraft-welcome-dialog') as any;
      welcomeComponent.hasBeenWelcomed = hasBeenWelcomed;

      dialog.addEventListener('closed', () => {
        this.localStorageService.setHasBeenWelcomed();
        this.openDoNotTrustTheBotSnackbar();
        this.textEditorService.focus();
      });

      this.openDialog(dialog);
    }
  }

  private openDialog(dialog: Dialog) {
    dialog.open = true;
    this.keyboardServiceHelper.registerKeyHandler('Escape', () => {
      dialog.close();
    });
    dialog.addEventListener('closed', () => {
      this.keyboardServiceHelper.unregisterKeyHandlers();
    });
  }

  getPendingSuggestionsMessage() {
    return html`
      You can't edit your story with pending suggestions.<br />
      Please choose a suggestion from the sidebar, or hit cancel.
    `;
  }

  getDoNotTrustTheBotMessage() {
    return html`
      ⚠️ DO NOT BELIEVE THE BOT!<br />
      Any information it provides is likely to be made up.<br />
      It can say offensive and biased things, especially when provoked.
    `;
  }

  private hasBeenWarnedNotToTrustTheBot = false;

  openDoNotTrustTheBotSnackbar() {
    if (!this.hasBeenWarnedNotToTrustTheBot) {
      this.openSnackbar(
        'bot-warning-snackbar',
        this.getDoNotTrustTheBotMessage(),
        true
      );
      this.hasBeenWarnedNotToTrustTheBot = true;
    }
  }

  openPendingChoiceSnackbar() {
    const content = this.getPendingSuggestionsMessage();
    this.openSnackbar('message-snackbar', content);
  }

  openErrorSnackbar(errorMessage: string) {
    this.openSnackbar('error-snackbar', errorMessage, true);
  }

  private openSnackbar(
    id: string,
    content: string | TemplateResult,
    isWarning = false
  ) {
    const htmlContent: TemplateResult =
      typeof content === 'string' ? html`${content}` : content;
    // tslint:disable-next-line:no-any
    const snackbar = this.snackbars.get(id);
    if (snackbar instanceof SnackbarComponent) {
      snackbar.open = false;
      snackbar.isWarning = isWarning;
      snackbar.content = htmlContent;
      snackbar.show();
    }
  }
}

decorate(DialogService, {
  messageBody: observable,
  messageHeader: observable,
});
