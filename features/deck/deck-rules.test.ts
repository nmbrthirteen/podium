import { describe, expect, it } from 'vitest';
import { deckRules } from './deck-rules';

describe('deckRules', () => {
  it('flags slides over 40 words', () => {
    const issues = deckRules([
      { number: 5, wordCount: 40 },
      { number: 6, wordCount: 58 },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toBe('Slide 6 has 58 words. Dense slides pull you into reading.');
    expect(issues[0]?.action).toEqual({ kind: 'open', panel: 'deck', target: 'slide-6', label: 'Show slide' });
  });
});
