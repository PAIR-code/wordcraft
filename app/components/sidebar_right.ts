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
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import '@components/shared_components/primitives/error_message';
import './chat';
import './operations';
import './operation_controls';
import './starred';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {AppService} from '@services/app_service';
import {DocumentStoreService} from '@services/document_store_service';
import {InitializationService} from '@services/initialization_service';
import {ModelService} from '@services/model_service';
import {OperationsService} from '@services/operations_service';
import {StarredResultsService} from '@services/starred_results_service';

import {styles as sharedStyles} from './shared.css';
import {styles as sidebarStyles} from './sidebar.css';
import {styles as sidebarRightStyles} from './sidebar_right.css';

/**
 * The right sidebar component
 */
@customElement('wordcraft-sidebar-right')
export class SidebarComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, sidebarStyles, sidebarRightStyles];
  }

  private readonly appService = wordcraftCore.getService(AppService);
  private readonly documentStoreService =
    wordcraftCore.getService(DocumentStoreService);
  private readonly initializationService = wordcraftCore.getService(
    InitializationService
  );
  private readonly modelService = wordcraftCore.getService(ModelService);
  private readonly operationsService =
    wordcraftCore.getService(OperationsService);
  private readonly starredResultsService = wordcraftCore.getService(
    StarredResultsService
  );

  private onTabActivated(event: CustomEvent<{index: number}>) {
    const index = event.detail.index;
    this.appService.activeSidebarTabIndex = index;
  }

  override render() {
    const {activeSidebarTabIndex} = this.appService;
    const noPadding = activeSidebarTabIndex === 1;

    const sidebarClasses = classMap({
      'sidebar-contents': true,
      'no-padding': noPadding,
    });

    return html`
      ${this.renderTabBar()}
      <div class=${sidebarClasses}>${this.renderContents()}</div>
    `;
  }

  renderTabBar() {
    const {activeSidebarTabIndex} = this.appService;
    const {starredResults, shouldShowStarredTab} = this.starredResultsService;
    const nStarred = starredResults.length;

    const areTabsDisabled = this.operationsService.isInOperation;
    const tabClasses = classMap({
      disabled: areTabsDisabled,
    });

    const renderStarTab = () => {
      if (!shouldShowStarredTab) return html``;
      return html` <mwc-tab
        icon="star_rate"
        label="Starred (${nStarred})"
      ></mwc-tab>`;
    };

    const renderChatTab = () => {
      const {hasDialogModel} = this.modelService;
      if (!hasDialogModel) return html``;

      return html` <mwc-tab icon="question_answer" label="Chat"></mwc-tab>`;
    };

    return html`
      <mwc-tab-bar
        class=${tabClasses}
        activeIndex=${activeSidebarTabIndex}
        @MDCTabBar:activated=${this.onTabActivated}
      >
        <mwc-tab icon="auto_awesome" label="Controls"></mwc-tab>
        ${renderChatTab()} ${renderStarTab()}
      </mwc-tab-bar>
    `;
  }

  renderContents() {
    const tabIndex = this.appService.activeSidebarTabIndex;

    if (tabIndex === 0) {
      return this.renderControls();
    }
    if (tabIndex === 1) {
      return html`<wordcraft-chat></wordcraft-chat>`;
    }
    if (tabIndex === 2) {
      return html`<wordcraft-starred-choices></wordcraft-starred-choices>`;
    }

    return html``;
  }

  renderControls() {
    const {top, bottom} = this.getTopAndBottomContents();

    return html`
      <div class="sidebar-top">${top}</div>
      <div class="sidebar-bottom">${bottom}</div>
    `;
  }

  private getTopAndBottomContents() {
    let top: TemplateResult = html``;
    let bottom: TemplateResult = html``;

    if (this.operationsService.currentOperation != null) {
      top = html`<wordcraft-operation></wordcraft-operation>`;
      bottom = html``;
    }
    // If the operation has errored, we'll add a message in the sidebar
    else if (this.operationsService.isError) {
      const onClose = () => {
        this.operationsService.isError = false;
      };
      const getMessage = () => {
        return html`
          ⚠️ Something went wrong...<br />
          The AI is probably busy, please try again later.
        `;
      };
      top = html`
        <wordcraft-error-message
          .onClose=${onClose}
          .getMessage=${getMessage}
        ></wordcraft-error-message>
      `;
    }
    // Otherwise show all available operations
    else {
      top = html`<wordcraft-operations></wordcraft-operations>`;

      const documentRow = html`
        ${this.renderMainMenuButton()} ${this.renderSaveButton()}
        <br />
      `;

      // clang-format off
      bottom = html` <div class="sidebar-bottom-links">${documentRow}</div> `;
      // clang-format on
    }

    return {top, bottom};
  }

  renderSaveButton() {
    if (this.documentStoreService.isSaving) {
      return this.renderLinkButton('saving...', () => {}, true /** disabled */);
    }

    const onClick = () => {
      this.documentStoreService.saveDocument();
    };
    return this.renderLinkButton('save story', onClick);
  }

  renderMainMenuButton() {
    const onClick = () => {
      this.initializationService.reset();
    };
    return this.renderLinkButton('main menu', onClick);
  }

  renderLinkButton(
    text: string,
    onClick: (e: Event) => void | Promise<void>,
    disabled = false
  ) {
    const buttonClasses = classMap({
      'link-button': true,
      disabled: disabled,
    });
    return html`<div class=${buttonClasses} @click=${onClick}>${text}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-sidebar-right': SidebarComponent;
  }
}
