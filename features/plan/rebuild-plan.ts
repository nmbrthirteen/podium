import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { endedRuns } from '@/features/practice/runs';
import { talkDayOf, toDay } from '@/lib/dates';
import type { Database } from '@/lib/db/client';
import { planSessions, runs, sections, talks } from '@/lib/db/schema';
import { newId } from '@/lib/utils';
import { generatePlan } from './generate-plan';

export async function rebuildPlan(db: Database, talkId: string) {
  const talk = await db.query.talks.findFirst({ where: eq(talks.id, talkId) });
  if (!talk) return;

  const [talkSections, talkRuns, existingSessions] = await Promise.all([
    db.select().from(sections).where(eq(sections.talkId, talkId)),
    db.select().from(runs).where(eq(runs.talkId, talkId)),
    db.select().from(planSessions).where(eq(planSessions.talkId, talkId)),
  ]);

  const latestTimings = endedRuns(talkRuns)
    .filter(run => run.sectionTimings.length > 0)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .at(-1)?.sectionTimings;

  const today = toDay(new Date());
  const talkDay = talkDayOf(talk.startsAt);
  const plan = generatePlan({
    today: today > talkDay ? talkDay : today,
    talkDay,
    lengthMinutes: talk.lengthMinutes,
    depth: talk.depth,
    sections: talkSections,
    latestTimings,
  });

  const completed = existingSessions.filter(session => session.completedRunId !== null);
  const alreadyDone = (session: (typeof plan)[number]) =>
    completed.some(
      done => done.day === session.day && done.kind === session.kind && done.sectionId === session.sectionId,
    );
  const nextPlan = plan.filter(session => !alreadyDone(session));

  await db.delete(planSessions).where(and(eq(planSessions.talkId, talkId), isNull(planSessions.completedRunId)));
  if (nextPlan.length === 0) return;
  await db.insert(planSessions).values(nextPlan.map(session => ({ id: newId(), talkId, ...session })));
}
