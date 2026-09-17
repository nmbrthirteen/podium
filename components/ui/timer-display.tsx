import type { ReactNode } from 'react';
import { cn, formatClock } from '@/lib/utils';

const sizeClass = {
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl sm:text-6xl',
};

type TimerDisplayProps = {
  label: ReactNode;
  seconds: number;
  total?: number;
  size?: keyof typeof sizeClass;
  over?: boolean;
  className?: string;
};

export function TimerDisplay({ label, seconds, total, size = 'md', over = false, className }: TimerDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-sm text-muted">{label}</span>
      <span className={cn('font-mono leading-none font-medium tabular-nums', sizeClass[size], over && 'text-danger')}>
        {formatClock(seconds)}
        {total !== undefined && <span className="text-base text-muted"> of {formatClock(total)}</span>}
      </span>
    </div>
  );
}
