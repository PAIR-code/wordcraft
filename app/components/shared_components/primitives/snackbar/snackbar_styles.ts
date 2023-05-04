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
import {css} from 'lit';

/**
 * Styles resulting from building the material-web-components snackbar.
 */
export const style = css`
  .mdc-snackbar {
    z-index: 8;
    margin: 8px;
    display: none;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    pointer-events: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .mdc-snackbar.is-warning > .mdc-snackbar__surface {
    background-color: #fdd;
    color: red;
  }

  .mdc-snackbar.is-warning * .mdc-snackbar__label {
    color: red;
  }

  .mdc-snackbar.is-warning * slot[name='dismiss']::slotted(mwc-icon-button) {
    color: red;
  }

  .mdc-snackbar__surface {
    background-color: #333333;
    min-width: 344px;
    max-width: 672px;
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border-radius: var(--mdc-shape-small, 4px);
    padding-left: 0;
    padding-right: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    transform: scale(0.8);
    opacity: 0;
  }

  .mdc-snackbar__label {
    color: rgba(255, 255, 255, 0.87);
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-family: Roboto, sans-serif;
    font-family: var(
      --mdc-typography-body2-font-family,
      var(--mdc-typography-font-family, Roboto, sans-serif)
    );
    font-size: 0.875rem;
    font-size: var(--mdc-typography-body2-font-size, 0.875rem);
    line-height: 1.25rem;
    line-height: var(--mdc-typography-body2-line-height, 1.25rem);
    font-weight: 400;
    font-weight: var(--mdc-typography-body2-font-weight, 400);
    letter-spacing: 0.0178571429em;
    letter-spacing: var(--mdc-typography-body2-letter-spacing, 0.0178571429em);
    text-decoration: inherit;
    text-decoration: var(--mdc-typography-body2-text-decoration, inherit);
    text-transform: inherit;
    text-transform: var(--mdc-typography-body2-text-transform, inherit);
    padding-left: 16px;
    padding-right: 8px;
    width: 100%;
    flex-grow: 1;
    box-sizing: border-box;
    margin: 0;
    visibility: hidden;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  @media (max-width: 480px), (max-width: 344px) {
    .mdc-snackbar__surface {
      min-width: 100%;
    }
  }

  .mdc-snackbar--opening,
  .mdc-snackbar--open,
  .mdc-snackbar--closing {
    display: flex;
  }
  .mdc-snackbar--open .mdc-snackbar__label,
  .mdc-snackbar--open .mdc-snackbar__actions {
    visibility: visible;
  }
  .mdc-snackbar--leading {
    justify-content: flex-start;
  }
  .mdc-snackbar--stacked .mdc-snackbar__label {
    padding-left: 16px;
    padding-right: 8px;
    padding-bottom: 12px;
  }
  [dir='rtl'] .mdc-snackbar--stacked .mdc-snackbar__label,
  .mdc-snackbar--stacked .mdc-snackbar__label[dir='rtl'] {
    padding-left: 8px;
    padding-right: 16px;
  }
  .mdc-snackbar--stacked .mdc-snackbar__surface {
    flex-direction: column;
    align-items: flex-start;
  }
  .mdc-snackbar--stacked .mdc-snackbar__actions {
    align-self: flex-end;
    margin-bottom: 8px;
  }

  .mdc-snackbar--open .mdc-snackbar__surface {
    transform: scale(1);
    opacity: 1;
    pointer-events: auto;
    transition: opacity 150ms 0ms cubic-bezier(0, 0, 0.2, 1),
      transform 150ms 0ms cubic-bezier(0, 0, 0.2, 1);
  }
  .mdc-snackbar--closing .mdc-snackbar__surface {
    transform: scale(1);
    transition: opacity 75ms 0ms cubic-bezier(0.4, 0, 1, 1);
  }

  .mdc-snackbar__label::before {
    display: inline;
    content: attr(data-mdc-snackbar-label-text);
  }
  .mdc-snackbar__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    box-sizing: border-box;
    visibility: hidden;
  }
  .mdc-snackbar__action:not(:disabled) {
    color: #bb86fc;
  }
  .mdc-snackbar__action::before,
  .mdc-snackbar__action::after {
    background-color: #bb86fc;
    background-color: var(--mdc-ripple-color, #bb86fc);
  }
  .mdc-snackbar__action:hover::before,
  .mdc-snackbar__action.mdc-ripple-surface--hover::before {
    opacity: 0.08;
    opacity: var(--mdc-ripple-hover-opacity, 0.08);
  }
  .mdc-snackbar__action.mdc-ripple-upgraded--background-focused::before,
  .mdc-snackbar__action:not(.mdc-ripple-upgraded):focus::before {
    transition-duration: 75ms;
    opacity: 0.24;
    opacity: var(--mdc-ripple-focus-opacity, 0.24);
  }
  .mdc-snackbar__action:not(.mdc-ripple-upgraded)::after {
    transition: opacity 150ms linear;
  }
  .mdc-snackbar__action:not(.mdc-ripple-upgraded):active::after {
    transition-duration: 75ms;
    opacity: 0.24;
    opacity: var(--mdc-ripple-press-opacity, 0.24);
  }
  .mdc-snackbar__action.mdc-ripple-upgraded {
    --mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.24);
  }
  .mdc-snackbar__dismiss {
    color: rgba(255, 255, 255, 0.87);
  }
  .mdc-snackbar__dismiss::before,
  .mdc-snackbar__dismiss::after {
    background-color: rgba(255, 255, 255, 0.87);
    background-color: var(--mdc-ripple-color, rgba(255, 255, 255, 0.87));
  }
  .mdc-snackbar__dismiss:hover::before,
  .mdc-snackbar__dismiss.mdc-ripple-surface--hover::before {
    opacity: 0.08;
    opacity: var(--mdc-ripple-hover-opacity, 0.08);
  }
  .mdc-snackbar__dismiss.mdc-ripple-upgraded--background-focused::before,
  .mdc-snackbar__dismiss:not(.mdc-ripple-upgraded):focus::before {
    transition-duration: 75ms;
    opacity: 0.24;
    opacity: var(--mdc-ripple-focus-opacity, 0.24);
  }
  .mdc-snackbar__dismiss:not(.mdc-ripple-upgraded)::after {
    transition: opacity 150ms linear;
  }
  .mdc-snackbar__dismiss:not(.mdc-ripple-upgraded):active::after {
    transition-duration: 75ms;
    opacity: 0.24;
    opacity: var(--mdc-ripple-press-opacity, 0.24);
  }
  .mdc-snackbar__dismiss.mdc-ripple-upgraded {
    --mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.24);
  }
  .mdc-snackbar__dismiss.mdc-snackbar__dismiss {
    width: 36px;
    height: 36px;
    padding: 9px;
    font-size: 18px;
  }
  .mdc-snackbar__dismiss.mdc-snackbar__dismiss svg,
  .mdc-snackbar__dismiss.mdc-snackbar__dismiss img {
    width: 18px;
    height: 18px;
  }
  .mdc-snackbar__action + .mdc-snackbar__dismiss {
    margin-left: 8px;
    margin-right: 0;
  }
  [dir='rtl'] .mdc-snackbar__action + .mdc-snackbar__dismiss,
  .mdc-snackbar__action + .mdc-snackbar__dismiss[dir='rtl'] {
    margin-left: 0;
    margin-right: 8px;
  }
  slot[name='action']::slotted(mwc-button) {
    --mdc-theme-primary: var(--mdc-snackbar-action-color, #bb86fc);
  }
  slot[name='dismiss']::slotted(mwc-icon-button) {
    --mdc-icon-size: 18px;
    --mdc-icon-button-size: 36px;
    color: rgba(255, 255, 255, 0.87);
    margin-left: 8px;
    margin-right: 0;
  }
`;
