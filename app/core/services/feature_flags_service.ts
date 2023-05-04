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
import {ObservableMap} from 'mobx';

import {ConfigKey} from './config_service';
import {Service} from './service';

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export const FEATURE_FLAGS: ConfigKey[] = ['availableOperations'];
// tslint:disable-next-line:enforce-comments-on-exported-symbols
export type FeatureFlag = typeof FEATURE_FLAGS[number];

/**
 * Manages feature flags set in the url query params
 */
export class FeatureFlagsService extends Service {
  private readonly featureMap = new ObservableMap<FeatureFlag, string>();

  isValidUrlParam(urlParam: ConfigKey) {
    return FEATURE_FLAGS.includes(urlParam);
  }

  isFeatureEnabled(feature: FeatureFlag) {
    return !!this.featureMap.get(feature);
  }

  setFeature(feature: FeatureFlag, value: string) {
    this.featureMap.set(feature, value);
  }

  getFeature<T>(feature: FeatureFlag): T {
    const value = this.featureMap.get(feature);
    return value as {} as T;
  }
}
