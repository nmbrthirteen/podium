import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const iconBadgeVariants = cva('flex shrink-0 items-center justify-center rounded-full', {
  variants: {
    size: {
      '7': 'size-7',
      '8': 'size-8',
      '10': 'size-10',
      '11': 'size-11',
      '13': 'size-13',
      '14': 'size-14',
      '16': 'size-16',
      '20': 'size-20',
    },
    tone: {
      accent: 'bg-accent text-accent-ink',
      soft: 'bg-accent-soft text-accent',
      surface: 'bg-surface text-accent shadow-card',
      'on-accent': 'bg-accent-ink/15',
      neutral: 'bg-inset text-muted',
    },
  },
  defaultVariants: { size: '10', tone: 'soft' },
});

type IconBadgeProps = ComponentProps<'span'> & VariantProps<typeof iconBadgeVariants>;

export function IconBadge({ size, tone, className, children, ...props }: IconBadgeProps) {
  return (
    <span className={cn(iconBadgeVariants({ size, tone }), className)} {...props}>
      {children}
    </span>
  );
}
