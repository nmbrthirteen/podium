'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-card! bg-surface! text-ink! shadow-overlay! border-0! font-sans! text-base!',
          description: 'text-muted!',
          actionButton: 'bg-accent! text-accent-ink! rounded-control!',
        },
      }}
    />
  );
}
