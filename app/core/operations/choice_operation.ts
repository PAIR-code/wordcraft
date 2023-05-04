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
import {ModelResult} from '../shared/types';

import {Operation} from './operation';
import {ChoiceStep} from './steps/choice_step';

/**
 * A multiple choice operation
 */
export abstract class ChoiceOperation extends Operation {
  abstract onSelectChoice(choice: ModelResult, index: number): void;
  abstract onPendingChoice(choice: ModelResult, index: number): void;

  canRewriteChoice = true;
  canStarChoice = true;

  get shouldReset() {
    return !this.isHelperOperation && !this.isStandaloneOperation;
  }

  isChoosing() {
    return this.currentStep instanceof ChoiceStep;
  }

  setChoices(choices: ModelResult[], originalChoice?: ModelResult) {
    if (this.shouldReset) {
      this.resetTextEditor();
    }

    let firstChoiceIsOrigional = false;
    if (originalChoice) {
      choices.unshift(originalChoice);
      firstChoiceIsOrigional = true;
    }

    const choiceStep = new ChoiceStep(
      this.serviceProvider,
      choices,
      this.canRewriteChoice,
      firstChoiceIsOrigional
    );
    this.setCurrentStep(choiceStep);

    choiceStep.onPendingChoice((choice, index) => {
      if (this.shouldReset) {
        this.resetTextEditor();
      }
      this.onPendingChoice(choice, index);
    });

    choiceStep.onSelectChoice((choice, index) => {
      if (this.shouldReset) {
        this.resetTextEditor();
      }
      this.onSelectChoice(choice, index);
      this.finish(true /** success */, choice);
    });

    choiceStep.onRemoveChoice((choice, index) => {
      this.onRemoveChoice(choice, index);
    });

    choiceStep.onRestart(() => {
      this.restart();
    });

    choiceStep.onCancel(() => {
      this.cancel();
    });
  }

  setChoice(choice: ModelResult) {
    if (this.shouldReset) {
      this.resetTextEditor();
    }
    this.onSelectChoice(choice, 0);
    this.finish(true /** success */, choice);
  }

  getPendingChoice() {
    if (this.currentStep instanceof ChoiceStep) {
      return this.currentStep.choices.getCurrentEntry();
    }
    return null;
  }

  onRemoveChoice(choice: ModelResult, index: number) {
    // pass
  }
}
