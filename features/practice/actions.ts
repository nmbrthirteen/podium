'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { loadTalkBundle, pickForBundle } from '@/features/talks/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { database } from '@/lib/db/client';
import { runs } from '@/lib/db/schema';
import { sessionKinds } from '@/lib/domain';
import { newId } from '@/lib/utils';

const choiceSchema = z.object({ kind: z.enum(sessionKinds), sectionId: z.string().nullable().optional() }).optional();

export async function startSession(talkId: string, rawChoice?: z.input<typeof choiceSchema>) {
  const choice = choiceSchema.parse(rawChoice);
  const userId = await requireUserId();
  const bundle = await loadTalkBundle(talkId, userId);
  if (!bundle) redirect('/');

  const picked = pickForBundle(bundle);
  const kind = choice?.kind ?? picked.kind;
  const plannedMatch = choice
    ? bundle.sessions.find(
        session =>
          session.kind === choice.kind &&
          !session.completedRunId &&
          (choice.sectionId === undefined || session.sectionId === choice.sectionId),
      )
    : bundle.sessions.find(session => session.id === picked.sessionId);

  const sectionId =
    kind === 'section-loop'
      ? (choice?.sectionId ?? plannedMatch?.sectionId ?? picked.sectionId ?? bundle.sections[0]?.id ?? null)
      : null;

  if (kind === 'qa-drill') {
    redirect(`/talks/${talkId}/practice/qa${plannedMatch ? `?session=${plannedMatch.id}` : ''}`);
  }
  if (kind === 'talk-day-checklist') {
    redirect(`/talks/${talkId}/present`);
  }

  const runId = newId();
  const db = await database();
  await db.insert(runs).values({
    id: runId,
    talkId,
    sessionId: plannedMatch?.id ?? null,
    kind,
    sectionId,
    startedAt: new Date().toISOString(),
  });

  if (kind === 'dress-rehearsal') redirect(`/talks/${talkId}/present/live?run=${runId}`);
  redirect(`/talks/${talkId}/practice/${runId}`);
}
