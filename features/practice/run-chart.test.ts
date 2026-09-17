import { describe, expect, it } from 'vitest';
import { barScale, sectionBars } from './run-chart';

const sections = [
  { id: 's1', title: 'Opening' },
  { id: 's2', title: 'Reasons' },
  { id: 's3', title: 'Close' },
];

describe('sectionBars', () => {
  it('keeps section order, skips untimed sections, and flags overruns', () => {
    const bars = sectionBars(
      [
        { sectionId: 's2', seconds: 200, budgetSeconds: 120, peeks: 3 },
        { sectionId: 's1', seconds: 50, budgetSeconds: 60, peeks: 0 },
      ],
      sections,
    );
    expect(bars.map(bar => [bar.id, bar.over, bar.peeks])).toEqual([
      ['s1', false, 0],
      ['s2', true, 3],
    ]);
    expect(bars[1]?.ratio).toBeCloseTo(1.667, 2);
  });

  it('treats a zero budget as no ratio', () => {
    const [bar] = sectionBars([{ sectionId: 's1', seconds: 5, budgetSeconds: 0, peeks: 1 }], sections);
    expect(bar?.ratio).toBe(0);
  });
});

describe('barScale', () => {
  it('leaves headroom past the planned time', () => {
    expect(barScale([])).toBe(1.25);
    expect(barScale(sectionBars([{ sectionId: 's1', seconds: 120, budgetSeconds: 60, peeks: 0 }], sections))).toBe(2);
  });
});
