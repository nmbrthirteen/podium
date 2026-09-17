import Link from 'next/link';
import { CheckIcon, PlayIcon } from '@/components/ui/icons';
import { MetaChip } from '@/components/ui/meta-chip';
import { ProgressRing } from '@/components/ui/progress-ring';
import { PracticeControls } from '@/features/practice/components/practice-controls';
import type { TalkSummary } from '../queries';
import { daysAwayText } from '../talk-phase';
import { TalkMenu } from './talk-menu';

export function TalkList({ talks }: { talks: TalkSummary[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2" aria-label="Talks">
      {talks.map(talk => (
        <li key={talk.id} className="flex flex-col justify-between gap-5 rounded-2xl bg-surface p-5 shadow-card">
          <Link href={`/talks/${talk.id}/plan`} className="group flex min-w-0 items-start gap-4">
            <ProgressRing
              value={talk.sessionsTotal > 0 ? talk.sessionsDone / talk.sessionsTotal : 0}
              size={56}
              stroke={4}
              label={`${daysAwayText(talk.daysAway)}. ${talk.sessionsDone} of ${talk.sessionsTotal} sessions done.`}
            >
              {talk.daysAway < 0 ? (
                <CheckIcon size={22} className="text-accent" />
              ) : talk.daysAway === 0 ? (
                <span className="text-sm font-semibold">Today</span>
              ) : (
                <span className="flex flex-col items-center leading-none">
                  <span className="font-display text-lg font-semibold tabular-nums">{talk.daysAway}</span>
                  <span className="text-xs text-muted">{talk.daysAway === 1 ? 'day' : 'days'}</span>
                </span>
              )}
            </ProgressRing>
            <span className="flex min-w-0 flex-col gap-2.5 pt-1">
              <span className="font-display text-lg leading-snug font-semibold text-balance group-hover:underline">
                {talk.title}
              </span>
              <span className="flex flex-wrap gap-2">
                <MetaChip icon={<PlayIcon size={12} />}>{talk.next.task}</MetaChip>
              </span>
            </span>
          </Link>
          <div className="flex items-center justify-between gap-2">
            <PracticeControls talkId={talk.id} talkTitle={talk.title} action={talk.next.action} />
            <TalkMenu talkId={talk.id} title={talk.title} done={talk.done} />
          </div>
        </li>
      ))}
    </ul>
  );
}
