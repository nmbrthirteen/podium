'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './field';

type AddLineInputProps = {
  label: string;
  placeholder?: string;
  buttonLabel?: string;
  onAdd: (text: string) => void;
  className?: string;
};

export function AddLineInput({ label, placeholder, buttonLabel = 'Add', onAdd, className }: AddLineInputProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        aria-label={label}
        value={draft}
        placeholder={placeholder ?? label}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            add();
          }
        }}
      />
      <Button onClick={add}>{buttonLabel}</Button>
    </div>
  );
}
