'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeckPanel } from '@/features/deck/components/deck-panel';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import type { Deck, Section, Slide, SlideDraft } from '@/lib/db/schema';
import { SlideDrafts } from './slide-drafts';

type SlidesPanelProps = {
  talkId: string;
  deck: Deck | null;
  slides: Slide[];
  drafts: SlideDraft[];
  sections: Section[];
  context: BriefContext;
};

export function SlidesPanel({ talkId, deck, slides, drafts, sections, context }: SlidesPanelProps) {
  const [uploading, setUploading] = useState(false);

  if (deck) return <DeckPanel talkId={talkId} deck={deck} slides={slides} />;

  if (uploading) {
    return (
      <div className="flex flex-col gap-3">
        <DeckPanel talkId={talkId} deck={null} slides={[]} />
        <Button variant="quiet" size="sm" className="-ml-3 self-start text-muted" onClick={() => setUploading(false)}>
          {drafts.length > 0 ? 'Back to drafted slides' : 'Cancel'}
        </Button>
      </div>
    );
  }

  return (
    <SlideDrafts
      talkId={talkId}
      sections={sections}
      drafts={drafts}
      context={context}
      onUploadDeck={() => setUploading(true)}
    />
  );
}
