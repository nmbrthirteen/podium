import { ImageIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type SlideContent = { title: string; points: string[]; visual: string };

type SlidePreviewProps = { number: number; slide: SlideContent; size?: 'sm' | 'lg'; className?: string };

export function SlidePreview({ number, slide, size = 'sm', className }: SlidePreviewProps) {
  const large = size === 'lg';

  return (
    <div
      className={cn(
        'relative flex aspect-video w-full flex-col overflow-hidden rounded-xl bg-surface text-left shadow-card',
        large ? 'gap-4 p-7' : 'gap-2 p-4',
        className,
      )}
    >
      <span
        className={cn('absolute text-muted tabular-nums', large ? 'top-5 right-6 text-sm' : 'top-3 right-3.5 text-xs')}
      >
        {number}
      </span>
      <p
        className={cn(
          'pr-8 font-display font-semibold text-balance',
          large ? 'text-2xl leading-tight sm:text-3xl' : 'line-clamp-2 text-sm leading-snug',
        )}
      >
        {slide.title || 'Untitled slide'}
      </p>
      {slide.points.length > 0 && (
        <ul className={cn('flex flex-col', large ? 'gap-2 text-lg' : 'gap-1 text-xs')}>
          {slide.points.slice(0, 3).map(point => (
            <li key={point} className="flex min-w-0 items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                className={cn('shrink-0 rounded-full bg-accent', large ? 'size-1.5' : 'size-1')}
              />
              <span className="truncate">{point}</span>
            </li>
          ))}
        </ul>
      )}
      {slide.visual && (
        <div
          className={cn(
            'mt-auto flex items-center gap-2 rounded-lg bg-accent-soft text-accent',
            large ? 'px-3.5 py-3 text-base' : 'px-2 py-1.5 text-xs',
          )}
        >
          <ImageIcon size={large ? 20 : 14} className="shrink-0" />
          <span className={large ? undefined : 'line-clamp-1'}>{slide.visual}</span>
        </div>
      )}
    </div>
  );
}
