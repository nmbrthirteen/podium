import { describe, expect, it } from 'vitest';
import { countdownText, daysAwayShort, daysAwayText, talkPhase } from './talk-phase';

const at = (value: string) => new Date(`${value}:00`);

describe('talkPhase', () => {
  it('is before on earlier days', () => {
    expect(talkPhase('2026-09-18T10:00', 10, at('2026-09-16T09:00'))).toBe('before');
  });

  it('is talk day from midnight until the talk ends', () => {
    expect(talkPhase('2026-09-18T10:00', 10, at('2026-09-18T00:05'))).toBe('talk-day');
    expect(talkPhase('2026-09-18T10:00', 10, at('2026-09-18T10:09'))).toBe('talk-day');
  });

  it('is after once the talk ends', () => {
    expect(talkPhase('2026-09-18T10:00', 10, at('2026-09-18T10:10'))).toBe('after');
    expect(talkPhase('2026-09-18T10:00', 10, at('2026-09-19T08:00'))).toBe('after');
  });
});

describe('countdownText', () => {
  it('counts down in the largest whole unit', () => {
    expect(countdownText('2026-09-18T10:00', at('2026-09-16T10:00'))).toBe('In 2 days');
    expect(countdownText('2026-09-18T10:00', at('2026-09-18T07:00'))).toBe('In 3 hours');
    expect(countdownText('2026-09-18T10:00', at('2026-09-18T09:59'))).toBe('In 1 minute');
    expect(countdownText('2026-09-18T10:00', at('2026-09-18T10:02'))).toBe('Starting now');
  });
});

describe('daysAwayText', () => {
  it('describes days left as a sentence fragment', () => {
    expect(daysAwayText(-1)).toBe('Talk given');
    expect(daysAwayText(0)).toBe('Talk today');
    expect(daysAwayText(1)).toBe('1 day to go');
    expect(daysAwayText(9)).toBe('9 days to go');
  });
});

describe('daysAwayShort', () => {
  it('shortens the days left', () => {
    expect(daysAwayShort(-1)).toBe('Past');
    expect(daysAwayShort(0)).toBe('Today');
    expect(daysAwayShort(9)).toBe('9d');
  });
});
