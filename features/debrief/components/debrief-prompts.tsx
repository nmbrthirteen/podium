'use client';

import { FlagIcon } from '@/components/ui/icons';
import {
  challengeFor,
  type DebriefScope,
  type DebriefValues,
  wentWellChoices,
  withCurrent,
  workOnChoices,
} from '../debrief-choices';
import { ChoiceTiles } from './choice-tiles';

type DebriefPromptsProps = {
  values: DebriefValues;
  onChange: (values: DebriefValues) => void;
  scope: DebriefScope;
};

export function DebriefPrompts({ values, onChange, scope }: DebriefPromptsProps) {
  return (
    <div className="flex flex-col gap-8">
      <ChoiceTiles
        label="What went well?"
        options={withCurrent(wentWellChoices(scope), values.excelled)}
        value={values.excelled}
        onChange={excelled => onChange({ ...values, excelled })}
      />
      <ChoiceTiles
        label={scope === 'run' ? 'What to work on next run?' : 'What to work on next talk?'}
        options={withCurrent(workOnChoices(scope), values.workOn)}
        value={values.workOn}
        onChange={next => onChange({ ...values, workOn: next, challenge: challengeFor[next] ?? '' })}
      />
      {values.challenge && (
        <p className="flex items-center gap-2 font-medium">
          <FlagIcon size={18} className="text-accent" />
          Next time: {values.challenge}.
        </p>
      )}
    </div>
  );
}
