import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { readEnv } from '@/lib/env';
import { migrationsDir } from '@/lib/paths';
import { databaseConfig } from './config';
import * as schema from './schema';

export type Database = LibSQLDatabase<typeof schema>;

const connections = new Map<string, Promise<Database>>();

async function connect(url: string, authToken: string | undefined, local: boolean) {
  if (local) mkdirSync(path.dirname(url.replace(/^file:/, '')), { recursive: true });
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: migrationsDir() });
  return db;
}

export function database() {
  const { url, authToken, local } = databaseConfig(readEnv());
  let connection = connections.get(url);
  if (!connection) {
    connection = connect(url, authToken, local);
    connections.set(url, connection);
  }
  return connection;
}
