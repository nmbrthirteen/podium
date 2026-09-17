import type { z } from 'zod';

export type CoachTaskDefinition<I extends z.ZodType, O extends z.ZodType> = {
  id: string;
  inputSchema: I;
  schema: O;
  system: string;
  buildPrompt: (input: z.output<I>) => string;
};

export type CoachTask<I extends z.ZodType, O extends z.ZodType> = CoachTaskDefinition<I, O> & {
  promptFor: (raw: unknown) => string;
};

export type RunnableCoachTask = {
  id: string;
  schema: z.ZodType;
  system: string;
  promptFor: (raw: unknown) => string;
};

export function defineTask<I extends z.ZodType, O extends z.ZodType>(
  definition: CoachTaskDefinition<I, O>,
): CoachTask<I, O> {
  return { ...definition, promptFor: raw => definition.buildPrompt(definition.inputSchema.parse(raw)) };
}
