import { describe, expect, it } from 'vitest';
import { buildTalkInput, type CoachTalkDraft } from './talk-from-text';

const base = { id: '7d1c6f7e-3f7a-4c55-9d0e-2a3b4c5d6e7f', today: '2026-09-15', deckTitle: '' };
const now = new Date('2026-09-15T09:00:00');

const coach: CoachTalkDraft = {
  title: 'Two more engineers',
  type: 'exec-update',
  stakes: 'high',
  date: '2026-09-24',
  time: '15:00',
  lengthMinutes: 12,
  goal: 'Approve two engineering hires this quarter.',
  audience: 'The exec team, who think hiring can wait.',
  bigIdea: 'Two engineers now save a quarter of rework.',
  points: [{ text: 'Rework costs us 30 percent', example: 'The billing rebuild' }],
  openingLine: 'Last quarter we rebuilt billing twice.',
  closingLine: 'Approve two hires today and we ship billing once.',
};

describe('buildTalkInput', () => {
  it('uses the coach draft and marks it as a draft', () => {
    const input = buildTalkInput({ ...base, now, text: 'hiring update', coach });
    expect(input).toMatchObject({
      title: 'Two more engineers',
      type: 'exec-update',
      startsAt: '2026-09-24T15:00',
      lengthMinutes: 12,
      stakes: 'high',
      depth: 'deep',
      openingLine: 'Last quarter we rebuilt billing twice.',
    });
    expect(input.fieldSources.bigIdea).toBe('coach-draft');
    expect(input.points).toEqual([{ ...coach.points[0], source: 'coach-draft' }]);
  });

  it('falls back to the text when the coach is unavailable', () => {
    const input = buildTalkInput({ ...base, now, text: 'Board update on Friday at 2pm, 20 minutes', coach: null });
    expect(input).toMatchObject({
      title: 'Board update',
      type: 'exec-update',
      startsAt: '2026-09-18T14:00',
      lengthMinutes: 20,
      stakes: 'high',
      goal: '',
      points: [],
    });
    expect(input.fieldSources.title).toBe('user');
  });

  it('ignores a past or malformed coach date and defaults to tomorrow at 10', () => {
    const input = buildTalkInput({
      ...base,
      now,
      text: 'Weekly sync',
      coach: { ...coach, date: '2026-09-01', time: '25:00', lengthMinutes: 0 },
    });
    expect(input.startsAt).toBe('2026-09-16T10:00');
    expect(input.lengthMinutes).toBe(10);
  });

  it('uses the deck title when nothing else names the talk', () => {
    const input = buildTalkInput({ ...base, now, text: '', coach: null, deckTitle: 'Q3 roadmap' });
    expect(input.title).toBe('Q3 roadmap');
  });
});
