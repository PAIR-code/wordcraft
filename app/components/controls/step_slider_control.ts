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
import {html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {StepSliderControl} from '@operations/operation_controls';
import {styles as sharedStyles} from '../shared.css';

import {styles} from './controls.css';

/**
 * A component that displays a step slider input control for an operation
 */
@customElement('wc-step-slider-control')
export class StepSliderControlComponent extends MobxLitElement {
  @property({type: Object}) control!: StepSliderControl<number>;
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
      <div class="row">
        <div class="operation-control-prefix"
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        >${control.getPrefix()} :</div>
        <input
          type='range'
          class="input-control"
          min="0"
          max="${control.steps.length - 1}"
          value=${control.value}
          @input=${
            // tslint:disable-next-line no-any
            (e: any) => (control.value = e.target.value)
          }
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        </input>
        <div class="operation-control-suffix"
          @mouseenter=${() => void this.onHover(hoverTooltip)}
          @mouseleave=${() => void this.onHover('')}
        >${control.getSuffix()}</div>
      </div>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-step-slider-control': StepSliderControlComponent;
  }
}
