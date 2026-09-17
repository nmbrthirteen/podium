'use client';

import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Sheet({ open, onOpenChange, title, description, children, className }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-2xl flex-col gap-4 rounded-t-card bg-surface px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink shadow-overlay outline-none',
            className,
          )}
        >
          <Drawer.Handle className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-line-strong" />
          <div className="flex flex-col gap-1">
            <Drawer.Title className="font-display text-xl font-semibold">{title}</Drawer.Title>
            {description && <Drawer.Description className="text-muted">{description}</Drawer.Description>}
          </div>
          <div className="overflow-y-auto">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
