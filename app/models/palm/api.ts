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

// set up Gemini generative AI library
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Remember to set an environment variable for API_KEY in .env

import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { DialogParams } from '@core/shared/interfaces';

// Default safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export interface ModelParams {
  generationConfig?: {
    topK?: number;
    topP?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    temperature?: number;
  }
}

const DEFAULT_GENERATION_PARAMS: ModelParams = {
  generationConfig: {
    temperature: 0.8,
    topK: 40,
    topP: 0.95,
    candidateCount: 8
  }
};

const TEXT_MODEL_ID = 'gemini-pro';
const DIALOG_MODEL_ID = 'gemini-pro';

export async function callTextModel(
  textPrompt: string,
  genConfig: ModelParams) {
  // set any passed parameters
  genConfig = Object.assign({}, DEFAULT_GENERATION_PARAMS, genConfig);
  genConfig.generationConfig.maxOutputTokens = 1024;

  const model = genAI.getGenerativeModel({
    model: TEXT_MODEL_ID, genConfig, safetySettings
  });
  const result = await model.generateContent(textPrompt);
  const response = await result.response;
  return response.text();
}

export async function callDialogModel(
  chatParams: DialogParams,
  genConfig: ModelParams) {
  // set any passed parameters
  genConfig = Object.assign({}, DEFAULT_GENERATION_PARAMS, genConfig);
  // set dialog-specific model parameters
  genConfig.generationConfig.temperature = 0.7;
  genConfig.generationConfig.candidateCount = 1;

  const model = genAI.getGenerativeModel({
    model: DIALOG_MODEL_ID, genConfig, safetySettings
  });

  // get lastest chat request (last message)
  const lastMsgIndex = chatParams.messages.length - 1;
  const message = chatParams.messages[lastMsgIndex].content;

  // set chat history
  const history = remapHistory(chatParams);

  // chat history TESTS
  const history1 = [
    {
      role: "user",
      parts: "Who are you?"
    },
    {
      role: "model",
      parts: "I am a model trained by Google"
    }
  ];
  const history2 = [
    {
      role: "user",
      parts: "Here's my story so far: {The man sat in his chair and closed his eyes. His voice was filled with sadness, but also with hope and let out a single tear. He whispered, \"I've finally found my way home,\" as the light from the lantern flickered and grew faint. With those words, the man's body relaxed and a peaceful smile spread across his face. As the light from the lantern slowly faded, it left behind a lingering sense of warmth and belonging. }",
    },
    {
      role: "model",
      parts: "That's a great start for your story. How can I help?",
    }
  ];

  // end test
  console.log("history1 (static):\n", history1);
  console.log("history2 (static):\n", history2);
  console.log("history (object):\n", history);

  const chat = model.startChat({ history2 });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

export function remapHistory(chatParams: DialogParams) {
  const remappedMessageHistory = [];

  // skip the first and last messages
  for (let i = 1; i < chatParams.messages.length - 1; i++) {
    remappedMessageHistory.push({
      role: chatParams.messages[i].author,
      parts: chatParams.messages[i].content
    });
  }
  return remappedMessageHistory;
}
