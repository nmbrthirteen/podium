'use server';

import { rm } from 'node:fs/promises';
import { eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { rebuildPlan } from '@/features/plan/rebuild-plan';
import { fixedKey, focusKey } from '@/features/practice/next-focus';
import { requireUserId } from '@/lib/auth/current-user';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { database } from '@/lib/db/client';
import {
  briefs,
  decks,
  planSessions,
  points,
  questions,
  runs,
  sections,
  settings,
  slideDrafts,
  slides,
  talkDebriefs,
  talks,
} from '@/lib/db/schema';
import { briefFields, depths, fieldSources, stakesLevels, talkTypes } from '@/lib/domain';
import { dataPath } from '@/lib/paths';
import { newId } from '@/lib/utils';
import { revalidateTalk } from './revalidate-talk';
import { markSeen, setupKey } from './setup-progress';
import { seenStepIds } from './setup-steps';
import { scaleTemplate } from './talk-types';

const createTalkSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1).max(200),
  goal: z.string().trim().max(2000),
  bigIdea: z.string().trim().max(2000),
  audience: z.string().trim().max(2000),
  openingLine: z.string().trim().max(2000),
  closingLine: z.string().trim().max(2000),
  type: z.enum(talkTypes),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  lengthMinutes: z.number().int().min(1).max(600),
  nervousness: z.number().int().min(1).max(5),
  stakes: z.enum(stakesLevels),
  depth: z.enum(depths),
  fieldSources: z.partialRecord(z.enum(briefFields), z.enum(fieldSources)),
  points: z.array(z.object({ text: z.string(), example: z.string(), source: z.enum(fieldSources) })).max(10),
});

export type CreateTalkInput = z.input<typeof createTalkSchema>;

export async function createTalk(raw: CreateTalkInput): Promise<{ error: string }> {
  const parsed = createTalkSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'The talk could not be added. Shorten the description, then try again.' };
  }

  const userId = await requireUserId();
  const input = parsed.data;
  const id = input.id ?? newId();
  const now = new Date().toISOString();
  const db = await database();

  const existing = await db.query.talks.findFirst({ where: eq(talks.id, id) });
  if (existing) return { error: 'This talk already exists. Go back home to open it.' };

  const draftDeck = await db.query.decks.findFirst({ where: eq(decks.talkId, id) });
  if (draftDeck && draftDeck.userId !== userId) {
    return { error: 'This deck belongs to another account. Upload the deck again, then add the talk.' };
  }

  await db.transaction(async tx => {
    await tx.insert(talks).values({
      id,
      userId,
      title: input.title,
      type: input.type,
      depth: input.depth,
      stakes: input.stakes,
      startsAt: input.startsAt,
      lengthMinutes: input.lengthMinutes,
      nervousness: input.nervousness,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(briefs).values({
      talkId: id,
      goal: input.goal,
      audience: input.audience,
      bigIdea: input.bigIdea,
      openingLine: input.openingLine,
      closingLine: input.closingLine,
      fieldSources: input.fieldSources,
    });

    const talkPoints = input.points.filter(point => point.text.trim());
    if (talkPoints.length > 0) {
      await tx
        .insert(points)
        .values(talkPoints.map((point, position) => ({ id: newId(), talkId: id, position, ...point })));
    }

    const templateSections = scaleTemplate(input.type, input.lengthMinutes);
    if (templateSections.length > 0) {
      await tx.insert(sections).values(
        templateSections.map((section, position) => ({
          id: newId(),
          talkId: id,
          position,
          title: section.title,
          minutes: section.minutes,
        })),
      );
    }
  });

  await rebuildPlan(db, id);
  revalidateTalk(id);
  redirect(`/talks/${id}/plan`);
}

export async function markSetupSeen(talkId: string, rawStep: string) {
  const step = z.enum(seenStepIds).parse(rawStep);
  await requireTalkAccess(talkId);
  await markSeen(talkId, step);
}

export async function setTalkDone(talkId: string, rawDone: boolean) {
  const done = z.boolean().parse(rawDone);
  const { db } = await requireTalkAccess(talkId);
  const now = new Date().toISOString();
  await db
    .update(talks)
    .set({ completedAt: done ? now : null, updatedAt: now })
    .where(eq(talks.id, talkId));
  revalidateTalk(talkId);
}

export async function deleteTalk(talkId: string) {
  const { db } = await requireTalkAccess(talkId);
  const deckIds = (await db.select({ id: decks.id }).from(decks).where(eq(decks.talkId, talkId))).map(deck => deck.id);

  await db.transaction(async tx => {
    if (deckIds.length > 0) await tx.delete(slides).where(inArray(slides.deckId, deckIds));
    await tx.delete(slideDrafts).where(eq(slideDrafts.talkId, talkId));
    await tx.delete(decks).where(eq(decks.talkId, talkId));
    await tx.delete(briefs).where(eq(briefs.talkId, talkId));
    await tx.delete(points).where(eq(points.talkId, talkId));
    await tx.delete(sections).where(eq(sections.talkId, talkId));
    await tx.delete(questions).where(eq(questions.talkId, talkId));
    await tx.delete(planSessions).where(eq(planSessions.talkId, talkId));
    await tx.delete(runs).where(eq(runs.talkId, talkId));
    await tx.delete(talkDebriefs).where(eq(talkDebriefs.talkId, talkId));
    await tx.delete(settings).where(inArray(settings.key, [focusKey(talkId), fixedKey(talkId), setupKey(talkId)]));
    await tx.delete(talks).where(eq(talks.id, talkId));
  });

  await Promise.all([
    rm(dataPath('decks', talkId), { recursive: true, force: true }),
    rm(dataPath('recordings', talkId), { recursive: true, force: true }),
  ]);
  revalidateTalk(talkId);
  redirect('/');
}
