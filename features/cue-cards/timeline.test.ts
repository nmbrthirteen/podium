import { describe, expect, it } from 'vitest';
import { formatShortMinutes, moveBoundary } from './timeline';

describe('moveBoundary', () => {
  it('moves time between two neighbours in half-minute steps and keeps the total', () => {
    const next = moveBoundary([1, 2, 1], 0, 0.6);
    expect(next).toEqual([1.5, 1.5, 1]);
    expect(next.reduce((sum, value) => sum + value, 0)).toBe(4);
  });

  it('keeps each section at half a minute or more', () => {
    expect(moveBoundary([1, 2, 1], 0, 5)).toEqual([2.5, 0.5, 1]);
    expect(moveBoundary([1, 2, 1], 0, -5)).toEqual([0.5, 2.5, 1]);
  });

  it('returns the same list when nothing changes', () => {
    const minutes = [1, 2, 1];
    expect(moveBoundary(minutes, 0, 0.1)).toBe(minutes);
    expect(moveBoundary(minutes, 2, 1)).toBe(minutes);
    expect(moveBoundary([0.25, 0.5], 0, 1)).toEqual([0.25, 0.5]);
  });

  it('snaps uneven template splits onto the grid', () => {
    expect(moveBoundary([2.33, 2.33, 5.34], 1, 0.3)).toEqual([2.33, 2.5, 5.17]);
  });
});

describe('formatShortMinutes', () => {
  it('rounds to one decimal', () => {
    expect(formatShortMinutes(2.333)).toBe('2.3 min');
    expect(formatShortMinutes(6)).toBe('6 min');
  });
});
