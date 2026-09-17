import { describe, expect, it } from 'vitest';
import { structureRules } from './structure-rules';

describe('structureRules', () => {
  it('flags sections that do not sum to the talk length', () => {
    const [issue] = structureRules({
      lengthMinutes: 10,
      sections: [
        { id: 's1', minutes: 8, keywords: [] },
        { id: 's2', minutes: 6, keywords: [] },
      ],
    });
    expect(issue?.message).toBe('Sections add up to 14 minutes. The talk is 10.');
    expect(issue?.action).toEqual({ kind: 'open', panel: 'structure', label: 'Open structure' });
  });

  it('passes sections that sum to the length', () => {
    expect(
      structureRules({
        lengthMinutes: 10,
        sections: [
          { id: 's1', minutes: 2.5, keywords: [] },
          { id: 's2', minutes: 7.5, keywords: [] },
        ],
      }),
    ).toEqual([]);
  });

  it('flags a card over 7 keywords', () => {
    const keywords = Array.from({ length: 11 }, (_, index) => `k${index}`);
    const [issue] = structureRules({ lengthMinutes: 5, sections: [{ id: 's1', minutes: 5, keywords }] });
    expect(issue?.message).toBe('This card has 11 keywords. Keep 7 or fewer.');
    expect(issue?.action).toEqual({ kind: 'focus', target: 'card-s1', label: 'Edit card' });
  });
});
