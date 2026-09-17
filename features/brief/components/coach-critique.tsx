'use client';

import { Button } from '@/components/ui/button';
import { CheckIcon, SparkIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { briefCritique, type critiqueFields } from '@/lib/coach/tasks/brief-critique';
import { focusTarget } from '../brief-context';

type CritiqueField = (typeof critiqueFields)[number];

const fieldLabels: Record<CritiqueField, string> = {
  goal: 'The ask',
  audience: 'Audience',
  bigIdea: 'Big idea',
  points: 'Points',
  openingLine: 'Opening line',
  closingLine: 'Closing line',
};

const fieldTargets: Record<CritiqueField, string> = {
  goal: 'field-goal',
  audience: 'field-audience',
  bigIdea: 'field-bigIdea',
  points: 'points',
  openingLine: 'field-openingLine',
  closingLine: 'field-closingLine',
};

export function CoachCritique({ context }: { context: BriefContext }) {
  const critique = useCoachTask(briefCritique);
  const { state } = critique;

  return (
    <section aria-labelledby="critique-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="critique-heading" className="font-display text-xl font-semibold">
          Coach review
        </h2>
        <Button
          variant="secondary"
          size="sm"
          pending={state.status === 'running'}
          pendingLabel="Reviewing"
          onClick={() => void critique.run({ brief: context }, { fresh: state.status === 'result' })}
        >
          <SparkIcon size={16} />
          {state.status === 'result' ? 'Review again' : 'Review my brief'}
        </Button>
      </div>

      {state.status === 'running' && (
        <LoadingState label="The coach is reading your brief" onCancel={critique.cancel} />
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-danger">
          {state.message}
        </p>
      )}
      {state.status === 'result' &&
        (state.output.issues.length === 0 ? (
          <p className="flex items-center gap-2">
            <CheckIcon size={18} className="text-accent" />
            Nothing to fix
          </p>
        ) : (
          <ol className="enter-stagger flex flex-col gap-2" aria-live="polite">
            {state.output.issues.map(issue => (
              <li
                key={`${issue.field}-${issue.problem}`}
                className="flex flex-col items-start gap-1 rounded-xl bg-inset px-4 py-3"
              >
                <span className="text-sm text-muted">{fieldLabels[issue.field]}</span>
                <p>{issue.problem}</p>
                <p className="font-medium">{issue.action}</p>
                <Button
                  variant="quiet"
                  size="sm"
                  className="-ml-3"
                  onClick={() => focusTarget(fieldTargets[issue.field])}
                >
                  Go to {fieldLabels[issue.field].toLowerCase()}
                </Button>
              </li>
            ))}
          </ol>
        ))}
      {state.status === 'result' && state.flagged && (
        <p className="text-sm text-muted">Some wording may break a style rule.</p>
      )}
    </section>
  );
}
