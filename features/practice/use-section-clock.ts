'use client';

import { useRef, useState } from 'react';
import type { SectionTiming } from '@/lib/domain';

/**
 * Builds the SectionTiming rows a run posts on finish. Budget scales with
 * budgetMultiplier (section loops repeat a section, so its budget is the
 * per-loop budget times the loop count). A row with no banked time and no
 * peeks is dropped: it was never visited.
 */
export function sectionTimings(
  cards: readonly { id: string; minutes: number }[],
  elapsed: readonly number[],
  budgetMultiplier = 1,
  peeks?: readonly number[],
): SectionTiming[] {
  return cards
    .map((item, position) => ({
      sectionId: item.id,
      seconds: Math.round(elapsed[position] ?? 0),
      budgetSeconds: Math.round(item.minutes * 60 * budgetMultiplier),
      peeks: peeks?.[position] ?? 0,
    }))
    .filter(timing => timing.seconds > 0 || timing.peeks > 0);
}

/**
 * Tracks which section is current and how much time has banked against each
 * one. bank() rolls the time since the last bank/goTo into the current
 * section and restarts the clock; call it before reading elapsed or moving
 * on. goTo() ignores no-op and out-of-range moves so callers can wire it
 * straight to prev/next controls without their own bounds checks.
 */
export function useSectionClock(cardCount: number) {
  const [index, setIndex] = useState(0);
  const [sectionStartedAt, setSectionStartedAt] = useState(() => Date.now());
  const elapsed = useRef<number[]>(Array.from({ length: cardCount }, () => 0));

  const bank = () => {
    const time = Date.now();
    elapsed.current[index] = (elapsed.current[index] ?? 0) + (time - sectionStartedAt) / 1000;
    setSectionStartedAt(time);
    return time;
  };

  const goTo = (position: number) => {
    if (position < 0 || position >= cardCount || position === index) return;
    bank();
    setIndex(position);
  };

  const timings = (
    cards: readonly { id: string; minutes: number }[],
    budgetMultiplier = 1,
    peeks?: readonly number[],
  ) => sectionTimings(cards, elapsed.current, budgetMultiplier, peeks);

  return { index, setIndex, sectionStartedAt, setSectionStartedAt, elapsed, bank, goTo, timings };
}
