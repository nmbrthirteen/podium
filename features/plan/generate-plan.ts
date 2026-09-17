import { addDays, daysBetween } from '@/lib/dates';
import type { Depth, SectionTiming, SessionKind } from '@/lib/domain';
import { sessionMinutes } from './session-kinds';

export type PlanSection = { id: string; minutes: number };

export type PlanInput = {
  today: string;
  talkDay: string;
  lengthMinutes: number;
  depth: Depth;
  sections: PlanSection[];
  latestTimings?: SectionTiming[];
};

export type PlannedSession = {
  day: string;
  position: number;
  kind: SessionKind;
  sectionId: string | null;
  minutes: number;
};

type Draft = { kind: SessionKind; sectionId: string | null };

export function sectionScore(timing: SectionTiming) {
  return timing.peeks + Math.max(0, timing.seconds - timing.budgetSeconds) / 30;
}

export function rankWeakestSections(sections: PlanSection[], latestTimings: SectionTiming[] = []) {
  const scores = new Map(latestTimings.map(timing => [timing.sectionId, sectionScore(timing)]));
  const hasRun = latestTimings.length > 0;
  return [...sections]
    .sort((a, b) => {
      if (hasRun) {
        const difference = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
        if (difference !== 0) return difference;
      }
      return b.minutes - a.minutes;
    })
    .map(section => section.id);
}

const draft = (kind: SessionKind, sectionId: string | null = null): Draft => ({ kind, sectionId });

function standardDays(prepDays: number, weakest: string[]): Draft[][] {
  const loops = weakest.slice(0, 2).map(id => draft('section-loop', id));
  const dayOne = [draft('full-run'), ...loops];
  const dayTwo = [
    draft('mental-walkthrough'),
    draft('recorded-run'),
    draft('open-close-drill'),
    draft('listener-run'),
    draft('qa-drill'),
  ];
  const dayThree = [draft('dress-rehearsal')];

  if (prepDays >= 3) {
    const middle = Array.from({ length: prepDays - 3 }, () => [draft('full-run')]);
    return [dayOne, ...middle, dayTwo, dayThree];
  }

  const merged = [...dayTwo, ...dayThree].filter(session => session.kind !== 'mental-walkthrough');
  if (prepDays === 2) return [dayOne, merged];
  return [[...dayOne, ...merged]];
}

function deepDays(prepDays: number, weakest: string[]): Draft[][] {
  const days = standardDays(prepDays, weakest);
  days.forEach((sessions, index) => {
    const hasFullTalk = sessions.some(session => session.kind === 'full-run' || session.kind === 'dress-rehearsal');
    if (index % 2 === 0 && !hasFullTalk) sessions.unshift(draft('full-run'));
  });

  const dressDay = days.find(sessions => sessions.some(session => session.kind === 'dress-rehearsal'));
  if (dressDay) {
    const dressIndex = dressDay.findIndex(session => session.kind === 'dress-rehearsal');
    dressDay.splice(dressIndex, 0, draft('listener-run'), draft('qa-drill'));
  }
  return days;
}

function quickDays(weakest: string[]): Draft[][] {
  const loop = weakest.slice(0, 1).map(id => draft('section-loop', id));
  return [[draft('full-run'), ...loop, draft('open-close-drill'), draft('qa-drill')]];
}

export function generatePlan(input: PlanInput): PlannedSession[] {
  const weakest = rankWeakestSections(input.sections, input.latestTimings);
  const daysAway = Math.max(0, daysBetween(input.today, input.talkDay));
  const prepDays = Math.max(1, daysAway);

  const days =
    input.depth === 'quick'
      ? quickDays(weakest)
      : input.depth === 'deep'
        ? deepDays(prepDays, weakest)
        : standardDays(prepDays, weakest);

  const minutesById = new Map(input.sections.map(section => [section.id, section.minutes]));
  const sessions: PlannedSession[] = [];

  days.forEach((drafts, index) => {
    const day = addDays(input.today, index);
    drafts.forEach((item, position) => {
      sessions.push({
        day,
        position,
        kind: item.kind,
        sectionId: item.sectionId,
        minutes: sessionMinutes(item.kind, input.lengthMinutes, minutesById.get(item.sectionId ?? '') ?? 0),
      });
    });
  });

  const talkDaySessions = sessions.filter(session => session.day === input.talkDay).length;
  sessions.push({
    day: input.talkDay,
    position: talkDaySessions,
    kind: 'talk-day-checklist',
    sectionId: null,
    minutes: sessionMinutes('talk-day-checklist', input.lengthMinutes),
  });

  return sessions;
}
