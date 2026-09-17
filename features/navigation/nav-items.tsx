import {
  CalendarIcon,
  CardsIcon,
  ChartIcon,
  DocumentIcon,
  type IconComponent,
  PlayIcon,
  PodiumIcon,
} from '@/components/ui/icons';

export const talkPages: { segment: string; label: string; icon: IconComponent }[] = [
  { segment: 'plan', label: 'Plan', icon: CalendarIcon },
  { segment: 'brief', label: 'Brief', icon: DocumentIcon },
  { segment: 'cards', label: 'Cards', icon: CardsIcon },
  { segment: 'practice', label: 'Practice', icon: PlayIcon },
  { segment: 'present', label: 'Talk day', icon: PodiumIcon },
  { segment: 'debrief', label: 'Debrief', icon: ChartIcon },
];
