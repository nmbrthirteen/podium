'use client';

import { CheckIcon, SparkIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { choiceIcons } from '../debrief-choices';

type ChoiceTilesProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  legendClassName?: string;
};

export function ChoiceTiles({ label, options, value, onChange, legendClassName }: ChoiceTilesProps) {
  return (
    <fieldset className="flex flex-col">
      <legend className={cn('mb-3 font-medium', legendClassName)}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const selected = option === value;
          const Icon = choiceIcons[option] ?? SparkIcon;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? '' : option)}
              className={cn(
                'press inline-flex min-h-10 items-center gap-2 rounded-full pr-4 pl-3 text-sm font-medium transition-colors pointer-coarse:min-h-11',
                selected ? 'bg-accent text-accent-ink' : 'bg-surface text-ink shadow-card hover:bg-inset',
              )}
            >
              {selected ? <CheckIcon size={16} /> : <Icon size={16} className="text-muted" />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
