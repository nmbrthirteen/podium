'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import type { CoachTask } from '@/lib/coach/task';

export type CoachTaskState<T> =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'result'; output: T; flagged: boolean }
  | { status: 'error'; message: string };

const successSchema = z.object({ output: z.unknown(), flagged: z.boolean() });
const failureSchema = z.object({ error: z.string() });

export function useCoachTask<I extends z.ZodType, O extends z.ZodType>(task: CoachTask<I, O>) {
  const [state, setState] = useState<CoachTaskState<z.output<O>>>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (input: z.input<I>, options: { fresh?: boolean } = {}): Promise<z.output<O> | null> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: 'running' });

      try {
        const response = await fetch(`/api/coach/${task.id}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ input, fresh: options.fresh ?? false }),
          signal: controller.signal,
        });
        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          const failure = failureSchema.safeParse(body);
          setState({ status: 'error', message: failure.success ? failure.data.error : 'The coach failed. Try again.' });
          return null;
        }

        const success = successSchema.safeParse(body);
        const output = success.success ? task.schema.safeParse(success.data.output) : null;
        if (!success.success || !output?.success) {
          setState({ status: 'error', message: 'The coach returned an unexpected answer. Try again.' });
          return null;
        }

        setState({ status: 'result', output: output.data, flagged: success.data.flagged });
        return output.data;
      } catch {
        if (controller.signal.aborted) {
          setState({ status: 'idle' });
          return null;
        }
        setState({
          status: 'error',
          message: 'Could not reach the coach. Check that the app is running, then try again.',
        });
        return null;
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [task],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: 'idle' });
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, run, cancel, reset };
}
