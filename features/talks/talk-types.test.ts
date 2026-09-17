import { describe, expect, it } from 'vitest';
import { talkTypes } from '@/lib/db/schema';
import { scaleTemplate, talkTemplates } from './talk-types';

const lengths = [2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60, 90];

describe('scaleTemplate', () => {
  for (const type of talkTypes) {
    if (type === 'interview-panel') continue;
    for (const length of lengths) {
      it(`${type} sums to ${length} minutes`, () => {
        const sections = scaleTemplate(type, length);
        const total = sections.reduce((sum, section) => sum + section.minutes, 0);
        expect(total).toBeCloseTo(length, 5);
        expect(sections).toHaveLength(talkTemplates[type].length);
        expect(sections.every(section => section.minutes > 0)).toBe(true);
      });
    }
  }

  it('keeps the default split for a 10 minute exec update', () => {
    expect(scaleTemplate('exec-update', 10).map(section => section.minutes)).toEqual([1, 1, 6, 2]);
  });

  it('returns no sections for an interview or panel', () => {
    expect(scaleTemplate('interview-panel', 30)).toEqual([]);
  });
});
