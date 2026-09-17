import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { PracticeOverview } from '@/features/practice/components/practice-overview';
import { readFocus } from '@/features/practice/next-focus';
import { TalkProgress } from '@/features/progress/components/talk-progress';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';

export const metadata: Metadata = { title: 'Practice' };

export default async function PracticePage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, today, pick, next } = await loadTalkPage(params);
  const focus = await readFocus(bundle.talk.id);

  return (
    <AppShell width="lg">
      <TalkHeader talk={bundle.talk} next={next} />
      <PracticeOverview bundle={bundle} pick={pick} focus={focus} today={today} now={new Date()} />
      <TalkProgress runs={bundle.runs} />
    </AppShell>
  );
}
