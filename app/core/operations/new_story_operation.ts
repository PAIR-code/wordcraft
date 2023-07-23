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
import {html} from 'lit';
import * as Mobiledoc from 'mobiledoc-kit';

import {getRandomGenre, getRandomTopic} from '@lib/topics';
import {ChoiceOperation} from './choice_operation';
import {TextareaControl} from './operation_controls';
import {ModelResult, OperationSite, OperationType} from '../shared/types';

/**
 * An Operation to start a new story from a prompt or for a given topic from a
 * blank editor.
 */
export class NewStoryOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.EMPTY_DOCUMENT;
  }

  getLoadingMessage() {
    return html`
      <p>Starting a new story...</p>
      <p><i>${this.topic}</i></p>
    `;
  }

  static override id = OperationType.NEW_STORY;

  static override getButtonLabel() {
    return 'start new story';
  }

  static override getDescription() {
    return 'Start a new story from a prompt.';
  }

  private get topic(): string {
    return NewStoryOperation.controls.topic.value;
  }

  private getOperatingPosition(): Mobiledoc.Position {
    const range = this.textEditorService.getRange();
    return range.head;
  }

  async run() {
    const params = {topic: this.topic};
    const choices = await this.getModel().newStory(params);

    this.setChoices(choices);
  }

  onPendingChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertChoiceAtom(choice.text, operatingPosition);
  }

  onSelectChoice(choice: ModelResult) {
    const operatingPosition = this.getOperatingPosition();
    this.textEditorService.insertGeneratedText(choice.text, operatingPosition);
  }

  static override controls = {
    topic: new TextareaControl({
      prefix: 'prompt',
      description: 'A prompt to start a new story.',
      value: getRandomInitialTopic(),
    }),
  };
}

/**
 * Returns a random initial new story topic from the list of genres and topics.
 */
function getRandomInitialTopic() {
  const topic = getRandomTopic();
  const genre = getRandomGenre();
  const noStoryGenres = ['fairy tale', 'mystery'];
  const genreString = genre in noStoryGenres ? genre : genre + ' story';
  return `A ${genreString} about ${topic}.`;
}
