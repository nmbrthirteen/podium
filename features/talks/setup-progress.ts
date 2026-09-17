import 'server-only';
import { z } from 'zod';
import { readSetting, writeSetting } from '@/lib/settings';
import { type SeenStepId, seenStepIds } from './setup-steps';

const seenSchema = z.array(z.enum(seenStepIds));

export const setupKey = (talkId: string) => `setup-seen:${talkId}`;

export function readSeenSteps(talkId: string) {
  return readSetting<SeenStepId[]>(setupKey(talkId), seenSchema, []);
}

export async function markSeen(talkId: string, step: SeenStepId) {
  const seen = await readSeenSteps(talkId);
  if (!seen.includes(step)) await writeSetting(setupKey(talkId), [...seen, step]);
}
