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

/** An error to be thrown and caught when cancelling a step */
export class CancelStepError extends Error {
  override name = 'CancelStepError';

  constructor(message = '') {
    super(message);
    // This is a dumb issue for typescript compilation targeting ES5... see
    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, CancelStepError.prototype);
  }
}

/** An error to be thrown and caught when cancelling an operation */
export class CancelOperationError extends Error {
  override name = 'CancelOperationError';

  constructor(message = '') {
    super(message);
    // This is a dumb issue for typescript compilation targeting ES5... see
    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, CancelOperationError.prototype);
  }
}
