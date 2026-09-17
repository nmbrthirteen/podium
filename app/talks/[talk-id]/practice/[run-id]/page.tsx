import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { RunSession } from '@/features/practice/components/run-session';
import { loadRunView } from '@/features/practice/queries';

export const metadata: Metadata = { title: 'Practice run' };

export default async function RunPage({ params }: { params: Promise<{ 'talk-id': string; 'run-id': string }> }) {
  const { bundle, run, explainersSeen, listenerQuestions, cards, summary } = await loadRunView(params);
  const initialPhase = run.debriefedAt ? 'saved' : run.endedAt ? 'debrief' : 'fresh';

  return (
    <AppShell back={{ href: `/talks/${bundle.talk.id}/practice`, label: bundle.talk.title }}>
      <RunSession
        talkId={bundle.talk.id}
        runId={run.id}
        kind={run.kind}
        cards={cards}
        explainersSeen={explainersSeen}
        listenerQuestions={listenerQuestions}
        initialPhase={initialPhase}
        initialSummary={summary}
        initialTimings={run.sectionTimings}
        initialPrediction={run.prediction}
        initialRecordingUrl={run.recordingPath ? `/api/recordings/${run.id}` : null}
      />
    </AppShell>
  );
}
