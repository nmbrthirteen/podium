'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, EyeIcon } from '@/components/ui/icons';
import { Kbd } from '@/components/ui/kbd';
import { TimerDisplay } from '@/components/ui/timer-display';
import { CueCard } from '@/features/cue-cards/components/cue-card';
import { TalkTimeline } from '@/features/cue-cards/components/talk-timeline';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useNow } from '@/hooks/use-now';
import type { SectionTiming, SessionKind } from '@/lib/domain';
import { pluralize } from '@/lib/utils';
import type { RunCard } from '../run-cards';
import { useSectionClock } from '../use-section-clock';

export type RunResult = { startedAt: string; endedAt: string; timings: SectionTiming[] };

type RunStageProps = {
  kind: SessionKind;
  cards: RunCard[];
  recording: boolean;
  onEnd: (result: RunResult) => void;
};

const tapThresholdMs = 250;
const tapRevealMs = 3000;

export function RunStage({ kind, cards, recording, onEnd }: RunStageProps) {
  const loop = kind === 'section-loop';
  const clock = useSectionClock(cards.length);
  const [loopCount, setLoopCount] = useState(1);
  const [runStartedAt] = useState(() => Date.now());
  const [peeks, setPeeks] = useState<number[]>(() => cards.map(() => 0));
  const [revealed, setRevealed] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartedAt = useRef<number | null>(null);
  const ended = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const now = useNow(true);

  useEffect(() => {
    nextRef.current?.focus();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const actions = useRef({ next: () => {}, back: () => {}, peek: () => {} });
  useHotkeys([
    { keys: [' '], handler: () => actions.current.next(), yieldToButtons: true },
    { keys: ['ArrowRight', 'PageDown'], handler: () => actions.current.next() },
    { keys: ['ArrowLeft', 'PageUp'], handler: () => actions.current.back() },
    { keys: ['p', 'P'], handler: () => actions.current.peek() },
  ]);

  const { index } = clock;
  const card = cards[index];
  if (!card) return null;

  const clearHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  };
  const hide = () => {
    clearHide();
    setRevealed(false);
  };
  const peek = () => {
    clearHide();
    setRevealed(true);
    setPeeks(current => current.map((count, position) => (position === index ? count + 1 : count)));
  };
  const peekForAWhile = () => {
    peek();
    hideTimer.current = setTimeout(() => setRevealed(false), tapRevealMs);
  };

  const end = () => {
    if (ended.current) return;
    ended.current = true;
    const endedAt = clock.bank();
    hide();
    onEnd({
      startedAt: new Date(runStartedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      timings: clock.timings(cards, loop ? loopCount : 1, peeks),
    });
  };

  const goTo = (position: number) => {
    clock.goTo(position);
    hide();
  };

  const next = () => {
    if (loop) {
      clock.bank();
      hide();
      setLoopCount(count => count + 1);
      return;
    }
    if (index >= cards.length - 1) end();
    else goTo(index + 1);
  };

  const back = () => {
    if (index > 0) goTo(index - 1);
  };

  actions.current = { next, back, peek: peekForAWhile };

  const sectionSeconds = loop
    ? (now - clock.sectionStartedAt) / 1000
    : (clock.elapsed.current[index] ?? 0) + (now - clock.sectionStartedAt) / 1000;
  const sectionBudget = card.minutes * 60;
  const runSeconds = (now - runStartedAt) / 1000;
  const runBudget = cards.reduce((sum, item) => sum + item.minutes * 60, 0) * (loop ? loopCount : 1);
  const sectionOver = sectionSeconds > sectionBudget;
  const last = !loop && index === cards.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <TalkTimeline
        sections={cards}
        selectedIndex={index}
        progress={{ fraction: sectionBudget > 0 ? sectionSeconds / sectionBudget : 0, over: sectionOver }}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <dl className="flex flex-wrap gap-8">
          <TimerDisplay
            label={
              <>
                {loop ? `Loop ${loopCount}` : 'Section'}
                {sectionOver ? ', over time' : ''}
              </>
            }
            seconds={sectionSeconds}
            total={sectionBudget}
            size="lg"
            over={sectionOver}
          />
          <TimerDisplay label="Whole run" seconds={runSeconds} total={runBudget} size="lg" />
        </dl>
        {recording && (
          <p className="flex items-center gap-2 font-medium text-danger" role="status">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-danger" />
            Recording
          </p>
        )}
      </div>

      <CueCard
        mode="recall"
        section={card}
        index={index}
        timeline={cards}
        holdsVerbatim={card.holdsVerbatim}
        revealed={revealed}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          aria-pressed={revealed}
          onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pressStartedAt.current = Date.now();
            peek();
          }}
          onPointerUp={() => {
            const held = Date.now() - (pressStartedAt.current ?? Date.now());
            pressStartedAt.current = null;
            if (held < tapThresholdMs) hideTimer.current = setTimeout(() => setRevealed(false), tapRevealMs);
            else hide();
          }}
          onClick={event => {
            if (event.detail === 0) peekForAWhile();
          }}
        >
          <EyeIcon size={20} />
          Peek
          <Kbd>P</Kbd>
        </Button>
        <p className="text-muted tabular-nums" aria-live="polite">
          {pluralize(peeks[index] ?? 0, 'peek')} in this section
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="icon" onClick={back} disabled={index === 0} aria-label="Previous section">
          <ChevronLeftIcon />
        </Button>
        <Button ref={nextRef} variant="primary" size="lg" onClick={next}>
          {loop ? 'Next loop' : last ? 'Finish run' : 'Next section'}
          <Kbd>→</Kbd>
        </Button>
        <Button variant="quiet" size="lg" onClick={end} className="ml-auto">
          End run
        </Button>
      </div>
    </div>
  );
}
