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

export const BLOCK_CONFIDENCE_THRESHOLDS = [
  'BLOCK_CONFIDENCE_THRESHOLD_UNSPECIFIED',
  'BLOCK_LOW_MEDIUM_AND_HIGH_HARM_CONFIDENCE',
  'BLOCK_MEDIUM_AND_HIGH_HARM_CONFIDENCE',
  'BLOCK_HIGH_HARM_CONFIDENCE_ONLY',
  'BLOCK_NONE',
];
export type BlockConfidenceThreshold =
  (typeof BLOCK_CONFIDENCE_THRESHOLDS)[number];

export const SAFETY_CATEGORIES = [
  'HATE',
  'TOXICITY',
  'VIOLENCE',
  'SEXUAL',
  'MEDICAL',
  'DANGEROUS',
];
export type SafetyCategory = (typeof SAFETY_CATEGORIES)[number];

export interface SafetySetting {
  category: number;
  threshold: BlockConfidenceThreshold;
}

export interface ModelParams {
  topK?: number;
  topP?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  temperature?: number;
  safetySettings?: SafetySetting[];
}

const DEFAULT_PARAMS: ModelParams = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  candidateCount: 8,
};

const DEFAULT_TEXT_PARAMS: ModelParams = {
  ...DEFAULT_PARAMS,
  maxOutputTokens: 1024,
  safetySettings: SAFETY_CATEGORIES.map((category, index) => ({
    category: index,
    threshold: 'BLOCK_NONE',
  })),
};

const DEFAULT_DIALOG_PARAMS: ModelParams = {
  ...DEFAULT_PARAMS,
};

const API_URL = 'https://generativelanguage.googleapis.com/v1beta2';

const TEXT_MODEL_ID = 'text-bison-001';
const TEXT_METHOD = 'generateText';

const DIALOG_MODEL_ID = 'chat-bison-001';
const DIALOG_METHOD = 'generateMessage';

export async function callTextModel(params: ModelParams) {
  params = {
    ...DEFAULT_TEXT_PARAMS,
    ...params,
  };
  return callApi(TEXT_MODEL_ID, TEXT_METHOD, params);
}

export async function callDialogModel(params: ModelParams) {
  params = {
    ...DEFAULT_DIALOG_PARAMS,
    ...params,
  };
  return callApi(DIALOG_MODEL_ID, DIALOG_METHOD, params);
}

export async function callApi(
  modelId: string,
  method: string,
  params: Partial<ModelParams>
) {
  const urlPrefix = `${API_URL}/models/${modelId}:${method}`;
  const url = new URL(urlPrefix);
  url.searchParams.append('key', process.env.PALM_API_KEY);

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(params),
  });
}
