'use client';

import { AddLineInput } from '@/components/ui/add-line-input';
import { Button } from '@/components/ui/button';
import { CheckMark } from '@/components/ui/check-mark';
import { TrashIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type ReceivedQuestion = { id: string; question: string; surprised: boolean };

type ReceivedQuestionsProps = {
  items: ReceivedQuestion[];
  onChange: (items: ReceivedQuestion[]) => void;
  headingClassName?: string;
};

export function ReceivedQuestions({ items, onChange, headingClassName }: ReceivedQuestionsProps) {
  return (
    <section aria-labelledby="received-heading" className="flex flex-col gap-3">
      <h2 id="received-heading" className={cn('font-display text-xl font-semibold', headingClassName)}>
        Any questions from the audience?
      </h2>

      {items.length > 0 && (
        <ul className="divide-y divide-line border-y border-line">
          {items.map(item => (
            <li key={item.id} className="flex flex-wrap items-center gap-2 py-2">
              <p className="min-w-0 flex-1">{item.question}</p>
              <button
                type="button"
                aria-pressed={item.surprised}
                onClick={() =>
                  onChange(
                    items.map(other => (other.id === item.id ? { ...other, surprised: !other.surprised } : other)),
                  )
                }
                className={cn(
                  'press flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium shadow-control',
                  item.surprised ? 'bg-accent-soft text-accent shadow-none' : 'bg-surface text-ink hover:bg-inset',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-5 items-center justify-center rounded-control',
                    item.surprised ? 'bg-accent text-accent-ink' : 'shadow-control',
                  )}
                >
                  {item.surprised && <CheckMark size={12} />}
                </span>
                Surprised me
              </button>
              <Button
                variant="quiet"
                size="icon"
                aria-label={`Remove question: ${item.question}`}
                onClick={() => onChange(items.filter(other => other.id !== item.id))}
              >
                <TrashIcon size={18} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddLineInput
        label="A question someone asked"
        onAdd={question => onChange([...items, { id: crypto.randomUUID(), question, surprised: false }])}
      />
    </section>
  );
}
