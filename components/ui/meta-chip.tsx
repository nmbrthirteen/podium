import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const metaChipVariants = cva(
  'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted tabular-nums',
  {
    variants: {
      tone: {
        inset: 'bg-inset',
        surface: 'bg-surface shadow-card',
      },
    },
    defaultVariants: { tone: 'inset' },
  },
);

type MetaChipProps = VariantProps<typeof metaChipVariants> & {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function MetaChip({ icon, tone, children, className }: MetaChipProps) {
  return (
    <span className={cn(metaChipVariants({ tone }), className)}>
      {icon}
      {children}
    </span>
  );
}
