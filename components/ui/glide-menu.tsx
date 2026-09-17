'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Box = { top: number; height: number };

export function GlideMenu({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const moveTo = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const row = event.target.closest('[data-menu-row]');
      if (!(row instanceof HTMLElement) || !container.contains(row)) return;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      setBox({ top: rowRect.top - containerRect.top, height: rowRect.height });
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const hideOnBlur = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !container.contains(event.relatedTarget)) setVisible(false);
    };

    container.addEventListener('mouseover', moveTo);
    container.addEventListener('focusin', moveTo);
    container.addEventListener('mouseleave', hide);
    container.addEventListener('focusout', hideOnBlur);
    return () => {
      container.removeEventListener('mouseover', moveTo);
      container.removeEventListener('focusin', moveTo);
      container.removeEventListener('mouseleave', hide);
      container.removeEventListener('focusout', hideOnBlur);
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 rounded-control bg-inset transition-[translate,opacity] duration-(--motion-base) ease-(--ease-out)"
        style={{ height: box?.height ?? 0, translate: `0 ${box?.top ?? 0}px`, opacity: box && visible ? 1 : 0 }}
      />
      {children}
    </div>
  );
}
