'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { completePlannedSession } from '@/features/practice/complete-session';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { briefs, questions, runs } from '@/lib/db/schema';
import { newId } from '@/lib/utils';

export async function savePredictedQuestions(talkId: string, rawQuestions: string[]) {
  const list = z.array(z.string().trim().min(1).max(500)).max(10).parse(rawQuestions);
  const { db } = await requireTalkAccess(talkId);
  await db.delete(questions).where(and(eq(questions.talkId, talkId), eq(questions.source, 'predicted')));
  if (list.length === 0) return;
  const now = new Date().toISOString();
  await db
    .insert(questions)
    .values(list.map(question => ({ id: newId(), talkId, source: 'predicted' as const, question, createdAt: now })));
}

const answerSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().max(1000),
  example: z.string().max(1000),
  relevance: z.string().max(1000),
});

export async function saveDrillAnswer(talkId: string, raw: z.input<typeof answerSchema>) {
  const input = answerSchema.parse(raw);
  const { db } = await requireTalkAccess(talkId);
  await db.insert(questions).values({
    id: newId(),
    talkId,
    source: 'drill',
    createdAt: new Date().toISOString(),
    ...input,
  });
  revalidateTalk(talkId);
}

export async function saveDrillAudience(talkId: string, audience: string) {
  const value = z.string().trim().max(2000).parse(audience);
  const { db } = await requireTalkAccess(talkId);
  const brief = await db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) });
  const fieldSources = { ...(brief?.fieldSources ?? {}), audience: 'user' as const };
  await db
    .insert(briefs)
    .values({ talkId, audience: value, fieldSources })
    .onConflictDoUpdate({ target: briefs.talkId, set: { audience: value, fieldSources } });
}

export async function finishDrill(talkId: string, sessionId: string | null, backPocketQuestion: string) {
  const question = z.string().trim().max(500).parse(backPocketQuestion);
  const { db } = await requireTalkAccess(talkId);
  if (question) {
    const brief = await db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) });
    const fieldSources = { ...(brief?.fieldSources ?? {}), backPocketQuestion: 'user' as const };
    await db
      .insert(briefs)
      .values({ talkId, backPocketQuestion: question, fieldSources })
      .onConflictDoUpdate({ target: briefs.talkId, set: { backPocketQuestion: question, fieldSources } });
  }

  const now = new Date().toISOString();
  const runId = newId();
  await db.insert(runs).values({
    id: runId,
    talkId,
    sessionId,
    kind: 'qa-drill',
    startedAt: now,
    endedAt: now,
    debriefedAt: now,
  });
  await completePlannedSession(talkId, runId, sessionId, 'qa-drill', null);
  revalidateTalk(talkId);
}
