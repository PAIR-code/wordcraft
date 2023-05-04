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
import {Examples} from './base';

export interface RewriteSelectionExample {
  pre: string;
  toRewrite: string;
  post: string;
  nWords: string;
  howToRewrite: string;
  target: string;
}

export const exampleData: RewriteSelectionExample[] = [
  {
    pre: 'Once upon a time there was an old man, standing all alone. The man looked down at his feet, and realized ',
    toRewrite: 'he was standing next to a box',
    post: '. It was a plain pine box and looked as if it had been there for a long time. The man was afraid to look inside the box.',
    nWords: 'about ten words',
    howToRewrite: "to include the word 'red'",
    target: 'he was holding a bright red box made of pine',
  },
  {
    pre: 'An elderly man was sitting alone on a dark path. The darkness turned to light as a figure ran up to him. The figure was holding a sword. The older man recognized the young man as ',
    toRewrite: "a dear friend, who he hadn't seen in some time",
    post: '. The young man said he had had the strangest dream.',
    nWords: 'two words',
    howToRewrite: 'to be about family',
    target: 'his son',
  },
  {
    pre: 'A traveling salesman was walking along a country road. He stumbled upon a little girl who was crying because she had lost ',
    toRewrite: 'her doll',
    post: '. The salesman decided to help the little girl find it. The man and the little girl began their journey together and as night fell they stumbled upon a small church.',
    nWords: 'a few words',
    howToRewrite: 'to be like a disney movie',
    target: 'her glass slipper',
  },
  {
    pre: 'An oddly dressed gnome was wandering through the forest. He stumbled upon a little girl who was crying because she had lost ',
    toRewrite: 'her doll',
    post: '. The gnome decided to help the little girl find it, so he and the little girl began their journey together. As night fell they stumbled upon a small church.',
    nWords: 'ten words',
    howToRewrite: 'to be about a cat',
    target: 'her cat, which she had just received for her birthday',
  },
  {
    pre: 'It was a cold night, and a storm was raging out sea. A lightning bolt lit up the sky, illuminating the warlock as he stood. With a swift movement he pulled a ',
    toRewrite: 'small notebook',
    post: ' out of his jacket and then stood in silence.',
    nWords: 'one word',
    howToRewrite: 'to be more intense',
    target: 'dagger',
  },
];

class RewriteSelectionExamples extends Examples<RewriteSelectionExample> {}
export const examples = new RewriteSelectionExamples(exampleData);
