'use server';

import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { replaceSectionsWithTemplate } from '@/features/cue-cards/replace-sections';
import { rebuildPlan } from '@/features/plan/rebuild-plan';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireTalkAccess } from '@/lib/auth/talk-access';
import { type Brief, briefs, points, talks } from '@/lib/db/schema';
import { depths, fieldSources, stakesLevels, talkTypes } from '@/lib/domain';
import { newId } from '@/lib/utils';
import { type BriefTextField, briefTextFields } from './brief-fields';

const draftedFields = ['goal', 'audience', 'bigIdea', 'openingLine', 'closingLine'] as const;

const briefDraftSchema = z.object({
  goal: z.string().max(2000),
  audience: z.string().max(2000),
  bigIdea: z.string().max(2000),
  openingLine: z.string().max(2000),
  closingLine: z.string().max(2000),
  points: z.array(z.object({ text: z.string().max(1000), example: z.string().max(1000) })).max(3),
});

export async function applyBriefDraft(talkId: string, raw: z.input<typeof briefDraftSchema>) {
  const draft = briefDraftSchema.parse(raw);
  const { db } = await requireTalkAccess(talkId);

  const brief = await db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) });
  const sources = { ...(brief?.fieldSources ?? {}) };
  const patch: Partial<Brief> = {};
  for (const field of draftedFields) {
    const value = draft[field].trim();
    if (!value || brief?.[field].trim()) continue;
    patch[field] = value;
    sources[field] = 'coach-draft';
  }
  if (Object.keys(patch).length > 0) {
    patch.fieldSources = sources;
    await db
      .insert(briefs)
      .values({ talkId, ...patch })
      .onConflictDoUpdate({ target: briefs.talkId, set: patch });
  }

  const existing = await db.select({ id: points.id }).from(points).where(eq(points.talkId, talkId));
  const drafted = draft.points.filter(point => point.text.trim());
  if (existing.length === 0 && drafted.length > 0) {
    await db.insert(points).values(
      drafted.map((point, position) => ({
        id: newId(),
        talkId,
        position,
        text: point.text,
        example: point.example,
        source: 'coach-draft' as const,
      })),
    );
  }
  revalidateTalk(talkId);

  const [savedBrief, savedPoints] = await Promise.all([
    db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) }),
    db.select().from(points).where(eq(points.talkId, talkId)).orderBy(asc(points.position)),
  ]);
  return { brief: savedBrief ?? null, points: savedPoints };
}

export async function saveBriefField(talkId: string, rawField: BriefTextField, rawValue: string, rawSource: string) {
  const field = z.enum(briefTextFields).parse(rawField);
  const value = z.string().max(5000).parse(rawValue);
  const source = z.enum(fieldSources).parse(rawSource);
  const { db } = await requireTalkAccess(talkId);

  const current = await db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) });
  const sources = { ...(current?.fieldSources ?? {}), [field]: source };
  const patch: Partial<Brief> = { fieldSources: sources };
  patch[field] = value;

  await db
    .insert(briefs)
    .values({ talkId, ...patch })
    .onConflictDoUpdate({ target: briefs.talkId, set: patch });
  await db.update(talks).set({ updatedAt: new Date().toISOString() }).where(eq(talks.id, talkId));
  revalidateTalk(talkId);
}

const talkDetailsSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    type: z.enum(talkTypes),
    startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    lengthMinutes: z.number().int().min(1).max(600),
    stakes: z.enum(stakesLevels),
    nervousness: z.number().int().min(1).max(5),
    depth: z.enum(depths),
  })
  .partial();

export async function saveTalkDetails(talkId: string, rawPatch: z.input<typeof talkDetailsSchema>) {
  const patch = talkDetailsSchema.parse(rawPatch);
  const { db, talk } = await requireTalkAccess(talkId);

  await db
    .update(talks)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(talks.id, talkId));

  if (patch.title !== undefined) {
    const brief = await db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) });
    const sources = { ...(brief?.fieldSources ?? {}), title: 'user' as const };
    await db
      .insert(briefs)
      .values({ talkId, fieldSources: sources })
      .onConflictDoUpdate({ target: briefs.talkId, set: { fieldSources: sources } });
  }

  const typeChanged = patch.type !== undefined && patch.type !== talk.type;
  if (typeChanged) await replaceSectionsWithTemplate(db, talkId);

  const planChanged =
    typeChanged ||
    (patch.startsAt !== undefined && patch.startsAt !== talk.startsAt) ||
    (patch.lengthMinutes !== undefined && patch.lengthMinutes !== talk.lengthMinutes) ||
    (patch.depth !== undefined && patch.depth !== talk.depth);
  if (planChanged) await rebuildPlan(db, talkId);

  revalidateTalk(talkId);
}

export async function addPoint(talkId: string) {
  const { db } = await requireTalkAccess(talkId);
  const existing = await db.select({ id: points.id }).from(points).where(eq(points.talkId, talkId));
  const point = { id: newId(), talkId, position: existing.length, text: '', example: '', source: 'user' as const };
  await db.insert(points).values(point);
  revalidateTalk(talkId);
  return point;
}

export async function savePoint(talkId: string, pointId: string, rawPatch: { text?: string; example?: string }) {
  const patch = z
    .object({ text: z.string().max(1000), example: z.string().max(1000) })
    .partial()
    .parse(rawPatch);
  const { db } = await requireTalkAccess(talkId);
  await db
    .update(points)
    .set({ ...patch, source: 'user' })
    .where(and(eq(points.id, pointId), eq(points.talkId, talkId)));
  revalidateTalk(talkId);
}

export async function removePoint(talkId: string, pointId: string) {
  const { db } = await requireTalkAccess(talkId);
  await db.delete(points).where(and(eq(points.id, pointId), eq(points.talkId, talkId)));
  const remaining = await db.select().from(points).where(eq(points.talkId, talkId)).orderBy(asc(points.position));
  await Promise.all(
    remaining.map((point, position) => db.update(points).set({ position }).where(eq(points.id, point.id))),
  );
  revalidateTalk(talkId);
}
