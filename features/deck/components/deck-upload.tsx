'use client';

import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { UploadIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { deckKindOf, maxDeckBytes, type SavedDeck, savedDeckSchema } from '@/features/deck/deck-limits';
import { deckRules } from '@/features/deck/deck-rules';
import { cn, pluralize } from '@/lib/utils';
import { renderPdfThumbnails } from '../render-pdf-thumbnails';

type Phase = { name: 'idle' } | { name: 'reading'; detail: string } | { name: 'done'; deck: SavedDeck };

type DeckUploadProps = {
  talkId: string;
  compact?: boolean;
  onUploaded?: (deck: SavedDeck) => void;
};

export function DeckUpload({ talkId, compact = false, onUploaded }: DeckUploadProps) {
  const [phase, setPhase] = useState<Phase>({ name: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef<HTMLLabelElement>(null);

  const upload = async (file: File) => {
    setError(null);
    const kind = deckKindOf(file.name);
    const isPdf = kind === 'pdf';
    if (!kind) {
      setError('Upload a PPTX or PDF. Export Keynote or Google Slides decks to one of those first.');
      return;
    }
    if (file.size > maxDeckBytes) {
      setError('This deck is over 100 MB. Export a smaller copy, then upload it.');
      return;
    }

    const form = new FormData();
    form.set('talkId', talkId);
    form.set('file', file);

    if (isPdf) {
      setPhase({ name: 'reading', detail: 'Rendering slide thumbnails' });
      try {
        const thumbnails = await renderPdfThumbnails(file, (done, total) =>
          setPhase({ name: 'reading', detail: `Rendering thumbnail ${done} of ${total}` }),
        );
        for (const [number, blob] of thumbnails) form.set(`thumb-${number}`, blob, `${number}.png`);
      } catch {
        setPhase({ name: 'reading', detail: 'Reading slides without thumbnails' });
      }
    }

    setPhase({ name: 'reading', detail: 'Reading slide text and notes' });
    const response = await fetch('/api/decks', { method: 'POST', body: form }).catch(() => null);
    const body: unknown = await response?.json().catch(() => null);
    if (!response?.ok) {
      const message = z.object({ error: z.string() }).safeParse(body);
      setError(
        message.success ? message.data.error : 'The upload failed. Check that the app is running, then try again.',
      );
      setPhase({ name: 'idle' });
      return;
    }

    const deck = savedDeckSchema.parse(body);
    setPhase({ name: 'done', deck });
    onUploaded?.(deck);
  };

  const uploadRef = useRef(upload);
  uploadRef.current = upload;

  useEffect(() => {
    const zone = dropRef.current;
    if (!zone) return;
    const over = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    const leave = () => setDragging(false);
    const drop = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer?.files[0];
      if (file) void uploadRef.current(file);
    };
    zone.addEventListener('dragover', over);
    zone.addEventListener('dragleave', leave);
    zone.addEventListener('drop', drop);
    return () => {
      zone.removeEventListener('dragover', over);
      zone.removeEventListener('dragleave', leave);
      zone.removeEventListener('drop', drop);
    };
  }, [phase.name]);

  const busy = phase.name === 'reading';

  return (
    <section aria-label="Deck" className={cn('flex flex-col gap-3', compact && 'items-start')}>
      {phase.name === 'done' ? (
        compact ? (
          <div className="flex min-h-10 items-center gap-1 rounded-full bg-accent-soft pl-4 text-sm font-medium text-accent">
            {pluralize(phase.deck.slides.length, 'slide')} attached
            <Button
              variant="quiet"
              size="sm"
              className="rounded-full text-accent"
              onClick={() => setPhase({ name: 'idle' })}
            >
              Replace
            </Button>
          </div>
        ) : (
          <DeckSummary deck={phase.deck} onReplace={() => setPhase({ name: 'idle' })} />
        )
      ) : (
        <label
          ref={dropRef}
          className={cn(
            compact
              ? 'inline-flex min-h-10 items-center gap-2 rounded-full bg-inset px-4 text-sm font-medium text-ink transition-colors'
              : 'flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl bg-inset px-4 py-8 text-center font-medium transition-colors',
            busy ? 'cursor-progress' : 'cursor-pointer hover:bg-line',
            dragging && 'bg-accent-soft',
          )}
        >
          <input
            type="file"
            accept=".pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            disabled={busy}
            onChange={event => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void upload(file);
            }}
          />
          {phase.name === 'reading' && <LoadingState label={phase.detail} />}
          {phase.name === 'idle' && (
            <>
              <UploadIcon size={compact ? 16 : 24} className="text-muted" />
              {compact ? 'Attach slides' : 'Drop a PPTX or PDF, or choose a file'}
            </>
          )}
        </label>
      )}

      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}
    </section>
  );
}

function DeckSummary({ deck, onReplace }: { deck: SavedDeck; onReplace: () => void }) {
  const dense = deckRules(deck.slides);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-inset p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          {pluralize(deck.slides.length, 'slide')} from {deck.fileName}
        </p>
        <Button variant="quiet" size="sm" onClick={onReplace}>
          Replace deck
        </Button>
      </div>
      {dense.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-danger">
          {dense.map(issue => (
            <li key={issue.id}>{issue.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
