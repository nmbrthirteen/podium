import { describe, expect, it } from 'vitest';
import type { SectionTiming } from '@/lib/db/schema';
import { type PickerSession, pickSession } from './pick-session';

const sections = [
  { id: 'part-1', minutes: 4 },
  { id: 'part-2', minutes: 6 },
];

const calmTimings: SectionTiming[] = [
  { sectionId: 'part-1', seconds: 240, budgetSeconds: 240, peeks: 1 },
  { sectionId: 'part-2', seconds: 360, budgetSeconds: 360, peeks: 0 },
];

const base = { today: '2026-09-15', talkDay: '2026-09-25', lengthMinutes: 10, sections, sessions: [], runs: [] };

function session(overrides: Partial<PickerSession>): PickerSession {
  return {
    id: 'session',
    day: '2026-09-15',
    position: 0,
    kind: 'full-run',
    sectionId: null,
    minutes: 12,
    completedRunId: null,
    ...overrides,
  };
}

describe('pickSession', () => {
  it('picks the first incomplete planned session dated today or earlier', () => {
    const pick = pickSession({
      ...base,
      sessions: [
        session({ id: 'later', day: '2026-09-16', kind: 'recorded-run' }),
        session({ id: 'today-2', position: 1, kind: 'section-loop', sectionId: 'part-2', minutes: 18 }),
        session({ id: 'done', day: '2026-09-14', completedRunId: 'run-1' }),
        session({ id: 'yesterday', day: '2026-09-14', position: 3, kind: 'qa-drill', minutes: 15 }),
      ],
    });
    expect(pick).toEqual({ kind: 'qa-drill', sectionId: null, minutes: 15, sessionId: 'yesterday', reason: 'planned' });
  });

  it('starts a full run when no full run exists yet', () => {
    const pick = pickSession({ ...base, sessions: [session({ day: '2026-09-16' })] });
    expect(pick).toMatchObject({ kind: 'full-run', minutes: 12, sessionId: null, reason: 'first-full-run' });
  });

  it('loops a section with 3 or more peeks in the last run', () => {
    const pick = pickSession({
      ...base,
      runs: [
        {
          kind: 'full-run',
          sectionTimings: [
            { sectionId: 'part-1', seconds: 240, budgetSeconds: 240, peeks: 3 },
            { sectionId: 'part-2', seconds: 360, budgetSeconds: 360, peeks: 0 },
          ],
        },
      ],
    });
    expect(pick).toMatchObject({ kind: 'section-loop', sectionId: 'part-1', minutes: 12, reason: 'weak-section' });
  });

  it('loops a section that ran 20% or more over', () => {
    const pick = pickSession({
      ...base,
      runs: [
        {
          kind: 'full-run',
          sectionTimings: [
            { sectionId: 'part-1', seconds: 240, budgetSeconds: 240, peeks: 0 },
            { sectionId: 'part-2', seconds: 432, budgetSeconds: 360, peeks: 0 },
          ],
        },
      ],
    });
    expect(pick).toMatchObject({ kind: 'section-loop', sectionId: 'part-2', minutes: 18 });
  });

  it('starts a recorded run after two full runs without one', () => {
    const pick = pickSession({
      ...base,
      runs: [
        { kind: 'full-run', sectionTimings: calmTimings },
        { kind: 'full-run', sectionTimings: calmTimings },
      ],
    });
    expect(pick).toMatchObject({ kind: 'recorded-run', minutes: 20, reason: 'recorded' });
  });

  it('starts a dress rehearsal within 2 days of the talk', () => {
    const pick = pickSession({
      ...base,
      talkDay: '2026-09-17',
      runs: [{ kind: 'full-run', sectionTimings: calmTimings }],
    });
    expect(pick).toMatchObject({ kind: 'dress-rehearsal', minutes: 20, reason: 'dress' });
  });

  it('falls back to a full run', () => {
    const pick = pickSession({
      ...base,
      runs: [
        { kind: 'full-run', sectionTimings: calmTimings },
        { kind: 'full-run', sectionTimings: calmTimings },
        { kind: 'recorded-run', sectionTimings: calmTimings },
      ],
    });
    expect(pick).toMatchObject({ kind: 'full-run', minutes: 12, reason: 'default' });
  });
});
