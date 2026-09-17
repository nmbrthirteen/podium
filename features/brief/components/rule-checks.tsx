'use client';

import { Button } from '@/components/ui/button';
import type { RuleAction, RuleIssue } from '../rules';

export function RuleChecks({ issues, onAction }: { issues: RuleIssue[]; onAction: (action: RuleAction) => void }) {
  if (issues.length === 0) return null;

  return (
    <ul aria-label="Checks" className="flex flex-col gap-2">
      {issues.map(issue => (
        <li
          key={issue.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-danger-soft px-4 py-3"
        >
          <p className="text-danger">{issue.message}</p>
          <Button
            variant="quiet"
            size="sm"
            className="text-danger hover:bg-danger/10"
            onClick={() => onAction(issue.action)}
          >
            {issue.action.label}
          </Button>
        </li>
      ))}
    </ul>
  );
}
