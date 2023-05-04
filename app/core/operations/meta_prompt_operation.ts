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
import {ModelResult, OperationType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';

/**
 * An operation to ask the model to suggest the next prompt.
 */
export abstract class MetaPromptOperation extends ChoiceOperation {
  override canRewriteChoice = false;
  override canStarChoice = false;

  override readonly isHelperOperation = true;
  abstract override onSelectChoice(choice: ModelResult): Promise<void>;

  getLoadingMessage() {
    return `Generating prompts...`;
  }

  static override id = OperationType.META_PROMPT;

  static override getDescription() {
    return 'Ask the AI for suggested prompts.';
  }

  static override getButtonLabel() {
    return 'get a suggested prompt';
  }

  async run() {
    const operationData = this.getOperationData();
    const params = this.dataProcessor.metaPrompt(operationData);
    const responses = await this.getModel().metaPrompt(params);
    this.setChoices(responses);
  }

  onPendingChoice() {
    // Noop, since we're not inserting prompt text anywhere in the doc
  }

  done() {
    this.resolve();
  }
}
