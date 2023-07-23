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
import {TemplateResult} from 'lit';
import {observable} from 'mobx';

import {CancelOperationError, CancelStepError} from '@lib/errors';
import {StateSnapshot} from '@lib/mobiledoc';
import {OperationDataProcessor} from '../operation_data/processor';
import {OperationData} from '../shared/data';
import {
  AppService,
  CursorService,
  KeyboardService,
  MetaTextService,
  SentencesService,
  TextEditorService,
} from '../services/services';
import {Model} from '@models/model';
import {OperationControls} from '../shared/interfaces';
import {OperationsService} from '../services/operations_service';
import {OperationSite, OperationTrigger, OperationType} from '../shared/types';
import {ModelService} from '../services/model_service';

import {ToggleControl} from './operation_controls';
import {FinishedStep, LoadingStep, NotStartedStep, Step} from './steps';

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export interface ServiceProvider {
  appService: AppService;
  cursorService: CursorService;
  keyboardService: KeyboardService;
  metaTextService: MetaTextService;
  operationsService: OperationsService;
  sentencesService: SentencesService;
  textEditorService: TextEditorService;
  modelService: ModelService;
}

/**
 * For now, we'll maintain a single global data processor instance that's
 * responsible for parsing the OperationData. This will eventually be brought
 * into a service that uses a dataProcessor that's part of the wordcraft context
 * so we can define different data->prompt pipelines for different domains and
 * track the actual data that's used to create prompts.
 */
const DATA_PROCESSOR = new OperationDataProcessor();

/**
 * An Operation encapsulates all of the logic necessary to handle a pending
 * controllable text generation operation (insertion/continuation/elaboration
 * etc.) In order to create a new operation, create a subclass of the base
 * Operation class.
 *
 * Operations manage all parts of the lifeycle of the actual text operation in
 * the aynchronous `run` method. This includes:
 *
 * - Getting the text to operate on from the TextEditorService
 * - Creating a payload to send to the API Service, and making a request
 * - Adding the returned text into a `choices` object
 * - Managing the OperationStatus (Load /run state)
 * - Updating the text editor view via the TextEditorService (showing Loading
 *   atoms, inserting inline text choices, etc).
 * - Turning on/off key handlers for the operation
 */
export abstract class Operation {
  constructor(
    protected serviceProvider: ServiceProvider,
    public trigger: OperationTrigger
  ) {}

  protected get appService() {
    return this.serviceProvider.appService;
  }

  protected get cursorService() {
    return this.serviceProvider.cursorService;
  }

  protected get keyboardService() {
    return this.serviceProvider.keyboardService;
  }

  protected get metaTextService() {
    return this.serviceProvider.metaTextService;
  }

  protected get operationsService() {
    return this.serviceProvider.operationsService;
  }

  protected get modelService() {
    return this.serviceProvider.modelService;
  }

  protected get sentencesService() {
    return this.serviceProvider.sentencesService;
  }

  protected get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  get lookahead() {
    return Operation.globalControls.lookahead.value;
  }

  private operationData!: OperationData;

  setOperationData(operationData: OperationData) {
    this.operationData = operationData;
  }

  getOperationData() {
    if (!this.operationData) {
      throw new Error('OperationData not initialized');
    }
    return this.operationData;
  }

  get dataProcessor() {
    return DATA_PROCESSOR;
  }

  /**
   * Helper operations are tied to another operation, and don't modify the text
   * editor.
   */
  isHelperOperation = false;

  /**
   * Standalone operations are run outside of the context of the text editor.
   */
  isStandaloneOperation = false;

  protected initialState!: StateSnapshot;

  abstract run(): Promise<void>;
  async onCancel() {}
  protected async onRestart() {}
  protected async beforeStart() {}

  protected abstract getLoadingMessage(): TemplateResult | string;
  getMessage(): TemplateResult | string {
    return '';
  }

  // tslint:disable-next-line:no-any
  protected resolve = (result?: any) => {};
  protected reject = (err: unknown) => {};

  getModel(): Model {
    return this.modelService.getModel();
  }

  instanceControls: OperationControls = {};
  hasInstanceControls() {
    return Object.keys(this.instanceControls).length > 0;
  }

  // We're using a decorator here because the mobx decorate function can't
  // handle decorating abstract classes...
  @observable.ref currentStep: Step = new NotStartedStep();
  setCurrentStep(step: Step) {
    if (this.currentStep) {
      this.currentStep.finish();
    }
    this.currentStep = step;
    step.start();
  }

  isLoading() {
    return this.currentStep instanceof LoadingStep;
  }

  resetTextEditor() {
    this.textEditorService.setStateFromSnapshot(this.initialState);
  }

  setInitialState(initialState: StateSnapshot) {
    this.initialState = initialState;
  }

  isStarted() {
    return !(this.currentStep instanceof NotStartedStep);
  }

  setIsLoading() {
    const message = this.getLoadingMessage();
    this.setCurrentStep(new LoadingStep(message));
  }

  setIsFinished() {
    this.setCurrentStep(new FinishedStep());
  }

  // tslint:disable-next-line:no-any
  async start(): Promise<any> {
    // Because we await the promise returned by createPromise in the underlying
    // OperationsService code that manages the operation, we need to run the
    // actual code in the _start method as a side effect. This is so we can
    // properly handle errors by calling .reject and triggering rejection of
    // that promise managed in OperationsService.
    this._start();
    return this.createPromise();
  }

  // tslint:disable-next-line:enforce-name-casing
  private async _start(): Promise<void> {
    try {
      if (this.isStarted()) return;

      await this.beforeStart();

      this.setIsLoading();
      await this.run();
      for (const callback of this.onRunCallbacks) {
        callback();
      }
    } catch (err: unknown) {
      this.handleError(err);
    }
  }

  async restart(shouldResetTextEditor = true): Promise<void> {
    try {
      await this.onRestart();
      if (shouldResetTextEditor) {
        this.resetTextEditor();
      }
      this.setIsLoading();
      await this.run();
    } catch (err: unknown) {
      this.handleError(err);
    }
  }

  async cancel(shouldResetTextEditor = true): Promise<void> {
    this.currentStep.cancelPromise();
    await this.onCancel();
    if (shouldResetTextEditor) {
      this.resetTextEditor();
    }
    return this.finish(false);
  }

  private handleError(err: unknown) {
    // A CancelOperationError is a way of cancelling the entire operation from
    // within a step that's currently being awaited
    if (err instanceof CancelOperationError) {
      this.cancel();
      return;
    }
    // A CancelStepError is a way of escaping the current step only
    if (err instanceof CancelStepError) {
      return;
    }
    this.reject(err);
  }

  // tslint:disable-next-line:no-any
  async finish(wasSuccess = true, result?: any) {
    for (const callback of this.onFinishCallbacks) {
      callback(wasSuccess);
    }

    if (!this.currentStep.isFinished) {
      this.currentStep.finish();
    }
    this.resolve(result);
  }

  private readonly onFinishCallbacks = new Set<(wasSuccess: boolean) => void>();
  onFinish(callback: (wasSuccess: boolean) => void) {
    this.onFinishCallbacks.add(callback);
  }

  private readonly onRunCallbacks = new Set<() => void>();
  onRun(callback: () => void) {
    this.onRunCallbacks.add(callback);
  }

  protected createPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve as () => void;
      this.reject = reject as () => void;
    });
  }

  static id: OperationType = OperationType.NONE;
  static controls: OperationControls = {};
  static globalControls = {
    lookahead: new ToggleControl({
      prefix: 'lookahead',
      description: 'Whether Wordcraft will account for text after the cursor.',
      value: true,
    }),
  };

  // tslint:disable-next-line:no-any
  static getDescription(...params: any[]): string | TemplateResult {
    return '';
  }
  // tslint:disable-next-line:no-any
  static getButtonLabel(...params: any[]): string | TemplateResult {
    return '';
  }
  static isAvailable(operationSite: OperationSite) {
    return true;
  }
}
