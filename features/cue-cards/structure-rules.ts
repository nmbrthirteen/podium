import type { RuleIssue } from '@/features/brief/rules';

export type StructureRuleInput = {
  lengthMinutes: number;
  sections: { id: string; minutes: number; keywords: string[] }[];
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

export function structureRules(input: StructureRuleInput): RuleIssue[] {
  const issues: RuleIssue[] = [];
  if (input.sections.length > 0) {
    const total = input.sections.reduce((sum, section) => sum + section.minutes, 0);
    if (Math.abs(total - input.lengthMinutes) > 0.01) {
      issues.push({
        id: 'section-minutes',
        message: `Sections add up to ${formatNumber(total)} minutes. The talk is ${formatNumber(input.lengthMinutes)}.`,
        action: { kind: 'open', panel: 'structure', label: 'Open structure' },
      });
    }
  }

  for (const section of input.sections) {
    if (section.keywords.length > 7) {
      issues.push({
        id: `card-keywords-${section.id}`,
        message: `This card has ${section.keywords.length} keywords. Keep 7 or fewer.`,
        action: { kind: 'focus', target: `card-${section.id}`, label: 'Edit card' },
      });
    }
  }
  return issues;
}
