'use client';

import { EditableLine } from '@/components/ui/editable-line';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import type { DraftableField } from '@/lib/coach/tasks/draft-field';
import type { FieldSource } from '@/lib/domain';
import type { BriefTextField } from '../brief-fields';
import { useFieldDraft } from './use-field-draft';

type BriefLineProps = {
  name: BriefTextField;
  label: string;
  placeholder: string;
  value: string;
  size?: 'md' | 'lg';
  draft?: { field: DraftableField; context: BriefContext };
  onSave: (value: string, source: FieldSource) => void;
};

export function BriefLine({ draft, ...props }: BriefLineProps) {
  if (!draft) {
    return (
      <EditableLine
        id={`field-${props.name}`}
        label={props.label}
        placeholder={props.placeholder}
        value={props.value}
        size={props.size}
        onSave={value => props.onSave(value, 'user')}
      />
    );
  }
  return <DraftableLine draft={draft} {...props} />;
}

function DraftableLine({
  name,
  label,
  placeholder,
  value,
  size,
  draft,
  onSave,
}: BriefLineProps & { draft: NonNullable<BriefLineProps['draft']> }) {
  const { trigger, panel } = useFieldDraft({
    field: draft.field,
    fieldLabel: label,
    context: draft.context,
    hasValue: value.trim() !== '',
    onUse: text => onSave(text, 'coach-draft'),
  });

  return (
    <div className="flex flex-col gap-2">
      <EditableLine
        id={`field-${name}`}
        label={label}
        placeholder={placeholder}
        value={value}
        size={size}
        editActions={trigger}
        onSave={text => onSave(text, 'user')}
      />
      {panel}
    </div>
  );
}
