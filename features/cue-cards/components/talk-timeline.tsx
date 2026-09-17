'use client';

import { Fragment, type RefObject, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatShortMinutes, minuteStep, moveBoundary } from '../timeline';

export type TimelineSection = { id: string; title: string; minutes: number };

type TalkTimelineProps = {
  sections: TimelineSection[];
  selectedIndex: number;
  onSelect?: (index: number) => void;
  onRetime?: (minutes: number[]) => void;
  onRetimeEnd?: (minutes: number[], boundary: number) => void;
  progress?: { fraction: number; over: boolean };
  className?: string;
};

export function TalkTimeline({
  sections,
  selectedIndex,
  onSelect,
  onRetime,
  onRetimeEnd,
  progress,
  className,
}: TalkTimelineProps) {
  const trackRef = useRef<HTMLElement>(null);
  const minutes = sections.map(section => section.minutes);

  return (
    <section ref={trackRef} aria-label="Talk timeline" className={cn('flex h-14 w-full gap-1', className)}>
      {sections.map((section, index) => {
        const current = index === selectedIndex;
        const done = progress !== undefined && index < selectedIndex;
        const blockClass = cn(
          'relative flex min-w-0 flex-col items-start justify-center overflow-hidden rounded-control px-2 text-left',
          progress
            ? current
              ? 'bg-surface text-ink shadow-card'
              : done
                ? 'bg-accent text-accent-ink'
                : 'bg-inset text-muted'
            : current
              ? 'bg-accent text-accent-ink'
              : 'bg-inset text-ink hover:bg-line',
        );
        const style = { flexGrow: Math.max(section.minutes, 0.1), flexBasis: 0 };
        const content = (
          <>
            {progress && current && (
              <>
                <span
                  aria-hidden="true"
                  className={cn('absolute inset-y-0 left-0', progress.over ? 'bg-danger-soft' : 'bg-accent-soft')}
                  style={{ width: `${Math.min(progress.fraction, 1) * 100}%` }}
                />
                <span
                  aria-hidden="true"
                  className={cn('absolute bottom-0 left-0 h-1', progress.over ? 'bg-danger' : 'bg-accent')}
                  style={{ width: `${Math.min(progress.fraction, 1) * 100}%` }}
                />
              </>
            )}
            <span className="relative w-full truncate text-sm font-medium">{section.title}</span>
            <span className="relative w-full truncate text-xs whitespace-nowrap tabular-nums opacity-80">
              {formatShortMinutes(section.minutes)}
            </span>
          </>
        );

        return (
          <Fragment key={section.id}>
            {onSelect ? (
              <button
                type="button"
                aria-pressed={current}
                onClick={() => onSelect(index)}
                className={cn(blockClass, 'press')}
                style={style}
              >
                {content}
              </button>
            ) : (
              <div aria-current={current ? 'step' : undefined} className={blockClass} style={style}>
                {content}
              </div>
            )}
            {onRetime && onRetimeEnd && index < sections.length - 1 && (
              <BoundaryHandle
                boundary={index}
                minutes={minutes}
                left={section.title}
                right={sections[index + 1]?.title ?? ''}
                trackRef={trackRef}
                onRetime={onRetime}
                onRetimeEnd={onRetimeEnd}
              />
            )}
          </Fragment>
        );
      })}
    </section>
  );
}

type BoundaryHandleProps = {
  boundary: number;
  minutes: number[];
  left: string;
  right: string;
  trackRef: RefObject<HTMLElement | null>;
  onRetime: (minutes: number[]) => void;
  onRetimeEnd: (minutes: number[], boundary: number) => void;
};

function BoundaryHandle({ boundary, minutes, left, right, trackRef, onRetime, onRetimeEnd }: BoundaryHandleProps) {
  const drag = useRef<{ x: number; start: number[]; latest: number[] } | null>(null);
  const total = minutes.reduce((sum, value) => sum + value, 0);
  const leftMinutes = minutes[boundary] ?? 0;
  const pair = leftMinutes + (minutes[boundary + 1] ?? 0);

  const finish = () => {
    const current = drag.current;
    drag.current = null;
    if (current && current.latest !== current.start) onRetimeEnd(current.latest, boundary);
  };

  return (
    <div className="relative w-0">
      {/* biome-ignore lint/a11y/useSemanticElements: a focusable window splitter needs role separator, and hr takes no focus or children */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={`Move time between ${left} and ${right}`}
        aria-valuemin={minuteStep}
        aria-valuemax={pair - minuteStep}
        aria-valuenow={leftMinutes}
        aria-valuetext={`${left} ${formatShortMinutes(leftMinutes)}, ${right} ${formatShortMinutes(pair - leftMinutes)}`}
        className="group absolute inset-y-0 -left-3 z-10 flex w-6 cursor-col-resize touch-none items-center justify-center rounded-control"
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, start: minutes, latest: minutes };
        }}
        onPointerMove={event => {
          const current = drag.current;
          const width = trackRef.current?.getBoundingClientRect().width;
          if (!current || !width) return;
          const next = moveBoundary(current.start, boundary, ((event.clientX - current.x) / width) * total);
          if (next[boundary] === current.latest[boundary]) return;
          current.latest = next;
          onRetime(next);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onKeyDown={event => {
          const delta =
            event.key === 'ArrowLeft' || event.key === 'ArrowDown'
              ? -minuteStep
              : event.key === 'ArrowRight' || event.key === 'ArrowUp'
                ? minuteStep
                : 0;
          if (!delta) return;
          event.preventDefault();
          const next = moveBoundary(minutes, boundary, delta);
          if (next === minutes) return;
          onRetime(next);
          onRetimeEnd(next, boundary);
        }}
      >
        <span
          aria-hidden="true"
          className="handle-grip h-7 w-1 rounded-full bg-ink/15 group-hover:bg-ink/40 group-focus-visible:bg-accent group-active:bg-accent"
        />
      </div>
    </div>
  );
}
