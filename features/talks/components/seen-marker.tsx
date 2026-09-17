'use client';

import { useEffect } from 'react';
import { markSetupSeen } from '../actions';
import type { SeenStepId } from '../setup-steps';

export function SeenMarker({ talkId, step }: { talkId: string; step: SeenStepId }) {
  useEffect(() => {
    void markSetupSeen(talkId, step);
  }, [talkId, step]);
  return null;
}
