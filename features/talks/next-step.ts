import type { SessionPick } from '@/features/plan/pick-session';
import { nextStepText } from '@/features/practice/summary';
import { daysBetween, formatDay, talkDayOf } from '@/lib/dates';
import { capitalize, pluralize } from '@/lib/utils';

export type NextStepAction = 'practice' | 'present' | 'debrief' | 'done';
export type NextStep = { when: string; task: string; action: NextStepAction };

export type NextStepInput = {
  startsAt: string;
  today: string;
  pick: SessionPick;
  sections: { id: string; title: string }[];
  debriefed: boolean;
};

export function describeNextStep({ startsAt, today, pick, sections, debriefed }: NextStepInput): NextStep {
  const talkDay = talkDayOf(startsAt);
  const when = formatDay(talkDay, today);

  if (daysBetween(today, talkDay) < 0) {
    return debriefed
      ? { when, task: 'Debrief saved', action: 'done' }
      : { when, task: 'Debrief, 1 minute', action: 'debrief' };
  }

  const label = nextStepText(pick, sections);
  return {
    when,
    task: `${capitalize(label)}, ${pluralize(pick.minutes, 'minute')}`,
    action: pick.kind === 'talk-day-checklist' ? 'present' : 'practice',
  };
}
