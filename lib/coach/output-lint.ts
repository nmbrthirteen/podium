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

export function lintOutput(value: unknown, path = 'output'): LintViolation[] {
  if (typeof value === 'string') return lintString(value, path);
  if (Array.isArray(value)) return value.flatMap((item, index) => lintOutput(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => lintOutput(item, `${path}.${key}`));
  }
  return [];
}

export function describeViolations(violations: LintViolation[]) {
  return violations.map(violation => `- ${violation.path}: ${violation.detail}`).join('\n');
}
