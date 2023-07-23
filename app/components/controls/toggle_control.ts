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
import '@material/mwc-checkbox';

import {MobxLitElement} from '@adobe/lit-mobx';
import {html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {ToggleControl} from '@operations/operation_controls';
import {styles as sharedStyles} from '../shared.css';

import {styles} from './controls.css';

/**
 * A component that displays a step slider input control for an operation
 */
@customElement('wc-toggle-control')
export class ToggleControlComponent extends MobxLitElement {
  @property({type: Object}) control!: ToggleControl;
  @property({type: Object}) onHover = (
    isHovered: string | TemplateResult
  ) => {};

  static override get styles() {
    return [sharedStyles, styles];
  }

  override render() {
    const {control} = this;
    const hoverTooltip = control.getDescription();

    // clang-format off
    return html`
      <div class="row" style=${styleMap({height: '38px'})}>
        <div
          class="operation-control-prefix"
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        >
          ${control.getPrefix()} :
        </div>
        <mwc-checkbox
          ?checked=${control.value === true}
          reducedTouchTarget
          @change=${
            // tslint:disable-next-line:no-any
            (e: any) => {
              control.value = e.currentTarget.checked;
            }
          }
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        ></mwc-checkbox>
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-toggle-control': ToggleControlComponent;
  }
}
