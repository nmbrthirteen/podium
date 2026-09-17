import { endedRuns, runTotals } from '@/features/practice/runs';
import type { SectionTiming, SessionKind } from '@/lib/domain';

export type ProgressRun = {
  id: string;
  kind: SessionKind;
  startedAt: string;
  endedAt: string | null;
  sectionTimings: SectionTiming[];
};

const timedKinds = new Set<SessionKind>([
  'full-run',
  'section-loop',
  'open-close-drill',
  'mental-walkthrough',
  'recorded-run',
  'listener-run',
  'dress-rehearsal',
]);

export function talkProgress(runs: ProgressRun[]) {
  const timed = endedRuns(runs)
    .filter(run => timedKinds.has(run.kind) && run.sectionTimings.length > 0)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const last = timed.at(-1);
  const lastTotals = last && runTotals(last.sectionTimings);
  const lastRun = lastTotals
    ? { seconds: lastTotals.seconds, budgetSeconds: lastTotals.budgetSeconds, peeks: lastTotals.peeks }
    : null;

  return {
    lastRun,
    peeksPerRun: timed.map((run, index) => ({
      id: run.id,
      label: `Run ${index + 1}`,
      value: runTotals(run.sectionTimings).peeks,
    })),
  };
}

export function recurringThemes(notes: string[], limit = 5) {
  const counts = new Map<string, { text: string; count: number }>();
  for (const note of notes) {
    const phrases = new Set(
      note
        .split(/[.!?\n]+/)
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 2),
    );
    for (const phrase of phrases) {
      const key = phrase.toLowerCase();
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { text: phrase, count: 1 });
    }
  }
  return [...counts.values()]
    .filter(entry => entry.count >= 2)
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
    .slice(0, limit);
}
