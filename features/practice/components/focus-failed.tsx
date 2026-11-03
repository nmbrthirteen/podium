'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { retryNextFocus } from '../run-actions';

export function FocusFailed({ talkId }: { talkId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <section aria-label="Coach focus" className="flex flex-col items-start gap-3 rounded-card bg-inset p-5">
      <p role="status">The coach could not pick your next focus. Try again.</p>
      <Button
        variant="secondary"
        pending={pending}
        pendingLabel="Picking a focus"
        onClick={() => startTransition(() => retryNextFocus(talkId))}
      >
        Try again
      </Button>
    </section>
  );
}
