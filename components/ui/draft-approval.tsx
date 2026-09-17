'use client';

import { Button } from './button';

type DraftApprovalProps = {
  label: string;
  text: string;
  flagged?: boolean;
  onUse: () => void;
  onDiscard: () => void;
};

export function DraftApproval({ label, text, flagged = false, onUse, onDiscard }: DraftApprovalProps) {
  return (
    <section aria-label={label} className="enter-stagger flex flex-col gap-3 rounded-card bg-accent-soft p-4">
      <p className="text-sm font-medium text-accent">{label}</p>
      <p className="whitespace-pre-wrap">{text}</p>
      {flagged && <p className="text-sm text-muted">This draft may break a style rule. Read it before you use it.</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={onUse}>
          Use draft
        </Button>
        <Button variant="quiet" size="sm" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </section>
  );
}
