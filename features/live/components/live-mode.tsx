'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { TimerDisplay } from '@/components/ui/timer-display';
import { CueCard } from '@/features/cue-cards/components/cue-card';
import { finishRun } from '@/features/practice/run-actions';
import type { RunCard } from '@/features/practice/run-cards';
import { useSectionClock } from '@/features/practice/use-section-clock';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useNow } from '@/hooks/use-now';
import { useWakeLock } from '@/hooks/use-wake-lock';
import { HoldToStart } from './hold-to-start';
import { LostSheet } from './lost-sheet';

type LiveModeProps = {
  talkId: string;
  talkTitle: string;
  runId: string | null;
  cards: RunCard[];
  lengthMinutes: number;
  recoveryLine: string;
};

const swipeDistance = 80;
const swipeVelocity = 110;

export function LiveMode({ talkId, talkTitle, runId, cards, lengthMinutes, recoveryLine }: LiveModeProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'hold' | 'live' | 'saving'>('hold');
  const [lostOpen, setLostOpen] = useState(false);
  const [liveStartedAt, setLiveStartedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const clock = useSectionClock(cards.length);
  const x = useMotionValue(0);
  const now = useNow(phase === 'live');
  const wakeLock = useWakeLock(phase === 'live');

  const actions = useRef({ next: () => {}, back: () => {} });
  useHotkeys(
    [
      { keys: [' '], handler: () => actions.current.next(), yieldToButtons: true },
      { keys: ['ArrowRight', 'PageDown', 'ArrowDown'], handler: () => actions.current.next() },
      { keys: ['ArrowLeft', 'PageUp', 'ArrowUp'], handler: () => actions.current.back() },
    ],
    phase === 'live' && !lostOpen,
  );

  const { index } = clock;
  const card = cards[index];
  const nextCard = cards[index + 1];
  const previousCard = index > 0 ? cards[index - 1] : undefined;

  actions.current = { next: () => clock.goTo(index + 1), back: () => clock.goTo(index - 1) };

  const begin = () => {
    const time = Date.now();
    setLiveStartedAt(time);
    clock.setSectionStartedAt(time);
    setPhase('live');
  };

  const end = async () => {
    const endedAt = clock.bank();
    if (!runId) {
      router.push(`/talks/${talkId}/debrief`);
      return;
    }
    setPhase('saving');
    try {
      await finishRun(runId, {
        startedAt: new Date(liveStartedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        timings: clock.timings(cards),
      });
      router.push(`/talks/${talkId}/practice/${runId}`);
    } catch {
      setError('The dress rehearsal did not save. Check that the app is running, then end again.');
      setPhase('live');
    }
  };

  if (!card) {
    return (
      <div className="live flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas p-6 text-ink">
        <p className="text-lg">This talk has no cue cards yet. Add sections in Cards first.</p>
      </div>
    );
  }

  const sectionSeconds = (clock.elapsed.current[index] ?? 0) + (now - clock.sectionStartedAt) / 1000;
  const sectionLeft = Math.max(0, card.minutes * 60 - sectionSeconds);
  const talkLeft = Math.max(0, lengthMinutes * 60 - (now - liveStartedAt) / 1000);

  if (phase === 'hold') {
    return <HoldToStart talkTitle={talkTitle} onComplete={begin} />;
  }

  return (
    <div className="live flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <p className="min-w-0 truncate text-muted">{talkTitle}</p>
        <Button variant="quiet" size="sm" onClick={() => void end()} disabled={phase === 'saving'}>
          End talk
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
        {wakeLock === 'unsupported' && (
          <p className="text-sm text-muted">
            This browser cannot keep the screen awake. Turn off auto-lock in your device settings.
          </p>
        )}
        {error && (
          <p role="alert" className="font-medium text-danger">
            {error}
          </p>
        )}

        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          <TimerDisplay label="Section time left" seconds={sectionLeft} size="xl" />
          <TimerDisplay label="Talk time left" seconds={talkLeft} size="xl" />
        </dl>

        <motion.div
          drag="x"
          dragMomentum={false}
          style={{ x, touchAction: 'pan-y' }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -swipeDistance || info.velocity.x < -swipeVelocity) clock.goTo(index + 1);
            else if (info.offset.x > swipeDistance || info.velocity.x > swipeVelocity) clock.goTo(index - 1);
            animate(x, 0, reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.3 });
          }}
          className="flex-1 cursor-grab active:cursor-grabbing"
          aria-live="polite"
        >
          <CueCard
            mode="live"
            section={card}
            index={index}
            timeline={cards}
            holdsVerbatim={card.holdsVerbatim}
            className="h-full"
          />
        </motion.div>

        {phase === 'saving' && <LoadingState label="Saving the dress rehearsal" />}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => clock.goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous section"
            className="flex size-14 items-center justify-center rounded-control bg-surface text-ink shadow-control disabled:opacity-40"
          >
            <ChevronLeftIcon size={24} />
          </button>
          <button
            type="button"
            onClick={() => clock.goTo(index + 1)}
            disabled={!nextCard}
            aria-label="Next section"
            className="flex size-14 items-center justify-center rounded-control bg-surface text-ink shadow-control disabled:opacity-40"
          >
            <ChevronRightIcon size={24} />
          </button>
          <p className="min-w-0 flex-1 text-lg text-muted">
            {nextCard ? (
              <>
                Next: <span className="text-ink">{nextCard.title}</span>
              </>
            ) : (
              'Last section'
            )}
          </p>
          <Button variant="secondary" size="lg" className="min-h-14 min-w-28 text-xl" onClick={() => setLostOpen(true)}>
            Lost
          </Button>
        </div>
      </main>

      <LostSheet
        open={lostOpen}
        onOpenChange={setLostOpen}
        recoveryLine={recoveryLine}
        previousCard={previousCard}
        card={card}
      />
    </div>
  );
}
