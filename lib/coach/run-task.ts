import 'server-only';
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { database } from '@/lib/db/client';
import { coachCache } from '@/lib/db/schema';
import { isHosted } from '@/lib/env';
import { readSetting } from '@/lib/settings';
import { newId } from '@/lib/utils';
import { generateChecked } from './generate-checked';
import { CoachError, type CoachProviderId } from './provider';
import { type ProviderPreference, resolveProvider } from './registry';
import type { RunnableCoachTask } from './task';

export type CoachResult = { output: unknown; flagged: boolean; provider: CoachProviderId | 'cache'; cached: boolean };

export const providerPreferenceSchema = z.enum(['auto', 'claude-cli', 'codex-cli', 'ai-sdk']);

export function providerPreference() {
  return readSetting<ProviderPreference>('coach-provider', providerPreferenceSchema, 'auto');
}

function hashPrompt(task: RunnableCoachTask, prompt: string) {
  return createHash('sha256')
    .update(task.id)
    .update('\n')
    .update(task.system)
    .update('\n')
    .update(prompt)
    .digest('hex');
}

export async function runCoachTask(
  task: RunnableCoachTask,
  rawInput: unknown,
  options: { signal?: AbortSignal; fresh?: boolean } = {},
): Promise<CoachResult> {
  let prompt: string;
  try {
    prompt = task.promptFor(rawInput);
  } catch {
    throw new CoachError('invalid-input', 'The coach request was missing fields. Reload the page and try again.');
  }

  const db = await database();
  const inputHash = hashPrompt(task, prompt);

  if (!options.fresh) {
    const cached = await db.query.coachCache.findFirst({
      where: and(eq(coachCache.task, task.id), eq(coachCache.inputHash, inputHash)),
    });
    const parsed = cached ? task.schema.safeParse(cached.output) : null;
    if (parsed?.success) return { output: parsed.data, flagged: false, provider: 'cache', cached: true };
  }

  const provider = await resolveProvider(isHosted() ? 'ai-sdk' : await providerPreference());
  if (!provider) {
    throw new CoachError(
      'unavailable',
      isHosted()
        ? 'The coach is not configured on this server. Set OPENROUTER_API_KEY, then try again.'
        : 'No coach is available. Install Claude Code or Codex, or set OPENROUTER_API_KEY, then reload the page.',
    );
  }

  const { output, flagged } = await generateChecked(provider, {
    task: task.id,
    system: task.system,
    prompt,
    schema: task.schema,
    signal: options.signal,
  });

  if (!flagged) {
    await db
      .insert(coachCache)
      .values({
        id: newId(),
        task: task.id,
        inputHash,
        provider: provider.id,
        output,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: [coachCache.task, coachCache.inputHash],
        set: { output, provider: provider.id, createdAt: new Date().toISOString() },
      });
  }

  return { output, flagged, provider: provider.id, cached: false };
}
