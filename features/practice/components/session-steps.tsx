import { IconBadge } from '@/components/ui/icon-badge';
import {
  CardsIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  FlagIcon,
  type IconComponent,
  ListCheckIcon,
  MicIcon,
  PodiumIcon,
  QuestionIcon,
  QuoteIcon,
  RepeatIcon,
  SparkIcon,
  ThoughtIcon,
  UserIcon,
  VideoIcon,
  WaveIcon,
} from '@/components/ui/icons';
import type { SessionKind } from '@/lib/domain';
import { cn } from '@/lib/utils';

type SessionStep = { icon: IconComponent; label: string };

const sessionSteps: Record<SessionKind, SessionStep[]> = {
  'full-run': [
    { icon: MicIcon, label: 'Stand up, speak out loud' },
    { icon: CardsIcon, label: 'Tap through your cards' },
    { icon: ChartIcon, label: 'See your time and peeks' },
  ],
  'section-loop': [
    { icon: MicIcon, label: 'Say one section' },
    { icon: ClockIcon, label: 'Stay inside its time' },
    { icon: RepeatIcon, label: 'Repeat until it flows' },
  ],
  'open-close-drill': [
    { icon: QuoteIcon, label: 'Say your opening' },
    { icon: FlagIcon, label: 'Say your close' },
    { icon: EyeIcon, label: 'No peeking' },
  ],
  'mental-walkthrough': [
    { icon: ThoughtIcon, label: 'Picture the room' },
    { icon: CardsIcon, label: 'Walk each card in your head' },
    { icon: CheckIcon, label: 'Note where you stall' },
  ],
  'recorded-run': [
    { icon: VideoIcon, label: 'Record yourself' },
    { icon: MicIcon, label: 'Give the whole talk' },
    { icon: EyeIcon, label: 'Watch it back' },
  ],
  'listener-run': [
    { icon: UserIcon, label: 'Find one listener' },
    { icon: MicIcon, label: 'Give the whole talk' },
    { icon: QuestionIcon, label: 'Take their questions' },
  ],
  'qa-drill': [
    { icon: QuestionIcon, label: 'Hear a hard question' },
    { icon: MicIcon, label: 'Answer out loud' },
    { icon: SparkIcon, label: 'Get coach feedback' },
  ],
  'dress-rehearsal': [
    { icon: PodiumIcon, label: 'Open live mode' },
    { icon: MicIcon, label: 'Give it as on the day' },
    { icon: ChartIcon, label: 'Rate how it went' },
  ],
  'talk-day-checklist': [
    { icon: WaveIcon, label: 'Calm your nerves' },
    { icon: ListCheckIcon, label: 'Final check' },
    { icon: PodiumIcon, label: 'Go live' },
  ],
};

export function SessionSteps({ kind, className }: { kind: SessionKind; className?: string }) {
  return (
    <ol aria-label="How it works" className={cn('grid gap-2 sm:grid-cols-3', className)}>
      {sessionSteps[kind].map((step, index) => (
        <li key={step.label} className="flex items-center gap-3 rounded-xl bg-accent-ink/10 px-3 py-2.5">
          <IconBadge size="8" tone="on-accent">
            <step.icon size={16} />
          </IconBadge>
          <span className="text-sm font-medium">
            <span className="sr-only">Step {index + 1}: </span>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
