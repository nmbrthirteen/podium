'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { SparkIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { MetaChip } from '@/components/ui/meta-chip';
import type { CardSection } from '@/features/cue-cards/card-section';
import { talkTypeLabels } from '@/features/talks/talk-types';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { cardsGenerate } from '@/lib/coach/tasks/cards-generate';
import type { Section, Slide, Talk } from '@/lib/db/schema';
import { applyCoachCards, resetSections, saveSection, saveSectionMinutes } from '../actions';
import { structureRules } from '../structure-rules';
import { CardDeck } from './card-deck';
import { CueCard } from './cue-card';
import { TalkTimeline } from './talk-timeline';

type StructureEditorProps = {
  talk: Talk;
  sections: Section[];
  slides: Slide[];
  deckId: string | null;
  context: BriefContext;
};

function formatTotal(minutes: number) {
  return Number.isInteger(minutes) ? String(minutes) : String(Math.round(minutes * 10) / 10);
}

export function StructureEditor({ talk, sections, slides, deckId, context }: StructureEditorProps) {
  const [cards, setCards] = useState<CardSection[]>(sections);
  const [selected, setSelected] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, startReset] = useTransition();
  const generate = useCoachTask(cardsGenerate);

  const thumbnailNumbers = slides.filter(slide => slide.thumbnailPath).map(slide => slide.number);
  const total = cards.reduce((sum, card) => sum + card.minutes, 0);
  const issues = structureRules({ lengthMinutes: talk.lengthMinutes, sections: cards });

  const fillCards = async () => {
    const output = await generate.run(
      {
        brief: context,
        sections: cards.map((card, index) => ({
          id: card.id,
          title: card.title,
          minutes: card.minutes,
          holdsVerbatim: index === 0 || index === cards.length - 1,
        })),
        slides: slides.map(slide => ({ number: slide.number, text: slide.text, notes: slide.notes })),
      },
      { fresh: true },
    );
    if (!output) return;

    const generated = new Map(output.sections.map(section => [section.id, section]));
    const next = cards.map(card => {
      const match = generated.get(card.id);
      if (!match) return card;
      return {
        ...card,
        keywords: [...new Set(match.keywords.map(keyword => keyword.trim()).filter(Boolean))].slice(0, 7),
        verbatim: match.verbatim || card.verbatim,
        slideNumbers: match.slideNumbers,
      };
    });
    setCards(next);
    await applyCoachCards(
      talk.id,
      next.map(card => ({
        id: card.id,
        keywords: card.keywords,
        verbatim: card.verbatim,
        slideNumbers: card.slideNumbers,
      })),
    );
  };

  const fillRef = useRef(fillCards);
  fillRef.current = fillCards;
  const autoFilled = useRef(false);
  const needsCards = cards.length > 0 && cards.every(card => card.keywords.length === 0);

  useEffect(() => {
    if (!needsCards || autoFilled.current) return;
    autoFilled.current = true;
    void fillRef.current();
    return () => {
      autoFilled.current = false;
    };
  }, [needsCards]);

  const retime = (minutes: number[]) =>
    setCards(current => current.map((card, index) => ({ ...card, minutes: minutes[index] ?? card.minutes })));

  const commitRetime = (minutes: number[], boundary: number) => {
    const updates = [boundary, boundary + 1].flatMap(index => {
      const card = cards[index];
      const value = minutes[index];
      return card && value !== undefined ? [{ id: card.id, minutes: value }] : [];
    });
    if (updates.length > 0) void saveSectionMinutes(talk.id, updates);
  };

  if (talk.type === 'interview-panel') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-inset px-6 py-8">
        <h2 className="font-display text-xl font-semibold">{talkTypeLabels[talk.type]} prep has no cue cards</h2>
        <Link href={`/talks/${talk.id}/practice/qa`} className={buttonVariants({ variant: 'primary' })}>
          Run the Q&A drill
        </Link>
      </div>
    );
  }

  const card = cards[selected];

  return (
    <div className="flex flex-col gap-6">
      <h2 id="structure-heading" tabIndex={-1} className="sr-only">
        Cue cards
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MetaChip>
          {formatTotal(total)} of {talk.lengthMinutes} min
        </MetaChip>
        <div className="flex gap-2">
          <Button variant="quiet" size="sm" className="text-muted" onClick={() => setResetOpen(true)}>
            Reset
          </Button>
          <Button
            variant="secondary"
            size="sm"
            pending={generate.state.status === 'running'}
            pendingLabel="Drafting cards"
            onClick={() => void fillCards()}
          >
            <SparkIcon size={16} />
            Redraft cards
          </Button>
        </div>
      </div>

      <TalkTimeline
        sections={cards}
        selectedIndex={selected}
        onSelect={setSelected}
        onRetime={retime}
        onRetimeEnd={commitRetime}
      />

      {generate.state.status === 'running' && (
        <LoadingState label="The coach is writing keywords for each card" onCancel={generate.cancel} />
      )}
      {generate.state.status === 'error' && (
        <p role="alert" className="text-danger">
          {generate.state.message}
        </p>
      )}
      {issues.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {issues.map(issue => (
            <li key={issue.id} className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      {card && (
        <CardDeck count={cards.length} index={selected} onIndexChange={setSelected} label="Cue cards">
          <CueCard
            mode="edit"
            section={card}
            index={selected}
            timeline={cards}
            holdsVerbatim={selected === 0 || selected === cards.length - 1}
            deckId={deckId}
            thumbnailNumbers={thumbnailNumbers}
            onChange={patch =>
              setCards(current => current.map(item => (item.id === card.id ? { ...item, ...patch } : item)))
            }
            onCommit={patch => void saveSection(talk.id, card.id, patch)}
          />
        </CardDeck>
      )}

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent
          title="Reset the cue cards?"
          description={`The cards return to the ${talkTypeLabels[talk.type]} template. Keywords and exact words are cleared.`}
        >
          <div className="flex flex-wrap justify-end gap-2">
            <DialogClose render={<Button variant="quiet" />}>Keep my cards</DialogClose>
            <Button
              variant="danger"
              pending={resetting}
              pendingLabel="Resetting cards"
              onClick={() =>
                startReset(async () => {
                  await resetSections(talk.id);
                  setResetOpen(false);
                })
              }
            >
              Reset cards
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
