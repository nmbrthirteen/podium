'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

const holdMs = 1000;

type HoldButtonProps = { children: ReactNode; onComplete: () => void; className?: string };

export function HoldButton({ children, onComplete, className }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }, []);

  const start = useCallback(() => {
    if (timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      completeRef.current();
    }, holdMs);
  }, []);

  useEffect(() => cancel, [cancel]);

  const isHoldKey = (key: string) => key === ' ' || key === 'Enter';

  return (
    <button
      type="button"
      data-holding={holding}
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onKeyDown={event => {
        if (!isHoldKey(event.key)) return;
        event.preventDefault();
        if (!event.repeat) start();
      }}
      onKeyUp={event => {
        if (isHoldKey(event.key)) cancel();
      }}
      onBlur={cancel}
      onContextMenu={event => event.preventDefault()}
      className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'touch-none overflow-hidden', className)}
    >
      <span aria-hidden="true" className="hold-fill absolute inset-0 bg-accent-ink/20" />
      <span className="relative">{children}</span>
    </button>
  );
}
