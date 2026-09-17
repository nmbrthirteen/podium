import Link from 'next/link';
import { connection } from 'next/server';
import { AppShell } from '@/components/app-shell';
import { buttonVariants } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { LandingPage } from '@/features/marketing/components/landing-page';
import { AcrossTalks } from '@/features/progress/components/across-talks';
import { loadAcrossTalks } from '@/features/progress/queries';
import { CoachMissingBanner } from '@/features/talks/components/coach-missing-banner';
import { DoneTalkList } from '@/features/talks/components/done-talk-list';
import { EmptyTalks } from '@/features/talks/components/empty-talks';
import { TalkList } from '@/features/talks/components/talk-list';
import { listTalkSummaries } from '@/features/talks/queries';
import { currentUser } from '@/lib/auth/current-user';
import { providerStatuses } from '@/lib/coach/registry';
import { isHosted } from '@/lib/env';

export default async function HomePage() {
  await connection();
  const user = await currentUser();
  if (!user) return <LandingPage />;

  const hosted = isHosted();
  const [talks, statuses, across] = await Promise.all([
    listTalkSummaries(user.id),
    hosted ? Promise.resolve([]) : providerStatuses(),
    loadAcrossTalks(user.id),
  ]);
  const coachMissing = !hosted && statuses.every(status => !status.available);
  const active = talks.filter(talk => !talk.done);
  const finished = talks.filter(talk => talk.done);

  return (
    <AppShell width="lg">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your talks</h1>
        {active.length > 0 && (
          <Link href="/talks/new" className={buttonVariants({ variant: 'primary' })}>
            <PlusIcon size={18} />
            New talk
          </Link>
        )}
      </header>

      {coachMissing && <CoachMissingBanner />}

      {active.length > 0 ? <TalkList talks={active} /> : <EmptyTalks hasFinished={finished.length > 0} />}

      {finished.length > 0 && <DoneTalkList talks={finished} />}

      <AcrossTalks data={across} />
    </AppShell>
  );
}
