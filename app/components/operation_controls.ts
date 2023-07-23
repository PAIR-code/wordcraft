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
import './controls/text_input_control';
import './controls/textarea_control';
import './controls/toggle_control';
import './controls/step_slider_control';

import {MobxLitElement} from '@adobe/lit-mobx';
import {css, html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {wordcraftCore} from '@core/wordcraft_core';
import {
  StepSliderControl,
  TextareaControl,
  TextInputControl,
  ToggleControl,
} from '@operations/operation_controls';
import {OperationsService} from '@services/operations_service';
import {OperationControl, OperationControls} from '@core/shared/interfaces';
import {OperationTrigger} from '@core/shared/types';

import {styles as sharedStyles} from './shared.css';

/**
 * A component that displays the controls for a given operation.
 */
@customElement('wc-operation-controls')
export class OperationControlsComponent extends MobxLitElement {
  static override get styles() {
    return [
      sharedStyles,
      css`
        .row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 3px 0;
        }
      `,
    ];
  }

  private readonly operationsService =
    wordcraftCore.getService(OperationsService);

  @property({type: Object}) controls!: OperationControls;
  @property({type: Object}) onEnter = () => {};
  @property({type: Boolean}) override autofocus = false;

  override render() {
    const {controls} = this;
    if (!controls) return;
    return html`${Object.values(controls).map(
      (control) => html` <div class="row">${this.renderControl(control)}</div> `
    )}`;
  }

  /** Render a single control. */
  private renderControl(control: OperationControl) {
    const onHover = (tooltip: string | TemplateResult) => {
      this.operationsService.setHoverTooltip(tooltip);
    };

    if (control instanceof TextInputControl) {
      // clang-format off
      return html`
        <wc-text-input-control
          .onClickHelper=${() => {
            if (control.hasHelperOperation()) {
              const helperOperationClass = control.helperOperation!;
              this.operationsService.startOperation(
                helperOperationClass,
                OperationTrigger.CONTROL
              );
            }
          }}
          .control=${control}
          .onEnter=${() => void this.onEnter()}
          .onHover=${onHover}
          ?autofocus=${this.autofocus}
        ></wc-text-input-control>
      `;
      // clang-format on
    } else if (control instanceof StepSliderControl) {
      return html`
        <wc-step-slider-control .control=${control} .onHover=${onHover}>
        </wc-step-slider-control>
      `;
    } else if (control instanceof ToggleControl) {
      return html`
        <wc-toggle-control
          .control=${control}
          .onHover=${onHover}
        ></wc-toggle-control>
      `;
    } else if (control instanceof TextareaControl) {
      return html`
        <wc-textarea-control
          .onClickHelper=${() => {
            if (control.hasHelperOperation()) {
              const helperOperationClass = control.helperOperation!;
              this.operationsService.startOperation(
                helperOperationClass,
                OperationTrigger.CONTROL
              );
            }
          }}
          .control=${control}
          .onEnter=${() => void this.onEnter()}
          .onHover=${onHover}
          ?autofocus=${this.autofocus}
        ></wc-textarea-control>
      `;
    }
    return '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-operation-controls': OperationControlsComponent;
  }
}
