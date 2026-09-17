import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type StepDotsProps = ComponentProps<'div'> & {
  count: number;
  current: number;
  currentClassName?: string;
};

export function StepDots({ count, current, currentClassName, className, ...props }: StepDotsProps) {
  return (
    <div className={cn('flex gap-1.5', className)} {...props}>
      {Array.from({ length: count }, (_, index) => index).map(index => (
        <span
          key={index}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            index < current ? 'bg-accent' : index === current ? (currentClassName ?? 'bg-accent') : 'bg-line',
          )}
        />
      ))}
    </div>
  );
}
