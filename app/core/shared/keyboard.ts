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
export type KeyHandler = () => void;
export class KeyCommand {
  constructor(
    public key: string,
    public metaKey = false,
    public shiftKey = false,
    public altKey = false
  ) {}

  toHash() {
    const {key, metaKey, shiftKey, altKey} = this;
    return `${key}:${metaKey ? 1 : 0}:${shiftKey ? 1 : 0}:${altKey ? 1 : 0}`;
  }

  static keyboardEventToHash(event: KeyboardEvent) {
    const {key, metaKey, shiftKey, altKey} = event;
    return `${key}:${metaKey ? 1 : 0}:${shiftKey ? 1 : 0}:${altKey ? 1 : 0}`;
  }

  static stringToHash(key: string) {
    return new KeyCommand(key).toHash();
  }
}

type OSType = 'windows' | 'mac' | 'linux';

function getOS(): OSType {
  if (navigator.appVersion.indexOf('Win') !== -1) {
    return 'windows';
  } else if (navigator.appVersion.indexOf('Linux') !== -1) {
    return 'linux';
  } else if (navigator.appVersion.indexOf('Mac') !== -1) {
    return 'mac';
  }
  return 'windows';
}

type MetaKey = 'cmd' | 'ctrl';

export function getMetaKeyString(): MetaKey {
  const os = getOS();
  if (os === 'mac') return 'cmd';
  return 'ctrl';
}
