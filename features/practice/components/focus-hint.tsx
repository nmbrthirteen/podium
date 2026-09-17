'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { sentenceLabel } from '@/features/plan/session-kinds';
import type { SessionKind } from '@/lib/domain';
import { markFocusFixed } from '../run-actions';
import { StartSessionButton } from './start-session-button';

type FocusHintProps = { talkId: string; focus: string; reason: string; kind: SessionKind };

export function FocusHint({ talkId, focus, reason, kind }: FocusHintProps) {
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();
  if (hidden) return null;

  return (
    <section
      aria-labelledby="focus-heading"
      className="flex flex-col items-start gap-3 rounded-card bg-accent-soft p-5"
    >
      <h2 id="focus-heading" className="text-sm font-medium text-accent">
        Coach focus for your next run
      </h2>
      <p className="font-display text-xl font-semibold">{focus}</p>
      <p>{reason}</p>
      <div className="flex flex-wrap gap-2">
        <StartSessionButton talkId={talkId} kind={kind} label={`Start a ${sentenceLabel(kind)}`} size="md" />
        <Button
          variant="quiet"
          pending={pending}
          pendingLabel="Marking fixed"
          onClick={() =>
            startTransition(async () => {
              await markFocusFixed(talkId, focus);
              setHidden(true);
            })
          }
        >
          Mark fixed
        </Button>
      </div>
    </section>
  );
}
