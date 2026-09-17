'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditableLine } from '@/components/ui/editable-line';
import { Field, Input } from '@/components/ui/field';
import { slideLabel } from '@/features/cue-cards/card-section';
import type { CueCardProps } from './cue-card';
import { KeywordsEditor } from './keywords-editor';

export function parseSlideNumbers(text: string) {
  return [
    ...new Set(
      text
        .split(/[\s,]+/)
        .map(part => Number.parseInt(part, 10))
        .filter(number => Number.isInteger(number) && number > 0),
    ),
  ];
}

export function CardEditBody({
  section,
  holdsVerbatim,
  deckId,
  thumbnailNumbers = [],
  onChange,
  onCommit,
}: CueCardProps) {
  const [slidesText, setSlidesText] = useState(section.slideNumbers.join(', '));
  const [slidesOpen, setSlidesOpen] = useState(false);
  const thumbs = deckId ? section.slideNumbers.filter(number => thumbnailNumbers.includes(number)) : [];

  return (
    <>
      <KeywordsEditor
        cardTitle={section.title}
        keywords={section.keywords}
        onChange={keywords => {
          onChange?.({ keywords });
          onCommit?.({ keywords });
        }}
      />

      {holdsVerbatim && (
        <EditableLine
          label="Exact words"
          value={section.verbatim}
          placeholder="Tap to write the words you say"
          onSave={verbatim => {
            onChange?.({ verbatim });
            onCommit?.({ verbatim });
          }}
        />
      )}

      {deckId && thumbs.length > 0 && (
        <ul className="grid grid-cols-3 gap-2" aria-label="Slides on this card">
          {thumbs.map(number => (
            <li key={number}>
              <Image
                unoptimized
                src={`/api/decks/${deckId}/thumbs/${number}`}
                alt={`Slide ${number}`}
                width={320}
                height={180}
                className="h-auto w-full rounded-lg outline -outline-offset-1 outline-black/10 dark:outline-white/10"
              />
            </li>
          ))}
        </ul>
      )}

      {deckId && !slidesOpen && (
        <Button variant="quiet" size="sm" className="-ml-3 self-start text-muted" onClick={() => setSlidesOpen(true)}>
          {section.slideNumbers.length > 0 ? `${slideLabel(section.slideNumbers)}, change` : 'Link slides'}
        </Button>
      )}

      {deckId && slidesOpen && (
        <Field label="Slide numbers">
          <Input
            value={slidesText}
            placeholder="3, 4, 5"
            onChange={event => setSlidesText(event.target.value)}
            onBlur={() => {
              const slideNumbers = parseSlideNumbers(slidesText);
              setSlidesText(slideNumbers.join(', '));
              setSlidesOpen(false);
              onChange?.({ slideNumbers });
              onCommit?.({ slideNumbers });
            }}
          />
        </Field>
      )}
    </>
  );
}
