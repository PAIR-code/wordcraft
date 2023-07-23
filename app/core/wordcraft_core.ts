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

import {Constructor} from '@lib/types';
import {Service} from './services/service';

interface ServiceProvider {
  [key: string]: Service;
}

/**
 * The core app module, which is responsible for instantiating and initializing
 * all of the wordcraft singleton services. In order to resolve inter-service
 * dependencies, the services are constructed with a ServiceProvider object
 * which provides access to the other lazily-constructed services. This way,
 * each service can specify which services it depends on via an interface.
 *
 * Services are responsible for providing this ServiceProvider into the
 * constructors of the various objects that they build (Operations, etc).
 */
export class WordcraftCore {
  private readonly services = new Map<Constructor<Service>, Service>();

  getService<T extends Service>(t: Constructor<T>): T {
    return this.buildService(t);
  }

  buildService<T extends Service>(t: Constructor<T>): T {
    let service = this.services.get(t);
    if (service === undefined) {
      service = new t(this.serviceProvider)!;
      this.services.set(t, service);
    }
    return service as T;
  }

  initialize = (
    makeServiceProvider: (core: WordcraftCore) => ServiceProvider
  ) => {
    console.log('🚀', 'initialize');
    const serviceProvider = makeServiceProvider(this);

    const handler = {
      // tslint:disable-next-line:no-any
      get(target: any, propKey: string) {
        if (serviceProvider.hasOwnProperty(propKey)) {
          return target[propKey];
        }
        throw new Error(
          `ServiceProvider in WordcraftCore has not been built with ${propKey}.`
        );
      },
    };

    const proxy = new Proxy(serviceProvider, handler);

    this.serviceProvider = proxy;
  };

  serviceProvider: ServiceProvider = {};
}

export const wordcraftCore = new WordcraftCore();
