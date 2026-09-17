import 'server-only';
import type { z } from 'zod';

export type CoachProviderId = 'claude-cli' | 'codex-cli' | 'ai-sdk';

export type CoachRequest<T> = {
  task: string;
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  signal?: AbortSignal;
};

export interface CoachProvider {
  id: CoachProviderId;
  detect(): Promise<{ available: boolean; reason?: string }>;
  generate<T>(request: CoachRequest<T>): Promise<T>;
}

export type CoachErrorCode = 'unavailable' | 'timeout' | 'aborted' | 'failed' | 'invalid-input' | 'invalid-output';

export class CoachError extends Error {
  readonly code: CoachErrorCode;

  constructor(code: CoachErrorCode, message: string) {
    super(message);
    this.name = 'CoachError';
    this.code = code;
  }
}

export const coachTimeoutMs = 90_000;

export function parseStructured<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new CoachError('invalid-output', 'The coach returned fields that do not match the task. Try again.');
  }
  return parsed.data;
}
