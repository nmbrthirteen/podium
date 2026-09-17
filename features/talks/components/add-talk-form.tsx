'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MicIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/loading-state';
import { DeckUpload } from '@/features/deck/components/deck-upload';
import type { SavedDeck } from '@/features/deck/deck-limits';
import { useSpeechInput } from '@/hooks/use-speech-input';
import { capitalize } from '@/lib/utils';
import { AddLinkButton, LinkChips, type LinkState } from './link-chips';
import { MicButton } from './mic-button';

type AddTalkFormProps = {
  talkId: string;
  text: string;
  onTextChange: (text: string) => void;
  onDeck: (deck: SavedDeck) => void;
  links: LinkState[];
  onAddLinks: (urls: string[]) => void;
  onRemoveLink: (url: string) => void;
  stage: 'idle' | 'links' | 'drafting';
  creating: boolean;
  error: string | null;
  onSubmit: () => void;
  onCancel: () => void;
};

function appendSpoken(current: string, spoken: string) {
  if (!spoken) return current;
  const trimmed = current.trim();
  if (!trimmed) return capitalize(spoken);
  return `${trimmed.replace(/[.!?]?$/, '.')} ${capitalize(spoken)}`;
}

export function AddTalkForm({
  talkId,
  text,
  onTextChange,
  onDeck,
  links,
  onAddLinks,
  onRemoveLink,
  stage,
  creating,
  error,
  onSubmit,
  onCancel,
}: AddTalkFormProps) {
  const [typing, setTyping] = useState(false);
  const textRef = useRef(text);
  textRef.current = text;
  const speech = useSpeechInput(spoken => onTextChange(appendSpoken(textRef.current, spoken)));
  const busy = stage !== 'idle' || creating;
  const voice = !typing && speech.supported !== false;

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {voice ? (
        <section
          aria-labelledby="voice-heading"
          className="flex flex-col items-center gap-8 rounded-2xl bg-inset px-6 py-14 text-center"
        >
          <h2 id="voice-heading" className="max-w-md font-display text-2xl font-semibold text-balance sm:text-3xl">
            {speech.listening ? 'Listening' : text ? 'Anything to add?' : 'Tell the coach about your talk'}
          </h2>
          <MicButton
            listening={speech.listening}
            disabled={busy}
            onPress={speech.listening ? speech.stop : speech.start}
          />
          {(text || speech.interim) && (
            <p aria-live="polite" className="max-w-xl text-lg text-pretty">
              {text}
              {speech.interim && <span className="text-muted"> {speech.interim}</span>}
            </p>
          )}
          {speech.error && (
            <p role="alert" className="font-medium text-danger">
              {speech.error}
            </p>
          )}
          <Button
            variant="quiet"
            size="sm"
            className="text-muted"
            disabled={busy}
            onClick={() => {
              speech.stop();
              setTyping(true);
            }}
          >
            {text ? 'Edit the words' : 'Type instead'}
          </Button>
        </section>
      ) : (
        <div className="flex flex-col gap-3">
          <label htmlFor="talk-text" className="font-display text-2xl font-semibold">
            Tell the coach about your talk
          </label>
          <textarea
            id="talk-text"
            value={text}
            rows={4}
            disabled={busy}
            placeholder="Hiring update for the exec team next Thursday at 2pm, 10 minutes. Paste links for context."
            className="field-sizing-content min-h-40 w-full rounded-2xl bg-inset px-5 py-4 text-lg text-ink placeholder:text-muted focus:bg-surface focus:shadow-control disabled:opacity-60"
            onChange={event => onTextChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
          {speech.supported && (
            <Button variant="quiet" size="sm" className="-ml-3 self-start text-muted" onClick={() => setTyping(false)}>
              <MicIcon size={16} />
              Speak instead
            </Button>
          )}
        </div>
      )}

      {links.length > 0 && <LinkChips links={links} onRemove={onRemoveLink} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DeckUpload talkId={talkId} compact onUploaded={onDeck} />
          <AddLinkButton disabled={busy} onAdd={onAddLinks} />
        </div>
        {stage === 'drafting' ? (
          <LoadingState label="The coach is drafting your plan" onCancel={onCancel} />
        ) : stage === 'links' ? (
          <LoadingState label="Reading your links" />
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            pending={creating}
            pendingLabel="Building the plan"
            disabled={speech.listening}
          >
            Build my plan
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
