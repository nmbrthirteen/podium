import { describe, expect, it } from 'vitest';
import { parseDate, parseLength, parseTalkText, parseTime, titleFromText } from './parse-talk-text';

const today = '2026-09-15';

describe('parseTalkText', () => {
  it('reads an exec update with day, time, and length', () => {
    expect(parseTalkText('Hiring update for the exec team tomorrow at 2pm, 10 minutes.', today)).toEqual({
      title: 'Hiring update for the exec team',
      date: '2026-09-16',
      time: '14:00',
      lengthMinutes: 10,
      type: 'exec-update',
      stakes: null,
    });
  });

  it('reads a pitch on a weekday', () => {
    const parsed = parseTalkText('Pitch to investors on Thursday 3:30 pm, 20 min', today);
    expect(parsed).toMatchObject({ date: '2026-09-17', time: '15:30', lengthMinutes: 20, type: 'pitch' });
    expect(parsed.stakes).toBe('high');
  });

  it('strips lead-ins and the when from the title', () => {
    const parsed = parseTalkText("I'm presenting the Q3 roadmap to the board on Friday at 9", today);
    expect(parsed).toMatchObject({ title: 'Q3 roadmap to the board', date: '2026-09-18', time: '09:00' });
  });

  it('keeps a plain title and leaves unknowns empty', () => {
    expect(parseTalkText('Keyboard run', today)).toEqual({
      title: 'Keyboard run',
      date: null,
      time: null,
      lengthMinutes: null,
      type: null,
      stakes: null,
    });
  });
});

describe('parseLength', () => {
  it('reads hours, minutes, and phrases', () => {
    expect(parseLength('a 45-minute talk')).toBe(45);
    expect(parseLength('1 hour 30 minutes')).toBe(90);
    expect(parseLength('half an hour')).toBe(30);
    expect(parseLength('an hour')).toBe(60);
    expect(parseLength('at 2pm')).toBeNull();
  });
});

describe('parseTime', () => {
  it('reads 12 and 24 hour times', () => {
    expect(parseTime('at 12am')).toBe('00:00');
    expect(parseTime('14:15')).toBe('14:15');
    expect(parseTime('at 3')).toBe('15:00');
    expect(parseTime('in the morning')).toBe('09:00');
    expect(parseTime('for 10 minutes')).toBeNull();
  });
});

describe('parseDate', () => {
  it('reads month names and rolls past dates into next year', () => {
    expect(parseDate('Conference talk on Oct 3', today)).toBe('2026-10-03');
    expect(parseDate('3rd of October', today)).toBe('2026-10-03');
    expect(parseDate('Lecture on Sep 1', today)).toBe('2027-09-01');
  });

  it('reads relative days', () => {
    expect(parseDate('in 3 days', today)).toBe('2026-09-18');
    expect(parseDate('next week', today)).toBe('2026-09-22');
    expect(parseDate('tuesday', today)).toBe('2026-09-22');
    expect(parseDate('no day given', today)).toBeNull();
  });
});

describe('titleFromText', () => {
  it('caps long titles at a word boundary', () => {
    const title = titleFromText('word '.repeat(30));
    expect(title.length).toBeLessThanOrEqual(80);
    expect(title.endsWith(' ')).toBe(false);
  });
});
