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
import {reaction} from 'mobx';
import {
  TextareaControl,
  TextInputControl,
} from '../operations/operation_controls';
import {LocalStorageService} from './services';
import {EditorMetaText} from '../shared/types';
import {LocalStorageState} from './local_storage_service';

import {Service} from './service';

interface ServiceProvider {
  localStorageService: LocalStorageService;
}

/**
 * The MetaTextService class is responsible for managing the state of the
 * document meta text (title, outline)
 */
export class MetaTextService extends Service {
  titleControl = new TextInputControl({
    prefix: 'title',
    description: '',
    value: '',
    placeholder: 'e.g. The Necklace',
  });
  outlineControl = new TextareaControl({
    prefix: 'plot points',
    description: '',
    id: 'outline-textarea',
    value: '',
    placeholder: 'e.g.\n- woman borrows necklace \n- woman loses necklace',
  });

  constructor(private readonly serviceProvider: ServiceProvider) {
    super();

    reaction(
      () => {
        return {
          title: this.titleControl.value,
          outline: this.outlineControl.value,
        };
      },
      (values) => {
        this.localStorageService.setMetaText(values);
      }
    );
  }

  private get localStorageService() {
    return this.serviceProvider.localStorageService;
  }

  initializeFromLocalStorage(localStorageState: LocalStorageState) {
    if (localStorageState.meta != null) {
      // tslint:disable-next-line:no-any
      const meta = localStorageState.meta as any;
      this.titleControl.value = meta.title || '';
      this.outlineControl.value = meta.outline || '';
    }
  }

  getMetaText(): EditorMetaText {
    return {
      title: this.titleControl.value,
      outline: this.outlineControl.value,
    };
  }
}
