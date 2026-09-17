import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const toneStroke = {
  accent: 'var(--accent)',
  danger: 'var(--danger)',
};

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  tone?: keyof typeof toneStroke;
  label?: string;
  className?: string;
  children?: ReactNode;
};

export function ProgressRing({
  value,
  size = 44,
  stroke = 3,
  tone = 'accent',
  label,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

  return (
    <span
      {...(label ? { role: 'img', 'aria-label': label } : {})}
      className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="ring-progress"
          opacity={clamped === 0 ? 0 : 1}
        />
      </svg>
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
}
