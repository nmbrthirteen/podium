import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from './icons';

type DisclosureProps = { summary: ReactNode; children: ReactNode; className?: string };

export function Disclosure({ summary, children, className }: DisclosureProps) {
  return (
    <details className={cn('group border-t border-line', className)}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDownIcon size={20} className="text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-6 pt-2 pb-4">{children}</div>
    </details>
  );
}
