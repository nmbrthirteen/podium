'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckMark } from './check-mark';

export type ChecklistItem = {
  id: string;
  title: ReactNode;
  detail?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  done: boolean;
  disabled?: boolean;
};

type ChecklistProps = {
  items: ChecklistItem[];
  onToggle?: (id: string, done: boolean) => void;
  label: string;
  className?: string;
};

export function Checklist({ items, onToggle, label, className }: ChecklistProps) {
  const [doneAtMount] = useState(() => new Set(items.filter(item => item.done).map(item => item.id)));

  return (
    <ul aria-label={label} className={cn('divide-y divide-line', className)}>
      {items.map(item => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <label className={cn('flex min-h-11 min-w-0 flex-1 items-start gap-3', onToggle && 'cursor-pointer')}>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={item.done}
              disabled={item.disabled || !onToggle}
              onChange={event => onToggle?.(item.id, event.target.checked)}
            />
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-control text-accent-ink shadow-control peer-checked:bg-accent peer-checked:shadow-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
            >
              {item.done && <CheckMark animate={!doneAtMount.has(item.id)} />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={cn('font-medium', item.done && 'text-muted line-through')}>{item.title}</span>
              {item.detail && <span className="text-sm text-muted">{item.detail}</span>}
            </span>
            {item.meta && <span className="shrink-0 pt-0.5 text-sm text-muted tabular-nums">{item.meta}</span>}
          </label>
          {item.action}
        </li>
      ))}
    </ul>
  );
}
