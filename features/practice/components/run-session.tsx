'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { LoadingState } from '@/components/ui/loading-state';
import { sessionKindLabels } from '@/features/plan/session-kinds';
import { useMediaRecorder } from '@/hooks/use-media-recorder';
import type { SectionTiming, SessionKind } from '@/lib/domain';
import { finishRun, markExplainersSeen } from '../run-actions';
import type { RunCard } from '../run-cards';
import { sectionBars } from '../run-chart';
import { ExplainerCards } from './explainer-cards';
import { RecordingPreview } from './recording-preview';
import { RunDebrief } from './run-debrief';
import { type RunResult, RunStage } from './run-stage';
import { SavedPanel } from './saved-panel';
import { StartSessionButton } from './start-session-button';

type Phase = 'explainers' | 'predict' | 'ready' | 'running' | 'saving' | 'debrief' | 'saved';

type RunSessionProps = {
  talkId: string;
  runId: string;
  kind: SessionKind;
  cards: RunCard[];
  explainersSeen: boolean;
  listenerQuestions: string[];
  initialPhase: 'fresh' | 'debrief' | 'saved';
  initialSummary: string;
  initialTimings: SectionTiming[];
  initialPrediction: string;
  initialRecordingUrl: string | null;
};

export function RunSession(props: RunSessionProps) {
  const { talkId, runId, kind, cards, listenerQuestions } = props;
  const recorded = kind === 'recorded-run';
  const [phase, setPhase] = useState<Phase>(() => {
    if (props.initialPhase !== 'fresh') return props.initialPhase;
    if (!props.explainersSeen) return 'explainers';
    return recorded ? 'predict' : 'ready';
  });
  const [prediction, setPrediction] = useState(props.initialPrediction);
  const [summary, setSummary] = useState(props.initialSummary);
  const [timings, setTimings] = useState(props.initialTimings);
  const [recordingUrl, setRecordingUrl] = useState(props.initialRecordingUrl);
  const [recordWithCamera, setRecordWithCamera] = useState(recorded);
  const [error, setError] = useState<string | null>(null);
  const recorder = useMediaRecorder();
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === 'ready') startRef.current?.focus();
  }, [phase]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-lg">This talk has no cue cards yet. Add sections in Cards, or run the Q&A drill.</p>
        <Link href={`/talks/${talkId}/cards`} className={buttonVariants({ variant: 'primary' })}>
          Open cards
        </Link>
      </div>
    );
  }

  const finishExplainers = () => {
    void markExplainersSeen();
    setPhase(recorded ? 'predict' : 'ready');
  };

  const start = () => {
    if (recordWithCamera && recorder.state === 'ready') recorder.start();
    setPhase('running');
  };

  const end = async (result: RunResult) => {
    setPhase('saving');
    setError(null);
    try {
      if (recorded && recordWithCamera) {
        const blob = await recorder.stop();
        if (blob) {
          const response = await fetch(`/api/recordings/${runId}`, { method: 'POST', body: blob });
          if (response.ok) setRecordingUrl(`/api/recordings/${runId}?t=${Date.now()}`);
          else setError('The recording did not save. Your run and debrief still save.');
        }
      }
      const saved = await finishRun(runId, result);
      setSummary(saved.summary);
      setTimings(result.timings);
      setPhase('debrief');
    } catch {
      setError('The run did not save. Check that the app is running, then end the run again.');
      setPhase('running');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold">{sessionKindLabels[kind]}</h1>

      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}

      {phase === 'explainers' && <ExplainerCards onDone={finishExplainers} />}

      {phase === 'predict' && (
        <section aria-labelledby="predict-heading" className="flex flex-col items-start gap-4">
          <h2 id="predict-heading" className="font-display text-xl font-semibold">
            Before you record
          </h2>
          <Field label="What do you expect to see?" className="w-full">
            <Textarea value={prediction} rows={3} onChange={event => setPrediction(event.target.value)} />
          </Field>
          <Button variant="primary" onClick={() => setPhase('ready')}>
            Continue
          </Button>
        </section>
      )}

      {phase === 'ready' && (
        <section aria-labelledby="ready-heading" className="flex flex-col items-start gap-6">
          <p id="ready-heading" className="font-display text-2xl font-semibold text-pretty">
            {kind === 'mental-walkthrough'
              ? 'Sit back and walk through each section in your head.'
              : 'Stand up and speak out loud. Hands free.'}
          </p>
          {recorded && recordWithCamera && (
            <RecordingPreview recorder={recorder} onSkipRecording={() => setRecordWithCamera(false)} />
          )}
          <Button
            ref={startRef}
            variant="primary"
            size="lg"
            onClick={start}
            disabled={recorded && recordWithCamera && recorder.state !== 'ready'}
          >
            {recorded && recordWithCamera ? 'Start recording' : 'Start'}
          </Button>
        </section>
      )}

      {phase === 'running' && (
        <RunStage
          kind={kind}
          cards={cards}
          recording={recorder.state === 'recording'}
          onEnd={result => void end(result)}
        />
      )}

      {phase === 'saving' && <LoadingState label="Saving the run" />}

      {phase === 'debrief' && (
        <RunDebrief
          runId={runId}
          kind={kind}
          summary={summary}
          bars={sectionBars(timings, cards)}
          prediction={prediction}
          recordingUrl={recordingUrl}
          listenerQuestions={listenerQuestions}
          onSaved={() => setPhase('saved')}
        />
      )}

      {phase === 'saved' && (
        <SavedPanel
          title="Run saved"
          talkId={talkId}
          actions={<StartSessionButton talkId={talkId} label="Start the next session" variant="primary" size="md" />}
        >
          {summary && <p className="text-lg">{summary}</p>}
        </SavedPanel>
      )}
    </div>
  );
}
