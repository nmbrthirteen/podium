import { describe, expect, it } from 'vitest';
import { summarizeRun } from './summary';

const sections = [
  { id: 'part-1', title: 'Part 1' },
  { id: 'part-2', title: 'Part 2' },
];

describe('summarizeRun', () => {
  it('names peeks, the worst overrun, and the next step', () => {
    const line = summarizeRun(
      [
        { sectionId: 'part-1', seconds: 120, budgetSeconds: 120, peeks: 1 },
        { sectionId: 'part-2', seconds: 250, budgetSeconds: 180, peeks: 3 },
      ],
      sections,
      { kind: 'section-loop', sectionId: 'part-2', minutes: 9, sessionId: null, reason: 'weak-section' },
    );
    expect(line).toBe('4 peeks, 1:10 over in part 2. Next: loop part 2.');
  });

  it('reports a calm run', () => {
    const line = summarizeRun([{ sectionId: 'part-1', seconds: 100, budgetSeconds: 120, peeks: 0 }], sections, {
      kind: 'recorded-run',
      sectionId: null,
      minutes: 20,
      sessionId: null,
      reason: 'recorded',
    });
    expect(line).toBe('No peeks, on time. Next: recorded run.');
  });

  it('keeps Q&A capitalized', () => {
    const line = summarizeRun([{ sectionId: 'part-1', seconds: 100, budgetSeconds: 120, peeks: 1 }], sections, {
      kind: 'qa-drill',
      sectionId: null,
      minutes: 15,
      sessionId: 'planned',
      reason: 'planned',
    });
    expect(line).toBe('1 peek, on time. Next: Q&A drill.');
  });
});
