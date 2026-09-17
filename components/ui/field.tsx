'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FieldProps = {
  label: ReactNode;
  description?: ReactNode;
  error?: string | null;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({ label, description, error, trailing, className, children }: FieldProps) {
  return (
    <BaseField.Root invalid={Boolean(error)} className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <BaseField.Label className="font-medium">{label}</BaseField.Label>
        {trailing}
      </div>
      {children}
      {description && <BaseField.Description className="text-sm text-muted">{description}</BaseField.Description>}
      {error && (
        <BaseField.Error match className="text-sm font-medium text-danger">
          {error}
        </BaseField.Error>
      )}
    </BaseField.Root>
  );
}

const controlClass =
  'w-full rounded-control bg-surface px-3 text-base text-ink shadow-control placeholder:text-muted data-invalid:shadow-[inset_0_0_0_2px_var(--danger)] disabled:opacity-50';

export function Input({ className, ...props }: ComponentProps<typeof BaseField.Control>) {
  return <BaseField.Control className={cn('min-h-11', controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <BaseField.Control
      render={<textarea className={cn('field-sizing-content min-h-24 py-2.5', controlClass, className)} {...props} />}
    />
  );
}
