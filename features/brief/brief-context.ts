import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import type { Talk } from '@/lib/db/schema';

type BriefValues = { goal: string; audience: string; bigIdea: string; openingLine: string; closingLine: string };

export function toBriefContext(
  talk: Pick<Talk, 'title' | 'type' | 'lengthMinutes'>,
  values: BriefValues,
  points: { text: string; example: string }[],
): BriefContext {
  return {
    title: talk.title,
    type: talk.type,
    lengthMinutes: talk.lengthMinutes,
    goal: values.goal,
    audience: values.audience,
    bigIdea: values.bigIdea,
    openingLine: values.openingLine,
    closingLine: values.closingLine,
    points: points.filter(point => point.text.trim()).map(point => ({ text: point.text, example: point.example })),
  };
}

export const defaultRecoveryLine = 'Let me come back to the one thing I want you to remember.';

export function focusTarget(target: string) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (!element) return;
      element.scrollIntoView({ block: 'center' });
      element.focus({ preventScroll: true });
    }),
  );
}
