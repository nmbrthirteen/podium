import { wordCount } from '@/lib/utils';

export type RuleAction =
  | { kind: 'focus'; target: string; label: string }
  | { kind: 'open'; panel: 'points' | 'structure' | 'deck'; target?: string; label: string };

export type RuleIssue = { id: string; message: string; action: RuleAction };

export type BriefRuleInput = {
  bigIdea: string;
  openingLine: string;
  closingLine: string;
  points: { id: string; text: string; example: string }[];
};

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function spelled(count: number) {
  return numberWords[count] ?? String(count);
}

const weakOpening =
  /^(thanks|thank you|hi|hello|hey|good (morning|afternoon|evening)|welcome|greetings|my name is|i am [a-z]+ (and|from)|i'm [a-z]+ (and|from)|let me (start|begin) by|(the |our |today's )?agenda|here is (the|our) agenda|here's (the|our) agenda|today (i|we)('ll| will| are going to| am going to)|first,? (i|we)('ll| will))\b/;

const weakClosing = /(thank you|thanks|questions)$/;

export function startsWeak(opening: string) {
  return weakOpening.test(opening.trim().toLowerCase());
}

export function endsWeak(closing: string) {
  const normalized = closing
    .trim()
    .toLowerCase()
    .replace(/[\s.!?,;:'")\]]+$/, '');
  return weakClosing.test(normalized);
}

export function briefRules(input: BriefRuleInput): RuleIssue[] {
  const issues: RuleIssue[] = [];

  const bigIdeaWords = wordCount(input.bigIdea);
  if (bigIdeaWords > 15) {
    issues.push({
      id: 'big-idea-length',
      message: `Your big idea has ${bigIdeaWords} words. Cut it to 15 or fewer.`,
      action: { kind: 'focus', target: 'field-bigIdea', label: 'Edit big idea' },
    });
  }

  if (input.points.length > 3) {
    issues.push({
      id: 'too-many-points',
      message: `You have ${input.points.length} points. Audiences trust 3. Merge or cut ${spelled(input.points.length - 3)}.`,
      action: { kind: 'open', panel: 'points', label: 'Open points' },
    });
  }

  for (const point of input.points) {
    if (point.text.trim() && !point.example.trim()) {
      issues.push({
        id: `point-example-${point.id}`,
        message: 'This point has no example or number.',
        action: { kind: 'focus', target: `point-example-${point.id}`, label: 'Add an example' },
      });
    }
  }

  if (input.openingLine.trim() && startsWeak(input.openingLine)) {
    issues.push({
      id: 'weak-opening',
      message: 'Openings that thank or list an agenda lose attention. Start with a fact, question, or story.',
      action: { kind: 'focus', target: 'field-openingLine', label: 'Edit opening' },
    });
  }

  if (input.closingLine.trim() && endsWeak(input.closingLine)) {
    issues.push({
      id: 'weak-closing',
      message: 'End on your big idea or your ask.',
      action: { kind: 'focus', target: 'field-closingLine', label: 'Edit closing' },
    });
  }

  return issues;
}
