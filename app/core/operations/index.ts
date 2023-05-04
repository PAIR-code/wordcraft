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
import {ContinuationOperation} from './continuation_operation';
import {ElaborationOperation} from './elaboration_operation';
import {FirstSentenceOperation} from './first_sentence_operation';
import {FreeformOperation} from './freeform_operation';
import {GenerateWithinSentenceOperation} from './generate_within_sentence_operation';
import {MetaPromptOperation} from './meta_prompt_operation';
import {NextSentenceOperation} from './next_sentence_operation';
import {NewStoryOperation} from './new_story_operation';
import {ReplaceOperation} from './replace_operation';
import {RewriteChoiceOperation} from './rewrite_choice_operation';
import {RewriteEndOfSentenceOperation} from './rewrite_end_of_sentence_operation';
import {RewriteSelectionOperation} from './rewrite_selection_operation';
import {RewriteSentenceOperation} from './rewrite_sentence_operation';
import {SuggestRewriteOperation} from './suggest_rewrite_operation';

export {ChoiceOperation} from './choice_operation';
export {Operation} from './operation';
export {
  ContinuationOperation,
  ElaborationOperation,
  FirstSentenceOperation,
  FreeformOperation,
  GenerateWithinSentenceOperation,
  MetaPromptOperation,
  NextSentenceOperation,
  NewStoryOperation,
  ReplaceOperation,
  RewriteChoiceOperation,
  RewriteEndOfSentenceOperation,
  RewriteSelectionOperation,
  RewriteSentenceOperation,
  SuggestRewriteOperation,
};
