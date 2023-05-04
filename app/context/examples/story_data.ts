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
export interface ParsedStory {
  sentences: string[];
}

export const storyData: {[key: string]: ParsedStory} = {
  kentucky: {
    sentences: [
      "There once was a man named Kentucky, who could play the guitar like nobody's business.",
      "He loved to play the guitar so that he could hear the guitar sing along to him, to hear the guitar's melodic hum.",
      'Kentucky was a lonely man living in a lonely house in the middle of nowhere with only his favorite guitar to keep him company.',
      'Now this guitar had been owned by many-a-man, and all of them had come to the same fate. They played the guitar until the guitar played them.',
    ],
  },
  secretary: {
    sentences: [
      'A secretary went about her daily work, while her company was being relocated from Chicago to New York City.',
      'It was tough, but she remained adaptable throughout the process.',
    ],
  },
  deathbed: {
    sentences: [
      'The old man was laying on his deathbed, the only thing he could hear was his own heartbeat inside his ear.',
      'He knew he had an hour left to live, and he was so filled with despair.',
      '"I have no regrets, for I have led a good life."',
      'However, in the next moment, a nurse entered the room, and he quickly said to her, "One regret, now that I have time to think on it.',
      'I wish I had talked less and listened more."',
      'Before dying, the man decided to have one more conversation with his children, his wife and his friends.',
    ],
  },
  explorers: {
    sentences: [
      'A small group of explorers landed in China, and were amazed by the beautiful, sparkling buildings.',
      'They wondered how such a beautiful country could ever be as scary as they had heard.',
      'It was at night, and the explorers were deep in the heart of the forbidden city, their flashlights not strong enough to reach the bottom of the narrow, dark hallways.',
      'Suddenly, a terrifying sound echoed through the halls.',
    ],
  },
  datacenter: {
    sentences: [
      'There was once a fairy living in a datacenter.',
      'It was a place filled with lights and noise, and the fairy loved it.',
      'The fairy lived on a mountain of Ethernet cables.',
      'She liked the way they glittered in the fluorescent artificial light that filled the room.',
      'The noise from the constant chatter of the servers, like a babbling brook, lulled her to sleep.',
    ],
  },
};
