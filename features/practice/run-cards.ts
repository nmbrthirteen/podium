import type { CardSection } from '@/features/cue-cards/card-section';
import type { SessionKind } from '@/lib/domain';

export type RunCard = CardSection & { holdsVerbatim: boolean };

export const fallbackListenerQuestions = [
  'Which point were you least sure about?',
  'What would you cut if you had half the time?',
  'What should I do differently after hearing this?',
];

export function runCards(
  kind: SessionKind,
  sections: CardSection[],
  sectionId: string | null,
  brief: { openingLine: string; closingLine: string },
): RunCard[] {
  const lastIndex = sections.length - 1;
  const cards = sections.map((section, index) => {
    const holdsVerbatim = index === 0 || index === lastIndex;
    const briefLine = index === 0 ? brief.openingLine : index === lastIndex ? brief.closingLine : '';
    return {
      id: section.id,
      title: section.title,
      minutes: section.minutes,
      keywords: section.keywords,
      slideNumbers: section.slideNumbers,
      verbatim: holdsVerbatim ? section.verbatim || briefLine : '',
      holdsVerbatim,
    };
  });

  if (kind === 'section-loop') {
    const match = cards.find(card => card.id === sectionId) ?? cards[0];
    return match ? [match] : [];
  }
  if (kind === 'open-close-drill') {
    const first = cards[0];
    const last = cards.at(-1);
    if (!first || !last) return [];
    return first.id === last.id ? [first] : [first, last];
  }
  return cards;
}
