import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatTileProps = {
  icon: ReactNode;
  title: ReactNode;
  detail: ReactNode;
  className?: string;
};

export function StatTile({ icon, title, detail, className }: StatTileProps) {
  return (
    <div className={cn('flex items-center gap-4 rounded-2xl bg-inset p-4', className)}>
      {icon}
      <span className="flex flex-col">
        {title}
        {detail}
      </span>
    </div>
  );
}
