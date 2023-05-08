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

/**
 * A collection of witty loading messages.
 */
export const loadingMessages = [
  'Reticulating splines',
  'Defragmenting disks',
  'Making the sun rise and set',
  'Initializing reality engine',
  'Re-assembling subspace',
  'Creating new universe',
  'Generating witty dialog',
  'Swapping time and space',
  'Spinning violently around the y-axis',
  'Tokenizing real life',
  'Bending the spoon',
  'Filtering morale',
  'Resampling quantum foam',
  'Creating a new universe',
  'Calculating escape velocity',
  'Copying from the Internet',
  "Inputting user's life story",
  'Singing the alphabet',
  'Achieving sentience',
  'Checking for updates',
  'Calculating probability',
  'Compressing a few centuries worth of data',
  'Checking Google.exe',
  'Calculating trajectory',
  'Downloading more RAM',
  'Computing the meaning of life',
  'Writing witty loading messages',
  'Re-establishing quantum entanglement',
  'Making another cup of coffee',
  'Recompiling morality database',
  'Initializing the universe',
  'Setting gravity to 0',
  'Running to Wikipedia',
  'Reconstructing your neural network',
  'Waiting for the hamsters to turn the wheel',
  'Preparing to calculate pi to the last digit',
  'Compiling coffee',
  'Defragmenting memory',
  'Installing Java',
  'Copying the laws of physics',
  'Exercising the mouse',
  'Downloading sarcasm module',
  'Transcending the fourth wall',
];

/** Gets a random loading message from the list */
export const getRandomLoadingMessage = () => {
  const index = Math.floor(Math.random() * loadingMessages.length);
  return loadingMessages[index];
};
