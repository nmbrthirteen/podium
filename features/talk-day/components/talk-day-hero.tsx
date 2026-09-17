import { IconBadge } from '@/components/ui/icon-badge';
import { CalendarIcon } from '@/components/ui/icons';
import { StartSessionButton } from '@/features/practice/components/start-session-button';
import type { TalkPhase } from '@/features/talks/talk-phase';
import { countdownText } from '@/features/talks/talk-phase';

type TalkDayHeroProps = {
  talkId: string;
  phase: TalkPhase;
  when: string;
  startsAt: string;
  now: Date;
  dressDone: boolean;
};

export function TalkDayHero({ talkId, phase, when, startsAt, now, dressDone }: TalkDayHeroProps) {
  if (phase === 'talk-day') {
    return (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-inset p-6 sm:p-8">
        <h2 className="font-display text-3xl font-semibold">It is talk day</h2>
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-surface px-3.5 font-medium tabular-nums shadow-card">
          <CalendarIcon size={16} className="text-accent" />
          {countdownText(startsAt, now)}
        </span>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-inset p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-3xl font-semibold">{when}</h2>
          <p className="text-muted">{countdownText(startsAt, now)}</p>
        </div>
        <IconBadge size="14" tone="surface">
          <CalendarIcon size={26} />
        </IconBadge>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <StartSessionButton
          talkId={talkId}
          kind="dress-rehearsal"
          label={dressDone ? 'Another dress rehearsal' : 'Do a dress rehearsal'}
          variant="primary"
          size="lg"
        />
        <span className="text-sm text-muted">Give the whole talk in live mode, as on the day.</span>
      </div>
    </section>
  );
}
