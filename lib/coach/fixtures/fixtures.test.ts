import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { lintOutput } from '../output-lint';
import { briefContextSchema } from '../tasks/brief-context';
import { briefCritique } from '../tasks/brief-critique';

const folder = path.join(__dirname, 'briefs');
const fixtureSchema = z.object({
  brief: briefContextSchema,
  provider: z.string(),
  flagged: z.boolean(),
  critique: briefCritique.schema,
});

const files = readdirSync(folder).filter(file => file.endsWith('.json'));

describe('recorded brief critiques', () => {
  it('covers the five sample talk types', () => {
    expect(files.map(file => file.replace('.json', '')).sort()).toEqual([
      'conference-talk',
      'exec-update',
      'lecture',
      'pitch',
      'team-meeting',
    ]);
  });

  for (const file of files) {
    it(`${file} matches the schema and passes the style lint`, () => {
      const fixture = fixtureSchema.parse(JSON.parse(readFileSync(path.join(folder, file), 'utf8')));
      expect(fixture.brief.type).toBe(file.replace('.json', ''));
      expect(fixture.flagged).toBe(false);
      expect(lintOutput(fixture.critique)).toEqual([]);
      expect(briefCritique.promptFor({ brief: fixture.brief })).toContain(fixture.brief.bigIdea);
    });
  }
});
