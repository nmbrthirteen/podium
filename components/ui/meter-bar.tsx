import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const meterBarVariants = cva('block h-2 w-full overflow-hidden rounded-full', {
  variants: {
    tone: {
      accent: 'bg-accent-soft',
      inset: 'bg-inset',
    },
  },
  defaultVariants: { tone: 'accent' },
});

type MeterBarProps = VariantProps<typeof meterBarVariants> & {
  value: number;
  animated?: boolean;
  className?: string;
};

export function MeterBar({ value, tone, animated = false, className }: MeterBarProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <span aria-hidden="true" className={cn(meterBarVariants({ tone }), className)}>
      <span
        className={cn('block h-full rounded-full bg-accent', animated && 'bar-grow')}
        style={{ width: `${clamped * 100}%` }}
      />
    </span>
  );
}
