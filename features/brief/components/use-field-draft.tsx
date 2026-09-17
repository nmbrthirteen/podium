'use client';

import { Button } from '@/components/ui/button';
import { DraftApproval } from '@/components/ui/draft-approval';
import { SparkIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { type DraftableField, draftField } from '@/lib/coach/tasks/draft-field';

type DraftButtonProps = {
  field: DraftableField;
  fieldLabel: string;
  context: BriefContext;
  hasValue: boolean;
  onUse: (text: string) => void;
};

export function useFieldDraft({ field, fieldLabel, context, hasValue, onUse }: DraftButtonProps) {
  const draft = useCoachTask(draftField);

  const trigger = (
    <Button
      variant="quiet"
      size="sm"
      onClick={() => void draft.run({ brief: context, field }, { fresh: draft.state.status === 'result' })}
      disabled={draft.state.status === 'running'}
      aria-label={`${hasValue ? 'Redraft' : 'Draft'} the ${fieldLabel.toLowerCase()} with the coach`}
    >
      <SparkIcon size={16} />
      {hasValue ? 'Redraft' : 'Draft'}
    </Button>
  );

  const panel =
    draft.state.status === 'running' ? (
      <LoadingState label="The coach is drafting" onCancel={draft.cancel} />
    ) : draft.state.status === 'error' ? (
      <p role="alert" className="text-sm text-danger">
        {draft.state.message}
      </p>
    ) : draft.state.status === 'result' ? (
      <DraftApproval
        label={`Coach draft for the ${fieldLabel.toLowerCase()}`}
        text={draft.state.output.text}
        flagged={draft.state.flagged}
        onUse={() => {
          if (draft.state.status === 'result') onUse(draft.state.output.text);
          draft.reset();
        }}
        onDiscard={draft.reset}
      />
    ) : null;

  return { trigger, panel };
}
