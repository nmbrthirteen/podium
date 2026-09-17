import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IconBadge } from './icon-badge';

type FlowStepProps = { marker: ReactNode; last?: boolean; id?: string; className?: string; children: ReactNode };

export function FlowStep({ marker, last = false, id, className, children }: FlowStepProps) {
  return (
    <li id={id} tabIndex={id ? -1 : undefined} className={cn('flex gap-4 outline-none', className)}>
      <div className="flex flex-col items-center">
        <IconBadge size="10" tone="surface" className="font-semibold tabular-nums">
          {marker}
        </IconBadge>
        {!last && <span aria-hidden="true" className="w-0.5 flex-1 bg-line" />}
      </div>
      <div className={cn('flex min-w-0 flex-1 flex-col gap-1 pt-1', !last && 'pb-8')}>{children}</div>
    </li>
  );
}
