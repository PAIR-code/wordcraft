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
import {computed, decorate, observable} from 'mobx';

import {ConfigService, ModelService, TextEditorService} from './services';

import {Service} from './service';
import {DialogMessage, DialogParams} from '../shared/interfaces';

interface ServiceProvider {
  configService: ConfigService;
  modelService: ModelService;
  textEditorService: TextEditorService;
}

/**
 * The ChatService class is responsible for managing a running chat with a
 * dialog agent, in order to help facilitate the writing process.
 */
export class ChatService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private get configService() {
    return this.serviceProvider.configService;
  }

  private get modelService() {
    return this.serviceProvider.modelService;
  }

  private get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  shouldIncludeStory = true;
  currentMessage = '';
  isLoading = false;

  messages: string[] = [];

  /** The user messages + the preamble */
  get messagesToDisplay() {
    return [this.getPreamble(), ...this.messages];
  }

  private getPreamble() {
    return "Hello, I'm Wordcraft, your story writing assistant. What would you like me to help with?";
  }

  private getUserStoryAndResponse() {
    const story = this.textEditorService.getPlainText();
    return [
      `Here's my story so far: {${story}}`,
      "That's a great story! what would you like me to help with?",
    ];
  }

  private getMessagesForQuery() {
    if (this.shouldIncludeStory) {
      return [
        this.getPreamble(),
        ...this.getUserStoryAndResponse(),
        ...this.messages,
      ];
    }
    return this.messagesToDisplay;
  }

  private getDialogParams(): DialogParams {
    const messages = this.getMessagesForQuery().map((content, i) => {
      return {content, author: i % 2 === 0 ? 'model' : 'user'};
    }) as DialogMessage[];
    return {messages};
  }

  async sendMessage() {
    if (this.currentMessage.length === 0) {
      return;
    }

    this.messages.push(this.currentMessage);
    this.isLoading = true;

    const model = this.modelService.getDialogModel();
    const responses = await model.query(this.getDialogParams());

    try {
      const response = responses[0];
      const message = response.text;

      this.messages.push(message);

      this.currentMessage = '';
      this.isLoading = false;
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }

  private readonly didResetMessagesHandlers: Function[] = [];
  didResetMessages(fn: Function) {
    this.didResetMessagesHandlers.push(fn);
  }
  reset() {
    for (const fn of this.didResetMessagesHandlers) {
      fn();
    }
    this.messages = [];
  }

  undoLastTurn() {
    if (this.messages.length === 0) return;
    this.currentMessage = this.messages[this.messages.length - 2];
    this.messages = this.messages.slice(0, this.messages.length - 2);
  }
}

decorate(ChatService, {
  currentMessage: observable,
  isLoading: observable,
  messages: observable,
  messagesToDisplay: computed,
  shouldIncludeStory: observable,
});
