'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { PlusIcon } from '@/components/ui/icons';

type OptionalNoteProps = { label: string; value: string; onChange: (value: string) => void };

export function OptionalNote({ label, value, onChange }: OptionalNoteProps) {
  const [open, setOpen] = useState(value.trim() !== '');
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && focusOnOpen) inputRef.current?.focus();
  }, [open, focusOnOpen]);

  if (!open) {
    return (
      <Button
        variant="quiet"
        className="-ml-4 self-start text-muted"
        onClick={() => {
          setFocusOnOpen(true);
          setOpen(true);
        }}
      >
        <PlusIcon size={16} />
        {label}
      </Button>
    );
  }

  return (
    <Field label={label}>
      <Textarea ref={inputRef} value={value} rows={2} onChange={event => onChange(event.target.value)} />
    </Field>
  );
}
