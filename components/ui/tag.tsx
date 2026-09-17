import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex shrink-0 items-center rounded-control px-1.5 py-0.5 text-sm leading-tight font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-inset text-muted',
        accent: 'bg-accent-soft text-accent',
        danger: 'bg-danger-soft text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type TagProps = VariantProps<typeof tagVariants> & { children: ReactNode; className?: string; title?: string };

export function Tag({ tone, children, className, title }: TagProps) {
  return (
    <span title={title} className={cn(tagVariants({ tone }), className)}>
      {children}
    </span>
  );
}
