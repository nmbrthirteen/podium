import { describe, expect, it } from 'vitest';
import { endedRuns, runTotals } from './runs';

describe('endedRuns', () => {
  it('keeps only runs with an endedAt', () => {
    const runs = [{ endedAt: '2026-09-17T10:00:00Z' }, { endedAt: null }, { endedAt: '2026-09-17T11:00:00Z' }];
    expect(endedRuns(runs)).toEqual([{ endedAt: '2026-09-17T10:00:00Z' }, { endedAt: '2026-09-17T11:00:00Z' }]);
  });

  it('returns an empty array when nothing ended', () => {
    expect(endedRuns([{ endedAt: null }])).toEqual([]);
  });
});

describe('runTotals', () => {
  it('sums seconds, budget, peeks, and time over budget', () => {
    const timings = [
      { sectionId: 'a', seconds: 90, budgetSeconds: 60, peeks: 1 },
      { sectionId: 'b', seconds: 30, budgetSeconds: 60, peeks: 2 },
    ];
    expect(runTotals(timings)).toEqual({ seconds: 120, budgetSeconds: 120, peeks: 3, overSeconds: 30 });
  });

  it('returns zeros for no timings', () => {
    expect(runTotals([])).toEqual({ seconds: 0, budgetSeconds: 0, peeks: 0, overSeconds: 0 });
  });
});
