import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'hidden min-w-6 items-center justify-center rounded-md bg-current/15 px-1.5 text-xs font-medium sm:inline-flex',
        className,
      )}
    >
      {children}
    </span>
  );
}
