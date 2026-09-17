'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { rebuildPlan } from '@/features/plan/rebuild-plan';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { sections } from '@/lib/db/schema';
import { replaceSectionsWithTemplate } from './replace-sections';

const sectionPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    minutes: z.number().min(0.25).max(600),
    keywords: z.array(z.string().trim().min(1).max(80)).max(30),
    verbatim: z.string().max(2000),
    slideNumbers: z.array(z.number().int().min(1)).max(500),
  })
  .partial();

export async function saveSection(talkId: string, sectionId: string, rawPatch: z.input<typeof sectionPatchSchema>) {
  const patch = sectionPatchSchema.parse(rawPatch);
  const { db } = await requireTalkAccess(talkId);
  await db
    .update(sections)
    .set(patch)
    .where(and(eq(sections.id, sectionId), eq(sections.talkId, talkId)));
  if (patch.minutes !== undefined) await rebuildPlan(db, talkId);
  revalidateTalk(talkId);
}

const minutesSchema = z
  .array(z.object({ id: z.string(), minutes: z.number().min(0.25).max(600) }))
  .min(1)
  .max(50);

export async function saveSectionMinutes(talkId: string, rawUpdates: z.input<typeof minutesSchema>) {
  const updates = minutesSchema.parse(rawUpdates);
  const { db } = await requireTalkAccess(talkId);
  for (const update of updates) {
    await db
      .update(sections)
      .set({ minutes: update.minutes })
      .where(and(eq(sections.id, update.id), eq(sections.talkId, talkId)));
  }
  await rebuildPlan(db, talkId);
  revalidateTalk(talkId);
}

export async function resetSections(talkId: string) {
  const { db } = await requireTalkAccess(talkId);
  await replaceSectionsWithTemplate(db, talkId);
  await rebuildPlan(db, talkId);
  revalidateTalk(talkId);
}

const coachCardsSchema = z.array(
  z.object({
    id: z.string(),
    keywords: z.array(z.string()).max(7),
    verbatim: z.string(),
    slideNumbers: z.array(z.number().int()),
  }),
);

export async function applyCoachCards(talkId: string, rawCards: z.input<typeof coachCardsSchema>) {
  const cards = coachCardsSchema.parse(rawCards);
  const { db } = await requireTalkAccess(talkId);
  for (const card of cards) {
    await db
      .update(sections)
      .set({
        keywords: [...new Set(card.keywords.map(keyword => keyword.trim()).filter(Boolean))],
        verbatim: card.verbatim,
        slideNumbers: card.slideNumbers,
      })
      .where(and(eq(sections.id, card.id), eq(sections.talkId, talkId)));
  }
  revalidateTalk(talkId);
}
