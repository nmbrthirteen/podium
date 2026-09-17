import { daysBetween } from '@/lib/dates';
import type { SectionTiming, SessionKind } from '@/lib/domain';
import { sectionScore } from './generate-plan';
import { sessionMinutes } from './session-kinds';

export type PickerSession = {
  id: string;
  day: string;
  position: number;
  kind: SessionKind;
  sectionId: string | null;
  minutes: number;
  completedRunId: string | null;
};

export type PickerRun = { kind: SessionKind; sectionTimings: SectionTiming[] };

export type PickInput = {
  today: string;
  talkDay: string;
  lengthMinutes: number;
  sessions: PickerSession[];
  runs: PickerRun[];
  sections: { id: string; minutes: number }[];
};

export type PickReason = 'planned' | 'first-full-run' | 'weak-section' | 'recorded' | 'dress' | 'default';

export type SessionPick = {
  kind: SessionKind;
  sectionId: string | null;
  minutes: number;
  sessionId: string | null;
  reason: PickReason;
};

function isWeakTiming(timing: SectionTiming) {
  const overrun = timing.budgetSeconds > 0 ? (timing.seconds - timing.budgetSeconds) / timing.budgetSeconds : 0;
  return timing.peeks >= 3 || overrun >= 0.2;
}

export function pickSession(input: PickInput): SessionPick {
  const planned = input.sessions
    .filter(session => !session.completedRunId && session.day <= input.today)
    .sort((a, b) => a.day.localeCompare(b.day) || a.position - b.position)[0];

  if (planned) {
    return {
      kind: planned.kind,
      sectionId: planned.sectionId,
      minutes: planned.minutes,
      sessionId: planned.id,
      reason: 'planned',
    };
  }

  const unplanned = (kind: SessionKind, reason: PickReason, sectionId: string | null = null): SessionPick => {
    const sectionMinutes = input.sections.find(section => section.id === sectionId)?.minutes ?? 0;
    return {
      kind,
      sectionId,
      minutes: sessionMinutes(kind, input.lengthMinutes, sectionMinutes),
      sessionId: null,
      reason,
    };
  };

  const fullRuns = input.runs.filter(run => run.kind === 'full-run').length;
  if (fullRuns === 0) return unplanned('full-run', 'first-full-run');

  const lastTimed = [...input.runs].reverse().find(run => run.sectionTimings.length > 0);
  const weakest = lastTimed?.sectionTimings
    .filter(isWeakTiming)
    .filter(timing => input.sections.some(section => section.id === timing.sectionId))
    .sort((a, b) => sectionScore(b) - sectionScore(a))[0];
  if (weakest) return unplanned('section-loop', 'weak-section', weakest.sectionId);

  if (fullRuns >= 2 && !input.runs.some(run => run.kind === 'recorded-run')) {
    return unplanned('recorded-run', 'recorded');
  }

  const daysAway = daysBetween(input.today, input.talkDay);
  if (daysAway >= 0 && daysAway <= 2 && !input.runs.some(run => run.kind === 'dress-rehearsal')) {
    return unplanned('dress-rehearsal', 'dress');
  }

  return unplanned('full-run', 'default');
}
