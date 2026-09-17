'use client';

import { useEffect, useRef, useState } from 'react';
import { capitalize } from '@/lib/utils';

export type ChartPoint = { id: string; label: string; value: number };

type LineChartProps = {
  title: string;
  valueName: string;
  points: ChartPoint[];
  maxValue?: number;
};

const plotHeight = 180;
const margin = { top: 16, right: 24, bottom: 32, left: 40 };

function niceMax(max: number) {
  if (max <= 5) return 5;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

export function LineChart({ title, valueName, points, maxValue }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const yMax = maxValue ?? niceMax(Math.max(...points.map(point => point.value), 1));
  const innerWidth = width - margin.left - margin.right;
  const x = (index: number) =>
    margin.left + (points.length === 1 ? innerWidth / 2 : (index * innerWidth) / (points.length - 1));
  const y = (value: number) => margin.top + plotHeight - (value / yMax) * plotHeight;
  const ticks = [0, Math.round(yMax / 2), yMax];
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.value)}`).join(' ');

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      const offset = event.clientX - bounds.left;
      let nearest = 0;
      points.forEach((_, index) => {
        if (Math.abs(x(index) - offset) < Math.abs(x(nearest) - offset)) nearest = index;
      });
      setActive(points.length > 0 ? nearest : null);
    };
    const leave = () => setActive(null);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  });

  const activePoint = active === null ? null : points[active];
  const lastPoint = points.at(-1);
  const height = plotHeight + margin.top + margin.bottom;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-medium">{title}</figcaption>
      <div ref={containerRef} className="relative w-full touch-pan-y">
        <svg width={width} height={height} role="img" aria-label={`${title}. Values are in the table below.`}>
          {ticks.map(tick => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={margin.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted text-sm tabular-nums"
              >
                {tick}
              </text>
            </g>
          ))}
          {points.length > 1 && (
            <path
              d={path}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {activePoint && active !== null && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={margin.top}
              y2={margin.top + plotHeight}
              stroke="var(--line-strong)"
              strokeWidth={1}
            />
          )}
          {points.map((point, index) => (
            <circle
              key={point.id}
              cx={x(index)}
              cy={y(point.value)}
              r={index === active ? 6 : 5}
              fill="var(--accent)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          ))}
          {points.length > 0 && (
            <>
              <text
                x={x(0)}
                y={height - 8}
                textAnchor={points.length === 1 ? 'middle' : 'start'}
                className="fill-muted text-sm"
              >
                {points[0]?.label}
              </text>
              {points.length > 1 && lastPoint && (
                <text x={x(points.length - 1)} y={height - 8} textAnchor="end" className="fill-muted text-sm">
                  {lastPoint.label}
                </text>
              )}
            </>
          )}
          {lastPoint && active === null && (
            <text
              x={x(points.length - 1) + (points.length === 1 ? 0 : -10)}
              y={y(lastPoint.value) - 12}
              textAnchor={points.length === 1 ? 'middle' : 'end'}
              className="fill-ink text-sm font-medium tabular-nums"
            >
              {lastPoint.value}
            </text>
          )}
        </svg>
        {activePoint && active !== null && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 rounded-control bg-surface px-2 py-1 text-sm whitespace-nowrap shadow-overlay"
            style={{
              left: Math.min(Math.max(x(active), 60), width - 60),
              top: Math.max(0, y(activePoint.value) - 44),
              translate: '-50% 0',
            }}
          >
            <span className="text-muted">{activePoint.label}: </span>
            <span className="font-medium tabular-nums">
              {activePoint.value} {valueName}
            </span>
          </div>
        )}
      </div>
      <details className="text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center text-muted hover:text-ink">
          Show as a table
        </summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="py-1 font-medium">Item</th>
              <th className="py-1 text-right font-medium">{capitalize(valueName)}</th>
            </tr>
          </thead>
          <tbody>
            {points.map(point => (
              <tr key={point.id} className="border-b border-line">
                <td className="py-1">{point.label}</td>
                <td className="py-1 text-right tabular-nums">{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
