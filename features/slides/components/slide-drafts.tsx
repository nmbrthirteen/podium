'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { PlusIcon, SlidesIcon, SparkIcon, UploadIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { MetaChip } from '@/components/ui/meta-chip';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { slidesDraft } from '@/lib/coach/tasks/slides-draft';
import type { Section, SlideDraft } from '@/lib/db/schema';
import { formatMinutes, pluralize } from '@/lib/utils';
import { addSlideDraft, replaceSlideDrafts } from '../actions';
import { orderDrafts } from '../numbering';
import { SlideEditor } from './slide-editor';
import { SlidePreview } from './slide-preview';

type SlideDraftsProps = {
  talkId: string;
  sections: Section[];
  drafts: SlideDraft[];
  context: BriefContext;
  onUploadDeck: () => void;
};

export function SlideDrafts({ talkId, sections, drafts: initialDrafts, context, onUploadDeck }: SlideDraftsProps) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const coach = useCoachTask(slidesDraft);

  const sectionIds = sections.map(section => section.id);
  const ordered = orderDrafts(drafts, sectionIds);
  const numberOf = new Map(ordered.map((draft, index) => [draft.id, index + 1]));

  const draftAll = async () => {
    const output = await coach.run(
      {
        brief: context,
        sections: sections.map(section => ({
          id: section.id,
          title: section.title,
          minutes: section.minutes,
          keywords: section.keywords,
          verbatim: section.verbatim,
        })),
      },
      { fresh: drafts.length > 0 },
    );
    if (!output) return;
    setDrafts(await replaceSlideDrafts(talkId, output.slides));
  };

  const addSlide = async (sectionId: string) => {
    const row = await addSlideDraft(talkId, sectionId);
    setDrafts(current => [...current, row]);
    setEditingId(row.id);
  };

  const errorMessage = coach.state.status === 'error' ? coach.state.message : null;

  if (coach.state.status === 'running') {
    return <LoadingState label="The coach is sketching your slides" onCancel={coach.cancel} />;
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-inset px-6 py-12 text-center">
        <IconBadge size="16" tone="accent">
          <SlidesIcon size={28} />
        </IconBadge>
        <p className="font-display text-2xl font-semibold">No slides yet</p>
        {errorMessage && (
          <p role="alert" className="text-danger">
            {errorMessage}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={() => void draftAll()}>
            <SparkIcon size={18} />
            Draft slides with the coach
          </Button>
          <Button variant="secondary" size="lg" onClick={onUploadDeck}>
            <UploadIcon size={18} />
            Upload a deck
          </Button>
        </div>
      </div>
    );
  }

  const placed = new Set(sectionIds);
  const groups = [
    ...sections.map(section => ({
      key: section.id,
      title: section.title,
      minutes: section.minutes as number | null,
      items: ordered.filter(draft => draft.sectionId === section.id),
    })),
    {
      key: 'unplaced',
      title: 'Other slides',
      minutes: null,
      items: ordered.filter(draft => draft.sectionId === null || !placed.has(draft.sectionId)),
    },
  ].filter(group => group.key !== 'unplaced' || group.items.length > 0);

  const editing = ordered.find(draft => draft.id === editingId);
  const editingIndex = editing ? ordered.indexOf(editing) : -1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MetaChip>{pluralize(drafts.length, 'slide')} drafted</MetaChip>
        <div className="flex gap-2">
          <Button variant="quiet" size="sm" className="text-muted" onClick={onUploadDeck}>
            Upload a deck
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void draftAll()}>
            <SparkIcon size={16} />
            Redraft all
          </Button>
        </div>
      </div>
      {errorMessage && (
        <p role="alert" className="text-danger">
          {errorMessage}
        </p>
      )}

      {groups.map((group, groupIndex) => (
        <section key={group.key} aria-label={group.title} className="flex flex-col gap-3">
          <h3 className="flex flex-wrap items-baseline gap-x-2 font-medium">
            <span className="text-muted tabular-nums">{groupIndex + 1}</span>
            {group.title}
            {group.minutes !== null && <span className="text-sm text-muted">{formatMinutes(group.minutes)}</span>}
          </h3>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(draft => (
              <li key={draft.id} id={`slide-draft-${draft.id}`} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(draft.id)}
                  aria-label={`Edit slide ${numberOf.get(draft.id)}: ${draft.title || 'untitled'}`}
                  className="press rounded-xl text-left"
                >
                  <SlidePreview number={numberOf.get(draft.id) ?? 0} slide={draft} />
                </button>
                {draft.script && <p className="line-clamp-2 text-sm text-muted">{draft.script}</p>}
              </li>
            ))}
            {group.key !== 'unplaced' && (
              <li>
                <button
                  type="button"
                  onClick={() => void addSlide(group.key)}
                  className="press flex aspect-video w-full items-center justify-center gap-2 rounded-xl bg-inset text-sm font-medium text-muted transition-colors hover:bg-line hover:text-ink"
                >
                  <PlusIcon size={16} />
                  Add slide
                </button>
              </li>
            )}
          </ol>
        </section>
      ))}

      {editing && (
        <SlideEditor
          key={editing.id}
          talkId={talkId}
          draft={editing}
          number={editingIndex + 1}
          sectionTitle={sections.find(section => section.id === editing.sectionId)?.title ?? 'Other slides'}
          before={ordered[editingIndex - 1]}
          after={ordered[editingIndex + 1]}
          context={context}
          onChange={next => setDrafts(current => current.map(draft => (draft.id === next.id ? next : draft)))}
          onDelete={() => {
            setDrafts(current => current.filter(draft => draft.id !== editing.id));
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
