import { defineConfig } from 'drizzle-kit';

const tursoUrl = process.env.TURSO_DATABASE_URL;

export default defineConfig({
  dialect: 'turso',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: tursoUrl
    ? { url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: `file:${process.env.PODIUM_DATA_DIR ?? 'data'}/podium.db` },
});
