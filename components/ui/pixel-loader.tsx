import { cn } from '@/lib/utils';

const cells = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return { id: `cell-${index}`, delay: (column + Math.abs(row - 1)) * 90 };
});

export function PixelLoader({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 grid-cols-3 gap-px', className)}>
      {cells.map(cell => (
        <span key={cell.id} className="pixel-cell size-1 bg-current" style={{ animationDelay: `${cell.delay}ms` }} />
      ))}
    </span>
  );
}
