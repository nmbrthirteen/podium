'use client';

import { useEffect, useState } from 'react';

export function useNow(running: boolean, intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [running, intervalMs]);

  return now;
}

export function useCountUp(startedAt: number | null, running = true) {
  const now = useNow(running && startedAt !== null);
  return startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1000);
}
