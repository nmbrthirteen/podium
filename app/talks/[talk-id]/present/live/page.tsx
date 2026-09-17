import type { Metadata } from 'next';
import { defaultRecoveryLine } from '@/features/brief/brief-context';
import { LiveMode } from '@/features/live/components/live-mode';
import { runCards } from '@/features/practice/run-cards';
import { loadTalkPage } from '@/features/talks/load-talk-page';

export const metadata: Metadata = { title: 'Live mode' };

type LivePageProps = {
  params: Promise<{ 'talk-id': string }>;
  searchParams: Promise<{ run?: string }>;
};

export default async function LivePage({ params, searchParams }: LivePageProps) {
  const [{ bundle }, { run }] = await Promise.all([loadTalkPage(params), searchParams]);
  const rehearsal = bundle.runs.find(item => item.id === run && item.kind === 'dress-rehearsal' && !item.endedAt);

  return (
    <LiveMode
      talkId={bundle.talk.id}
      talkTitle={bundle.talk.title}
      runId={rehearsal?.id ?? null}
      cards={runCards('full-run', bundle.sections, null, bundle.brief)}
      lengthMinutes={bundle.talk.lengthMinutes}
      recoveryLine={bundle.brief.recoveryLine || defaultRecoveryLine}
    />
  );
}
