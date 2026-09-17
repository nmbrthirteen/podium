import { describe, expect, it } from 'vitest';
import { initialDay, planDays } from './plan-days';

const sessions = [
  { id: 'a', day: '2026-09-14', completedRunId: 'r1' },
  { id: 'b', day: '2026-09-15', completedRunId: null },
  { id: 'c', day: '2026-09-15', completedRunId: 'r2' },
  { id: 'd', day: '2026-09-16', completedRunId: null },
];

describe('planDays', () => {
  it('groups sessions by day, counts progress, and adds the talk day', () => {
    const days = planDays(sessions, '2026-09-15', '2026-09-18');
    expect(days.map(day => [day.day, day.done, day.total])).toEqual([
      ['2026-09-14', 1, 1],
      ['2026-09-15', 1, 2],
      ['2026-09-16', 0, 1],
      ['2026-09-18', 0, 0],
    ]);
    expect(days[0]?.isPast).toBe(true);
    expect(days[1]?.isToday).toBe(true);
    expect(days[3]?.isTalkDay).toBe(true);
  });
});

describe('initialDay', () => {
  it('opens the earliest day with sessions still due', () => {
    const days = planDays(sessions, '2026-09-15', '2026-09-18');
    expect(initialDay(days, '2026-09-15')).toBe('2026-09-15');
  });

  it('opens the next day when today is done', () => {
    const days = planDays(
      sessions.map(session => ({ ...session, completedRunId: session.day <= '2026-09-15' ? 'done' : null })),
      '2026-09-15',
      '2026-09-18',
    );
    expect(initialDay(days, '2026-09-15')).toBe('2026-09-16');
  });

  it('opens the last day after the talk', () => {
    const days = planDays(sessions, '2026-09-20', '2026-09-18');
    expect(initialDay(days, '2026-09-20')).toBe('2026-09-15');
  });
});
