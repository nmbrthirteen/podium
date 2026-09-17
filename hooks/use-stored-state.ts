'use client';

import { useCallback, useEffect, useState } from 'react';
import type { z } from 'zod';

export function useStoredState<T>(key: string, fallback: T, schema: z.ZodType<T>) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) setValue(parsed.data);
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [key, schema]);

  const store = useCallback(
    (next: T) => {
      setValue(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  return [value, store] as const;
}
