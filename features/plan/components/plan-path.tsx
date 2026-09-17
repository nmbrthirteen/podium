'use client';

import { useState } from 'react';
import { CheckIcon, PlayIcon, StarIcon } from '@/components/ui/icons';
import { PixelLoader } from '@/components/ui/pixel-loader';
import { ProgressRing } from '@/components/ui/progress-ring';
import { useStartSession } from '@/features/practice/use-start-session';
import { formatDay } from '@/lib/dates';
import type { PlanSession, Section } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { initialDay, type PlanDay, planDays } from '../plan-days';
import { sessionKindIcons } from '../session-icons';
import { sessionKindLabels } from '../session-kinds';

type PlanPathProps = { talkId: string; talkDay: string; sessions: PlanSession[]; sections: Section[]; today: string };

export function PlanPath({ talkId, talkDay, sessions, sections, today }: PlanPathProps) {
  const days = planDays(sessions, today, talkDay);
  const [selected, setSelected] = useState(() => initialDay(days, today));
  const current = days.find(day => day.day === selected) ?? days[0];
  const featuredId = current?.sessions.find(session => session.completedRunId === null && current.day <= today)?.id;

  return (
    <div className="flex flex-col gap-6">
      <ol aria-label="Days until the talk" className="-mx-2 flex overflow-x-auto px-2 py-2">
        {days.map((day, index) => (
          <DayNode
            key={day.day}
            day={day}
            first={index === 0}
            selected={day.day === selected}
            today={today}
            onSelect={() => setSelected(day.day)}
          />
        ))}
      </ol>

      {current && (
        <section aria-label={formatDay(current.day, today)}>
          {current.sessions.length === 0 ? (
            <p className="rounded-xl bg-inset px-4 py-6 text-center text-muted">Rest day</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {current.sessions.map(session => (
                <SessionTile
                  key={session.id}
                  talkId={talkId}
                  session={session}
                  sectionTitle={sections.find(item => item.id === session.sectionId)?.title}
                  startable={session.completedRunId === null && current.day <= today}
                  featured={session.id === featuredId}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

type DayNodeProps = {
  day: PlanDay<PlanSession>;
  first: boolean;
  selected: boolean;
  today: string;
  onSelect: () => void;
};

function DayNode({ day, first, selected, today, onSelect }: DayNodeProps) {
  const complete = day.total > 0 && day.done === day.total;
  const label = formatDay(day.day, today);

  return (
    <li className="relative flex min-w-18 flex-1 flex-col items-center">
      {!first && (
        <span
          aria-hidden="true"
          className={cn('absolute top-7.5 right-1/2 h-0.5 w-full', day.isPast || day.isToday ? 'bg-accent' : 'bg-line')}
        />
      )}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${label}${day.isTalkDay ? ', talk day' : ''}: ${day.done} of ${day.total} sessions done`}
        onClick={onSelect}
        className="press relative z-10 flex flex-col items-center gap-2 rounded-xl px-1 py-1"
      >
        <ProgressRing
          value={day.total > 0 ? day.done / day.total : 0}
          size={52}
          stroke={3}
          className={cn(
            'bg-surface',
            selected && 'bg-accent-soft ring-2 ring-accent ring-offset-2 ring-offset-surface',
          )}
        >
          {day.isTalkDay ? (
            <StarIcon size={20} className="text-accent" />
          ) : complete ? (
            <CheckIcon size={20} className="text-accent" />
          ) : (
            <span className={cn('font-semibold tabular-nums', day.isPast ? 'text-muted' : 'text-ink')}>
              {Number(day.day.slice(8))}
            </span>
          )}
        </ProgressRing>
        <span className={cn('text-sm whitespace-nowrap', selected || day.isToday ? 'text-ink' : 'text-muted')}>
          {label}
        </span>
      </button>
    </li>
  );
}

type SessionTileProps = {
  talkId: string;
  session: PlanSession;
  sectionTitle?: string;
  startable: boolean;
  featured: boolean;
};

function SessionTile({ talkId, session, sectionTitle, startable, featured }: SessionTileProps) {
  const { start, pending } = useStartSession(talkId);
  const Icon = sessionKindIcons[session.kind];
  const done = session.completedRunId !== null;
  const title = sectionTitle ? `${sessionKindLabels[session.kind]}: ${sectionTitle}` : sessionKindLabels[session.kind];

  const body = (
    <>
      <span className={cn('flex shrink-0', featured ? 'text-accent-ink' : done ? 'text-accent' : 'text-muted')}>
        {done ? <CheckIcon size={20} /> : <Icon size={20} />}
      </span>
      <span className={cn('min-w-0 flex-1 truncate text-left font-medium', done && 'text-muted line-through')}>
        {title}
      </span>
      <span className={cn('shrink-0 text-sm tabular-nums', featured ? 'text-accent-ink' : 'text-muted')}>
        {session.minutes} min
      </span>
      {startable && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            featured ? 'bg-surface text-accent' : 'bg-inset text-ink',
          )}
        >
          {pending ? <PixelLoader /> : <PlayIcon size={16} className="ml-0.5" />}
        </span>
      )}
    </>
  );

  const tileClass = cn(
    'flex min-h-16 w-full items-center gap-3 rounded-xl px-4',
    featured ? 'bg-accent text-accent-ink' : 'bg-surface shadow-card',
  );

  return (
    <li className={featured ? 'sm:col-span-2' : undefined}>
      {startable ? (
        <button
          type="button"
          aria-busy={pending || undefined}
          disabled={pending}
          onClick={() => start(session.kind, session.sectionId)}
          className={cn(tileClass, 'press')}
        >
          {body}
        </button>
      ) : (
        <div className={tileClass}>{body}</div>
      )}
    </li>
  );
}
