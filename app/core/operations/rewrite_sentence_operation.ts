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
import {styleMap} from 'lit/directives/style-map.js';

import {SerializedRange} from '@lib/mobiledoc';
import {createModelResult} from '@models/utils';
import * as helpers from '../operation_data/helpers';
import {
  ModelResult,
  OperationSite,
  OperationTrigger,
  OperationType,
  TextType,
} from '../shared/types';

import {ChoiceOperation} from './choice_operation';
import {ServiceProvider} from './operation';
import {TextInputControl} from './operation_controls';
import {ControlsStep} from './steps';
import {SuggestRewriteOperation} from './suggest_rewrite_operation';

class SuggestRewriteSentenceOperation extends SuggestRewriteOperation {
  getTextType() {
    return TextType.SENTENCE;
  }

  getTextToRewrite() {
    const operationData = this.getOperationData();
    return helpers.getCurrentSentence(operationData);
  }

  async onSelectChoice(choice: ModelResult) {
    // When the user selects a prompt, we're going to trigger a new freeform
    // prompt operation using the selected prompt. We'll do this by running
    // a new operation on the resolution of this operation's promise.
    this.onFinish(() => {
      this.operationsService.startOperation(
        () =>
          new RewriteSentenceOperation(
            this.serviceProvider,
            OperationTrigger.OPERATION,
            choice.data.payload
          ),
        OperationTrigger.OPERATION
      );
    });
  }
}

/**
 * An operation to adjust a single sentence in the context of a broader story
 */
export class RewriteSentenceOperation extends ChoiceOperation {
  static override isAvailable(operationSite: OperationSite) {
    return operationSite === OperationSite.WITHIN_SENTENCE;
  }

  constructor(
    serviceProvider: ServiceProvider,
    trigger: OperationTrigger,
    howToRewrite: string = ''
  ) {
    super(serviceProvider, trigger);
    if (howToRewrite) {
      this.instantiatedWithHowToRewrite = true;
      this.instanceControls.howToRewrite.value = howToRewrite;
    }
  }

  static override id = OperationType.REWRITE_SENTENCE;

  private currentSentenceSerializedRange!: SerializedRange;
  private readonly instantiatedWithHowToRewrite: boolean = false;

  getLoadingMessage() {
    return `Rewriting sentence...`;
  }

  override getMessage() {
    const sentenceToRewrite = this.sentencesService.currentSentence;
    const spanStyle = styleMap({
      fontStyle: 'italic',
    });
    return html`
      Rewriting sentence:
      <span style=${spanStyle}>${sentenceToRewrite}</span>
    `;
  }

  static override getDescription() {
    return 'Adjust the current sentence in a particular way';
  }

  static override getButtonLabel() {
    return 'rewrite sentence';
  }

  getTextWithBlank() {
    const range = this.sentencesService.currentSentenceSerializedRange;
    const [sectionIndex, start] = range.head;
    const [, end] = range.tail;
    const paragraphs = this.textEditorService.getParagraphs();
    let text = '';
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (i === sectionIndex) {
        const pre = paragraph.substring(0, start);
        const post = paragraph.substring(end);
        const insertBlank = `${pre}${this.getModel().getBlank()}. ${post}`;
        text += insertBlank;
      } else {
        text += paragraph;
      }
    }
    return text;
  }

  /**
   * If this operation is constructed with a prompt rather than using the
   * static control prompt that persists across instances, use the prompt that
   * the instance is constructed with.
   */
  get howToRewrite(): string {
    return this.instantiatedWithHowToRewrite
      ? this.instanceControls.howToRewrite.value
      : RewriteSentenceOperation.controls.howToRewrite.value;
  }

  override async beforeStart() {
    // If the operation was instantiated with a prompt, then there's no need to
    // move into the text input step;
    if (this.instantiatedWithHowToRewrite) {
      return;
    }

    // Only if the operation was triggered by key command do we move into the
    // controls step to get the prompt from a user input.
    if (this.trigger !== OperationTrigger.KEY_COMMAND) return;

    const sentenceToRewrite = this.sentencesService.currentSentence;
    const controlsStep = new ControlsStep(
      this.serviceProvider,
      RewriteSentenceOperation.controls,
      'Rewrite the sentence',
      sentenceToRewrite
    );
    this.setCurrentStep(controlsStep);
    return controlsStep.getPromise();
  }

  async run() {
    const operationData = this.getOperationData();
    const sentenceToRewrite = helpers.getCurrentSentence(operationData);

    this.currentSentenceSerializedRange =
      this.sentencesService.currentSentenceSerializedRange;

    const sentenceRange = this.sentencesService.getCurrentSentenceRange();
    const insertPosition = this.textEditorService.deleteRange(sentenceRange);
    this.textEditorService.insertSelectionAtom(
      insertPosition,
      sentenceToRewrite
    );

    const controls = {howToRewrite: this.howToRewrite};
    const params = this.dataProcessor.rewriteSentence(operationData, controls);
    const results = await this.getModel().rewriteSentence(params);

    // Keep the original text as the first option.
    const originalChoice = createModelResult(sentenceToRewrite);
    this.setChoices(results, originalChoice);
  }

  onPendingChoice(choice: ModelResult) {
    const sentenceSerializedRange = this.currentSentenceSerializedRange;
    const sentenceRange = this.cursorService.makeMobiledocRangeFromSerialized(
      sentenceSerializedRange
    );
    const insertPosition = this.textEditorService.deleteRange(sentenceRange);
    this.textEditorService.insertChoiceAtom(choice.text, insertPosition);
  }

  async onSelectChoice(choice: ModelResult) {
    const sentenceSerializedRange = this.currentSentenceSerializedRange;
    const sentenceRange = this.cursorService.makeMobiledocRangeFromSerialized(
      sentenceSerializedRange
    );
    const insertPosition = this.textEditorService.deleteRange(sentenceRange);
    this.textEditorService.insertGeneratedText(choice.text, insertPosition);
  }

  done() {
    this.resolve();
  }

  override instanceControls = {
    howToRewrite: new TextInputControl({
      prefix: 'rewrite the sentence',
      description: 'Instructions for how to rewrite the sentence.',
      value: RewriteSentenceOperation.controls.howToRewrite.value,
    }),
  };

  static override controls = {
    howToRewrite: new TextInputControl({
      prefix: 'rewrite the sentence',
      description: 'Instructions for how to rewrite the sentence.',
      value: 'to be more descriptive',
      helperOperation: SuggestRewriteSentenceOperation,
    }),
  };
}
