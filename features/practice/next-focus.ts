import 'server-only';
import { z } from 'zod';
import { assertUsageAllowed, recordUsage } from '@/features/billing/usage';
import { runCoachTask } from '@/lib/coach/run-task';
import { nextFocus } from '@/lib/coach/tasks/next-focus';
import type { Run } from '@/lib/db/schema';
import { sessionKinds } from '@/lib/domain';
import { readSetting, writeSetting } from '@/lib/settings';
import { endedRuns, runTotals } from './runs';

const focusSchema = z.object({
  focus: z.string(),
  reason: z.string(),
  kind: z.enum(sessionKinds),
  runId: z.string(),
});
export type StoredFocus = z.infer<typeof focusSchema>;

const fixedSchema = z.array(z.string());

export const focusKey = (talkId: string) => `next-focus:${talkId}`;
export const fixedKey = (talkId: string) => `fixed-focus:${talkId}`;

export function readFocus(talkId: string) {
  return readSetting<StoredFocus | null>(focusKey(talkId), focusSchema.nullable(), null);
}

function readFixedFocuses(talkId: string) {
  return readSetting<string[]>(fixedKey(talkId), fixedSchema, []);
}

export async function markFocusFixedFor(talkId: string, focus: string) {
  const fixed = await readFixedFocuses(talkId);
  if (!fixed.some(item => item.toLowerCase() === focus.toLowerCase())) {
    await writeSetting(fixedKey(talkId), [...fixed, focus]);
  }
  await writeSetting(focusKey(talkId), null);
}

export async function refreshNextFocus(talkId: string, runs: Run[], userId: string) {
  const debriefed = runs.filter(run => run.debriefedAt !== null).slice(-5);
  const latest = debriefed.at(-1);
  if (!latest) return;

  await assertUsageAllowed(userId, 'coach-call', 1);
  const fixed = await readFixedFocuses(talkId);
  const result = await runCoachTask(nextFocus, {
    debriefs: debriefed.map(run => {
      const totals = runTotals(run.sectionTimings);
      return {
        kind: run.kind,
        excelled: run.excelled,
        workOn: run.workOn,
        challenge: run.challenge,
        peeks: totals.peeks,
        overrunSeconds: totals.overSeconds,
      };
    }),
    fullRuns: endedRuns(runs).filter(run => run.kind === 'full-run').length,
    totalRuns: endedRuns(runs).length,
    fixedFocuses: fixed,
  });
  if (!result.cached) await recordUsage(userId, 'coach-call', 1);

  const output = nextFocus.schema.parse(result.output);
  if (fixed.some(item => item.toLowerCase() === output.focus.toLowerCase())) return;
  await writeSetting(focusKey(talkId), { ...output, runId: latest.id });
}
