import { describe, expect, it } from 'vitest';
import { sectionTimings } from './use-section-clock';

const cards = [
  { id: 'a', minutes: 1 },
  { id: 'b', minutes: 2 },
];

describe('sectionTimings', () => {
  it('rounds elapsed seconds and scales the budget by the multiplier', () => {
    expect(sectionTimings(cards, [30.4, 65.6], 1)).toEqual([
      { sectionId: 'a', seconds: 30, budgetSeconds: 60, peeks: 0 },
      { sectionId: 'b', seconds: 66, budgetSeconds: 120, peeks: 0 },
    ]);
  });

  it('scales every budget when a section loops multiple times', () => {
    expect(sectionTimings(cards, [10, 0], 3)).toEqual([{ sectionId: 'a', seconds: 10, budgetSeconds: 180, peeks: 0 }]);
  });

  it('drops sections with no banked time and no peeks', () => {
    expect(sectionTimings(cards, [0, 0])).toEqual([]);
  });

  it('keeps a section with peeks even if no time banked', () => {
    expect(sectionTimings(cards, [0, 0], 1, [2, 0])).toEqual([
      { sectionId: 'a', seconds: 0, budgetSeconds: 60, peeks: 2 },
    ]);
  });
});
