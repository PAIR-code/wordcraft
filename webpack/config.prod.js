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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotEnvPlugin = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './app/main.ts',
  mode: 'production',
  module: {
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
  },
  resolve: {
    extensions: ['.ts', '.ts', '.js', '.css'],
  },
  plugins: [
    new DotEnvPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      template: resolveDir('../app/static/index.html'),
    }),
    new CopyPlugin({
      patterns: [
        { from: resolveDir('../app/static/global.css'), to: resolveDir('../dist/global.css') },
      ],
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};

/**
 * Convenience wrapper for path.resolve().
 */
function resolveDir(relativeDir) {
  return path.resolve(__dirname, relativeDir);
}
