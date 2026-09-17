import { briefCritique } from './brief-critique';
import { briefPrefill } from './brief-prefill';
import { cardsGenerate } from './cards-generate';
import { draftField } from './draft-field';
import { nextFocus } from './next-focus';
import { qaFeedback } from './qa-feedback';
import { qaPredict } from './qa-predict';
import { slideRedraft } from './slide-redraft';
import { slidesDraft } from './slides-draft';

export const coachTasks = {
  'brief-prefill': briefPrefill,
  'brief-critique': briefCritique,
  'draft-field': draftField,
  'cards-generate': cardsGenerate,
  'qa-predict': qaPredict,
  'qa-feedback': qaFeedback,
  'next-focus': nextFocus,
  'slides-draft': slidesDraft,
  'slide-redraft': slideRedraft,
};

export type CoachTaskId = keyof typeof coachTasks;

export function isCoachTaskId(value: string): value is CoachTaskId {
  return Object.hasOwn(coachTasks, value);
}
