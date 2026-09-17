import 'server-only';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { z } from 'zod';
import { loadTalkBundle, pickForBundle } from '@/features/talks/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { userSettingKey } from '@/lib/auth/local-user';
import { readSetting } from '@/lib/settings';
import { fallbackListenerQuestions, runCards } from './run-cards';
import { summarizeRun } from './summary';

export async function loadRunView(params: Promise<{ 'talk-id': string; 'run-id': string }>) {
  await connection();
  const [{ 'talk-id': talkId, 'run-id': runId }, userId] = await Promise.all([params, requireUserId()]);
  const bundle = await loadTalkBundle(talkId, userId);
  const run = bundle?.runs.find(item => item.id === runId);
  if (!bundle || !run) notFound();

  const explainersSeen = await readSetting(userSettingKey(userId, 'explainers-seen'), z.boolean(), false);
  const pool = bundle.questions
    .filter(question => question.source === 'predicted' || question.source === 'drill')
    .map(question => question.question);
  const listenerQuestions = [...new Set([...pool, ...fallbackListenerQuestions])].slice(0, 3);

  return {
    bundle,
    run,
    explainersSeen,
    listenerQuestions,
    cards: runCards(run.kind, bundle.sections, run.sectionId, bundle.brief),
    summary: run.endedAt ? summarizeRun(run.sectionTimings, bundle.sections, pickForBundle(bundle)) : '',
  };
}
