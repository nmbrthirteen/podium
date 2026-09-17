import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { generateChecked } from './generate-checked';
import { lintOutput } from './output-lint';
import { CoachError, type CoachProvider, type CoachRequest } from './provider';
import { parseClaudeEnvelope } from './providers/claude-cli';
import { parseCodexOutput } from './providers/codex-cli';
import { toCliJsonSchema } from './providers/json-schema';
import { coachTasks } from './tasks';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'providers', 'fixtures', name), 'utf8');
const emDash = String.fromCharCode(0x2014);
const enDash = String.fromCharCode(0x2013);
const greetingSchema = z.object({ greeting: z.string(), instructions: z.string() });

describe('claude envelope parsing', () => {
  it('reads structured_output from the recorded envelope', () => {
    const output = greetingSchema.parse(parseClaudeEnvelope(fixture('claude-envelope.json')));
    expect(output.greeting.length).toBeGreaterThan(0);
  });

  it('falls back to the result string', () => {
    const envelope = JSON.stringify({ is_error: false, result: '{"greeting":"Hi","instructions":"none"}' });
    expect(parseClaudeEnvelope(envelope)).toEqual({ greeting: 'Hi', instructions: 'none' });
  });

  it('throws a failed error for an error envelope', () => {
    const envelope = JSON.stringify({ is_error: true, result: 'Credit balance is too low' });
    expect(() => parseClaudeEnvelope(envelope)).toThrowError(new CoachError('failed', 'Credit balance is too low'));
  });

  it('throws on stdout that is not JSON', () => {
    expect(() => parseClaudeEnvelope('Error: not logged in')).toThrow(CoachError);
  });
});

describe('codex output parsing', () => {
  it('reads the recorded output file', () => {
    const output = greetingSchema.parse(parseCodexOutput(fixture('codex-output.json')));
    expect(output.greeting.length).toBeGreaterThan(0);
  });

  it('throws on output that is not JSON', () => {
    expect(() => parseCodexOutput('')).toThrow(CoachError);
  });
});

describe('cli json schemas', () => {
  it('produces strict object schemas without the $schema key', () => {
    for (const task of Object.values(coachTasks)) {
      const json = toCliJsonSchema(task.schema);
      expect(json).not.toHaveProperty('$schema');
      expect(json.type).toBe('object');
      expect(json.additionalProperties).toBe(false);
    }
  });
});

describe('lintOutput', () => {
  it('passes clean output', () => {
    expect(lintOutput({ issues: [{ problem: 'The goal names no action.', action: 'Name the decision.' }] })).toEqual(
      [],
    );
  });

  it('flags em dashes and en dashes with their path', () => {
    const violations = lintOutput({ issues: [{ problem: `Too long ${emDash} cut it`, action: `Pages 3${enDash}5` }] });
    expect(violations).toEqual([
      { path: 'output.issues[0].problem', rule: 'em-dash', detail: 'Contains an em dash.' },
      { path: 'output.issues[0].action', rule: 'en-dash', detail: 'Contains an en dash.' },
    ]);
  });

  it('flags banned words', () => {
    const violations = lintOutput({ text: 'A seamless story that will supercharge your 10x pitch.' });
    expect(violations.map(violation => violation.detail)).toEqual([
      'Uses the banned word "seamless".',
      'Uses the banned word "supercharge".',
      'Uses the banned word "10x".',
    ]);
  });

  it('flags sentences over 25 words', () => {
    const long = Array.from({ length: 26 }, () => 'word').join(' ');
    expect(lintOutput(`Short one. ${long}.`)).toEqual([
      { path: 'output', rule: 'long-sentence', detail: 'Has a sentence with 26 words.' },
    ]);
    expect(lintOutput(Array.from({ length: 25 }, () => 'word').join(' '))).toEqual([]);
  });
});

function scriptedProvider(outputs: unknown[]) {
  const prompts: string[] = [];
  const provider: CoachProvider = {
    id: 'claude-cli',
    detect: async () => ({ available: true }),
    async generate<T>(request: CoachRequest<T>) {
      prompts.push(request.prompt);
      return request.schema.parse(outputs[prompts.length - 1]);
    },
  };
  return { provider, prompts };
}

const textRequest = {
  task: 'draft-field',
  system: 'system',
  prompt: 'Draft it.',
  schema: z.object({ text: z.string() }),
};

describe('generateChecked', () => {
  it('returns clean output after one call', async () => {
    const { provider, prompts } = scriptedProvider([{ text: 'Clean.' }]);
    await expect(generateChecked(provider, textRequest)).resolves.toEqual({
      output: { text: 'Clean.' },
      flagged: false,
    });
    expect(prompts).toHaveLength(1);
  });

  it('retries once with the violations listed', async () => {
    const { provider, prompts } = scriptedProvider([{ text: `Fast ${emDash} simple.` }, { text: 'Fast and simple.' }]);
    await expect(generateChecked(provider, textRequest)).resolves.toEqual({
      output: { text: 'Fast and simple.' },
      flagged: false,
    });
    expect(prompts).toHaveLength(2);
    expect(prompts[1]).toContain('output.text: Contains an em dash.');
  });

  it('flags output that fails twice', async () => {
    const { provider, prompts } = scriptedProvider([{ text: 'A seamless close.' }, { text: 'Still seamless.' }]);
    await expect(generateChecked(provider, textRequest)).resolves.toEqual({
      output: { text: 'Still seamless.' },
      flagged: true,
    });
    expect(prompts).toHaveLength(2);
  });
});
