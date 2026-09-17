'use client';

import { useState, useTransition } from 'react';
import { type DebriefValues, joinNote, splitNote, workOnChoices } from '@/features/debrief/debrief-choices';
import { setTalkDone } from '@/features/talks/actions';
import { saveTalkDebrief } from '../actions';
import { DebriefLocked } from './debrief-locked';
import { DebriefSteps } from './debrief-steps';
import { DebriefSummary } from './debrief-summary';
import type { ReceivedQuestion } from './received-questions';

type DebriefFormProps = {
  talkId: string;
  talkTypeLabel: string;
  when: string;
  locked: boolean;
  saved: boolean;
  done: boolean;
  initial: DebriefValues & { confidence: number | null };
  initialQuestions: ReceivedQuestion[];
};

export function DebriefForm({
  talkId,
  talkTypeLabel,
  when,
  locked,
  saved,
  done: initialDone,
  initial,
  initialQuestions,
}: DebriefFormProps) {
  const initialWork = splitNote(initial.workOn, workOnChoices('talk'));
  const [view, setView] = useState<'locked' | 'steps' | 'summary'>(saved ? 'summary' : locked ? 'locked' : 'steps');
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<DebriefValues>({
    excelled: initial.excelled,
    workOn: initialWork.choice,
    challenge: initial.challenge,
  });
  const [note, setNote] = useState(initialWork.note);
  const [confidence, setConfidence] = useState<number | null>(initial.confidence);
  const [items, setItems] = useState(initialQuestions);
  const [done, setDone] = useState(initialDone);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      if (confidence === null) return;
      try {
        await saveTalkDebrief(talkId, {
          ...values,
          workOn: joinNote(values.workOn, note),
          confidence,
          questions: items.map(item => ({ question: item.question, surprised: item.surprised })),
        });
        setError(null);
        setView('summary');
      } catch {
        setError('The debrief did not save. Check that the app is running, then save again.');
      }
    });

  const markDone = () =>
    startTransition(async () => {
      await setTalkDone(talkId, true);
      setDone(true);
    });

  if (view === 'locked') {
    return <DebriefLocked when={when} onContinue={() => setView('steps')} />;
  }

  if (view === 'summary') {
    return (
      <DebriefSummary
        talkTypeLabel={talkTypeLabel}
        values={values}
        confidence={confidence}
        items={items}
        done={done}
        pending={pending}
        onEdit={() => setView('steps')}
        onMarkDone={markDone}
      />
    );
  }

  return (
    <DebriefSteps
      step={step}
      onStepChange={setStep}
      values={values}
      onValuesChange={setValues}
      note={note}
      onNoteChange={setNote}
      confidence={confidence}
      onConfidenceChange={setConfidence}
      items={items}
      onItemsChange={setItems}
      error={error}
      pending={pending}
      saved={saved}
      onCancel={() => setView('summary')}
      onSave={save}
    />
  );
}
