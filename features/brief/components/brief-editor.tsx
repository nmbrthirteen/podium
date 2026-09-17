'use client';

import { useState } from 'react';
import { Disclosure } from '@/components/ui/disclosure';
import { FlowStep } from '@/components/ui/flow-step';
import { FlagIcon, QuoteIcon } from '@/components/ui/icons';
import type { Brief, Point, Question, Talk } from '@/lib/db/schema';
import type { FieldSource } from '@/lib/domain';
import { saveBriefField } from '../actions';
import { defaultRecoveryLine, toBriefContext } from '../brief-context';
import type { BriefTextField } from '../brief-fields';
import { briefRules, type RuleAction } from '../rules';
import { BriefLine } from './brief-text-field';
import { CoachCritique } from './coach-critique';
import { HardestQuestions } from './hardest-questions';
import { type EditablePoint, PointsEditor } from './points-editor';
import { RuleChecks } from './rule-checks';
import { TalkDetails } from './talk-details';

type BriefEditorProps = {
  talk: Talk;
  brief: Brief;
  points: Point[];
  questions: Question[];
  draftFailed: boolean;
  onRuleAction: (action: RuleAction) => void;
};

type LineSpec = { label: string; placeholder: string; size?: 'lg'; draftable: boolean };

const lines: Record<BriefTextField, LineSpec> = {
  bigIdea: { label: 'Big idea', placeholder: 'Tap to write your big idea', size: 'lg', draftable: true },
  audience: { label: 'Audience', placeholder: 'Tap to describe the room', draftable: true },
  goal: { label: 'The ask', placeholder: 'Tap to write what they should do', draftable: true },
  openingLine: { label: 'Opening line', placeholder: 'Tap to write your first line', draftable: true },
  closingLine: { label: 'Closing line', placeholder: 'Tap to write your last line', draftable: true },
  recoveryLine: { label: 'If you blank', placeholder: defaultRecoveryLine, draftable: true },
  backPocketQuestion: { label: 'Question for a quiet room', placeholder: 'Tap to write one', draftable: false },
};

export function BriefEditor({ talk, brief, points, questions, draftFailed, onRuleAction }: BriefEditorProps) {
  const [values, setValues] = useState<Record<BriefTextField, string>>(() => ({
    goal: brief.goal,
    audience: brief.audience,
    bigIdea: brief.bigIdea,
    openingLine: brief.openingLine,
    closingLine: brief.closingLine,
    recoveryLine: brief.recoveryLine,
    backPocketQuestion: brief.backPocketQuestion,
  }));
  const [pointList, setPointList] = useState<EditablePoint[]>(points);

  const context = toBriefContext(talk, values, pointList);
  const issues = briefRules({ ...values, points: pointList });

  const line = (field: BriefTextField) => {
    const spec = lines[field];
    return (
      <BriefLine
        name={field}
        label={spec.label}
        placeholder={spec.placeholder}
        size={spec.size}
        value={values[field]}
        draft={spec.draftable && field !== 'backPocketQuestion' ? { field, context } : undefined}
        onSave={(value: string, source: FieldSource) => {
          setValues(current => ({ ...current, [field]: value }));
          void saveBriefField(talk.id, field, value, source);
        }}
      />
    );
  };

  return (
    <div className="flex flex-col gap-12">
      {draftFailed && (
        <p role="status" className="rounded-xl bg-inset px-4 py-3">
          The coach could not draft this brief. Tap any line to write it.
        </p>
      )}

      <RuleChecks issues={issues} onAction={onRuleAction} />

      <section aria-label="Big idea" className="rounded-2xl bg-accent-soft px-6 py-6 sm:px-8">
        {line('bigIdea')}
      </section>

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {line('audience')}
        {line('goal')}
      </div>

      <section aria-labelledby="flow-heading" className="flex flex-col gap-6">
        <h2 id="flow-heading" className="font-display text-xl font-semibold">
          Flow
        </h2>
        <ol className="flex flex-col">
          <FlowStep marker={<QuoteIcon size={18} />}>{line('openingLine')}</FlowStep>
          <PointsEditor talkId={talk.id} points={pointList} setPoints={setPointList} />
          <FlowStep marker={<FlagIcon size={18} />} last>
            {line('closingLine')}
          </FlowStep>
        </ol>
      </section>

      <CoachCritique context={context} />

      <div className="flex flex-col">
        <Disclosure summary="Date, length, and type">
          <TalkDetails talk={talk} />
        </Disclosure>
        <Disclosure summary="Backup lines and hard questions" className="border-b">
          {line('recoveryLine')}
          {line('backPocketQuestion')}
          <HardestQuestions talkId={talk.id} questions={questions} />
        </Disclosure>
      </div>
    </div>
  );
}
