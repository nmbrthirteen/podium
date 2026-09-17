import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { toBriefContext } from '@/features/brief/brief-context';
import { QaDrill } from '@/features/qa-drill/components/qa-drill';
import { pastSurprisingQuestions } from '@/features/qa-drill/queries';
import { loadTalkPage } from '@/features/talks/load-talk-page';

export const metadata: Metadata = { title: 'Q&A drill' };

type QaPageProps = {
  params: Promise<{ 'talk-id': string }>;
  searchParams: Promise<{ session?: string }>;
};

export default async function QaPage({ params, searchParams }: QaPageProps) {
  const [{ bundle, userId }, { session }] = await Promise.all([loadTalkPage(params), searchParams]);
  const pastSurprising = await pastSurprisingQuestions(bundle.talk.type, bundle.talk.id, userId);
  const sessionId = bundle.sessions.some(item => item.id === session) ? (session ?? null) : null;

  return (
    <AppShell back={{ href: `/talks/${bundle.talk.id}/practice`, label: bundle.talk.title }}>
      <h1 className="font-display text-3xl font-semibold">Q&A drill</h1>
      <QaDrill
        talkId={bundle.talk.id}
        sessionId={sessionId}
        context={toBriefContext(bundle.talk, bundle.brief, bundle.points)}
        pastSurprising={pastSurprising}
        backPocketQuestion={bundle.brief.backPocketQuestion}
      />
    </AppShell>
  );
}
