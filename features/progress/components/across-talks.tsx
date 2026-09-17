import { MeterBar } from '@/components/ui/meter-bar';
import { pluralize } from '@/lib/utils';
import type { AcrossTalksData } from '../queries';
import { LineChart } from './line-chart';

export function AcrossTalks({ data }: { data: AcrossTalksData }) {
  if (data.confidence.length === 0 && data.themes.length === 0) return null;
  const maxThemeCount = Math.max(1, ...data.themes.map(theme => theme.count));

  return (
    <section aria-labelledby="across-heading" className="flex flex-col gap-6">
      <h2 id="across-heading" className="font-display text-xl font-semibold">
        Across your talks
      </h2>
      {data.confidence.length >= 2 ? (
        <LineChart
          title="Confidence after each talk, 1 to 5"
          valueName="confidence"
          points={data.confidence}
          maxValue={5}
        />
      ) : (
        data.confidence.length === 1 && (
          <p className="text-muted">
            You rated your confidence {data.confidence[0]?.value} of 5 after your first debrief. The chart appears after
            two talks.
          </p>
        )
      )}
      {data.themes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">Recurring things to work on</h3>
          <ul className="flex flex-col gap-2">
            {data.themes.map(theme => (
              <li key={theme.text} className="grid grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] items-center gap-3">
                <span className="truncate">{theme.text}</span>
                <MeterBar value={theme.count / maxThemeCount} tone="inset" animated />
                <span className="text-sm text-muted tabular-nums">{pluralize(theme.count, 'time')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
