import { EyeIcon } from '@/components/ui/icons';
import { cn, formatClock, pluralize } from '@/lib/utils';
import { barScale, type SectionBar } from '../run-chart';

export function RunChart({ bars }: { bars: SectionBar[] }) {
  if (bars.length === 0) return null;
  const scale = barScale(bars);

  return (
    <figure className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {bars.map(bar => (
          <li key={bar.id} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-3">
            <span aria-hidden="true" className="truncate text-sm font-medium">
              {bar.title}
            </span>
            <span aria-hidden="true" className="relative h-3 rounded-full bg-inset">
              <span
                className={cn('bar-grow absolute inset-y-0 left-0 rounded-full', bar.over ? 'bg-danger' : 'bg-accent')}
                style={{ width: `${Math.min(bar.ratio / scale, 1) * 100}%` }}
              />
              <span className="absolute -inset-y-1 w-0.5 rounded-full bg-ink" style={{ left: `${100 / scale}%` }} />
            </span>
            <span aria-hidden="true" className="flex items-center justify-end gap-3 text-sm tabular-nums">
              <span className={bar.over ? 'font-medium text-danger' : 'text-muted'}>{formatClock(bar.seconds)}</span>
              <span className="flex items-center gap-1 text-muted">
                <EyeIcon size={14} />
                {bar.peeks}
              </span>
            </span>
            <span className="sr-only">
              {bar.title}: {formatClock(bar.seconds)} of {formatClock(bar.budgetSeconds)} planned
              {bar.over ? ', over time' : ''}, {pluralize(bar.peeks, 'peek')}.
            </span>
          </li>
        ))}
      </ul>
      <figcaption aria-hidden="true" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-accent" />
          Time spoken
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-danger" />
          Over time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-ink" />
          Planned time
        </span>
        <span className="flex items-center gap-1.5">
          <EyeIcon size={14} />
          Peeks
        </span>
      </figcaption>
    </figure>
  );
}

export function RunStrip({ bars }: { bars: SectionBar[] }) {
  if (bars.length === 0) return null;
  const overCount = bars.filter(bar => bar.over).length;

  return (
    <span
      role="img"
      aria-label={overCount === 0 ? 'Every section on time' : `${overCount} of ${bars.length} sections over time`}
      className="flex h-2 w-full gap-0.5"
    >
      {bars.map(bar => (
        <span
          key={bar.id}
          className={cn('rounded-full', bar.over ? 'bg-danger' : 'bg-accent')}
          style={{ flexGrow: Math.max(bar.budgetSeconds, 1), flexBasis: 0 }}
        />
      ))}
    </span>
  );
}
