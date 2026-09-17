'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { questions, talkDebriefs } from '@/lib/db/schema';
import { newId } from '@/lib/utils';

const debriefSchema = z.object({
  excelled: z.string().max(2000),
  workOn: z.string().max(2000),
  challenge: z.string().max(2000),
  confidence: z.number().int().min(1).max(5),
  questions: z.array(z.object({ question: z.string().trim().min(1).max(500), surprised: z.boolean() })).max(50),
});

export type TalkDebriefInput = z.input<typeof debriefSchema>;

export async function saveTalkDebrief(talkId: string, raw: TalkDebriefInput) {
  const input = debriefSchema.parse(raw);
  const { db } = await requireTalkAccess(talkId);
  const now = new Date().toISOString();
  const values = {
    excelled: input.excelled,
    workOn: input.workOn,
    challenge: input.challenge,
    confidence: input.confidence,
  };

  await db
    .insert(talkDebriefs)
    .values({ talkId, createdAt: now, ...values })
    .onConflictDoUpdate({ target: talkDebriefs.talkId, set: values });

  await db.delete(questions).where(and(eq(questions.talkId, talkId), eq(questions.source, 'received')));
  if (input.questions.length > 0) {
    await db.insert(questions).values(
      input.questions.map(item => ({
        id: newId(),
        talkId,
        source: 'received' as const,
        question: item.question,
        surprised: item.surprised,
        createdAt: now,
      })),
    );
  }

  revalidateTalk(talkId);
}
