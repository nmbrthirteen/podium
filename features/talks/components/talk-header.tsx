import { CalendarIcon, CheckIcon, ClockIcon } from '@/components/ui/icons';
import { MetaChip } from '@/components/ui/meta-chip';
import { PracticeControls } from '@/features/practice/components/practice-controls';
import { formatTime } from '@/lib/dates';
import type { Talk } from '@/lib/db/schema';
import type { NextStep } from '../next-step';
import { TalkMenu } from './talk-menu';

export function TalkHeader({ talk, next }: { talk: Talk; next: NextStep }) {
  const done = talk.completedAt !== null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold text-balance sm:text-4xl">{talk.title}</h1>
        <div className="flex flex-wrap gap-2">
          {done && <MetaChip icon={<CheckIcon size={14} className="text-accent" />}>Done</MetaChip>}
          <MetaChip icon={<CalendarIcon size={14} />}>
            {next.when}, {formatTime(talk.startsAt)}
          </MetaChip>
          <MetaChip icon={<ClockIcon size={14} />}>{talk.lengthMinutes} min</MetaChip>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <PracticeControls talkId={talk.id} talkTitle={talk.title} action={next.action} />
        <TalkMenu talkId={talk.id} title={talk.title} done={done} />
      </div>
    </header>
  );
}
