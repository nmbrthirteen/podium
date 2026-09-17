import 'server-only';
import { connection } from 'next/server';
import { listTalkSummaries } from '@/features/talks/queries';
import { currentUser } from '@/lib/auth/current-user';
import { isHosted } from '@/lib/env';
import type { FrameData } from './frame';

export async function loadFrame(): Promise<FrameData | null> {
  await connection();
  const user = await currentUser();
  if (!user) return null;

  const talks = await listTalkSummaries(user.id);
  return {
    hosted: isHosted(),
    talks: talks.map(talk => ({
      id: talk.id,
      title: talk.title,
      daysAway: talk.daysAway,
      progress: talk.sessionsTotal > 0 ? talk.sessionsDone / talk.sessionsTotal : 0,
      done: talk.done,
    })),
  };
}
