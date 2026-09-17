import { cn } from '@/lib/utils';

export function CheckMark({
  animate = true,
  size = 16,
  className,
}: {
  animate?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" pathLength={24} strokeDasharray={24} className={cn(animate && 'check-draw')} />
    </svg>
  );
}
