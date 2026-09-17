'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type EditableLineProps = {
  id?: string;
  label: string;
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  trailing?: ReactNode;
  editActions?: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
};

export function EditableLine({
  id,
  label,
  value,
  placeholder,
  onSave,
  trailing,
  editActions,
  size = 'md',
  className,
}: EditableLineProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skipSave = useRef(false);
  const returnFocus = useRef(false);
  const labelId = useId();
  const valueId = useId();

  useEffect(() => {
    if (editing) {
      const input = inputRef.current;
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    } else if (returnFocus.current) {
      returnFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [editing]);

  const finish = () => {
    setEditing(false);
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const next = draft.trim();
    if (next !== value.trim()) onSave(next);
  };

  const textClass = size === 'lg' ? 'font-display text-2xl font-semibold sm:text-3xl' : 'text-lg';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex min-h-6 items-center gap-2">
        <span id={labelId} className="text-sm text-muted">
          {label}
        </span>
        {trailing && <span className="ml-auto flex items-center">{trailing}</span>}
      </div>
      {editing ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: focusout on the wrapper keeps editing open while focus moves to the edit actions
        <div
          tabIndex={-1}
          className="-mx-3 flex flex-col gap-1 outline-none"
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) finish();
          }}
        >
          <textarea
            ref={inputRef}
            id={id}
            aria-labelledby={labelId}
            value={draft}
            rows={1}
            className={cn(
              'field-sizing-content min-h-11 resize-none rounded-lg bg-surface px-3 py-2 text-pretty text-ink shadow-control',
              textClass,
            )}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                skipSave.current = true;
                returnFocus.current = true;
                event.currentTarget.blur();
              } else if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                returnFocus.current = true;
                event.currentTarget.blur();
              }
            }}
          />
          {editActions && <div className="flex justify-end">{editActions}</div>}
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          id={id}
          aria-labelledby={`${labelId} ${valueId}`}
          className="-mx-3 flex min-h-11 items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-inset"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <span id={valueId} className={cn('text-pretty', textClass, !value.trim() && 'font-normal text-muted')}>
            {value.trim() || placeholder}
          </span>
        </button>
      )}
    </div>
  );
}
