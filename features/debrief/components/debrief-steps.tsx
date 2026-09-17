import { Button } from '@/components/ui/button';
import { ArrowRightIcon, FlagIcon } from '@/components/ui/icons';
import { LevelPicker } from '@/components/ui/level-picker';
import { StepDots } from '@/components/ui/step-dots';
import { challengeFor, type DebriefValues, wentWellChoices, withCurrent, workOnChoices } from '../debrief-choices';
import { ChoiceTiles } from './choice-tiles';
import { OptionalNote } from './optional-note';
import { type ReceivedQuestion, ReceivedQuestions } from './received-questions';

const stepIds = ['confidence', 'went-well', 'work-on', 'questions'] as const;
const stepCount = stepIds.length;
const questionClass = 'mb-5 font-display text-2xl font-semibold text-balance sm:text-3xl';

type DebriefStepsProps = {
  step: number;
  onStepChange: (step: number) => void;
  values: DebriefValues;
  onValuesChange: (values: DebriefValues) => void;
  note: string;
  onNoteChange: (note: string) => void;
  confidence: number | null;
  onConfidenceChange: (confidence: number) => void;
  items: ReceivedQuestion[];
  onItemsChange: (items: ReceivedQuestion[]) => void;
  error: string | null;
  pending: boolean;
  saved: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function DebriefSteps({
  step,
  onStepChange,
  values,
  onValuesChange,
  note,
  onNoteChange,
  confidence,
  onConfidenceChange,
  items,
  onItemsChange,
  error,
  pending,
  saved,
  onCancel,
  onSave,
}: DebriefStepsProps) {
  const advanceSoon = () => window.setTimeout(() => onStepChange(Math.min(step + 1, stepCount - 1)), 250);
  const last = step === stepCount - 1;
  const canContinue = step !== 0 || confidence !== null;
  const empty =
    (step === 1 && !values.excelled) || (step === 2 && !values.workOn) || (step === 3 && items.length === 0);

  return (
    <section aria-label="Debrief" className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <StepDots count={stepCount} current={step} className="flex-1" aria-hidden="true" />
        <span className="text-sm text-muted tabular-nums">
          {step + 1} of {stepCount}
        </span>
      </div>

      <div className="min-h-72 rounded-2xl bg-surface p-6 shadow-card sm:p-8">
        {step === 0 && (
          <div className="flex max-w-md flex-col">
            <h2 className={questionClass}>How confident did you feel?</h2>
            <LevelPicker
              label="How confident did you feel?"
              value={confidence}
              lowLabel="Shaky"
              highLabel="Fully confident"
              onChange={next => {
                onConfidenceChange(next);
                advanceSoon();
              }}
            />
          </div>
        )}
        {step === 1 && (
          <ChoiceTiles
            label="What went well?"
            legendClassName={questionClass}
            options={withCurrent(wentWellChoices('talk'), values.excelled)}
            value={values.excelled}
            onChange={excelled => {
              onValuesChange({ ...values, excelled });
              if (excelled) advanceSoon();
            }}
          />
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <ChoiceTiles
              label="What to work on next time?"
              legendClassName={questionClass}
              options={withCurrent(workOnChoices('talk'), values.workOn)}
              value={values.workOn}
              onChange={workOn => onValuesChange({ ...values, workOn, challenge: challengeFor[workOn] ?? '' })}
            />
            {values.challenge && (
              <p className="flex items-center gap-2 font-medium">
                <FlagIcon size={18} className="text-accent" />
                Next time: {values.challenge}.
              </p>
            )}
            <OptionalNote label="Add a note" value={note} onChange={onNoteChange} />
          </div>
        )}
        {step === 3 && <ReceivedQuestions headingClassName={questionClass} items={items} onChange={onItemsChange} />}
      </div>

      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="quiet" onClick={() => onStepChange(step - 1)}>
            Back
          </Button>
        ) : saved ? (
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        {last ? (
          <Button variant="primary" size="lg" pending={pending} pendingLabel="Saving the debrief" onClick={onSave}>
            Save debrief
          </Button>
        ) : (
          <Button
            variant={empty ? 'secondary' : 'primary'}
            size="lg"
            disabled={!canContinue}
            onClick={() => onStepChange(step + 1)}
            className="pr-4"
          >
            {empty ? 'Skip' : 'Next'}
            <ArrowRightIcon size={18} />
          </Button>
        )}
      </div>
    </section>
  );
}
