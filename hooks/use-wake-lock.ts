'use client';

import { useEffect, useState } from 'react';

export type WakeLockStatus = 'idle' | 'active' | 'unsupported';

export function useWakeLock(active: boolean) {
  const [status, setStatus] = useState<WakeLockStatus>('idle');

  useEffect(() => {
    if (!active) return;
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported');
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await next.release();
          return;
        }
        sentinel = next;
        setStatus('active');
      } catch {
        setStatus('unsupported');
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void request();
    };

    void request();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release();
    };
  }, [active]);

  return status;
}
