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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotEnvPlugin = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const shared = require('./shared');

module.exports = {
  entry: './app/main.ts',
  mode: 'production',
  module: shared.module,
  resolve: shared.resolve,
  plugins: [
    new DotEnvPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      template: shared.resolveDir('../app/static/index.html'),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: shared.resolveDir('../app/static/global.css'),
          to: shared.resolveDir('../dist/global.css'),
        },
      ],
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
