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
import {CancelOperationError, CancelStepError} from '@lib/errors';
import {StepLifecycle} from '../../shared/types';

export abstract class Step {
  state = StepLifecycle.NOT_STARTED;

  get isFinished() {
    return this.state === StepLifecycle.FINISHED;
  }

  resolve = () => {};
  reject = (e: Error) => {};

  setup() {}
  cleanup() {}

  pause() {}
  unpause() {}

  private promise!: Promise<void>;
  getPromise() {
    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    return this.promise;
  }

  cancelPromise() {
    if (this.promise) {
      this.reject(new CancelStepError());
      this.onFinishCallback();
    }
  }

  start() {
    this.state = StepLifecycle.STARTED;
    this.setup();
    this.onStartCallback();
  }

  private onStartCallback = () => {};
  onStart(callback: () => void) {
    this.onStartCallback = callback;
  }

  cancel() {
    this.state = StepLifecycle.FINISHED;
    this.cleanup();
    this.onCancelCallback();
  }

  private onCancelCallback = () => {};
  onCancel(callback: () => void) {
    this.onCancelCallback = callback;
  }

  cancelOperation() {
    this.reject(new CancelOperationError());
  }

  restart() {
    this.onRestartCallback();
  }

  private onRestartCallback = () => {};
  onRestart(callback: () => void) {
    this.onRestartCallback = callback;
  }

  finish() {
    this.state = StepLifecycle.FINISHED;
    this.cleanup();
    this.resolve();
    this.onFinishCallback();
  }

  private onFinishCallback = () => {};
  onFinish(callback: () => void) {
    this.onFinishCallback = callback;
  }
}

export class NotStartedStep extends Step {}

export class FinishedStep extends Step {}
