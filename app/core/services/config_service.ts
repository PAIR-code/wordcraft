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
import {FeatureFlagsService, FeatureFlag} from './feature_flags_service';

import {Service} from './service';

interface ServiceProvider {
  featureFlagsService: FeatureFlagsService;
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export interface ConfigObject {
  availableOperations: string[];
}

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export type ConfigKey = keyof ConfigObject;

const DEFAULT_CONFIG: ConfigObject = {
  availableOperations: [],
};

const translateFeatureFlagValueToConfig = (flag: ConfigKey, value: string) => {
  if (flag === 'availableOperations') {
    return value.split(',');
  }
  return value;
};

/**
 * Determines configuration of the app from a wordcraftConfig object that's
 * bootstrapped onto the page.
 */
export class ConfigService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  get featureFlagsService(): FeatureFlagsService {
    return this.serviceProvider.featureFlagsService;
  }

  getConfigObject(): ConfigObject {
    // tslint:disable-next-line:no-any
    const localConfig = (window as any).wordcraftConfig;
    const routeConfig = Object.keys(DEFAULT_CONFIG).reduce((acc, curr) => {
      const value: string = this.featureFlagsService.getFeature(
        curr as FeatureFlag
      );
      if (value != null) {
        // tslint:disable-next-line:no-any
        (acc as any)[curr] = translateFeatureFlagValueToConfig(
          curr as ConfigKey,
          value
        );
      }
      return acc;
    }, {});

    const config = {...DEFAULT_CONFIG, ...localConfig, ...routeConfig};
    return config;
  }

  get availableOperations() {
    return this.getConfigObject().availableOperations;
  }
}
