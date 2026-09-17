'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { cn } from '@/lib/utils';

export type SegmentOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onValueChange: (value: T) => void;
  label: string;
  name?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  label,
  name,
  className,
}: SegmentedControlProps<T>) {
  return (
    <RadioGroup
      aria-label={label}
      name={name}
      value={value}
      onValueChange={next => {
        const match = options.find(option => option.value === next);
        if (match) onValueChange(match.value);
      }}
      className={cn('flex flex-wrap gap-1 rounded-card bg-inset p-1', className)}
    >
      {options.map(option => (
        <Radio.Root
          key={option.value}
          value={option.value}
          className="press flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-control px-3 font-medium whitespace-nowrap text-muted hover:text-ink data-checked:bg-surface data-checked:text-ink data-checked:shadow-card"
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
