import { describe, expect, it } from 'vitest';
import { type ProgressRun, recurringThemes, talkProgress } from './progress';

const run = (id: string, startedAt: string, seconds: number, budgetSeconds: number, peeks: number): ProgressRun => ({
  id,
  kind: 'full-run',
  startedAt,
  endedAt: startedAt,
  sectionTimings: [{ sectionId: 's1', seconds, budgetSeconds, peeks }],
});

describe('talkProgress', () => {
  it('reports the last run and peeks per run in order', () => {
    const progress = talkProgress([
      run('b', '2026-09-15T10:00:00Z', 300, 240, 2),
      run('a', '2026-09-14T10:00:00Z', 420, 600, 5),
      { ...run('open', '2026-09-15T11:00:00Z', 60, 60, 0), endedAt: null },
      { id: 'qa', kind: 'qa-drill', startedAt: '2026-09-15T12:00:00Z', endedAt: 'x', sectionTimings: [] },
    ]);
    expect(progress).toEqual({
      lastRun: { seconds: 300, budgetSeconds: 240, peeks: 2 },
      peeksPerRun: [
        { id: 'a', label: 'Run 1', value: 5 },
        { id: 'b', label: 'Run 2', value: 2 },
      ],
    });
  });
});

describe('recurringThemes', () => {
  it('returns phrases that appear in two or more notes', () => {
    expect(recurringThemes(['Pace. The close.', 'the close', 'Transitions. Pace!', 'Pace', 'Opening line'])).toEqual([
      { text: 'Pace', count: 3 },
      { text: 'The close', count: 2 },
    ]);
  });
});
