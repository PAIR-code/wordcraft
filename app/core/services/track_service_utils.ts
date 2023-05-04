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
import {
  AnnotatedLogEvent,
  AnnotatedText,
  Author,
  Log,
  LogAPIEvent,
  LogEvent,
} from '../shared/types';

export function getPreDiffLength(curr: string, prev: string) {
  let offset = 0;
  for (let i = 0; i <= curr.length; i++) {
    if (curr.charAt(i) !== prev.charAt(i)) {
      offset = i;
      break;
    }
  }
  return offset;
}

export function getPostDiffLength(
  curr: string,
  prev: string,
  preDiffLength: number
) {
  let postDiffLength = 0;
  const maxPostDiff = Math.min(
    curr.length - preDiffLength,
    prev.length - preDiffLength
  );
  const start = curr.length - maxPostDiff;

  for (let i = start; i <= curr.length; i++) {
    postDiffLength = curr.length - i;
    const post = curr.substring(curr.length - postDiffLength);
    const prevPost = prev.substring(prev.length - postDiffLength);

    if (post === prevPost) {
      break;
    }
  }
  return postDiffLength;
}

// To declutter the display, show consecutive user insertion / deletion events
// as a single event.
function mergeUserEvents(events: Log): AnnotatedLogEvent[] {
  // tslint:disable-next-line:no-any
  const chunkedEvents: any[] = [];
  for (let i = 0; i < events.length; i++) {
    const eventClone = Object.assign({}, events[i]);
    if (events[i].name === 'api') {
      chunkedEvents.push(eventClone);
      continue;
    }

    const event = events[i] as LogEvent;
    const prevEvent = chunkedEvents[chunkedEvents.length - 1];
    const isUserInsertion = event.name === 'insert' && event.author === 'user';
    const isDeletion = event.name === 'delete';
    let prevEventIsUserInsertion = false;
    let prevEventIsDeletion = false;
    let isConsecutive = false;

    if (prevEvent) {
      prevEventIsUserInsertion =
        prevEvent.name === 'insert' && prevEvent.author === 'user';
      prevEventIsDeletion = prevEvent.name === 'delete';

      if (isUserInsertion && prevEventIsUserInsertion) {
        const prevPosition: number = prevEvent.position;
        const prevLength: number = prevEvent.content.length;
        isConsecutive =
          event.content !== '\n' &&
          Math.abs(event.position - (prevPosition + prevLength)) < 2;
      } else if (isDeletion && prevEventIsDeletion) {
        const prevPosition: number = prevEvent.position;
        const prevLength: number = prevEvent.deletedContent.length;
        isConsecutive =
          Math.abs(event.position - (prevPosition - prevLength)) < 2;
      }
    }

    if (isUserInsertion && isConsecutive) {
      prevEvent.content = `${prevEvent.content}${event.content}`;
    } else if (isDeletion && isConsecutive) {
      prevEvent.content = `${event.content}${prevEvent.content}`;
    } else {
      chunkedEvents.push(eventClone);
    }
  }

  return chunkedEvents;
}

// Returns the annotated text in a condensed format, which makes serialization
// and storing a bit easier to parse.
export function condenseAnnotatedText(
  annotatedText: AnnotatedText
): AnnotatedText {
  // tslint:disable-next-line:no-any
  const spans: any[] = [];

  const firstSpan = annotatedText[0];
  if (firstSpan === undefined) return spans;

  let currentAuthor: Author = firstSpan.author;
  let currentSpan = firstSpan.span;

  for (const entry of annotatedText.slice(1)) {
    if (entry.author !== currentAuthor) {
      spans.push({
        author: currentAuthor,
        span: currentSpan,
      });
      currentSpan = '';
    }
    currentAuthor = entry.author;
    currentSpan += entry.span;
  }

  spans.push({
    author: currentAuthor,
    span: currentSpan,
  });

  return spans;
}

function getCharsFromAnnotatedText(annotatedText: AnnotatedText) {
  return annotatedText.map((d) => d.span).join('');
}

// Adds properties to model API events indicating user selection and corrections
// (if any).
function annotateModelEvents(allEvents: Log): AnnotatedLogEvent[] {
  // tslint:disable-next-line:no-any
  const annotatedAPIEvents: any[] = [];

  // tslint:disable-next-line:no-any
  let annotatedText: any[] = [];
  let modelSpan = [-1, -1];
  let trackingModelEdits = false;

  for (let i = 0; i < allEvents.length; i++) {
    // tslint:disable-next-line:no-any
    const event = allEvents[i] as any;
    if (event.name === 'api') {
      annotatedAPIEvents.push(event);
    } else {
      const {name, content, deletedContent} = event;
      const position: number = event.position;
      const insertionLength: number = content ? content.length : 0;
      const deletionLength: number = deletedContent ? deletedContent.length : 0;
      // tslint:disable-next-line:no-any
      const lastEvent: any = annotatedAPIEvents[annotatedAPIEvents.length - 1];

      if (
        i > 0 /* first event inserts initial text */ &&
        name === 'insert' &&
        event.author === 'model'
      ) {
        const contentLength = content.length as number;
        modelSpan = [position, position + contentLength];
        trackingModelEdits = true;
        annotatedAPIEvents[annotatedAPIEvents.length - 1]['selection'] =
          content;
      } else {
        if (trackingModelEdits) {
          const isModelEdit =
            position >= modelSpan[0] && position < modelSpan[1];
          if (isModelEdit) {
            modelSpan[1] = modelSpan[1] - deletionLength + insertionLength;
          } else {
            const correction = getCharsFromAnnotatedText(
              annotatedText.slice(...modelSpan)
            );
            if (
              lastEvent['selection'] &&
              correction !== lastEvent['selection']
            ) {
              lastEvent['correction'] = annotatedText.slice(...modelSpan);
            }
            trackingModelEdits = false;
          }
        }
      }

      // tslint:disable:no-any
      let diff: any[] = [];
      if (content) {
        diff = content.split('').map((d: any) => ({
          span: d,
          author: event['author'],
        }));
      }
      // tslint:enable:no-any
      annotatedText = [
        ...annotatedText.slice(0, position),
        ...diff,
        ...annotatedText.slice(position + deletionLength),
      ];

      if (trackingModelEdits) {
        const correction = getCharsFromAnnotatedText(
          annotatedText.slice(...modelSpan)
        );
        if (lastEvent['selection'] && correction !== lastEvent['selection']) {
          lastEvent['correction'] = annotatedText.slice(...modelSpan);
        }
      }
    }
  }

  // Merge model insertion events with the annotated API events.
  const annotatedEvents: AnnotatedLogEvent[] = [];
  let iterator = 0;
  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];
    if (event.name === 'api') {
      annotatedEvents.push({
        api: annotatedAPIEvents[iterator],
      } as AnnotatedLogEvent);

      iterator++;
      continue;
    }

    if (i > 0 && allEvents[i - 1].name === 'api') {
      if (event.author === 'model') {
        annotatedEvents[annotatedEvents.length - 1] = Object.assign(
          {},
          annotatedEvents[annotatedEvents.length - 1],
          event
        );
        continue;
      }
    }

    annotatedEvents.push(event);
  }
  return annotatedEvents;
}

/** Expand serialized event log. */
export function expandLog(events: AnnotatedLogEvent[]): Log {
  const allEvents: Log = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const isAPIEvent = event.api != null;

    if (isAPIEvent) {
      // When we save a story, we merge API events with user selection and user
      // edit events from the full log. This function decomposes those merged
      // events.
      allEvents.push(event.api as LogAPIEvent);

      const selectionDidOccur = event.content != null;
      if (selectionDidOccur) {
        // tslint:disable-next-line:no-any
        const selectionEvent: any = {};
        for (const [key, value] of Object.entries(event)) {
          if (key !== 'api') {
            selectionEvent[key] = value;
          }
        }

        allEvents.push(selectionEvent as LogEvent);
      }
    } else {
      allEvents.push(event as LogEvent);
    }
  }

  return allEvents;
}

/** Condense event log for serialization. */
export function condenseLog(events: Log): AnnotatedLogEvent[] {
  const annotatedEvents = annotateModelEvents(events);
  return mergeUserEvents(annotatedEvents);
}
