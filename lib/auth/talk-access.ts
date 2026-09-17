import 'server-only';
import { and, eq } from 'drizzle-orm';
import { database } from '@/lib/db/client';
import { runs, talks } from '@/lib/db/schema';
import { requireUserId } from './current-user';

class AccessError extends Error {
  constructor() {
    super('This talk is not in your account. Open it from your talk list.');
    this.name = 'AccessError';
  }
}

async function ownedTalk(talkId: string, userId: string) {
  const db = await database();
  return db.query.talks.findFirst({ where: and(eq(talks.id, talkId), eq(talks.userId, userId)) });
}

export async function requireTalkAccess(talkId: string) {
  const userId = await requireUserId();
  const talk = await ownedTalk(talkId, userId);
  if (!talk) throw new AccessError();
  return { userId, talk, db: await database() };
}

export async function ownedRun(runId: string, userId: string) {
  const db = await database();
  const run = await db.query.runs.findFirst({ where: eq(runs.id, runId) });
  if (!run) return null;
  const talk = await ownedTalk(run.talkId, userId);
  return talk ? { run, talk } : null;
}

export async function requireRunAccess(runId: string) {
  const userId = await requireUserId();
  const owned = await ownedRun(runId, userId);
  if (!owned) throw new AccessError();
  return { userId, ...owned, db: await database() };
}
