import 'server-only';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { readEnv } from '@/lib/env';
import { CoachError, type CoachProvider, coachTimeoutMs, parseStructured } from '../provider';

export const aiSdk: CoachProvider = {
  id: 'ai-sdk',

  async detect() {
    return readEnv().OPENROUTER_API_KEY
      ? { available: true }
      : { available: false, reason: 'OPENROUTER_API_KEY is not set.' };
  },

  async generate(request) {
    const env = readEnv();
    if (!env.OPENROUTER_API_KEY) {
      throw new CoachError('unavailable', 'The hosted coach has no API key. Set OPENROUTER_API_KEY, then try again.');
    }

    const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
    const timeout = AbortSignal.timeout(coachTimeoutMs);
    const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;

    try {
      const result = await generateText({
        model: openrouter(env.PODIUM_AI_MODEL),
        system: request.system,
        prompt: request.prompt,
        output: Output.object({ schema: request.schema }),
        abortSignal: signal,
        maxRetries: 1,
      });
      return parseStructured(request.schema, result.output);
    } catch (error) {
      if (error instanceof CoachError) throw error;
      if (request.signal?.aborted) throw new CoachError('aborted', 'The coach request was cancelled.');
      if (timeout.aborted) throw new CoachError('timeout', 'The coach took longer than 90 seconds. Try again.');
      throw new CoachError('failed', 'The hosted coach did not answer. Try again in a minute.');
    }
  },
};
