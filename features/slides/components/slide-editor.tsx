'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EditableLine } from '@/components/ui/editable-line';
import { SparkIcon, TrashIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { KeywordsEditor } from '@/features/cue-cards/components/keywords-editor';
import { useCoachTask } from '@/hooks/use-coach-task';
import type { BriefContext } from '@/lib/coach/tasks/brief-context';
import { type SlideTweak, slideRedraft, slideTweaks } from '@/lib/coach/tasks/slide-redraft';
import type { SlideDraft } from '@/lib/db/schema';
import { deleteSlideDraft, updateSlideDraft } from '../actions';
import { SlidePreview } from './slide-preview';

const tweakLabels: Record<SlideTweak, string> = {
  'more-visual': 'More visual',
  'fewer-words': 'Fewer words',
  'stronger-title': 'Stronger title',
  'new-idea': 'New idea',
};

type SlideContentPatch = Partial<Pick<SlideDraft, 'title' | 'points' | 'visual' | 'script'>>;

type SlideEditorProps = {
  talkId: string;
  draft: SlideDraft;
  number: number;
  sectionTitle: string;
  before?: SlideDraft;
  after?: SlideDraft;
  context: BriefContext;
  onChange: (draft: SlideDraft) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function SlideEditor({
  talkId,
  draft,
  number,
  sectionTitle,
  before,
  after,
  context,
  onChange,
  onDelete,
  onClose,
}: SlideEditorProps) {
  const redraft = useCoachTask(slideRedraft);
  const [previous, setPrevious] = useState<SlideDraft | null>(null);
  const running = redraft.state.status === 'running';

  const save = (patch: SlideContentPatch) => {
    onChange({ ...draft, ...patch });
    void updateSlideDraft(talkId, draft.id, patch);
  };

  const tweak = async (id: SlideTweak) => {
    const output = await redraft.run(
      {
        brief: context,
        sectionTitle,
        slide: { title: draft.title, points: draft.points, visual: draft.visual, script: draft.script },
        before: before?.title ?? '',
        after: after?.title ?? '',
        tweak: id,
      },
      { fresh: true },
    );
    if (!output) return;
    setPrevious(draft);
    save(output);
  };

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent title={`Slide ${number}`} className="max-w-2xl">
        <div className="flex flex-col gap-5">
          <SlidePreview number={number} slide={draft} size="lg" />

          <fieldset aria-label="Redraft this slide" className="flex flex-wrap items-center gap-2">
            {slideTweaks.map(id => (
              <button
                key={id}
                type="button"
                disabled={running}
                onClick={() => void tweak(id)}
                className="press inline-flex min-h-9 items-center gap-1.5 rounded-full bg-inset pr-3.5 pl-3 text-sm font-medium transition-colors hover:bg-line disabled:opacity-50 pointer-coarse:min-h-11"
              >
                <SparkIcon size={14} className="text-accent" />
                {tweakLabels[id]}
              </button>
            ))}
            {previous && !running && (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  save({
                    title: previous.title,
                    points: previous.points,
                    visual: previous.visual,
                    script: previous.script,
                  });
                  setPrevious(null);
                }}
              >
                Undo
              </Button>
            )}
          </fieldset>
          {running && <LoadingState label="Redrafting the slide" onCancel={redraft.cancel} />}
          {redraft.state.status === 'error' && (
            <p role="alert" className="text-danger">
              {redraft.state.message}
            </p>
          )}

          <EditableLine
            label="Title"
            value={draft.title}
            placeholder="Tap to write the slide title"
            onSave={title => save({ title })}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">Cues on the slide</span>
            <KeywordsEditor
              cardTitle={`slide ${number}`}
              keywords={draft.points}
              onChange={points => save({ points: points.slice(0, 5) })}
            />
          </div>
          <EditableLine
            label="Visual"
            value={draft.visual}
            placeholder="Tap to describe a picture or chart"
            onSave={visual => save({ visual })}
          />
          <EditableLine
            label="What to say"
            value={draft.script}
            placeholder="Tap to write what you say on this slide"
            onSave={script => save({ script })}
          />

          <div className="flex justify-between gap-2 border-t border-line pt-4">
            <Button
              variant="quiet"
              size="sm"
              className="text-danger hover:bg-danger-soft"
              onClick={() => {
                void deleteSlideDraft(talkId, draft.id);
                onDelete();
              }}
            >
              <TrashIcon size={16} />
              Delete slide
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
