import 'server-only';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { database } from '@/lib/db/client';
import { settings } from '@/lib/db/schema';

export async function readSetting<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  const db = await database();
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  if (!row) return fallback;
  const parsed = schema.safeParse(row.value);
  return parsed.success ? parsed.data : fallback;
}

export async function writeSetting(key: string, value: unknown) {
  const db = await database();
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}
