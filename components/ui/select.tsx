'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from './icons';

export type SelectOption<T extends string> = { value: T; label: string };

type SelectProps<T extends string> = {
  id?: string;
  name?: string;
  value: T;
  options: SelectOption<T>[];
  onValueChange: (value: T) => void;
  className?: string;
};

export function Select<T extends string>({ id, name, value, options, onValueChange, className }: SelectProps<T>) {
  return (
    <BaseSelect.Root
      items={options}
      value={value}
      name={name}
      onValueChange={next => {
        if (next !== null) onValueChange(next);
      }}
    >
      <BaseSelect.Trigger
        id={id}
        className={cn(
          'press flex min-h-11 w-full items-center justify-between gap-2 rounded-control bg-surface px-3 text-left text-base shadow-control hover:bg-inset',
          className,
        )}
      >
        <BaseSelect.Value className="truncate" />
        <BaseSelect.Icon className="text-muted">
          <ChevronDownIcon size={18} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-50 outline-none">
          <BaseSelect.Popup className="max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-card bg-surface p-1 shadow-overlay transition-[opacity,scale] duration-(--motion-fast) ease-(--ease-out) data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <BaseSelect.List>
              {options.map(option => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex min-h-11 cursor-default items-center gap-2 rounded-control px-3 outline-none select-none data-highlighted:bg-inset"
                >
                  <span className="flex w-5 justify-center text-accent">
                    <BaseSelect.ItemIndicator>
                      <CheckIcon size={16} />
                    </BaseSelect.ItemIndicator>
                  </span>
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
