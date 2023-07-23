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
import {reaction} from 'mobx';

import {Choices} from '@lib/choices';
import {OperationsService} from '../../services/operations_service';
import {ModelResult} from '../../shared/types';

import {Step} from './step';

export type ChoiceCallback = (choice: ModelResult, index: number) => void;
export type RemoveChoiceCallback = (
  choice: ModelResult,
  index: number,
  isEmpty: boolean
) => void;

interface ServiceProvider {
  operationsService: OperationsService;
}

export class ChoiceStep extends Step {
  constructor(
    private readonly serviceProvider: ServiceProvider,
    choices: ModelResult[],
    public canRewriteChoice = false,
    public firstChoiceIsOrigional = false
  ) {
    super();
    this.choices.setEntries(choices);
  }

  choices = new Choices<ModelResult>();

  get operationsService() {
    return this.serviceProvider.operationsService;
  }

  override setup() {
    this.observeChoices();
  }

  override cleanup() {
    this.clearChoiceObserver();
  }

  override pause() {}

  override unpause() {}

  private clearChoiceObserver = () => {};
  observeChoices() {
    // Tie the observable state to the text editor
    const indexReactionDisposer = reaction(
      () => {
        const index = this.choices.getIndex();
        const nChoices = this.choices.getNEntries();
        return {index, nChoices};
      },
      ({index, nChoices}) => {
        if (nChoices) {
          this.setPendingChoiceIndex(index);
        }
      }
    );

    this.clearChoiceObserver = () => {
      indexReactionDisposer();
      this.clearChoiceObserver = () => {};
    };
  }

  private chooseCallback: ChoiceCallback = () => {};
  onSelectChoice(callback: ChoiceCallback) {
    this.chooseCallback = callback;
  }

  private pendingChoiceCallback: ChoiceCallback = () => {};
  onPendingChoice(callback: ChoiceCallback) {
    this.pendingChoiceCallback = callback;
    if (this.choices.getNEntries()) {
      this.setPendingChoiceIndex(this.choices.getIndex());
    }
  }

  private removeChoiceCallback: RemoveChoiceCallback = () => {};
  onRemoveChoice(callback: RemoveChoiceCallback) {
    this.removeChoiceCallback = callback;
  }

  chooseCurrentIndex() {
    this.chooseIndex(this.choices.getIndex());
  }

  chooseIndex(index: number) {
    const choice = this.choices.getEntry(index);
    if (choice != null) {
      this.chooseCallback(choice, index);
    }
  }

  removeChoiceIndex(index: number) {
    const choice = this.choices.getEntry(index);
    this.choices.removeAtIndex(index);
    const isEmpty = this.choices.getNEntries() === 0;
    if (choice != null) {
      this.removeChoiceCallback(choice, index, isEmpty);
    }
  }

  setPendingChoiceIndex(index: number) {
    const choice = this.choices.getEntry(index);
    if (choice != null) {
      this.pendingChoiceCallback(choice, index);
    }
  }
}
