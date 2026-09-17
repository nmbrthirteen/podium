'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import type { Deck, Slide } from '@/lib/db/schema';
import { pluralize } from '@/lib/utils';
import { slideTitle } from '../extracted-slide';
import { DeckUpload } from './deck-upload';

export function DeckPanel({ talkId, deck, slides }: { talkId: string; deck: Deck | null; slides: Slide[] }) {
  const router = useRouter();
  const [replacing, setReplacing] = useState(deck === null);

  return (
    <div className="flex flex-col gap-6">
      {deck && !replacing && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            <span className="font-medium">{deck.fileName}</span>, {pluralize(deck.slideCount, 'slide')}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setReplacing(true)}>
            Replace deck
          </Button>
        </div>
      )}

      {replacing && (
        <DeckUpload
          talkId={talkId}
          onUploaded={() => {
            setReplacing(false);
            router.refresh();
          }}
        />
      )}

      {slides.length > 0 && !replacing && (
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Slides">
          {slides.map(slide => (
            <li
              key={slide.id}
              id={`slide-${slide.number}`}
              tabIndex={-1}
              className="flex flex-col gap-2 rounded-card outline-offset-4"
            >
              {slide.thumbnailPath && deck ? (
                <Image
                  unoptimized
                  src={`/api/decks/${deck.id}/thumbs/${slide.number}`}
                  alt={`Slide ${slide.number}`}
                  width={320}
                  height={180}
                  className="h-auto w-full rounded-control outline -outline-offset-1 outline-black/10 dark:outline-white/10"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-control bg-inset font-mono text-2xl text-muted">
                  {slide.number}
                </div>
              )}
              <p className="line-clamp-2 font-medium">
                {slide.number}. {slideTitle(slide)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="tabular-nums">{pluralize(slide.wordCount, 'word')}</span>
                {slide.wordCount > 40 && <Tag tone="danger">Over 40 words</Tag>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
