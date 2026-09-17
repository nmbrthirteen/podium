import 'server-only';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { requireUserId } from '@/lib/auth/current-user';
import { toDay } from '@/lib/dates';
import { describeNextStep } from './next-step';
import { loadTalkBundle, pickForBundle } from './queries';

export async function loadTalkPage(params: Promise<{ 'talk-id': string }>) {
  await connection();
  const [{ 'talk-id': talkId }, userId] = await Promise.all([params, requireUserId()]);
  const bundle = await loadTalkBundle(talkId, userId);
  if (!bundle) notFound();

  const today = toDay(new Date());
  const pick = pickForBundle(bundle, today);
  const next = describeNextStep({
    startsAt: bundle.talk.startsAt,
    today,
    pick,
    sections: bundle.sections,
    debriefed: bundle.debrief !== null,
  });
  return { bundle, today, pick, next, userId };
}
