import type { SessionKind } from '@/lib/domain';

export const sessionKindLabels: Record<SessionKind, string> = {
  'full-run': 'Full run',
  'section-loop': 'Section loop',
  'open-close-drill': 'Open and close drill',
  'mental-walkthrough': 'Mental walkthrough',
  'recorded-run': 'Recorded run',
  'listener-run': 'Listener run',
  'qa-drill': 'Q&A drill',
  'dress-rehearsal': 'Dress rehearsal',
  'talk-day-checklist': 'Talk-day routine',
};

export const sessionKindHints: Record<SessionKind, string> = {
  'full-run': 'Speak the whole talk out loud with notes hidden.',
  'section-loop': 'Repeat one section until it flows.',
  'open-close-drill': 'Say your opening and closing lines from memory.',
  'mental-walkthrough': 'Walk through each section in your head.',
  'recorded-run': 'Record a run, then watch it as a stranger would.',
  'listener-run': 'Give the talk to one person and take their questions.',
  'qa-drill': 'Answer the hardest questions out loud.',
  'dress-rehearsal': 'Run the talk in live mode, as on the day.',
  'talk-day-checklist': 'Warm up and check the room before you speak.',
};

export function sentenceLabel(kind: SessionKind) {
  const label = sessionKindLabels[kind];
  return label.startsWith('Q&A') ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

export function inSentence(title: string) {
  const second = title.charAt(1);
  return second && second === second.toLowerCase() ? title.charAt(0).toLowerCase() + title.slice(1) : title;
}

export function sessionMinutes(kind: SessionKind, lengthMinutes: number, sectionMinutes = 0) {
  switch (kind) {
    case 'full-run':
      return Math.ceil(lengthMinutes * 1.2);
    case 'section-loop':
      return Math.ceil(sectionMinutes * 3);
    case 'open-close-drill':
    case 'mental-walkthrough':
      return 5;
    case 'recorded-run':
    case 'listener-run':
    case 'dress-rehearsal':
      return lengthMinutes + 10;
    case 'qa-drill':
      return 15;
    case 'talk-day-checklist':
      return 30;
  }
}
