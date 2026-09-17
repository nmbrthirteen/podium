'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type LevelPickerProps = {
  label: string;
  value: number | null;
  levels?: number;
  lowLabel: string;
  highLabel: string;
  onChange: (value: number) => void;
};

export function LevelPicker({ label, value, levels = 5, lowLabel, highLabel, onChange }: LevelPickerProps) {
  const name = useId();
  const all = Array.from({ length: levels }, (_, index) => index + 1);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{label}</legend>
      <div className="flex h-20 items-end gap-2">
        {all.map(level => {
          const filled = value !== null && level <= value;
          return (
            <label
              key={level}
              style={{ height: `${35 + ((level - 1) / Math.max(levels - 1, 1)) * 65}%` }}
              className={cn(
                'press level-bar flex flex-1 cursor-pointer items-end justify-center rounded-control pb-2 font-medium tabular-nums has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                filled ? 'bg-accent text-accent-ink' : 'bg-inset text-muted',
              )}
            >
              <input
                type="radio"
                name={name}
                value={level}
                checked={value === level}
                aria-label={`${level} of ${levels}`}
                onChange={() => onChange(level)}
                className="sr-only"
              />
              <span aria-hidden="true">{level}</span>
            </label>
          );
        })}
      </div>
      <div className="flex justify-between text-sm text-muted" aria-hidden="true">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  );
}
