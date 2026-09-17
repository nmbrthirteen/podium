import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { database } from '@/lib/db/client';
import { runs, talkDebriefs, talks } from '@/lib/db/schema';
import { recurringThemes } from './progress';

export async function loadAcrossTalks(userId: string) {
  const db = await database();
  const userTalks = await db
    .select({ id: talks.id, title: talks.title, startsAt: talks.startsAt })
    .from(talks)
    .where(eq(talks.userId, userId));
  if (userTalks.length === 0) return { confidence: [], themes: [] };

  const talkIds = userTalks.map(talk => talk.id);
  const [debriefs, userRuns] = await Promise.all([
    db.select().from(talkDebriefs).where(inArray(talkDebriefs.talkId, talkIds)),
    db.select({ workOn: runs.workOn }).from(runs).where(inArray(runs.talkId, talkIds)),
  ]);

  const titles = new Map(userTalks.map(talk => [talk.id, talk]));
  const confidence = debriefs
    .map(debrief => ({
      id: debrief.talkId,
      label: titles.get(debrief.talkId)?.title ?? 'Talk',
      startsAt: titles.get(debrief.talkId)?.startsAt ?? debrief.createdAt,
      value: debrief.confidence,
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(({ id, label, value }) => ({ id, label, value }));

  const themes = recurringThemes([...debriefs.map(debrief => debrief.workOn), ...userRuns.map(run => run.workOn)]);

  return { confidence, themes };
}

export type AcrossTalksData = Awaited<ReturnType<typeof loadAcrossTalks>>;
