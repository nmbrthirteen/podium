import 'server-only';
import { and, asc, desc, eq } from 'drizzle-orm';
import { pickSession } from '@/features/plan/pick-session';
import { endedRuns } from '@/features/practice/runs';
import { daysBetween, talkDayOf, toDay } from '@/lib/dates';
import { database } from '@/lib/db/client';
import {
  type Brief,
  briefs,
  decks,
  planSessions,
  points,
  questions,
  runs,
  sections,
  slideDrafts,
  slides,
  talkDebriefs,
  talks,
} from '@/lib/db/schema';
import { describeNextStep, type NextStep } from './next-step';

function emptyBrief(talkId: string): Brief {
  return {
    talkId,
    goal: '',
    audience: '',
    bigIdea: '',
    openingLine: '',
    closingLine: '',
    recoveryLine: '',
    backPocketQuestion: '',
    fieldSources: {},
  };
}

export async function loadTalkBundle(talkId: string, userId: string) {
  const db = await database();
  const talk = await db.query.talks.findFirst({ where: and(eq(talks.id, talkId), eq(talks.userId, userId)) });
  if (!talk) return null;

  const [brief, talkPoints, talkSections, deck, sessions, talkRuns, talkQuestions, debrief, drafts] = await Promise.all(
    [
      db.query.briefs.findFirst({ where: eq(briefs.talkId, talkId) }),
      db.select().from(points).where(eq(points.talkId, talkId)).orderBy(asc(points.position)),
      db.select().from(sections).where(eq(sections.talkId, talkId)).orderBy(asc(sections.position)),
      db.query.decks.findFirst({ where: eq(decks.talkId, talkId), orderBy: desc(decks.uploadedAt) }),
      db
        .select()
        .from(planSessions)
        .where(eq(planSessions.talkId, talkId))
        .orderBy(asc(planSessions.day), asc(planSessions.position)),
      db.select().from(runs).where(eq(runs.talkId, talkId)).orderBy(asc(runs.startedAt)),
      db.select().from(questions).where(eq(questions.talkId, talkId)).orderBy(asc(questions.createdAt)),
      db.query.talkDebriefs.findFirst({ where: eq(talkDebriefs.talkId, talkId) }),
      db.select().from(slideDrafts).where(eq(slideDrafts.talkId, talkId)).orderBy(asc(slideDrafts.position)),
    ],
  );

  const deckSlides = deck
    ? await db.select().from(slides).where(eq(slides.deckId, deck.id)).orderBy(asc(slides.number))
    : [];

  return {
    talk,
    brief: brief ?? emptyBrief(talkId),
    points: talkPoints,
    sections: talkSections,
    deck: deck ?? null,
    slides: deckSlides,
    sessions,
    runs: talkRuns,
    questions: talkQuestions,
    debrief: debrief ?? null,
    slideDrafts: drafts,
  };
}

export type TalkBundle = NonNullable<Awaited<ReturnType<typeof loadTalkBundle>>>;

export function pickForBundle(bundle: TalkBundle, today = toDay(new Date())) {
  return pickSession({
    today,
    talkDay: talkDayOf(bundle.talk.startsAt),
    lengthMinutes: bundle.talk.lengthMinutes,
    sessions: bundle.sessions,
    runs: endedRuns(bundle.runs),
    sections: bundle.sections,
  });
}

export type TalkSummary = {
  id: string;
  title: string;
  startsAt: string;
  next: NextStep;
  sessionsDone: number;
  sessionsTotal: number;
  daysAway: number;
  done: boolean;
};

export async function listTalkSummaries(userId: string): Promise<TalkSummary[]> {
  const db = await database();
  const rows = await db
    .select({ id: talks.id })
    .from(talks)
    .where(eq(talks.userId, userId))
    .orderBy(asc(talks.startsAt));
  const today = toDay(new Date());
  const bundles = await Promise.all(rows.map(row => loadTalkBundle(row.id, userId)));

  const summaries = bundles
    .filter(bundle => bundle !== null)
    .map(bundle => ({
      id: bundle.talk.id,
      title: bundle.talk.title,
      startsAt: bundle.talk.startsAt,
      next: describeNextStep({
        startsAt: bundle.talk.startsAt,
        today,
        pick: pickForBundle(bundle, today),
        sections: bundle.sections,
        debriefed: bundle.debrief !== null,
      }),
      sessionsDone: bundle.sessions.filter(session => session.completedRunId !== null).length,
      sessionsTotal: bundle.sessions.length,
      daysAway: daysBetween(today, talkDayOf(bundle.talk.startsAt)),
      done: bundle.talk.completedAt !== null,
    }));

  const active = summaries.filter(summary => !summary.done);
  const upcoming = active.filter(summary => summary.next.action === 'practice' || summary.next.action === 'present');
  const past = active.filter(summary => summary.next.action === 'debrief' || summary.next.action === 'done').reverse();
  const finished = summaries.filter(summary => summary.done).reverse();
  return [...upcoming, ...past, ...finished];
}
