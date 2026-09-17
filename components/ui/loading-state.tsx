'use client';

import { useState } from 'react';
import { useCountUp } from '@/hooks/use-now';
import { cn, formatClock } from '@/lib/utils';
import { Button } from './button';
import { PixelLoader } from './pixel-loader';

type LoadingStateProps = { label: string; onCancel?: () => void; className?: string };

export function LoadingState({ label, onCancel, className }: LoadingStateProps) {
  const [startedAt] = useState(() => Date.now());
  const seconds = useCountUp(startedAt);

  return (
    <div role="status" className={cn('flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1', className)}>
      <PixelLoader className="text-ink" />
      <span className="font-medium">{label}</span>
      <span className="font-mono text-sm text-muted tabular-nums">{formatClock(seconds)}</span>
      {onCancel && (
        <Button variant="quiet" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
