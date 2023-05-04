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
import {KeyCommand, KeyHandler} from '../shared/keyboard';

import {Service} from './service';

/**
 * Responsible for managing global keys that aren't in the context of the
 * active text editor, such as navigating choices with the arrow keys or cycling
 * through options. The KeyboardService is used by operations to load and clear
 * key handlers.
 */
export class KeyboardService extends Service {
  constructor() {
    super();
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });
  }

  // A map of key hashes to a stack of key handlers
  private readonly keyHandlers = new Map<string, KeyHandler[]>();

  private getKeyHandlers(key: string): KeyHandler[] {
    const exists = this.keyHandlers.has(key);
    if (!exists) {
      this.keyHandlers.set(key, []);
    }
    return this.keyHandlers.get(key) || [];
  }

  /**
   * Registers a new key handler, and adds it to a stack for the given key
   */
  registerKeyHandler(key: string | KeyCommand, handler: KeyHandler) {
    const hash =
      key instanceof KeyCommand ? key.toHash() : KeyCommand.stringToHash(key);

    const keyHandlers = this.getKeyHandlers(hash);
    keyHandlers.push(handler);

    return () => {
      const keyHandlers = this.getKeyHandlers(hash);
      const removed = keyHandlers.filter((h) => h !== handler);
      this.keyHandlers.set(hash, removed);
    };
  }

  unregisterAllKeyHandlers() {
    for (const key of this.keyHandlers.keys()) {
      this.keyHandlers.set(key, []);
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    const hash = KeyCommand.keyboardEventToHash(event);
    const handlers = this.getKeyHandlers(hash);

    // Apply the last handler in the stack
    const handler = handlers[handlers.length - 1];
    if (handler) {
      handler();
      event.stopPropagation();
      event.preventDefault();
      return true;
    }

    return false;
  }

  makeHelper(namespace: string) {
    return new KeyboardServiceHelper(namespace, this);
  }
}

/**
 * Common infrastructure for registering and unregistering a set of key handlers
 * with a shared namespace.
 */
export class KeyboardServiceHelper {
  constructor(
    readonly namespace: string,
    private readonly keyboardService: KeyboardService
  ) {}

  private unregisterCallbacks: Array<() => void> = [];

  registerKeyHandler(key: string | KeyCommand, handler: KeyHandler) {
    const unregister = this.keyboardService.registerKeyHandler(key, handler);
    this.unregisterCallbacks.push(unregister);
  }

  unregisterKeyHandlers() {
    for (const unregister of this.unregisterCallbacks) {
      unregister();
    }
    this.unregisterCallbacks = [];
  }
}
