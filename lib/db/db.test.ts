import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { asc, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { database } from './client';
import { runs, sections, talks } from './schema';

const dataDir = mkdtempSync(path.join(os.tmpdir(), 'podium-db-test-'));

beforeAll(() => {
  process.env.PODIUM_DATA_DIR = dataDir;
});

afterAll(() => {
  delete process.env.PODIUM_DATA_DIR;
  rmSync(dataDir, { recursive: true, force: true });
});

describe('database', () => {
  it('migrates a fresh data directory, then stores a talk with sections and a run', async () => {
    const db = await database();
    const now = new Date().toISOString();

    await db.insert(talks).values({
      id: 'talk-1',
      title: 'Board update',
      type: 'exec-update',
      depth: 'standard',
      stakes: 'high',
      startsAt: '2026-09-18T14:00',
      lengthMinutes: 10,
      nervousness: 4,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(sections).values([
      { id: 'section-1', talkId: 'talk-1', position: 0, title: 'Answer first', minutes: 1, keywords: ['Revenue up'] },
      { id: 'section-2', talkId: 'talk-1', position: 1, title: 'Reasons', minutes: 9, slideNumbers: [2, 3] },
    ]);
    await db.insert(runs).values({
      id: 'run-1',
      talkId: 'talk-1',
      kind: 'full-run',
      startedAt: now,
      endedAt: now,
      sectionTimings: [{ sectionId: 'section-1', seconds: 75, budgetSeconds: 60, peeks: 2 }],
    });

    const talk = await db.query.talks.findFirst({ where: eq(talks.id, 'talk-1') });
    const storedSections = await db
      .select()
      .from(sections)
      .where(eq(sections.talkId, 'talk-1'))
      .orderBy(asc(sections.position));
    const storedRun = await db.query.runs.findFirst({ where: eq(runs.talkId, 'talk-1') });

    expect(talk).toMatchObject({ title: 'Board update', stakes: 'high', lengthMinutes: 10 });
    expect(storedSections.map(section => [section.title, section.keywords, section.slideNumbers])).toEqual([
      ['Answer first', ['Revenue up'], []],
      ['Reasons', [], [2, 3]],
    ]);
    expect(storedRun?.sectionTimings).toEqual([{ sectionId: 'section-1', seconds: 75, budgetSeconds: 60, peeks: 2 }]);
    expect(storedRun?.recordingPath).toBeNull();
  });
});
