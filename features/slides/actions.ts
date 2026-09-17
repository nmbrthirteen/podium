'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { sections, slideDrafts } from '@/lib/db/schema';
import { newId } from '@/lib/utils';

const slideContentSchema = z.object({
  title: z.string().trim().max(200),
  points: z.array(z.string().trim().min(1).max(120)).max(5),
  visual: z.string().trim().max(500),
  script: z.string().trim().max(1000),
});

const draftSchema = slideContentSchema.extend({ sectionId: z.string() });

async function talkSectionIds(talkId: string) {
  const { db } = await requireTalkAccess(talkId);
  const rows = await db.select({ id: sections.id }).from(sections).where(eq(sections.talkId, talkId));
  return { db, sectionIds: new Set(rows.map(row => row.id)) };
}

export async function replaceSlideDrafts(talkId: string, raw: z.input<typeof draftSchema>[]) {
  const drafts = z.array(draftSchema).max(60).parse(raw);
  const { db, sectionIds } = await talkSectionIds(talkId);
  const rows = drafts.map((draft, position) => ({
    id: newId(),
    talkId,
    position,
    title: draft.title,
    points: draft.points,
    visual: draft.visual,
    script: draft.script,
    sectionId: sectionIds.has(draft.sectionId) ? draft.sectionId : null,
  }));

  await db.transaction(async tx => {
    await tx.delete(slideDrafts).where(eq(slideDrafts.talkId, talkId));
    if (rows.length > 0) await tx.insert(slideDrafts).values(rows);
  });
  revalidateTalk(talkId);
  return rows;
}

export async function updateSlideDraft(
  talkId: string,
  slideId: string,
  raw: Partial<z.input<typeof slideContentSchema>>,
) {
  const patch = slideContentSchema.partial().parse(raw);
  const { db } = await requireTalkAccess(talkId);
  await db
    .update(slideDrafts)
    .set(patch)
    .where(and(eq(slideDrafts.id, slideId), eq(slideDrafts.talkId, talkId)));
  revalidateTalk(talkId);
}

export async function deleteSlideDraft(talkId: string, slideId: string) {
  const { db } = await requireTalkAccess(talkId);
  await db.delete(slideDrafts).where(and(eq(slideDrafts.id, slideId), eq(slideDrafts.talkId, talkId)));
  revalidateTalk(talkId);
}

export async function addSlideDraft(talkId: string, rawSectionId: string) {
  const sectionId = z.string().parse(rawSectionId);
  const { db, sectionIds } = await talkSectionIds(talkId);
  const existing = await db
    .select({ position: slideDrafts.position })
    .from(slideDrafts)
    .where(eq(slideDrafts.talkId, talkId));
  const points: string[] = [];
  const row = {
    id: newId(),
    talkId,
    sectionId: sectionIds.has(sectionId) ? sectionId : null,
    position: Math.max(-1, ...existing.map(item => item.position)) + 1,
    title: '',
    points,
    visual: '',
    script: '',
  };
  await db.insert(slideDrafts).values(row);
  revalidateTalk(talkId);
  return row;
}
