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

import {action, computed, decorate, observable, toJS} from 'mobx';

/** A simple type for the callback supplied to the UndoManager */
export type ApplyStateCallback<T> = (stateSnapshot: T) => void;

/**
 * Responsible for managing undo/redo state of the text editor, since we don't
 * want to delegate this responsibility to the MobilDoc editor because of all
 * of the temporary operations (such as adding/removing Loading atoms)
 */
export class UndoManager<T extends {}> {
  private isUndoLocked = false;
  isUndoing = false;
  isRedoing = false;
  get isUndoingOrRedoing() {
    return this.isUndoing || this.isRedoing;
  }

  undoSteps: T[] = [];
  redoSteps: T[] = [];

  get canUndo() {
    return this.undoSteps.length > 0;
  }

  get canRedo() {
    return this.redoSteps.length > 0;
  }

  private readonly callbacks = new Set<ApplyStateCallback<T>>();

  private applyStateSnapshot(stateSnapshot: T) {
    for (const callback of this.callbacks) {
      callback(toJS(stateSnapshot));
    }
  }

  onApplyState(callback: ApplyStateCallback<T>) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  getStateSnapshot(): T {
    throw new Error('getStateSnapshot not implemented');
  }

  setUndoStateSnapshot(stateSnapshot: T) {
    if (!this.isUndoLocked) {
      this.undoSteps.push(deepCopy(stateSnapshot));
      this.redoSteps = [];
    }
  }

  undo() {
    if (this.canUndo) {
      this.isUndoing = true;
      this.redoSteps.push(deepCopy(this.getStateSnapshot()));
      const lastStep = this.undoSteps.pop()!;
      this.applyStateSnapshot(lastStep);
      this.isUndoing = false;
    }
  }

  redo() {
    if (this.canRedo) {
      this.isRedoing = true;
      this.undoSteps.push(deepCopy(this.getStateSnapshot()));
      const lastStep = this.redoSteps.pop()!;
      this.applyStateSnapshot(lastStep);
      this.isRedoing = false;
    }
  }

  async preventUndoAsync(action: () => Promise<void>) {
    this.isUndoLocked = true;
    await action();
    this.isUndoLocked = false;
  }

  preventUndo(action: () => void) {
    this.isUndoLocked = true;
    action();
    this.isUndoLocked = false;
  }
}

/**
 * Naiive way of deep copying an object for serialization, so we don't get
 * weird mutability errors when pushing to the undo / redo stack.
 */
function deepCopy<T extends {}>(object: T): T {
  const str = JSON.stringify(object);
  return JSON.parse(str) as T;
}

decorate(UndoManager, {
  undoSteps: observable.shallow,
  redoSteps: observable.shallow,
  canUndo: computed,
  canRedo: computed,
  undo: action,
  redo: action,
});
