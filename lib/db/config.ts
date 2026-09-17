import path from 'node:path';
import type { AppEnv } from '@/lib/env';

export type DatabaseConfig = { url: string; authToken?: string; local: boolean };

export function databaseConfig(env: AppEnv, cwd = process.cwd()): DatabaseConfig {
  if (env.TURSO_DATABASE_URL) {
    return { url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN, local: false };
  }
  const dataDir = env.PODIUM_DATA_DIR ?? path.join(cwd, 'data');
  return { url: `file:${path.join(dataDir, 'podium.db').replaceAll('\\', '/')}`, local: true };
}
