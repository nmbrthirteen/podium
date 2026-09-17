import type { SessionPick } from '@/features/plan/pick-session';
import { inSentence, sentenceLabel } from '@/features/plan/session-kinds';
import type { SectionTiming } from '@/lib/domain';
import { formatClock, pluralize } from '@/lib/utils';
import { runTotals } from './runs';

export type SummarySection = { id: string; title: string };

export function nextStepText(pick: SessionPick, sections: SummarySection[]) {
  const section = sections.find(item => item.id === pick.sectionId);
  if (pick.kind === 'section-loop' && section) return `loop ${inSentence(section.title)}`;
  return sentenceLabel(pick.kind);
}

export function summarizeRun(timings: SectionTiming[], sections: SummarySection[], next: SessionPick) {
  const { peeks } = runTotals(timings);
  const peekText = peeks === 0 ? 'No peeks' : pluralize(peeks, 'peek');

  const worst = timings
    .map(timing => ({ timing, over: timing.seconds - timing.budgetSeconds }))
    .filter(item => item.over >= 1)
    .sort((a, b) => b.over - a.over)[0];
  const section = sections.find(item => item.id === worst?.timing.sectionId);
  const overText = worst && section ? `${formatClock(worst.over)} over in ${inSentence(section.title)}` : 'on time';

  return `${peekText}, ${overText}. Next: ${nextStepText(next, sections)}.`;
}
