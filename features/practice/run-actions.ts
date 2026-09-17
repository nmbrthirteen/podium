'use server';

import { eq } from 'drizzle-orm';
import { after } from 'next/server';
import { z } from 'zod';
import { loadTalkBundle, pickForBundle } from '@/features/talks/queries';
import { revalidateTalk } from '@/features/talks/revalidate-talk';
import { requireUserId } from '@/lib/auth/current-user';
import { userSettingKey } from '@/lib/auth/local-user';
import { requireRunAccess, requireTalkAccess } from '@/lib/auth/talk-access';
import { runs } from '@/lib/db/schema';
import { writeSetting } from '@/lib/settings';
import { completePlannedSession } from './complete-session';
import { markFocusFixedFor, refreshNextFocus } from './next-focus';
import { summarizeRun } from './summary';

const timingsSchema = z
  .array(
    z.object({
      sectionId: z.string(),
      seconds: z.number().min(0),
      budgetSeconds: z.number().min(0),
      peeks: z.number().int().min(0),
    }),
  )
  .max(100);

export async function finishRun(
  runId: string,
  raw: { startedAt: string; endedAt: string; timings: z.input<typeof timingsSchema> },
) {
  const input = z.object({ startedAt: z.iso.datetime(), endedAt: z.iso.datetime(), timings: timingsSchema }).parse(raw);
  const { run, userId, db } = await requireRunAccess(runId);

  await db
    .update(runs)
    .set({ startedAt: input.startedAt, endedAt: input.endedAt, sectionTimings: input.timings })
    .where(eq(runs.id, runId));

  const bundle = await loadTalkBundle(run.talkId, userId);
  if (!bundle) return { summary: '' };
  revalidateTalk(run.talkId);
  return { summary: summarizeRun(input.timings, bundle.sections, pickForBundle(bundle)) };
}

const debriefSchema = z.object({
  excelled: z.string().max(2000),
  workOn: z.string().max(2000),
  challenge: z.string().max(2000),
  prediction: z.string().max(2000).optional(),
  observation: z.string().max(2000).optional(),
  listenerFeedback: z.string().max(4000).optional(),
});

export async function saveRunDebrief(runId: string, raw: z.input<typeof debriefSchema>) {
  const input = debriefSchema.parse(raw);
  const { run, userId, db } = await requireRunAccess(runId);

  const now = new Date().toISOString();
  await db
    .update(runs)
    .set({ ...input, endedAt: run.endedAt ?? now, debriefedAt: now })
    .where(eq(runs.id, runId));

  await completePlannedSession(run.talkId, runId, run.sessionId, run.kind, run.sectionId);

  after(async () => {
    const bundle = await loadTalkBundle(run.talkId, userId);
    if (bundle) await refreshNextFocus(run.talkId, bundle.runs, userId).catch(() => undefined);
    revalidateTalk(run.talkId);
  });

  revalidateTalk(run.talkId);
}

export async function markExplainersSeen() {
  const userId = await requireUserId();
  await writeSetting(userSettingKey(userId, 'explainers-seen'), true);
}

export async function markFocusFixed(talkId: string, focus: string) {
  await requireTalkAccess(talkId);
  await markFocusFixedFor(talkId, z.string().min(1).max(200).parse(focus));
  revalidateTalk(talkId);
}
