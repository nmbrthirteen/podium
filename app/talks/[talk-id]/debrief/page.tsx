import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { DebriefForm } from '@/features/debrief/components/debrief-form';
import { AcrossTalks } from '@/features/progress/components/across-talks';
import { loadAcrossTalks } from '@/features/progress/queries';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';
import { talkPhase } from '@/features/talks/talk-phase';
import { talkTypeLabels } from '@/features/talks/talk-types';
import { formatWhen } from '@/lib/dates';

export const metadata: Metadata = { title: 'Debrief' };

export default async function DebriefPage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, next, today, userId } = await loadTalkPage(params);
  const across = await loadAcrossTalks(userId);
  const { talk, debrief } = bundle;

  return (
    <AppShell width="lg">
      <TalkHeader talk={talk} next={next} />
      <DebriefForm
        talkId={talk.id}
        talkTypeLabel={talkTypeLabels[talk.type]}
        when={formatWhen(talk.startsAt, today)}
        locked={talkPhase(talk.startsAt, talk.lengthMinutes, new Date()) !== 'after'}
        saved={debrief !== null}
        done={talk.completedAt !== null}
        initial={{
          excelled: debrief?.excelled ?? '',
          workOn: debrief?.workOn ?? '',
          challenge: debrief?.challenge ?? '',
          confidence: debrief?.confidence ?? null,
        }}
        initialQuestions={bundle.questions
          .filter(question => question.source === 'received')
          .map(question => ({ id: question.id, question: question.question, surprised: question.surprised }))}
      />
      <AcrossTalks data={across} />
    </AppShell>
  );
}
