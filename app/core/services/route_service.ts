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
import {FeatureFlag, FeatureFlagsService} from './feature_flags_service';
import {Service} from './service';

interface ServiceProvider {
  featureFlagsService: FeatureFlagsService;
}

/**
 * Manages the url route in order to determine which subpage to show.
 */
export class RouteService extends Service {
  constructor(private readonly serviceProvider: ServiceProvider) {
    super();
  }

  private readonly urlParams = new URLSearchParams(window.location.search);

  get featureFlagsService(): FeatureFlagsService {
    return this.serviceProvider.featureFlagsService;
  }

  initialize() {
    this.parseFeatureFlags();
  }

  getUrlParam(key: string) {
    return this.urlParams.get(key);
  }

  hasUrlParam(key: string) {
    return this.urlParams.has(key);
  }

  updateUrlParam(key: string, value: string) {
    this.urlParams.set(key, value);
    this.updateHistory();
  }

  deleteUrlParam(key: string) {
    this.urlParams.delete(key);
    this.updateHistory();
  }

  parseFeatureFlags() {
    for (const urlParamEntry of this.urlParams.entries()) {
      const [key, value] = urlParamEntry;
      if (this.featureFlagsService.isValidUrlParam(key as FeatureFlag)) {
        this.featureFlagsService.setFeature(key as FeatureFlag, value);
      }
    }
  }

  updateHistory() {
    const newUrl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      '?' +
      this.urlParams.toString();
    window.history.pushState({path: newUrl}, '', newUrl);
  }
}
