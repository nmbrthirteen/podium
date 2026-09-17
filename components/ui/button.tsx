import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { PixelLoader } from './pixel-loader';

export const buttonVariants = cva(
  'press relative inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-ink hover:bg-accent/90',
        secondary: 'bg-surface text-ink shadow-card hover:bg-inset',
        quiet: 'text-ink hover:bg-inset',
        danger: 'bg-surface text-danger shadow-card hover:bg-danger-soft',
      },
      size: {
        sm: 'min-h-9 px-3 text-sm pointer-coarse:min-h-11',
        md: 'min-h-10 px-4 text-base pointer-coarse:min-h-11',
        lg: 'min-h-12 px-5 text-base',
        icon: 'size-10 pointer-coarse:size-11',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    pending?: boolean;
    pendingLabel?: string;
  };

export function Button({
  variant,
  size,
  pending = false,
  pendingLabel = 'Working',
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      <span className={cn('inline-flex items-center gap-2', pending && 'invisible')}>{children}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <PixelLoader />
          <span className="sr-only">{pendingLabel}</span>
        </span>
      )}
    </button>
  );
}
