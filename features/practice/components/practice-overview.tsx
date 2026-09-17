import Link from 'next/link';
import { IconBadge } from '@/components/ui/icon-badge';
import { CalendarIcon, EyeIcon, PlayIcon } from '@/components/ui/icons';
import { ProgressRing } from '@/components/ui/progress-ring';
import { StatTile } from '@/components/ui/stat-tile';
import { Tag } from '@/components/ui/tag';
import type { SessionPick } from '@/features/plan/pick-session';
import { sessionKindIcons } from '@/features/plan/session-icons';
import { sessionKindHints, sessionKindLabels } from '@/features/plan/session-kinds';
import { talkProgress } from '@/features/progress/progress';
import type { TalkBundle } from '@/features/talks/queries';
import { countdownText } from '@/features/talks/talk-phase';
import { formatDay, formatWhen } from '@/lib/dates';
import { cn, formatClock, pluralize } from '@/lib/utils';
import type { StoredFocus } from '../next-focus';
import { sectionBars } from '../run-chart';
import { endedRuns, runTotals } from '../runs';
import { FocusHint } from './focus-hint';
import { PracticeModes } from './practice-modes';
import { RunStrip } from './run-chart';
import { SessionSteps } from './session-steps';
import { StartSessionButton } from './start-session-button';

type PracticeOverviewProps = {
  bundle: TalkBundle;
  pick: SessionPick;
  focus: StoredFocus | null;
  today: string;
  now: Date;
};

export function PracticeOverview({ bundle, pick, focus, today, now }: PracticeOverviewProps) {
  const talkId = bundle.talk.id;
  const section = bundle.sections.find(item => item.id === pick.sectionId);
  const NextIcon = sessionKindIcons[pick.kind];
  const recent = endedRuns(bundle.runs).reverse().slice(0, 8);
  const progress = talkProgress(bundle.runs);
  const sessionsDone = bundle.sessions.filter(session => session.completedRunId !== null).length;
  const sessionsTotal = bundle.sessions.length;
  const lastRun = progress.lastRun;
  const lastOver = lastRun !== null && lastRun.seconds - lastRun.budgetSeconds >= 1;

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="next-heading"
        className="flex flex-col gap-6 rounded-2xl bg-accent p-6 text-accent-ink sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 id="next-heading" className="text-sm font-medium opacity-80">
              {recent.length === 0 ? 'Start here' : 'Up next'}
            </h2>
            <p className="flex items-center gap-3 font-display text-2xl font-semibold text-balance sm:text-3xl">
              <NextIcon size={28} className="shrink-0" />
              {sessionKindLabels[pick.kind]}
              {section ? `: ${section.title}` : ''}
            </p>
            <p className="opacity-80">{sessionKindHints[pick.kind]}</p>
          </div>
          <StartSessionButton
            talkId={talkId}
            label={`Start, ${pick.minutes} min`}
            variant="secondary"
            size="lg"
            className="shadow-none"
          />
        </div>
        <SessionSteps kind={pick.kind} />
      </section>

      {focus && <FocusHint talkId={talkId} focus={focus.focus} reason={focus.reason} kind={focus.kind} />}

      <section aria-label="Readiness" className="grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={
            <ProgressRing
              value={sessionsTotal === 0 ? 0 : sessionsDone / sessionsTotal}
              size={52}
              stroke={5}
              label={`${sessionsDone} of ${sessionsTotal} planned sessions done`}
            >
              <span className="text-sm font-semibold tabular-nums">{sessionsDone}</span>
            </ProgressRing>
          }
          title={
            <span className="font-medium">
              {sessionsDone} of {pluralize(sessionsTotal, 'session')}
            </span>
          }
          detail={
            <Link href={`/talks/${talkId}/plan`} className="text-sm text-muted hover:text-ink hover:underline">
              See the plan
            </Link>
          }
        />

        <StatTile
          icon={
            <IconBadge size="13" tone="surface">
              <CalendarIcon size={22} />
            </IconBadge>
          }
          title={<span className="font-medium">{countdownText(bundle.talk.startsAt, now)}</span>}
          detail={<span className="text-sm text-muted">{formatWhen(bundle.talk.startsAt, today)}</span>}
        />

        <StatTile
          icon={
            <IconBadge size="13" tone="surface" className={lastOver ? 'text-danger' : undefined}>
              <PlayIcon size={22} />
            </IconBadge>
          }
          title={
            lastRun ? (
              <span className={cn('font-medium tabular-nums', lastOver && 'text-danger')}>
                {formatClock(lastRun.seconds)} of {formatClock(lastRun.budgetSeconds)}
              </span>
            ) : (
              <span className="font-medium">No runs yet</span>
            )
          }
          detail={
            lastRun ? (
              <span className="text-sm text-muted">
                Last run, {lastRun.peeks === 0 ? 'no peeks' : pluralize(lastRun.peeks, 'peek')}
              </span>
            ) : (
              <span className="text-sm text-muted">Your timing shows here</span>
            )
          }
        />
      </section>

      <section aria-labelledby="modes-heading" className="flex flex-col gap-4">
        <h2 id="modes-heading" className="font-display text-xl font-semibold">
          Or pick a way to practice
        </h2>
        <PracticeModes talkId={talkId} lengthMinutes={bundle.talk.lengthMinutes} sections={bundle.sections} />
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
          <h2 id="recent-heading" className="font-display text-xl font-semibold">
            Your runs
          </h2>
          <ul className="flex flex-col">
            {recent.map(run => {
              const RunIcon = sessionKindIcons[run.kind];
              const { peeks, seconds: spoken } = runTotals(run.sectionTimings);
              const runSection = bundle.sections.find(item => item.id === run.sectionId);
              const timed = run.sectionTimings.length > 0;
              return (
                <li key={run.id}>
                  <Link
                    href={`/talks/${talkId}/practice/${run.id}`}
                    className="-mx-3 flex min-h-16 items-center gap-4 rounded-xl px-3 py-2 hover:bg-inset"
                  >
                    <RunIcon size={20} className="shrink-0 text-muted" />
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="truncate font-medium">
                          {sessionKindLabels[run.kind]}
                          {runSection ? `: ${runSection.title}` : ''}
                        </span>
                        <span className="text-sm text-muted">{formatDay(run.startedAt.slice(0, 10), today)}</span>
                      </span>
                      <RunStrip bars={sectionBars(run.sectionTimings, bundle.sections)} />
                    </span>
                    {timed && (
                      <span className="flex shrink-0 items-center gap-3 text-sm text-muted tabular-nums">
                        <span>{formatClock(spoken)}</span>
                        <span className="flex items-center gap-1">
                          <EyeIcon size={16} />
                          <span className="sr-only">Peeks:</span>
                          {peeks}
                        </span>
                      </span>
                    )}
                    {!run.debriefedAt && <Tag tone="accent">Rate it</Tag>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
