import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { PlanView } from '@/features/plan/components/plan-view';
import { endedRuns } from '@/features/practice/runs';
import { SetupGuide } from '@/features/talks/components/setup-guide';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';
import { readSeenSteps } from '@/features/talks/setup-progress';
import { setupStepsFor } from '@/features/talks/setup-steps';

export const metadata: Metadata = { title: 'Plan' };

export default async function PlanPage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, today, next } = await loadTalkPage(params);
  const steps = setupStepsFor({
    hasDeck: bundle.deck !== null,
    seen: await readSeenSteps(bundle.talk.id),
    runs: endedRuns(bundle.runs).length,
  });
  const showGuide = bundle.talk.completedAt === null && steps.some(step => !step.done);

  return (
    <AppShell width="lg">
      <TalkHeader talk={bundle.talk} next={next} />
      {showGuide && <SetupGuide talkId={bundle.talk.id} slideCount={bundle.slides.length} steps={steps} />}
      <PlanView talk={bundle.talk} sessions={bundle.sessions} sections={bundle.sections} today={today} />
    </AppShell>
  );
}
