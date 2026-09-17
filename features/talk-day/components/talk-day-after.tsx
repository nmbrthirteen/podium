import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { buttonVariants } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { ArrowRightIcon, ChartIcon, PodiumIcon } from '@/components/ui/icons';
import { TalkHeader } from '@/features/talks/components/talk-header';
import type { NextStep } from '@/features/talks/next-step';
import type { Talk } from '@/lib/db/schema';

type TalkDayAfterProps = {
  talk: Talk;
  next: NextStep;
  hasDebrief: boolean;
};

export function TalkDayAfter({ talk, next, hasDebrief }: TalkDayAfterProps) {
  return (
    <AppShell width="lg">
      <TalkHeader talk={talk} next={next} />
      <section className="flex flex-col items-start gap-6 rounded-2xl bg-accent p-6 text-accent-ink sm:p-8">
        <IconBadge size="14" tone="on-accent">
          <ChartIcon size={26} />
        </IconBadge>
        <h2 className="font-display text-3xl font-semibold text-balance">
          {hasDebrief ? 'Your talk is done and debriefed' : 'Your talk is done. How did it go?'}
        </h2>
        <Link
          href={`/talks/${talk.id}/debrief`}
          className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'pr-4 shadow-none' })}
        >
          {hasDebrief ? 'See your debrief' : 'Debrief, 1 minute'}
          <ArrowRightIcon size={18} />
        </Link>
      </section>
      <Link
        href={`/talks/${talk.id}/present/live`}
        className="flex items-center gap-2 self-start text-muted hover:text-ink"
      >
        <PodiumIcon size={18} />
        Open live mode again
      </Link>
    </AppShell>
  );
}
