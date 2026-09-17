import { describe, expect, it } from 'vitest';
import type { SessionKind } from '@/lib/db/schema';
import { suggestDepth } from './depth';
import { generatePlan, type PlannedSession, rankWeakestSections } from './generate-plan';

const sections = [
  { id: 'open', minutes: 1 },
  { id: 'part-1', minutes: 2.5 },
  { id: 'part-2', minutes: 4 },
  { id: 'part-3', minutes: 1.5 },
  { id: 'close', minutes: 1 },
];

function byDay(plan: PlannedSession[]) {
  const days = new Map<string, SessionKind[]>();
  for (const session of plan) days.set(session.day, [...(days.get(session.day) ?? []), session.kind]);
  return Object.fromEntries(days);
}

const base = { today: '2026-09-15', lengthMinutes: 10, sections };

describe('generatePlan', () => {
  it('builds a quick plan for today and the talk day', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-16', depth: 'quick' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': ['full-run', 'section-loop', 'open-close-drill', 'qa-drill'],
      '2026-09-16': ['talk-day-checklist'],
    });
    expect(plan.find(session => session.kind === 'section-loop')?.sectionId).toBe('part-2');
  });

  it('puts the checklist after the sessions when the talk is today', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-15', depth: 'quick' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': ['full-run', 'section-loop', 'open-close-drill', 'qa-drill', 'talk-day-checklist'],
    });
    expect(plan.map(session => session.position)).toEqual([0, 1, 2, 3, 4]);
  });

  it('builds a standard plan with 3 prep days', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-18', depth: 'standard' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': ['full-run', 'section-loop', 'section-loop'],
      '2026-09-16': ['mental-walkthrough', 'recorded-run', 'open-close-drill', 'listener-run', 'qa-drill'],
      '2026-09-17': ['dress-rehearsal'],
      '2026-09-18': ['talk-day-checklist'],
    });
    const loops = plan.filter(session => session.kind === 'section-loop').map(session => session.sectionId);
    expect(loops).toEqual(['part-2', 'part-1']);
  });

  it('merges days and drops the mental walkthrough with 1 prep day', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-16', depth: 'standard' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': [
        'full-run',
        'section-loop',
        'section-loop',
        'recorded-run',
        'open-close-drill',
        'listener-run',
        'qa-drill',
        'dress-rehearsal',
      ],
      '2026-09-16': ['talk-day-checklist'],
    });
  });

  it('merges day 2 and day 3 with 2 prep days', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-17', depth: 'standard' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': ['full-run', 'section-loop', 'section-loop'],
      '2026-09-16': ['recorded-run', 'open-close-drill', 'listener-run', 'qa-drill', 'dress-rehearsal'],
      '2026-09-17': ['talk-day-checklist'],
    });
  });

  it('inserts full runs on middle days with 5 prep days', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-20', depth: 'standard' });
    expect(byDay(plan)).toEqual({
      '2026-09-15': ['full-run', 'section-loop', 'section-loop'],
      '2026-09-16': ['full-run'],
      '2026-09-17': ['full-run'],
      '2026-09-18': ['mental-walkthrough', 'recorded-run', 'open-close-drill', 'listener-run', 'qa-drill'],
      '2026-09-19': ['dress-rehearsal'],
      '2026-09-20': ['talk-day-checklist'],
    });
  });

  it('builds a deep plan with extra full runs, listener runs, and Q&A drills', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-24', depth: 'deep' });
    const days = byDay(plan);
    expect(Object.keys(days)).toHaveLength(10);
    const count = (kind: SessionKind) => plan.filter(session => session.kind === kind).length;
    expect(count('qa-drill')).toBe(2);
    expect(count('listener-run')).toBe(2);
    expect(count('dress-rehearsal')).toBe(1);
    plan
      .map(session => session.day)
      .filter((day, index, all) => all.indexOf(day) === index)
      .slice(0, 9)
      .forEach((day, index) => {
        const kinds = days[day] ?? [];
        if (index % 2 === 0) expect(kinds.some(kind => kind === 'full-run' || kind === 'dress-rehearsal')).toBe(true);
      });
    const ladder = plan.map(session => session.kind);
    expect(ladder.indexOf('full-run')).toBeLessThan(ladder.indexOf('recorded-run'));
    expect(ladder.indexOf('recorded-run')).toBeLessThan(ladder.indexOf('listener-run'));
    expect(ladder.lastIndexOf('listener-run')).toBeLessThan(ladder.indexOf('dress-rehearsal'));
  });

  it('uses session minutes from the plan table', () => {
    const plan = generatePlan({ ...base, talkDay: '2026-09-18', depth: 'standard' });
    const minutes = (kind: SessionKind) => plan.find(session => session.kind === kind)?.minutes;
    expect(minutes('full-run')).toBe(12);
    expect(plan.find(session => session.sectionId === 'part-2')?.minutes).toBe(12);
    expect(minutes('open-close-drill')).toBe(5);
    expect(minutes('mental-walkthrough')).toBe(5);
    expect(minutes('recorded-run')).toBe(20);
    expect(minutes('listener-run')).toBe(20);
    expect(minutes('qa-drill')).toBe(15);
    expect(minutes('dress-rehearsal')).toBe(20);
    expect(minutes('talk-day-checklist')).toBe(30);
  });

  it('skips section loops when the talk has no sections', () => {
    const plan = generatePlan({ ...base, sections: [], talkDay: '2026-09-16', depth: 'quick' });
    expect(plan.map(session => session.kind)).toEqual([
      'full-run',
      'open-close-drill',
      'qa-drill',
      'talk-day-checklist',
    ]);
  });
});

describe('rankWeakestSections', () => {
  it('uses the longest section before any run', () => {
    expect(rankWeakestSections(sections)[0]).toBe('part-2');
  });

  it('scores peeks plus overrun seconds divided by 30 from the latest run', () => {
    const ranked = rankWeakestSections(sections, [
      { sectionId: 'open', seconds: 60, budgetSeconds: 60, peeks: 1 },
      { sectionId: 'part-1', seconds: 240, budgetSeconds: 150, peeks: 0 },
      { sectionId: 'part-2', seconds: 240, budgetSeconds: 240, peeks: 2 },
    ]);
    expect(ranked.slice(0, 3)).toEqual(['part-1', 'part-2', 'open']);
  });
});

describe('suggestDepth', () => {
  const now = new Date('2026-09-15T09:00');

  it('suggests quick within 24 hours', () => {
    expect(suggestDepth({ now, startsAt: '2026-09-16T08:00', stakes: 'high', lengthMinutes: 30 })).toBe('quick');
  });

  it('suggests quick for low stakes and 10 minutes or less', () => {
    expect(suggestDepth({ now, startsAt: '2026-09-20T09:00', stakes: 'low', lengthMinutes: 10 })).toBe('quick');
  });

  it('suggests standard 1 to 6 days away', () => {
    expect(suggestDepth({ now, startsAt: '2026-09-18T09:00', stakes: 'normal', lengthMinutes: 20 })).toBe('standard');
    expect(suggestDepth({ now, startsAt: '2026-09-21T09:00', stakes: 'normal', lengthMinutes: 20 })).toBe('standard');
  });

  it('suggests deep 7 or more days away or for high stakes', () => {
    expect(suggestDepth({ now, startsAt: '2026-09-22T09:00', stakes: 'normal', lengthMinutes: 20 })).toBe('deep');
    expect(suggestDepth({ now, startsAt: '2026-09-18T09:00', stakes: 'high', lengthMinutes: 20 })).toBe('deep');
  });
});
