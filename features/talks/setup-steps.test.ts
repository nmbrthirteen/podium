import { describe, expect, it } from 'vitest';
import { currentStep, setupStepsFor } from './setup-steps';

describe('setupStepsFor', () => {
  it('starts with slides already done when a deck exists', () => {
    const steps = setupStepsFor({ hasDeck: true, seen: [], runs: 0 });
    expect(steps).toEqual([
      { id: 'slides', done: true },
      { id: 'brief', done: false },
      { id: 'cards', done: false },
      { id: 'run', done: false },
    ]);
    expect(currentStep(steps)).toBe('brief');
  });

  it('skips the slides step without a deck', () => {
    const steps = setupStepsFor({ hasDeck: false, seen: ['brief'], runs: 0 });
    expect(steps.map(step => step.id)).toEqual(['brief', 'cards', 'run']);
    expect(currentStep(steps)).toBe('cards');
  });

  it('points at the first run once brief and cards are seen', () => {
    expect(currentStep(setupStepsFor({ hasDeck: false, seen: ['cards', 'brief'], runs: 0 }))).toBe('run');
  });

  it('finishes after a first run', () => {
    expect(currentStep(setupStepsFor({ hasDeck: true, seen: ['brief', 'cards'], runs: 1 }))).toBeNull();
  });
});
