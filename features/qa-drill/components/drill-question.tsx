'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { LoadingState } from '@/components/ui/loading-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { StepDots } from '@/components/ui/step-dots';
import { useCoachTask } from '@/hooks/use-coach-task';
import { useNow } from '@/hooks/use-now';
import { qaFeedback } from '@/lib/coach/tasks/qa-feedback';
import { formatClock } from '@/lib/utils';
import { saveDrillAnswer } from '../actions';
import type { DrillItem } from './qa-drill';

const answerSeconds = 60;
const unknownScript = 'I do not know yet. I will send it to you by Friday.';
const answerParts = ['Answer', 'One example', 'Why it matters to them'];

type DrillQuestionProps = {
  talkId: string;
  audience: string;
  item: DrillItem;
  position: number;
  total: number;
  onSaved: () => void;
};

export function DrillQuestion({ talkId, audience, item, position, total, onSaved }: DrillQuestionProps) {
  const [endsAt] = useState(() => Date.now() + answerSeconds * 1000);
  const [typing, setTyping] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const feedback = useCoachTask(qaFeedback);
  const now = useNow(true);
  const secondsLeft = Math.max(0, (endsAt - now) / 1000);

  const save = () =>
    startSaving(async () => {
      try {
        await saveDrillAnswer(talkId, { question: item.question, answer, example: '', relevance: '' });
        onSaved();
      } catch {
        setError('The answer did not save. Check that the app is running, then try again.');
      }
    });

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="question-heading" className="flex flex-col gap-4">
        <StepDots
          count={total}
          current={position - 1}
          currentClassName="bg-ink"
          role="img"
          aria-label={`Question ${position} of ${total}`}
        />
        <h2 id="question-heading" className="font-display text-3xl font-semibold text-balance">
          {item.question}
        </h2>
      </section>

      <div className="flex flex-wrap items-center gap-6">
        <ProgressRing
          value={secondsLeft / answerSeconds}
          size={112}
          stroke={6}
          tone={secondsLeft <= 10 ? 'danger' : 'accent'}
          label={`${secondsLeft} seconds left to answer`}
        >
          <span className="font-mono text-2xl font-medium tabular-nums">{formatClock(secondsLeft)}</span>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-medium" aria-live="polite">
            {secondsLeft > 0 ? 'Answer out loud' : 'Time. Wrap up your answer.'}
          </p>
          <ol className="flex flex-wrap gap-2">
            {answerParts.map((part, index) => (
              <li
                key={part}
                className="flex min-h-9 items-center gap-2 rounded-control bg-surface pr-3 pl-1 text-sm font-medium shadow-card"
              >
                <span className="flex size-7 items-center justify-center rounded-control bg-accent-soft text-accent tabular-nums">
                  {index + 1}
                </span>
                {part}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <StuckHint />

      {typing && (
        <Field label="Your answer in a line or two">
          <Textarea value={answer} rows={2} onChange={event => setAnswer(event.target.value)} />
        </Field>
      )}

      {feedback.state.status === 'running' && (
        <LoadingState label="The coach is reading your answer" onCancel={feedback.cancel} />
      )}
      {feedback.state.status === 'error' && (
        <p role="alert" className="text-danger">
          {feedback.state.message}
        </p>
      )}
      {feedback.state.status === 'result' && (
        <section aria-labelledby="feedback-heading" className="enter-stagger flex flex-col gap-2">
          <h3 id="feedback-heading" className="font-display text-xl font-semibold">
            Coach feedback
          </h3>
          <ul className="flex flex-col gap-1">
            <FeedbackFlag label="Answer" present={feedback.state.output.hasAnswer} />
            <FeedbackFlag label="Example" present={feedback.state.output.hasExample} />
            <FeedbackFlag label="Why it matters to the asker" present={feedback.state.output.hasRelevance} />
          </ul>
          <p className="font-medium">{feedback.state.output.action}</p>
        </section>
      )}

      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="lg" pending={saving} pendingLabel="Saving the answer" onClick={save}>
          {position === total ? 'Finish questions' : 'Next question'}
        </Button>
        {typing ? (
          <Button
            variant="secondary"
            size="lg"
            pending={feedback.state.status === 'running'}
            pendingLabel="Getting feedback"
            disabled={!answer.trim()}
            onClick={() => void feedback.run({ audience, question: item.question, answer })}
          >
            Get feedback
          </Button>
        ) : (
          <Button variant="quiet" size="lg" onClick={() => setTyping(true)}>
            Type my answer
          </Button>
        )}
      </div>
    </div>
  );
}

function StuckHint() {
  const [open, setOpen] = useState(false);
  if (open) return <p className="rounded-xl bg-inset px-4 py-3">{unknownScript}</p>;
  return (
    <Button variant="quiet" size="sm" className="-ml-3 self-start text-muted" onClick={() => setOpen(true)}>
      Stuck?
    </Button>
  );
}

function FeedbackFlag({ label, present }: { label: string; present: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={present ? 'text-accent' : 'text-danger'} aria-hidden="true">
        {present ? 'Has' : 'Missing'}
      </span>
      <span>{label}</span>
      <span className="sr-only">{present ? 'is present' : 'is missing'}</span>
    </li>
  );
}
