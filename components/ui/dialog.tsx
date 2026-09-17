'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CloseIcon } from './icons';

export const Dialog = BaseDialog.Root;
export const DialogClose = BaseDialog.Close;

type DialogContentProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function DialogContent({ title, description, children, className }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-scrim transition-opacity duration-(--motion-base) data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-1/2 flex-col gap-4 overflow-y-auto rounded-card bg-surface p-6 shadow-overlay transition-[opacity,scale] duration-(--motion-base) ease-(--ease-out) data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-(--motion-fast) data-starting-style:scale-95 data-starting-style:opacity-0',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <BaseDialog.Title className="font-display text-xl font-semibold">{title}</BaseDialog.Title>
            {description && <BaseDialog.Description className="text-muted">{description}</BaseDialog.Description>}
          </div>
          <BaseDialog.Close className="press -mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-inset hover:text-ink">
            <CloseIcon />
            <span className="sr-only">Close</span>
          </BaseDialog.Close>
        </div>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
