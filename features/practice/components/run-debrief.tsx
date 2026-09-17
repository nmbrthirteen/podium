'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { DebriefPrompts } from '@/features/debrief/components/debrief-prompts';
import { OptionalNote } from '@/features/debrief/components/optional-note';
import { type DebriefValues, joinNote } from '@/features/debrief/debrief-choices';
import type { SessionKind } from '@/lib/domain';
import { saveRunDebrief } from '../run-actions';
import type { SectionBar } from '../run-chart';
import { RunChart } from './run-chart';

type RunDebriefProps = {
  runId: string;
  kind: SessionKind;
  summary: string;
  bars: SectionBar[];
  prediction: string;
  recordingUrl: string | null;
  listenerQuestions: string[];
  onSaved: () => void;
};

const noteLabels: Partial<Record<SessionKind, string>> = {
  'recorded-run': 'Add what you saw',
  'listener-run': 'Add what your listener said',
};

export function RunDebrief({
  runId,
  kind,
  summary,
  bars,
  prediction,
  recordingUrl,
  listenerQuestions,
  onSaved,
}: RunDebriefProps) {
  const [values, setValues] = useState<DebriefValues>({ excelled: '', workOn: '', challenge: '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const recorded = kind === 'recorded-run';
  const listener = kind === 'listener-run';

  const save = () =>
    startTransition(async () => {
      try {
        await saveRunDebrief(runId, {
          ...values,
          workOn: recorded || listener ? values.workOn : joinNote(values.workOn, note),
          ...(recorded ? { observation: note } : {}),
          ...(listener ? { listenerFeedback: note } : {}),
        });
        onSaved();
      } catch {
        setError('The debrief did not save. Check that the app is running, then save again.');
      }
    });

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="summary-heading" className="flex flex-col gap-2">
        <h2 id="summary-heading" className="text-sm font-medium text-muted">
          Run summary
        </h2>
        <p className="font-display text-2xl font-semibold text-pretty" data-testid="run-summary">
          {summary}
        </p>
        <div className="mt-4 rounded-card bg-surface p-5 shadow-card">
          <RunChart bars={bars} />
        </div>
      </section>

      {recorded && (
        <section aria-labelledby="recording-heading" className="flex flex-col gap-4">
          <h2 id="recording-heading" className="font-display text-xl font-semibold">
            Watch as if a stranger gave this talk
          </h2>
          {recordingUrl ? (
            <video
              src={recordingUrl}
              controls
              playsInline
              onLoadedMetadata={event => {
                const video = event.currentTarget;
                if (Number.isFinite(video.duration)) return;
                const rewind = () => {
                  video.removeEventListener('durationchange', rewind);
                  video.currentTime = 0;
                };
                video.addEventListener('durationchange', rewind);
                video.currentTime = Number.MAX_SAFE_INTEGER;
              }}
              className="aspect-video w-full rounded-card bg-inset outline -outline-offset-1 outline-black/10 dark:outline-white/10"
            >
              <track kind="captions" />
            </video>
          ) : (
            <p className="rounded-xl bg-inset px-4 py-6 text-center text-muted">No recording for this run</p>
          )}
          {prediction.trim() && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-muted">What you expected to see</p>
              <p className="text-lg text-pretty">{prediction}</p>
            </div>
          )}
        </section>
      )}

      {listener && (
        <section aria-labelledby="listener-heading" className="flex flex-col gap-4">
          <h2 id="listener-heading" className="font-display text-xl font-semibold">
            Questions for your listener to ask
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
            {listenerQuestions.map(question => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
      )}

      <section aria-label="Debrief" className="flex flex-col gap-6">
        <DebriefPrompts values={values} onChange={setValues} scope="run" />
        <OptionalNote label={noteLabels[kind] ?? 'Add a note'} value={note} onChange={setNote} />
      </section>

      <div className="flex flex-col items-start gap-3">
        {error && (
          <p role="alert" className="font-medium text-danger">
            {error}
          </p>
        )}
        <Button variant="primary" size="lg" pending={pending} pendingLabel="Saving the run" onClick={save}>
          Save run
        </Button>
      </div>
    </div>
  );
}
