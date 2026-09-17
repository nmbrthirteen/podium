'use server';

import { completePlannedSession } from '@/features/practice/complete-session';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { runs } from '@/lib/db/schema';
import { newId } from '@/lib/utils';

export async function completeChecklist(talkId: string, sessionId: string | null) {
  const { db } = await requireTalkAccess(talkId);
  const now = new Date().toISOString();
  const runId = newId();
  await db.insert(runs).values({
    id: runId,
    talkId,
    sessionId,
    kind: 'talk-day-checklist',
    startedAt: now,
    endedAt: now,
    debriefedAt: now,
  });
  await completePlannedSession(talkId, runId, sessionId, 'talk-day-checklist', null);
  revalidateTalk(talkId);
}
