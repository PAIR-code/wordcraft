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
import {computed, decorate, observable} from 'mobx';

import {CancelOperationError} from '@lib/errors';
import {Constructor} from '@lib/types';
import {uuid} from '@lib/uuid';
import {ChoiceOperation, RewriteChoiceOperation} from '../operations';
import {ServiceProvider as OperationServiceProvider} from '../operations/operation';
import {ChoiceStep} from '../operations/steps/choice_step';
import {CursorService, SentencesService, TextEditorService} from './services';
import {OperationClass} from '../shared/interfaces';
import {Operation} from '../operations/operation';
import {ConfigService} from './config_service';

import {ModelResult, OperationSite, OperationTrigger} from '../shared/types';

import {Service} from './service';

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export interface ServiceProvider {
  configService: ConfigService;
  cursorService: CursorService;
  sentencesService: SentencesService;
  textEditorService: TextEditorService;
}

type OperationFactory = () => Operation;

/**
 * The OperationsService class is responsible for managing the current operation
 * stack, and for managing the state of the TextEditor through the course of
 * those operations. In addition, this class manages:
 * - What operations are currently available
 * - What operations are currently running
 */
export class OperationsService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  isError = false;

  private get configService() {
    return this.serviceProvider.configService;
  }

  private get cursorService() {
    return this.serviceProvider.cursorService;
  }

  private get sentencesService() {
    return this.serviceProvider.sentencesService;
  }

  private get textEditorService() {
    return this.serviceProvider.textEditorService;
  }

  getOperationSite(): OperationSite {
    // We need to access all of the observable properties before the if/else
    // statements to ensure that they're observed properly by this computed
    // property.
    const {
      isCursorSelection,
      isCursorAtEndOfSection,
      isCursorAtStartOfSection,
      isCurrentSectionEmpty,
    } = this.cursorService;
    const {isCursorWithinSentence, isCursorBetweenSentences} =
      this.sentencesService;
    const isDocumentEmpty = this.textEditorService.isEmpty;

    if (isDocumentEmpty) {
      return OperationSite.EMPTY_DOCUMENT;
    } else if (isCursorSelection) {
      return OperationSite.SELECTION;
    } else if (isCurrentSectionEmpty) {
      return OperationSite.EMPTY_SECTION;
    } else if (isCursorAtStartOfSection) {
      return OperationSite.START_OF_SECTION;
    } else if (isCursorAtEndOfSection) {
      return OperationSite.END_OF_SECTION;
    } else if (isCursorWithinSentence) {
      return OperationSite.WITHIN_SENTENCE;
    } else if (isCursorBetweenSentences) {
      return OperationSite.BETWEEN_SENTENCES;
    } else {
      return OperationSite.NONE;
    }
  }

  readonly allOperations: OperationClass[] = [];

  get availableOperations(): OperationClass[] {
    const operationSite = this.getOperationSite();
    return this.allOperations.filter((operationClass) => {
      return operationClass.isAvailable(operationSite);
    });
  }

  operationStack: Operation[] = [];
  get currentOperation(): Operation | null {
    const index = this.operationStack.length - 1;
    return this.operationStack[index] ? this.operationStack[index] : null;
  }
  get isInOperation() {
    return !!this.currentOperation;
  }
  get isChoosing() {
    return (
      this.isInOperation &&
      this.currentOperation instanceof ChoiceOperation &&
      this.currentOperation.currentStep instanceof ChoiceStep &&
      this.currentOperation.currentStep.choices.getNEntries() > 0
    );
  }

  private readonly onRunCallbacks = new Set<(op: Operation) => void>();
  onRun(callback: (op: Operation) => void) {
    this.onRunCallbacks.add(callback);
  }

  removeOperation(operation: Operation) {
    this.operationStack = this.operationStack.filter((o) => o !== operation);
  }

  hoverTooltip: string | TemplateResult = '';
  setHoverTooltip(tooltip: string | TemplateResult) {
    this.hoverTooltip = tooltip;
  }
  clearHoverTooltip() {
    this.hoverTooltip = '';
  }

  /**
   * If the operation stack is empty, then we need to reenable the text editor
   * and set the undo snapshot if the text has changed.
   */
  finalizeOperation() {
    if (!this.isInOperation) {
      this.textEditorService.enableEditor();
      this.textEditorService.setLastSnapshot();
      this.textEditorService.nextChangeTriggersUndoSnapshot = true;
    }
  }

  registerOperation(operationClass: OperationClass) {
    this.allOperations.push(operationClass);
  }

  registerOperations(...operationClasses: OperationClass[]) {
    this.allOperations.push(...operationClasses);
  }

  triggerOperation(operationClass: OperationClass, trigger: OperationTrigger) {
    if (operationClass != null) {
      const factoryFn = this.makeOperationFactory(operationClass, trigger);
      this.startOperation(factoryFn, trigger);
    }
  }

  private makeOperationFactory(
    operationClass: OperationClass,
    trigger: OperationTrigger
  ): OperationFactory {
    return () => new operationClass(this.serviceProvider, trigger);
  }

  buildOperation<T extends Operation>(
    operationClass: Constructor<T>,
    trigger: OperationTrigger
  ): T {
    return new operationClass(this.serviceProvider, trigger);
  }

  cancelCurrentOperation() {
    if (this.currentOperation) {
      this.currentOperation.cancel();
    }
  }

  async startOperationWithParams(
    // tslint:disable-next-line:no-any
    operationClass: OperationClass,
    params: any,
    trigger = OperationTrigger.APP
  ) {
    const factory: OperationFactory = () => {
      return new operationClass(this.serviceProvider, trigger, params);
    };
    return this.startOperation(factory);
  }

  async startOperation(
    factoryOrClass: OperationClass | OperationFactory,
    trigger = OperationTrigger.APP
  ) {
    const factory: OperationFactory = isOperationClass(factoryOrClass)
      ? this.makeOperationFactory(factoryOrClass as OperationClass, trigger)
      : (factoryOrClass as OperationFactory);

    // Ensure that we get initial state before the text editor is disabled,
    // because we need to make sure the cursor position is captured.
    const initialState = this.textEditorService.getStateSnapshot();

    // Ensure the text editor undo/redo snapshot is taken before the operation
    // is run.
    if (!this.isInOperation) {
      this.textEditorService.disableEditor();
      this.textEditorService.maybeMakePseudoSelection();

      // If we're starting this operation from another operation, then don't set
      // the undo stack.
      if (trigger !== OperationTrigger.OPERATION) {
        this.textEditorService.setUndo();
      }
    }

    const operation = factory();

    const cursorOffset = this.cursorService.getOffsetRange();
    const operationData = {
      id: uuid(),
      documentId: this.textEditorService.documentId,
      timestamp: Date.now(),
      text: this.textEditorService.getPlainText(),
      cursorStart: cursorOffset.start,
      cursorEnd: cursorOffset.end,
    };

    operation.setOperationData(operationData);

    operation.onFinish((wasSuccess: boolean) => {
      this.removeOperation(operation);
      if (operation.isHelperOperation) {
        if (!wasSuccess) {
          this.finalizeOperation();
        }
      } else {
        this.finalizeOperation();
      }
    });
    operation.onRun(() => {
      for (const callback of this.onRunCallbacks) {
        callback(operation);
      }
    });

    this.operationStack.push(operation);
    const currentOperation = this.currentOperation!;

    // tslint:disable-next-line:no-any
    let result: any;
    try {
      currentOperation.setInitialState(initialState);
      const operationPromise = currentOperation.start();
      result = await operationPromise;
      // tslint:disable-next-line:no-any
    } catch (err: any) {
      // Reset all pending state in the TextEditor
      currentOperation.resetTextEditor();
      currentOperation.finish();

      if (err instanceof CancelOperationError) {
        return;
      }

      this.isError = true;
      throw err;
    }

    this.textEditorService.triggerUpdateCallbacks();
    return result;
  }

  async rewriteCurrentChoice() {
    const parentOperation = this.currentOperation;
    if (parentOperation instanceof ChoiceOperation) {
      const parentChoiceStep = parentOperation.currentStep as ChoiceStep;
      parentChoiceStep.pause();
      const choiceToRewrite = parentChoiceStep.choices.getCurrentEntry();
      if (choiceToRewrite == null) return;

      const indexToRewrite = parentChoiceStep.choices.getIndex();
      return this.startOperation(() => {
        // We need to cast this.serviceProvider as the correct interface for
        // the operation.
        const serviceProvider = this
          .serviceProvider as unknown as OperationServiceProvider;
        const rewriteChoiceOperation = new RewriteChoiceOperation(
          serviceProvider,
          OperationTrigger.OPERATION
        );
        rewriteChoiceOperation.initialize(choiceToRewrite.text);
        rewriteChoiceOperation.onPendingChoice = (choice: ModelResult) => {
          parentChoiceStep.choices.updateEntry(indexToRewrite, choice);
        };

        rewriteChoiceOperation.onSelectChoice = async () => {
          /**
           * We need to implement the logic of the choice step's callback, but
           * ensure that we finish the adjustment operation before we finish the
           * underlying choice operation.
           */
          parentChoiceStep.chooseIndex(indexToRewrite);
          await rewriteChoiceOperation.finish();
          return parentOperation.finish();
        };

        rewriteChoiceOperation.onCancel = async () => {
          parentChoiceStep.choices.updateEntry(indexToRewrite, choiceToRewrite);
          parentChoiceStep.unpause();
        };
        return rewriteChoiceOperation;
      }, OperationTrigger.OPERATION);
    }
  }
}

/**
 * We need to check the prototype chain to see if the class is a subclass of
 * Operation
 */
function isOperationClass(obj: OperationClass | OperationFactory) {
  while ((obj = Object.getPrototypeOf(obj))) {
    if (obj.name === 'Operation') {
      return true;
    }
  }
  return false;
}

decorate(OperationsService, {
  allOperations: observable,
  availableOperations: computed,
  operationStack: observable,
  currentOperation: computed,
  isChoosing: computed,
  isError: observable,
  isInOperation: computed,
  hoverTooltip: observable,
});
