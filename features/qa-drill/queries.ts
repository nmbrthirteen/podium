import 'server-only';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { database } from '@/lib/db/client';
import { questions, talks } from '@/lib/db/schema';
import type { TalkType } from '@/lib/domain';

export async function pastSurprisingQuestions(type: TalkType, excludeTalkId: string, userId: string) {
  const db = await database();
  const sameType = await db
    .select({ id: talks.id })
    .from(talks)
    .where(and(eq(talks.type, type), eq(talks.userId, userId), ne(talks.id, excludeTalkId)));
  if (sameType.length === 0) return [];

  const rows = await db
    .select({ question: questions.question })
    .from(questions)
    .where(
      and(
        inArray(
          questions.talkId,
          sameType.map(talk => talk.id),
        ),
        eq(questions.source, 'received'),
        eq(questions.surprised, true),
      ),
    );
  return [...new Set(rows.map(row => row.question.trim()).filter(Boolean))];
}
