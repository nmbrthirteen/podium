import { z } from 'zod';
import { jsonSchema } from '@/lib/json';

export type LintRule = 'em-dash' | 'en-dash' | 'banned-word' | 'long-sentence';

export type LintViolation = { path: string; rule: LintRule; detail: string };

const emDash = String.fromCharCode(0x2014);
const enDash = String.fromCharCode(0x2013);
const bannedWords = /\b(seamless(ly)?|effortless(ly)?|10x|supercharg(e|es|ed|ing)|game-changing)\b/gi;
const maxSentenceWords = 25;

function lintString(value: string, path: string): LintViolation[] {
  const violations: LintViolation[] = [];

  if (value.includes(emDash)) violations.push({ path, rule: 'em-dash', detail: 'Contains an em dash.' });

  if (value.includes(enDash)) violations.push({ path, rule: 'en-dash', detail: 'Contains an en dash.' });

  for (const match of value.matchAll(bannedWords)) {
    violations.push({ path, rule: 'banned-word', detail: `Uses the banned word "${match[0]}".` });
  }

  for (const sentence of value.split(/(?<=[.!?])\s+/)) {
    const words = sentence.trim().split(/\s+/).filter(Boolean).length;

    if (words > maxSentenceWords) {
      violations.push({ path, rule: 'long-sentence', detail: `Has a sentence with ${words} words.` });
    }
  }

  return violations;
}

const nodeSchema = z.union([
  z.string().transform(text => ({ text })),
  z.array(jsonSchema).transform(items => ({ items })),
  z.record(z.string(), jsonSchema).transform(fields => ({ fields })),
]);

export function lintOutput<Raw>(value: Raw, path = 'output'): LintViolation[] {
  const node = nodeSchema.safeParse(value);

  if (!node.success) return [];

  if ('text' in node.data) return lintString(node.data.text, path);

  if ('items' in node.data) return node.data.items.flatMap((item, index) => lintOutput(item, `${path}[${index}]`));

  return Object.entries(node.data.fields).flatMap(([key, item]) => lintOutput(item, `${path}.${key}`));
}

export function describeViolations(violations: LintViolation[]) {
  return violations.map(violation => `- ${violation.path}: ${violation.detail}`).join('\n');
}
