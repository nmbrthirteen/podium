import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { ArrowRightIcon, ChartIcon, CheckIcon, FlagIcon, QuestionIcon } from '@/components/ui/icons';
import { cn, pluralize } from '@/lib/utils';
import type { DebriefValues } from '../debrief-choices';
import type { ReceivedQuestion } from './received-questions';

const levels = [1, 2, 3, 4, 5];

type DebriefSummaryProps = {
  talkTypeLabel: string;
  values: DebriefValues;
  confidence: number | null;
  items: ReceivedQuestion[];
  done: boolean;
  pending: boolean;
  onEdit: () => void;
  onMarkDone: () => void;
};

export function DebriefSummary({
  talkTypeLabel,
  values,
  confidence,
  items,
  done,
  pending,
  onEdit,
  onMarkDone,
}: DebriefSummaryProps) {
  const surprised = items.filter(item => item.surprised).length;

  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="summary-heading" className="font-display text-2xl font-semibold">
          How your talk went
        </h2>
        <Button variant="quiet" size="sm" onClick={onEdit}>
          Edit debrief
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <SummaryTile icon={<ChartIcon size={20} />} label="Confidence">
          <span className="flex items-end gap-1.5" aria-hidden="true">
            {levels.map(level => (
              <span
                key={level}
                className={cn('w-5 rounded-sm', confidence !== null && level <= confidence ? 'bg-accent' : 'bg-line')}
                style={{ height: `${7 + level * 5}px` }}
              />
            ))}
          </span>
          <span className="font-display text-2xl font-semibold tabular-nums">{confidence ?? 0} of 5</span>
        </SummaryTile>
        <SummaryTile icon={<CheckIcon size={20} />} label="Went well">
          <span className="font-display text-xl font-semibold">{values.excelled || 'Nothing picked'}</span>
        </SummaryTile>
        <SummaryTile icon={<FlagIcon size={20} />} label="Work on next">
          <span className="font-display text-xl font-semibold">{values.workOn || 'Nothing picked'}</span>
          {values.challenge && <span className="text-sm text-muted">Next time: {values.challenge}</span>}
        </SummaryTile>
        <SummaryTile icon={<QuestionIcon size={20} />} label="Audience questions">
          <span className="font-display text-xl font-semibold">{pluralize(items.length, 'question')}</span>
          {surprised > 0 && (
            <span className="text-sm text-muted">
              {surprised} surprising, added to the drill for your next {talkTypeLabel.toLowerCase()}
            </span>
          )}
        </SummaryTile>
      </ul>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-inset p-5">
        {done ? (
          <>
            <span className="flex items-center gap-2 font-medium">
              <CheckIcon size={18} className="text-accent" />
              Talk marked done
            </span>
            <Link href="/talks/new" className={buttonVariants({ variant: 'primary', className: 'ml-auto pr-3.5' })}>
              Plan your next talk
              <ArrowRightIcon size={16} />
            </Link>
          </>
        ) : (
          <>
            <span className="font-medium">All wrapped up?</span>
            <Button
              variant="primary"
              className="ml-auto"
              pending={pending}
              pendingLabel="Marking done"
              onClick={onMarkDone}
            >
              <CheckIcon size={16} />
              Mark talk as done
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function SummaryTile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-card">
      <span className="flex items-center gap-2 text-sm text-muted">
        <IconBadge size="8" tone="soft">
          {icon}
        </IconBadge>
        {label}
      </span>
      <span className="flex flex-col gap-2">{children}</span>
    </li>
  );
}
