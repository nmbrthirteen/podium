import { describe, expect, it } from 'vitest';
import { formatShortDate, formatWhen } from './dates';

describe('formatShortDate', () => {
  it('renders the month and day', () => {
    expect(formatShortDate('2026-09-17')).toBe('Sep 17');
    expect(formatShortDate('2026-01-01')).toBe('Jan 1');
  });
});

describe('formatWhen', () => {
  it('combines the relative day and the time', () => {
    expect(formatWhen('2026-09-17T14:30:00', '2026-09-17')).toBe('Today, 2:30 pm');
    expect(formatWhen('2026-09-20T09:00:00', '2026-09-17')).toBe('Sunday, 9 am');
    expect(formatWhen('2026-10-01T00:00:00', '2026-09-17')).toBe('Oct 1, 12 am');
  });
});
