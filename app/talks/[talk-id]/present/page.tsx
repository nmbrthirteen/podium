import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { endedRuns } from '@/features/practice/runs';
import { TalkDayAfter } from '@/features/talk-day/components/talk-day-after';
import { TalkDayFlow } from '@/features/talk-day/components/talk-day-flow';
import { TalkDayHero } from '@/features/talk-day/components/talk-day-hero';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';
import { talkPhase } from '@/features/talks/talk-phase';
import { formatWhen, talkDayOf } from '@/lib/dates';

export const metadata: Metadata = { title: 'Talk day' };

export default async function PresentPage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, today, next } = await loadTalkPage(params);
  const { talk, brief } = bundle;
  const talkId = talk.id;
  const now = new Date();
  const talkDay = talkDayOf(talk.startsAt);
  const phase = talkPhase(talk.startsAt, talk.lengthMinutes, now);
  const checklistSession = bundle.sessions.find(session => session.kind === 'talk-day-checklist');
  const dressDone = endedRuns(bundle.runs).some(run => run.kind === 'dress-rehearsal');

  if (phase === 'after') {
    return <TalkDayAfter talk={talk} next={next} hasDebrief={bundle.debrief != null} />;
  }

  const when = formatWhen(talk.startsAt, today);

  return (
    <AppShell width="lg">
      <TalkHeader talk={talk} next={next} />

      <TalkDayHero talkId={talkId} phase={phase} when={when} startsAt={talk.startsAt} now={now} dressDone={dressDone} />

      <section aria-labelledby="routine-heading" className="flex flex-col gap-4">
        <h2 id="routine-heading" className="font-display text-xl font-semibold">
          {phase === 'talk-day' ? 'Before you go on' : 'Your talk-day routine'}
        </h2>
        <TalkDayFlow
          talkId={talkId}
          talkDay={talkDay}
          isTalkDay={phase === 'talk-day'}
          sessionId={checklistSession?.id ?? null}
          completed={checklistSession?.completedRunId != null}
          openingLine={brief.openingLine}
          closingLine={brief.closingLine}
          bigIdea={brief.bigIdea}
        />
      </section>
    </AppShell>
  );
}
