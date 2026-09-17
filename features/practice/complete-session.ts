import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { toDay } from '@/lib/dates';
import { database } from '@/lib/db/client';
import { planSessions } from '@/lib/db/schema';
import type { SessionKind } from '@/lib/domain';

export async function completePlannedSession(
  talkId: string,
  runId: string,
  sessionId: string | null,
  kind: SessionKind,
  sectionId: string | null,
) {
  const db = await database();
  if (sessionId) {
    await db
      .update(planSessions)
      .set({ completedRunId: runId })
      .where(and(eq(planSessions.id, sessionId), eq(planSessions.talkId, talkId), isNull(planSessions.completedRunId)));
    return;
  }

  const today = toDay(new Date());
  const candidates = await db
    .select()
    .from(planSessions)
    .where(and(eq(planSessions.talkId, talkId), eq(planSessions.kind, kind), isNull(planSessions.completedRunId)));
  const match = candidates
    .filter(session => session.day <= today && (kind !== 'section-loop' || session.sectionId === sectionId))
    .sort((a, b) => a.day.localeCompare(b.day) || a.position - b.position)[0];
  if (match) {
    await db.update(planSessions).set({ completedRunId: runId }).where(eq(planSessions.id, match.id));
  }
}
