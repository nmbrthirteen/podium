import { z } from 'zod';

const envSchema = z.object({
  PODIUM_MODE: z.enum(['local', 'hosted']).default('local'),
  PODIUM_DATA_DIR: z.string().optional(),
  TURSO_DATABASE_URL: z.string().min(1).optional(),
  TURSO_AUTH_TOKEN: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  PODIUM_AI_MODEL: z.string().min(1).default('anthropic/claude-sonnet-5'),
  PODIUM_COACH: z.enum(['on', 'off']).default('on'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const blankToUndefined = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value === '' ? undefined : value]),
  );
  return envSchema.parse(blankToUndefined);
}

export function isHosted() {
  return readEnv().PODIUM_MODE === 'hosted';
}
