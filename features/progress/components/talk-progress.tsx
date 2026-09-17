import type { Run } from '@/lib/db/schema';
import { talkProgress } from '../progress';
import { LineChart } from './line-chart';

export function TalkProgress({ runs }: { runs: Run[] }) {
  const progress = talkProgress(runs);
  if (progress.peeksPerRun.length < 2) return null;

  return (
    <section aria-labelledby="progress-heading" className="flex flex-col gap-4">
      <h2 id="progress-heading" className="font-display text-xl font-semibold">
        Peeks are going {trend(progress.peeksPerRun.map(point => point.value))}
      </h2>
      <LineChart title="Peeks per run" valueName="peeks" points={progress.peeksPerRun} />
    </section>
  );
}

function trend(values: number[]) {
  const first = values[0] ?? 0;
  const last = values.at(-1) ?? 0;
  if (last < first) return 'down';
  if (last > first) return 'up';
  return 'flat';
}
