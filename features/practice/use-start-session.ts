'use client';

import { useState, useTransition } from 'react';
import type { SessionKind } from '@/lib/domain';
import { startSession } from './actions';

/**
 * Wraps startSession in a transition. pendingKind is set synchronously,
 * ahead of the transition, so a tile can show "Starting" the instant it is
 * tapped instead of waiting for the (deprioritized) transition to render.
 */
export function useStartSession(talkId: string) {
  const [pendingKind, setPendingKind] = useState<SessionKind | null>(null);
  const [pending, startTransition] = useTransition();

  const start = (kind?: SessionKind, sectionId?: string | null) => {
    setPendingKind(kind ?? null);
    startTransition(async () => {
      await startSession(talkId, kind ? { kind, sectionId } : undefined);
    });
  };

  return { start, pending, pendingKind };
}
