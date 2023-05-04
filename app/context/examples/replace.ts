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

export interface ReplaceExample {
  pre: string;
  toReplace: string;
  wordinessOptions: string[];
  post: string;
}

export const exampleData = [
  {
    pre: 'An elderly man was sitting alone on a dark path. The man looked down at his feet, and realized ',
    toReplace: 'he was holding a bright red box made of pine',
    wordinessOptions: [
      'something',
      'something incredible',
      'he was holding a bright red box made of pine',
      'he was holding a bright red box made of pine, but he had no idea where it came from.',
      'he was holding a bright red box made of pine, but he had no idea where it came from.',
    ],
    post: '. It was a plain pine box and looked as if it had been there for a long time. The man was afraid to look inside the box.',
  },
  {
    pre: 'The mantle was cluttered with objects: ',
    toReplace:
      'picture frames showing grandchildren and long-ago weddings, knickknacks collected from all over the world, ',
    wordinessOptions: [
      'knickknacks',
      'picture frames showing grandchildren',
      'picture frames showing grandchildren and long-ago weddings, knickknacks collected from all over the world, ',
      'picture frames showing grandchildren and long-ago weddings, knickknacks collected from all over the world, intricate decorative figurines',
      'picture frames showing grandchildren and long-ago weddings, knickknacks collected from all over the world, intricate decorative figurines',
    ],
    post: 'and more than one vase of dried flowers. The bejeweled lamp was at the very back, nearly invisible.',
  },
  {
    pre: '"We have to leave now!" I shouted. ',
    toReplace:
      '"The zombies are going to break through any moment, and then we\'ll all be goners." ',
    wordinessOptions: [
      '"Hurry!"',
      '"Let\'s get out of here!"',
      '"The zombies are going to break through any moment, and then we\'ll all be goners." ',
      '"The zombies are going to break through any moment, and then we\'ll all be goners! We\'ve got to hurry!" ',
      '"The zombies are going to break through any moment, and then we\'ll all be goners! We\'ve got to hurry!" ',
    ],
    post: 'The only way out was up. We climbed flight after flight. The sound of the monsters banging on the door below became more distant but no less threatening.',
  },
  {
    pre: 'The sun was shining, and little gusts of wind brought through the window ',
    toReplace:
      'the faint scents of honeysuckle and freshly turned soil. It was a ',
    wordinessOptions: [
      'sweet scents. It was a',
      'the faint scent of huneysuckle. It was a',
      'the faint scents of honeysuckle and freshly turned soil. It was a ',
      'the faint scents of honeysuckle, newly cut grass, and freshly turned soil. It was a ',
      'the faint scents of honeysuckle, newly cut grass, and freshly turned soil. It was a ',
    ],
    post: 'shocking contrast from the stale city smells she had grown used to.',
  },
  {
    pre: 'I was minding my business at the park, when I was approached by a little girl who was crying because she had lost ',
    toReplace:
      "her cat, which she had just received for her birthday. She did not want her parents to know she'd already lost him. I'm a good person ",
    wordinessOptions: [
      'her cat.',
      'her new kitten.',
      'her cat, which she had just received for her birthday.',
      "her cat, which she had just received for her birthday. She did not want her parents to know she'd already lost him. I'm a good person ",
      "her cat, which she had just received for her birthday. She did not want her parents to know she'd already lost him. I'm a good person ",
    ],
    post: 'so of course I helped search.',
  },
  {
    pre: 'It was a cold night, and a storm was raging out at sea. A lightning bolt lit up the sky, briefly illuminating the lighthouse ',
    toReplace:
      'and the young man peering hesitantly over the sheer cliff. Before the next peal of thunder he jumped. At first he ',
    wordinessOptions: [
      'from above.',
      'in a sharp silhouette.',
      'and the young man peering hesitantly over the cliff. Before the next bolt he jumped. At first he ',
      'and the young man peering hesitantly over the sheer cliff. Before the next peal of thunder he jumped. At first he ',
      'and the young man peering hesitantly over the sheer cliff. Before the next peal of thunder he jumped. At first he ',
    ],
    post: 'plummeted but just before reaching the churning water, he disappeared in a poof of purple flame!',
  },
  {
    pre: 'The magician pulled out of his pocket ',
    toReplace: 'a scarlet handkerchief ',
    wordinessOptions: [
      'a rabbit',
      'a scarlet handkerchief ',
      'a multicolored silken handkerchief, covered in polka dots - ',
      'a multicolored silken handkerchief, woven from the finest shimmering fabric and covered in polka dots - ',
      'a multicolored silken handkerchief, woven from the finest shimmering fabric and covered in polka dots - ',
    ],
    post: " and then a second one and a third. He didn't stop until soon the ground was covered with them.",
  },
];

class ReplaceExamples extends Examples<ReplaceExample> {}

export const examples = new ReplaceExamples(exampleData);
