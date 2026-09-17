'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { z } from 'zod';
import type { SavedDeck } from '@/features/deck/deck-limits';
import { deckTextForCoach, slideTitle } from '@/features/deck/extracted-slide';
import { useCoachTask } from '@/hooks/use-coach-task';
import { briefPrefill } from '@/lib/coach/tasks/brief-prefill';
import { toDay } from '@/lib/dates';
import { createTalk } from '../actions';
import { findUrls, linkLabel, maxLinks } from '../link-urls';
import { buildTalkInput, todayForCoach } from '../talk-from-text';
import { AddTalkForm } from './add-talk-form';
import type { LinkState } from './link-chips';

const emptyKnown = { title: '', goal: '', audience: '', bigIdea: '', openingLine: '', closingLine: '' };
const pageSchema = z.object({ url: z.string(), title: z.string(), text: z.string() });
const errorSchema = z.object({ error: z.string() });
type Page = z.infer<typeof pageSchema>;

export function AddTalkScreen() {
  const [talkId] = useState(() => crypto.randomUUID());
  const [text, setText] = useState('');
  const [deck, setDeck] = useState<SavedDeck | null>(null);
  const [links, setLinks] = useState<LinkState[]>([]);
  const [readingLinks, setReadingLinks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, startCreating] = useTransition();
  const prefill = useCoachTask(briefPrefill);
  const cancelled = useRef(false);
  const pending = useRef(new Map<string, Promise<void>>());
  const pages = useRef(new Map<string, Page>());
  const dismissed = useRef(new Set<string>());

  const updateLink = (url: string, patch: Partial<LinkState>) =>
    setLinks(current => current.map(link => (link.url === url ? { ...link, ...patch } : link)));

  const readLink = (url: string) => {
    if (pending.current.has(url) || pending.current.size >= maxLinks) return;
    setLinks(current => [
      ...current.filter(link => link.url !== url),
      { url, status: 'reading', title: linkLabel(url), error: null },
    ]);
    const task = fetch('/api/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(async response => {
        const body: unknown = await response.json().catch(() => null);
        if (dismissed.current.has(url)) return;
        const page = pageSchema.safeParse(body);
        if (response.ok && page.success) {
          pages.current.set(url, page.data);
          updateLink(url, { status: 'ready', title: page.data.title });
          return;
        }
        const failure = errorSchema.safeParse(body);
        updateLink(url, {
          status: 'failed',
          error: failure.success ? failure.data.error : 'Could not read that page.',
        });
      })
      .catch(() => updateLink(url, { status: 'failed', error: 'Could not reach the app. Check that it is running.' }));
    pending.current.set(url, task);
  };

  const addLinks = (urls: string[], explicit: boolean) => {
    for (const url of urls) {
      if (!explicit && dismissed.current.has(url)) continue;
      dismissed.current.delete(url);
      readLink(url);
    }
  };

  const removeLink = (url: string) => {
    dismissed.current.add(url);
    pending.current.delete(url);
    pages.current.delete(url);
    setLinks(current => current.filter(link => link.url !== url));
  };

  const addLinksRef = useRef(addLinks);
  addLinksRef.current = addLinks;

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return;
      const urls = findUrls(event.clipboardData?.getData('text') ?? '');
      if (urls.length === 0) return;
      event.preventDefault();
      addLinksRef.current(urls, true);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const submit = async () => {
    if (!text.trim() && !deck && links.length === 0) {
      setError('Say or write a few words about the talk, or add slides or a link.');
      return;
    }
    setError(null);
    cancelled.current = false;
    setReadingLinks(true);
    await Promise.all(pending.current.values());
    setReadingLinks(false);

    const references = [...pages.current.entries()]
      .filter(([url]) => !dismissed.current.has(url))
      .map(([, page]) => page);
    const now = new Date();
    const today = toDay(now);
    const coach = await prefill.run({
      text,
      deckText: deck ? deckTextForCoach(deck.slides) : '',
      references,
      today: todayForCoach(now, today),
      known: emptyKnown,
    });
    if (cancelled.current) return;

    const firstSlide = deck?.slides[0];
    const fallbackTitle = firstSlide ? slideTitle(firstSlide) : (references[0]?.title ?? '');
    startCreating(async () => {
      const result = await createTalk(
        buildTalkInput({ id: talkId, text, today, now, coach, deckTitle: fallbackTitle }),
      );
      setError(result.error);
    });
  };

  return (
    <AddTalkForm
      talkId={talkId}
      text={text}
      onTextChange={next => {
        setText(next);
        addLinks(findUrls(next), false);
      }}
      onDeck={setDeck}
      links={links}
      onAddLinks={urls => addLinks(urls, true)}
      onRemoveLink={removeLink}
      stage={prefill.state.status === 'running' ? 'drafting' : readingLinks ? 'links' : 'idle'}
      creating={creating}
      error={error}
      onSubmit={() => void submit()}
      onCancel={() => {
        cancelled.current = true;
        prefill.cancel();
      }}
    />
  );
}
