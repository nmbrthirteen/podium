import type { SectionTiming } from '@/lib/domain';

export function endedRuns<T extends { endedAt: string | null }>(runs: T[]) {
  return runs.filter(run => run.endedAt !== null);
}

export function runTotals(timings: SectionTiming[]) {
  const seconds = timings.reduce((sum, timing) => sum + timing.seconds, 0);
  const budgetSeconds = timings.reduce((sum, timing) => sum + timing.budgetSeconds, 0);
  const peeks = timings.reduce((sum, timing) => sum + timing.peeks, 0);
  const overSeconds = timings.reduce((sum, timing) => sum + Math.max(0, timing.seconds - timing.budgetSeconds), 0);
  return { seconds, budgetSeconds, peeks, overSeconds };
}
