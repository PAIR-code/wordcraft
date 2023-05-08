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
  category: SafetyCategory;
  threshold: BlockConfidenceThreshold;
}

export interface ModelParams {
  topK?: number;
  topP?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  temperature?: number;
  safetySettings: SafetySetting[];
}

export const DEFAULT_PARAMS: ModelParams = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  candidateCount: 8,
  maxOutputTokens: 1024,
  safetySettings: SAFETY_CATEGORIES.map((category, index) => ({
    category,
    threshold: 'BLOCK_NONE',
  })),
};

const API_URL =
  'https://autopush-generativelanguage.sandbox.googleapis.com/v1beta2/models';

export async function makeFetch(
  modelId: string,
  method: string,
  params: Partial<ModelParams>
) {
  params = {
    ...DEFAULT_PARAMS,
    ...params,
  };

  const urlPrefix = `${API_URL}/${modelId}:${method}`;
  const url = new URL(urlPrefix);
  url.searchParams.append('key', process.env.GENAI_API_KEY);

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}
