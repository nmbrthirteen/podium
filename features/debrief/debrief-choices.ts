import {
  ArrowRightIcon,
  ClockIcon,
  EyeIcon,
  FlagIcon,
  GaugeIcon,
  type IconComponent,
  QuestionIcon,
  QuoteIcon,
  WaveIcon,
} from '@/components/ui/icons';

export type DebriefValues = { excelled: string; workOn: string; challenge: string };
export type DebriefScope = 'run' | 'talk';

const wentWell = [
  'A strong opening',
  'Keeping to time',
  'Few peeks',
  'Clear transitions',
  'A calm pace',
  'A strong close',
];
const workOn = ['The opening line', 'Transitions', 'Pace', 'The close', 'Filler words', 'Keeping to time'];

export const choiceIcons: Record<string, IconComponent> = {
  'A strong opening': QuoteIcon,
  'Keeping to time': ClockIcon,
  'Few peeks': EyeIcon,
  'Clear transitions': ArrowRightIcon,
  'A calm pace': GaugeIcon,
  'A strong close': FlagIcon,
  'The opening line': QuoteIcon,
  Transitions: ArrowRightIcon,
  Pace: GaugeIcon,
  'The close': FlagIcon,
  'Filler words': WaveIcon,
  'Answering questions': QuestionIcon,
};

export const challengeFor: Record<string, string> = {
  'The opening line': 'Say the opening from memory',
  Transitions: 'Pause before each point',
  Pace: 'Slow down in the first minute',
  'The close': 'Say the close from memory',
  'Filler words': 'Pause where a filler word would go',
  'Keeping to time': 'Finish 30 seconds early',
  'Answering questions': 'Answer each question with one example',
};

export function workOnChoices(scope: DebriefScope) {
  return scope === 'talk' ? [...workOn, 'Answering questions'] : workOn;
}

export function wentWellChoices(scope: DebriefScope) {
  return scope === 'talk' ? [...wentWell, 'Answering questions'] : wentWell;
}

export function joinNote(choice: string, note: string) {
  const trimmed = note.trim();
  if (!choice) return trimmed;
  return trimmed ? `${choice}. ${trimmed}` : choice;
}

export function splitNote(value: string, choices: string[]) {
  const choice = choices.find(option => value === option || value.startsWith(`${option}. `));
  if (!choice) return { choice: '', note: value };
  return { choice, note: value.slice(choice.length).replace(/^\.\s*/, '') };
}

export const withCurrent = (options: string[], value: string) =>
  value && !options.includes(value) ? [...options, value] : options;
