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
import {decorate, observable} from 'mobx';

import {
  ControlPrefix,
  OperationClass,
  OperationControl as OperationControlInterface,
} from '../shared/interfaces';

class OperationControl implements OperationControlInterface {
  value!: number | string | boolean;
  private readonly description: string | TemplateResult;

  constructor(private readonly prefix: ControlPrefix, description = '') {
    this.description = description;
  }

  getPrefix(): string | TemplateResult {
    return this.prefix instanceof Function ? this.prefix(this) : this.prefix;
  }

  getDescription(): string | TemplateResult {
    return this.description;
  }
}

export interface ControlParams {
  prefix: ControlPrefix;
  description: string;
}

export interface ToggleControlParams extends ControlParams {
  value: boolean;
}

export class ToggleControl extends OperationControl {
  constructor(params: ToggleControlParams) {
    const {prefix, description, value} = params;
    super(prefix, description);
    this.value = value;
  }

  override value: boolean;
}

decorate(ToggleControl, {
  value: observable,
});

export interface StepSliderControlParams<T> extends ControlParams {
  value: number;
  suffix?: ControlPrefix;
  steps: T[];
}

export class StepSliderControl<T> extends OperationControl {
  constructor(params: StepSliderControlParams<T>) {
    const {prefix, suffix, description, value, steps} = params;
    super(prefix, description);
    this.value = value;
    this.steps = steps;
    this.suffix = suffix;
  }

  override value: number;
  steps: T[];
  suffix?: ControlPrefix;

  getStepValue() {
    return this.steps[this.value];
  }

  getSuffix(): string | TemplateResult {
    if (this.suffix instanceof Function) {
      return this.suffix(this);
    }
    return this.suffix ? this.suffix : '';
  }
}

decorate(StepSliderControl, {
  value: observable,
  steps: observable,
});

export interface TextInputControlParams extends ControlParams {
  value: string;
  helperOperation?: OperationClass;
  placeholder?: string;
}

export class TextInputControl extends OperationControl {
  constructor(params: TextInputControlParams) {
    const {
      prefix,
      description,
      value,
      helperOperation,
      placeholder = '',
    } = params;
    super(prefix, description);

    this.value = value;
    this.helperOperation = helperOperation;
    this.placeholder = placeholder;
  }

  override value: string;
  helperOperation?: OperationClass;
  placeholder: string;

  hasHelperOperation() {
    return this.helperOperation != null;
  }
}

decorate(TextInputControl, {
  value: observable,
});

export interface TextAreaControlParams extends ControlParams {
  id?: string;
  value: string;
  helperOperation?: OperationClass;
  placeholder?: string;
}

export class TextareaControl extends OperationControl {
  constructor(params: TextAreaControlParams) {
    const {
      prefix,
      description,
      helperOperation,
      id = '',
      value,
      placeholder = '',
    } = params;
    super(prefix, description);

    this.id = id;
    this.value = value;
    this.helperOperation = helperOperation;
    this.placeholder = placeholder;
  }

  id: string;
  override value: string;
  helperOperation?: OperationClass;
  placeholder: string;

  hasHelperOperation() {
    return this.helperOperation != null;
  }
}

decorate(TextareaControl, {
  value: observable,
});
