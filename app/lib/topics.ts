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

/** A collection of genres */
export const genres = [
  'science fiction',
  'mystery',
  'fantasy',
  "children's",
  'drama',
  'fairy tale',
  'folk',
  'historical fiction',
  'horror',
];

/** A collection of topics. */
export const topics = [
  'cyborgs',
  'ninja schools',
  'magical battles',
  'a royal castle',
  'a faraway land',
  'witches',
  'vampires',
  'superhero schools',
  'magical girls',
  'a long journey',
  'wizard schools',
  'haunted forests',
  'a dragon',
  'a wizard tournament',
  'magical crystals',
  'knights riding dragons',
  'a princess',
  'time travel',
  'the underworld',
  'ninjas',
  'dystopian futures',
  'a time travel machine',
  'a boy with magical powers',
  'magic schools',
  'a love triangle',
  'magic artifacts',
  'the moon',
  'alien creatures',
  'a talking crow',
  'a king',
  'wizard battles',
  'a royal family',
  'giant sea snakes',
  'space battles',
  'a giant monster',
  'magic swords',
  'a young prince',
  'robots',
  'ancient rituals',
  'a medieval kingdom',
  'giant talking animals',
  'space stations',
  'the future',
  'haunted forest',
  'magical spells',
  'a wise old man',
  'magic items',
  'an epic love story',
  'pirates',
  'giant dragons',
  'dragons.',
  'dystopian worlds',
  'a cave',
  'magic spells',
  'a powerful sword',
  'magic stones',
  'space exploration',
  'talking animals',
  'dragon riders',
  'a magic academy',
  'wizards',
  'a boy with unusual powers',
  'kingdoms',
  'a desert',
  'an undercover agent',
  'a cave filled with gold',
  'fantasy worlds',
  'super heros',
  'magical creatures',
  'dungeons',
  'a forest',
  'princesses',
  'an old man',
  'a haunted building',
  'superheroes and supervillains',
  'a school for misfits',
  'magical elves',
  'elves',
  'magical artifacts',
  'dragons',
  'wizard wands',
  'superheroes',
];

/** Get a random topic from the list */
export const getRandomTopic = () => {
  const index = Math.floor(Math.random() * topics.length);
  return topics[index];
};

/** Get a random genre from the list */
export const getRandomGenre = () => {
  const index = Math.floor(Math.random() * genres.length);
  return genres[index];
};
