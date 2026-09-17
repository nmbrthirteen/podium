import {
  type IconComponent,
  ListCheckIcon,
  PlayIcon,
  PodiumIcon,
  QuestionIcon,
  QuoteIcon,
  RepeatIcon,
  ThoughtIcon,
  UserIcon,
  VideoIcon,
} from '@/components/ui/icons';
import type { SessionKind } from '@/lib/domain';

export const sessionKindIcons: Record<SessionKind, IconComponent> = {
  'full-run': PlayIcon,
  'section-loop': RepeatIcon,
  'open-close-drill': QuoteIcon,
  'mental-walkthrough': ThoughtIcon,
  'recorded-run': VideoIcon,
  'listener-run': UserIcon,
  'qa-drill': QuestionIcon,
  'dress-rehearsal': PodiumIcon,
  'talk-day-checklist': ListCheckIcon,
};
