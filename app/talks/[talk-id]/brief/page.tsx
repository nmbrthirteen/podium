import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { BriefWorkspace } from '@/features/brief/components/brief-workspace';
import { NextStepLink } from '@/features/talks/components/next-step-link';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';

export const metadata: Metadata = { title: 'Brief' };

export default async function BriefPage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, next } = await loadTalkPage(params);
  const talkId = bundle.talk.id;

  return (
    <AppShell width="lg">
      <TalkHeader talk={bundle.talk} next={next} />
      <BriefWorkspace bundle={bundle} />
      <NextStepLink
        talkId={talkId}
        seen="brief"
        href={`/talks/${talkId}/cards`}
        label={bundle.deck ? 'Next: link cards to slides' : 'Next: cue cards'}
      />
    </AppShell>
  );
}
