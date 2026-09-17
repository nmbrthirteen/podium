'use client';

import { Input } from '@/components/ui/field';
import { EyeIcon } from '@/components/ui/icons';
import { MetaChip } from '@/components/ui/meta-chip';
import { SegmentBar, sectionSegments } from '@/components/ui/segment-bar';
import { type CardSection, slideLabel } from '@/features/cue-cards/card-section';
import { cn, formatMinutes } from '@/lib/utils';
import { CardEditBody } from './cue-card-edit';

export type CueCardProps = {
  mode: 'edit' | 'recall' | 'live';
  section: CardSection;
  index: number;
  timeline: { id: string; minutes: number }[];
  holdsVerbatim: boolean;
  revealed?: boolean;
  deckId?: string | null;
  thumbnailNumbers?: number[];
  onChange?: (patch: Partial<CardSection>) => void;
  onCommit?: (patch: Partial<CardSection>) => void;
  className?: string;
};

export function CueCard(props: CueCardProps) {
  const { mode, section, index, timeline, holdsVerbatim, revealed = false, className } = props;
  const total = timeline.length;
  const live = mode === 'live';

  return (
    <article
      id={mode === 'edit' ? `card-${section.id}` : undefined}
      tabIndex={mode === 'edit' ? -1 : undefined}
      aria-label={`Section ${index + 1} of ${total}: ${section.title}`}
      className={cn('flex min-w-0 flex-col rounded-2xl bg-surface shadow-card outline-none', className)}
    >
      {mode === 'edit' ? (
        <header className="flex items-center gap-3 px-6 pt-5">
          <Input
            aria-label={`Section ${index + 1} title`}
            value={section.title}
            className="-mx-3 flex-1 bg-transparent font-display text-xl font-semibold shadow-none hover:bg-inset focus:bg-surface focus:shadow-control"
            onChange={event => props.onChange?.({ title: event.target.value })}
            onBlur={event => {
              if (event.target.value.trim()) props.onCommit?.({ title: event.target.value.trim() });
            }}
          />
          <MetaChip className="shrink-0">{formatMinutes(section.minutes)}</MetaChip>
        </header>
      ) : (
        <header className={cn('flex flex-col gap-2 px-5 pt-4', live && 'px-6 pt-5')}>
          <p className="text-sm text-muted tabular-nums">
            Section {index + 1} of {total}, {formatMinutes(section.minutes)}
          </p>
          <h2
            className={cn(
              'font-display font-semibold text-balance',
              live ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
            )}
          >
            {section.title}
          </h2>
          <SegmentBar
            segments={sectionSegments(timeline, index)}
            label={`Section ${index + 1} of ${total}`}
            className="mt-1"
          />
        </header>
      )}

      <div className={cn('flex flex-col gap-5 px-6 pt-4 pb-6', mode === 'recall' && 'px-5 pb-5')}>
        {mode === 'edit' && <CardEditBody key={section.slideNumbers.join('-')} {...props} />}
        {mode === 'recall' && (
          <div className="perspective-distant">
            <div className={cn('card-flip grid transform-3d', revealed && 'rotate-y-180')}>
              <div
                aria-hidden={revealed}
                className="flex min-h-40 flex-col items-center justify-center gap-3 text-center backface-hidden [grid-area:1/1]"
              >
                <EyeIcon size={28} className="text-muted" />
                <p className="text-muted">Say it out loud</p>
              </div>
              <div aria-hidden={!revealed} className="flex flex-col gap-4 rotate-y-180 backface-hidden [grid-area:1/1]">
                <CardContent section={section} holdsVerbatim={holdsVerbatim} size="md" />
              </div>
            </div>
          </div>
        )}
        {live && <CardContent section={section} holdsVerbatim={holdsVerbatim} size="lg" />}
      </div>
    </article>
  );
}

function CardContent({
  section,
  holdsVerbatim,
  size,
}: {
  section: CardSection;
  holdsVerbatim: boolean;
  size: 'md' | 'lg';
}) {
  const verbatim = holdsVerbatim ? section.verbatim.trim() : '';
  if (!verbatim && section.keywords.length === 0) {
    return <p className="text-muted">No keywords yet</p>;
  }

  return (
    <>
      {verbatim && (
        <p className={cn('font-display text-pretty', size === 'lg' ? 'text-3xl leading-snug sm:text-4xl' : 'text-xl')}>
          {verbatim}
        </p>
      )}
      {section.keywords.length > 0 && (
        <ul
          className={cn(
            'flex flex-col',
            size === 'lg' ? 'gap-3 text-3xl leading-tight font-medium sm:text-4xl' : 'gap-1.5 text-lg',
          )}
        >
          {section.keywords.map(keyword => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      )}
      {section.slideNumbers.length > 0 && <p className="text-sm text-muted">{slideLabel(section.slideNumbers)}</p>}
    </>
  );
}
