import { describe, expect, it } from 'vitest';
import { breathPhaseAt, cycleSeconds } from './breathing';

describe('breathing patterns', () => {
  it('runs box breathing at 4-4-4-4', () => {
    expect(cycleSeconds('box')).toBe(16);
    expect(breathPhaseAt('box', 0)).toEqual({ label: 'Breathe in', secondsLeft: 4 });
    expect(breathPhaseAt('box', 5)).toEqual({ label: 'Hold', secondsLeft: 3 });
    expect(breathPhaseAt('box', 9.5)).toEqual({ label: 'Breathe out', secondsLeft: 3 });
    expect(breathPhaseAt('box', 15.2)).toEqual({ label: 'Hold', secondsLeft: 1 });
    expect(breathPhaseAt('box', 16)).toEqual({ label: 'Breathe in', secondsLeft: 4 });
  });

  it('runs slow breathing at 6 breaths per minute', () => {
    expect(60 / cycleSeconds('slow')).toBe(6);
    expect(breathPhaseAt('slow', 2)).toEqual({ label: 'Breathe in', secondsLeft: 3 });
    expect(breathPhaseAt('slow', 7)).toEqual({ label: 'Breathe out', secondsLeft: 3 });
  });

  it('fits whole cycles into 2 and 5 minute sessions', () => {
    for (const minutes of [2, 5]) {
      expect((minutes * 60) % cycleSeconds('slow')).toBe(0);
      expect(Math.floor((minutes * 60) / cycleSeconds('box'))).toBeGreaterThan(0);
    }
  });
});
