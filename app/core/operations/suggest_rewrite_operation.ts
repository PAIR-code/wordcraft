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
import {ModelResult, OperationType, TextType} from '../shared/types';

import {ChoiceOperation} from './choice_operation';

/**
 * An operation to ask the model to suggest how to rewrite a piece of text (a
 * sentence for now)
 */
export abstract class SuggestRewriteOperation extends ChoiceOperation {
  override canRewriteChoice = false;
  override canStarChoice = false;

  override readonly isHelperOperation = true;

  abstract getTextType(): TextType;
  abstract getTextToRewrite(): string;
  abstract override onSelectChoice(choice: ModelResult): Promise<void>;

  getLoadingMessage() {
    return `Getting suggestions...`;
  }

  static override id = OperationType.SUGGEST_REWRITE;

  static override getDescription() {
    return 'Ask the AI for suggestions of how to rewrite the text.';
  }

  static override getButtonLabel() {
    return 'get a suggested way to rewrite';
  }

  async run() {
    const {text} = this.getOperationData();
    const toRewrite = this.getTextToRewrite();
    const textType = this.getTextType();
    const params = {text, toRewrite, textType};
    const responses = await this.getModel().suggestRewrite(params);
    this.setChoices(responses);
  }

  onPendingChoice() {
    // Noop, since we're not inserting prompt text anywhere in the doc
  }

  done() {
    this.resolve();
  }
}
