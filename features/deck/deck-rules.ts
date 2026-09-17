import type { RuleIssue } from '@/features/brief/rules';

export type DeckRuleInput = { number: number; wordCount: number }[];

export function deckRules(slides: DeckRuleInput): RuleIssue[] {
  return slides
    .filter(slide => slide.wordCount > 40)
    .map(slide => ({
      id: `dense-slide-${slide.number}`,
      message: `Slide ${slide.number} has ${slide.wordCount} words. Dense slides pull you into reading.`,
      action: { kind: 'open', panel: 'deck', target: `slide-${slide.number}`, label: 'Show slide' },
    }));
}
