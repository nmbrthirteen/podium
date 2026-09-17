'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState, useTransition } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { ArrowRightIcon, CheckIcon, ListCheckIcon, PodiumIcon, WaveIcon } from '@/components/ui/icons';
import { Sheet } from '@/components/ui/sheet';
import { useStoredState } from '@/hooks/use-stored-state';
import { cn } from '@/lib/utils';
import { completeChecklist } from '../actions';
import { BreathingTimer } from './breathing-timer';
import { type CheckId, checkIds, TalkDayChecklist } from './talk-day-checklist';

const routineSchema = z.object({ breathed: z.boolean(), checks: z.array(z.enum(checkIds)) });
type Routine = z.infer<typeof routineSchema>;

type TalkDayFlowProps = {
  talkId: string;
  talkDay: string;
  isTalkDay: boolean;
  sessionId: string | null;
  completed: boolean;
  openingLine: string;
  closingLine: string;
  bigIdea: string;
};

export function TalkDayFlow({
  talkId,
  talkDay,
  isTalkDay,
  sessionId,
  completed,
  openingLine,
  closingLine,
  bigIdea,
}: TalkDayFlowProps) {
  const fallback: Routine = completed ? { breathed: true, checks: [...checkIds] } : { breathed: false, checks: [] };
  const [routine, setRoutine] = useStoredState(`talk-day:${talkId}:${talkDay}`, fallback, routineSchema);
  const [open, setOpen] = useState<'breathe' | 'check' | null>(null);
  const [, startTransition] = useTransition();
  const recorded = useRef(completed);

  const checked = routine.checks.length === checkIds.length;
  const ready = routine.breathed && checked;
  const current = !routine.breathed ? 'breathe' : !checked ? 'check' : 'live';

  useEffect(() => {
    if (!ready || !isTalkDay || recorded.current) return;
    recorded.current = true;
    startTransition(async () => {
      await completeChecklist(talkId, sessionId);
    });
  }, [ready, isTalkDay, talkId, sessionId]);

  const toggle = (id: CheckId, value: boolean) =>
    setRoutine({
      ...routine,
      checks: value ? [...new Set([...routine.checks, id])] : routine.checks.filter(item => item !== id),
    });

  return (
    <>
      <ol className="grid gap-3 sm:grid-cols-3">
        <StepTile
          index={1}
          icon={<WaveIcon size={22} />}
          label="Calm your nerves"
          meta="2 minutes of breathing"
          done={routine.breathed}
          current={current === 'breathe'}
          onClick={() => setOpen('breathe')}
        />
        <StepTile
          index={2}
          icon={<ListCheckIcon size={22} />}
          label="Final check"
          meta={`${routine.checks.length} of ${checkIds.length} done`}
          done={checked}
          current={current === 'check'}
          onClick={() => setOpen('check')}
        />
        <li>
          <Link
            href={`/talks/${talkId}/present/live`}
            className={cn(
              'press flex h-full min-h-40 flex-col justify-between gap-4 rounded-2xl p-5 transition-colors',
              current === 'live' ? 'bg-accent text-accent-ink' : 'bg-surface shadow-card hover:bg-inset',
            )}
          >
            <span className="flex items-center justify-between">
              <StepIcon icon={<PodiumIcon size={22} />} highlighted={current === 'live'} />
              <ArrowRightIcon size={20} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-display text-xl font-semibold">
                <span className="sr-only">Step 3: </span>Go live
              </span>
              <span className={cn('text-sm', current === 'live' ? 'opacity-80' : 'text-muted')}>
                Your cards, full screen
              </span>
            </span>
          </Link>
        </li>
      </ol>

      <Sheet open={open === 'breathe'} onOpenChange={next => setOpen(next ? 'breathe' : null)} title="Calm your nerves">
        <div className="flex flex-col gap-4">
          <BreathingTimer />
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setRoutine({ ...routine, breathed: true });
              setOpen(null);
            }}
          >
            <CheckIcon size={18} />I feel calmer
          </Button>
        </div>
      </Sheet>

      <Sheet open={open === 'check'} onOpenChange={next => setOpen(next ? 'check' : null)} title="Final check">
        <div className="flex flex-col gap-4">
          <TalkDayChecklist
            done={routine.checks}
            onToggle={toggle}
            openingLine={openingLine}
            closingLine={closingLine}
            bigIdea={bigIdea}
          />
          <Button variant={checked ? 'primary' : 'secondary'} size="lg" onClick={() => setOpen(null)}>
            {checked ? 'Ready to go live' : 'Close'}
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function StepIcon({ icon, highlighted, done = false }: { icon: ReactNode; highlighted: boolean; done?: boolean }) {
  return (
    <IconBadge size="11" tone={highlighted ? 'on-accent' : 'soft'}>
      {done ? <CheckIcon size={20} /> : icon}
    </IconBadge>
  );
}

type StepTileProps = {
  index: number;
  icon: ReactNode;
  label: string;
  meta: string;
  done: boolean;
  current: boolean;
  onClick: () => void;
};

function StepTile({ index, icon, label, meta, done, current, onClick }: StepTileProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'press flex h-full min-h-40 w-full flex-col justify-between gap-4 rounded-2xl p-5 text-left transition-colors',
          current ? 'bg-accent text-accent-ink' : 'bg-surface shadow-card hover:bg-inset',
        )}
      >
        <span className="flex items-center justify-between">
          <StepIcon icon={icon} highlighted={current} done={done} />
          <span className={cn('text-sm tabular-nums', current ? 'opacity-80' : 'text-muted')}>{index}</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className={cn('font-display text-xl font-semibold', done && !current && 'text-muted')}>
            <span className="sr-only">Step {index}: </span>
            {label}
          </span>
          <span className={cn('text-sm', current ? 'opacity-80' : 'text-muted')}>{done ? 'Done' : meta}</span>
        </span>
      </button>
    </li>
  );
}
