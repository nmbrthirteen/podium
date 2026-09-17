import 'server-only';
import { eq } from 'drizzle-orm';
import { scaleTemplate } from '@/features/talks/talk-types';
import type { Database } from '@/lib/db/client';
import { sections, talks } from '@/lib/db/schema';
import { newId } from '@/lib/utils';

export async function replaceSectionsWithTemplate(db: Database, talkId: string) {
  const talk = await db.query.talks.findFirst({ where: eq(talks.id, talkId) });
  if (!talk) return;
  const template = scaleTemplate(talk.type, talk.lengthMinutes);
  await db.delete(sections).where(eq(sections.talkId, talkId));
  if (template.length === 0) return;
  await db.insert(sections).values(
    template.map((section, position) => ({
      id: newId(),
      talkId,
      position,
      title: section.title,
      minutes: section.minutes,
    })),
  );
}
