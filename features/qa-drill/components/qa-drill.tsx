'use client';

import { useState, useTransition } from 'react';
import { AddLineInput } from '@/components/ui/add-line-input';
import { Button } from '@/components/ui/button';
import { EditableLine } from '@/components/ui/editable-line';
import { LoadingState } from '@/components/ui/loading-state';
import { SavedPanel } from '@/features/practice/components/saved-panel';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { qaPredict } from '@/lib/coach/tasks/qa-predict';
import { pluralize } from '@/lib/utils';
import { finishDrill, saveDrillAudience, savePredictedQuestions } from '../actions';
import { DrillQuestion } from './drill-question';

export type DrillItem = { question: string; why: string; fromPastTalk: boolean };

type QaDrillProps = {
  talkId: string;
  sessionId: string | null;
  context: BriefContext;
  pastSurprising: string[];
  backPocketQuestion: string;
};

const drillLength = 5;

type Phase = 'setup' | 'questions' | 'wrap' | 'done';

export function QaDrill({ talkId, sessionId, context, pastSurprising, backPocketQuestion }: QaDrillProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [audience, setAudience] = useState(context.audience);
  const [items, setItems] = useState<DrillItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [backPocket, setBackPocket] = useState(backPocketQuestion);
  const [pending, startTransition] = useTransition();
  const predict = useCoachTask(qaPredict);

  const pastItems = pastSurprising.slice(0, drillLength).map(question => ({
    question,
    why: 'This surprised you in an earlier talk of the same type.',
    fromPastTalk: true,
  }));

  const begin = async () => {
    if (audience !== context.audience) await saveDrillAudience(talkId, audience);
    const output = await predict.run({ brief: { ...context, audience }, pastSurprising });
    const predicted = (output?.questions ?? []).map(item => ({ ...item, fromPastTalk: false }));
    const merged = [...pastItems, ...predicted].slice(0, drillLength);
    if (output)
      await savePredictedQuestions(
        talkId,
        predicted.map(item => item.question),
      );
    if (merged.length === 0) return;
    setItems(merged);
    setPhase('questions');
  };

  if (phase === 'setup') {
    const coachFailed = predict.state.status === 'error';
    const manualItems = [...pastItems, ...items].slice(0, drillLength);
    return (
      <div className="flex flex-col gap-8">
        <EditableLine
          label="Who is asking"
          value={audience}
          placeholder="Tap to describe the audience. The coach plays a skeptic from it."
          onSave={setAudience}
        />

        {predict.state.status === 'running' ? (
          <LoadingState label="The coach is writing hard questions" onCancel={predict.cancel} />
        ) : (
          <Button variant="primary" size="lg" className="self-start" onClick={() => void begin()}>
            Ask me 5 questions
          </Button>
        )}

        {coachFailed && (
          <section aria-labelledby="own-heading" className="flex flex-col gap-3">
            <p role="alert" className="text-danger">
              {predict.state.status === 'error' ? predict.state.message : ''} Add your own questions to drill now.
            </p>
            <h2 id="own-heading" className="font-display text-xl font-semibold">
              Your questions
            </h2>
            {manualItems.length > 0 && (
              <ol className="flex list-decimal flex-col gap-1 pl-6">
                {manualItems.map(item => (
                  <li key={item.question}>{item.question}</li>
                ))}
              </ol>
            )}
            <AddLineInput
              label="A question your audience might ask"
              onAdd={question =>
                setItems(list => [...list, { question, why: 'You added this question.', fromPastTalk: false }])
              }
            />
            <Button
              variant="primary"
              className="self-start"
              disabled={manualItems.length === 0}
              onClick={() => {
                setItems(manualItems);
                setPhase('questions');
              }}
            >
              Start the drill
            </Button>
          </section>
        )}
      </div>
    );
  }

  if (phase === 'questions') {
    const item = items[current];
    if (!item) return null;
    return (
      <DrillQuestion
        key={`${current}-${item.question}`}
        talkId={talkId}
        audience={audience}
        item={item}
        position={current + 1}
        total={items.length}
        onSaved={() => {
          setAnswered(count => count + 1);
          if (current + 1 >= items.length) setPhase('wrap');
          else setCurrent(current + 1);
        }}
      />
    );
  }

  if (phase === 'wrap') {
    return (
      <section aria-labelledby="wrap-heading" className="flex flex-col items-start gap-5">
        <h2 id="wrap-heading" className="font-display text-2xl font-semibold">
          One back-pocket question
        </h2>
        <EditableLine
          label="Back-pocket question"
          value={backPocket}
          placeholder="Tap to write a question for the room"
          className="w-full"
          onSave={setBackPocket}
        />
        <Button
          variant="primary"
          size="lg"
          pending={pending}
          pendingLabel="Saving the drill"
          onClick={() =>
            startTransition(async () => {
              await finishDrill(talkId, sessionId, backPocket);
              setPhase('done');
            })
          }
        >
          Finish drill
        </Button>
      </section>
    );
  }

  return (
    <SavedPanel title="Drill saved" talkId={talkId}>
      <p className="text-lg">{pluralize(answered, 'question')} practiced and saved to your brief.</p>
    </SavedPanel>
  );
}
