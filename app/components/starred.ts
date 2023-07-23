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
import '@material/mwc-tab-bar';
import '@material/mwc-tab';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {Choices} from '@lib/choices';
import {preventDefault} from '@lib/utils';
import {KeyboardService} from '@services/keyboard_service';
import {StarredResultsService} from '@services/starred_results_service';
import {TextEditorService} from '@services/text_editor_service';
import {ModelResult} from '@core/shared/types';

import {styles as choicesStyles} from './choices.css';
import {styles as sharedStyles} from './shared.css';

/**
 * Displays a list of starred choices to add to the editor.
 */
@customElement('wordcraft-starred-choices')
export class StarredChoicesComponent extends MobxLitElement {
  static override get styles() {
    return [sharedStyles, choicesStyles];
  }

  private readonly keyboardService = wordcraftCore.getService(KeyboardService);
  private readonly starredResultsService = wordcraftCore.getService(
    StarredResultsService
  );
  private readonly textEditorService =
    wordcraftCore.getService(TextEditorService);

  private readonly keyboardServiceHelper =
    this.keyboardService.makeHelper('starred');
  private readonly choices: Choices<ModelResult>;

  constructor() {
    super();
    this.choices = new Choices<ModelResult>(
      this.starredResultsService.starredResults
    );
  }

  override connectedCallback() {
    this.keyboardServiceHelper.registerKeyHandler('ArrowDown', () => {
      this.choices.incrementIndex();
    });
    this.keyboardServiceHelper.registerKeyHandler('ArrowDown', () => {
      this.choices.decrementIndex();
    });
    super.connectedCallback();
  }

  override disconnectedCallback() {
    this.keyboardServiceHelper.unregisterKeyHandlers();
    super.disconnectedCallback();
  }

  private removeResult(index: number) {
    const result = this.choices.getEntry(index);
    if (result) {
      this.choices.removeAtIndex(index);
      this.starredResultsService.unstar(result);
    }
  }

  private chooseResult(index: number) {
    const result = this.choices.getEntry(index);
    if (result) {
      const text = result.text;
      this.textEditorService.insertGeneratedTextAtEndOfDoc(text);
      this.removeResult(index);
    }
  }

  override render() {
    if (this.choices.getNEntries() === 0) {
      return html`
        <div class="empty-choices">
          No results have been starred. You can save results for later use by
          pressing the
          <mwc-icon class="inline-icon">star_outline</mwc-icon> button.
        </div>
      `;
    }

    return html` ${this.renderChoices()} `;
  }

  renderChoices() {
    const starredResults = this.choices.getEntries();
    return starredResults.map((choice, index) => {
      const selectIndex = (index: number) =>
        preventDefault(() => void this.choices.setIndex(index));

      const isSelected = this.choices.getIndex() === index;
      const choiceClasses = classMap({
        choice: true,
        selected: isSelected,
      });

      const choose = preventDefault(() => {
        this.chooseResult(index);
      });
      const remove = preventDefault(() => {
        this.removeResult(index);
      });

      const renderChoiceButtons = () => {
        // clang-format off
        return html`
          <div class="choice-buttons">
            <mwc-fab
              class="add-remove"
              mini
              icon="delete"
              @click=${remove}
              title="remove"
            ></mwc-fab>
            <mwc-fab
              class="choose"
              title="select"
              mini
              icon="add"
              @click=${choose}
            >
            </mwc-fab>
          </div>
        `;
        // clang-format on
      };

      // clang-format off
      return html`
        <div
          class=${choiceClasses}
          @click=${selectIndex(index)}
          @dblclick=${choose}
        >
          ${choice.text} ${isSelected ? renderChoiceButtons() : ''}
        </div>
      `;
      // clang-format on
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wordcraft-starred-choices': StarredChoicesComponent;
  }
}
