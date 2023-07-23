/**
 * @license
 * Copyright 2022 Google LLC
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
 */
const path = require('path');

module.exports.module = {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
    // Load the lit-element css files
    {
      test: /\.css$/i,
      loader: resolveDir('./lit-css-loader.js'),
    },
  ],
};

module.exports.resolve = {
  extensions: ['.ts', '.ts', '.js', '.css'],
  alias: {
    '@components': resolveDir('../app/components'),
    '@context': resolveDir('../app/context'),
    '@core': resolveDir('../app/core'),
    '@lib': resolveDir('../app/lib'),
    '@models': resolveDir('../app/models'),
    '@operations': resolveDir('../app/core/operations'),
    '@services': resolveDir('../app/core/services'),
  },
};

/**
 * Convenience wrapper for path.resolve().
 */
function resolveDir(relativeDir) {
  return path.resolve(__dirname, relativeDir);
}

module.exports.resolveDir = resolveDir;
