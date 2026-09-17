import type { z } from 'zod';
import { suggestDepth } from '@/features/plan/depth';
import type { briefPrefill } from '@/lib/coach/tasks/brief-prefill';
import { addDays, daysBetween } from '@/lib/dates';
import type { FieldSource } from '@/lib/domain';
import type { CreateTalkInput } from './actions';
import { parseTalkText } from './parse-talk-text';

export type CoachTalkDraft = z.output<(typeof briefPrefill)['schema']>;

type BuildTalkInput = {
  id: string;
  text: string;
  today: string;
  now: Date;
  coach: CoachTalkDraft | null;
  deckTitle: string;
};

const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function todayForCoach(now: Date, today: string) {
  return `${now.toLocaleDateString('en-US', { weekday: 'long' })} ${today}`;
}

export function buildTalkInput({ id, text, today, now, coach, deckTitle }: BuildTalkInput): CreateTalkInput {
  const local = parseTalkText(text, today);
  const coachDate = coach && dayPattern.test(coach.date) && daysBetween(today, coach.date) >= 0 ? coach.date : null;
  const coachTime = coach && timePattern.test(coach.time) ? coach.time : null;
  const coachLength = coach && coach.lengthMinutes >= 1 && coach.lengthMinutes <= 600 ? coach.lengthMinutes : null;

  const lengthMinutes = coachLength ?? local.lengthMinutes ?? 10;
  const stakes = coach?.stakes ?? local.stakes ?? 'normal';
  const startsAt = `${coachDate ?? local.date ?? addDays(today, 1)}T${coachTime ?? local.time ?? '10:00'}`;
  const source: FieldSource = coach ? 'coach-draft' : 'user';

  return {
    id,
    title: (coach?.title.trim() || local.title || deckTitle || 'Untitled talk').slice(0, 200),
    goal: coach?.goal ?? '',
    audience: coach?.audience ?? '',
    bigIdea: coach?.bigIdea ?? '',
    openingLine: coach?.openingLine ?? '',
    closingLine: coach?.closingLine ?? '',
    type: coach?.type ?? local.type ?? 'team-meeting',
    startsAt,
    lengthMinutes,
    nervousness: 3,
    stakes,
    depth: suggestDepth({ now, startsAt, stakes, lengthMinutes }),
    fieldSources: {
      title: source,
      type: source,
      goal: 'coach-draft',
      audience: 'coach-draft',
      bigIdea: 'coach-draft',
      openingLine: 'coach-draft',
      closingLine: 'coach-draft',
    },
    points: (coach?.points ?? []).map(point => ({ ...point, source: 'coach-draft' as const })),
  };
}
