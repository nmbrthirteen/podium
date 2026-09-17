'use client';

import { useState } from 'react';
import { CloseIcon, LinkIcon } from '@/components/ui/icons';
import { PixelLoader } from '@/components/ui/pixel-loader';
import { cn } from '@/lib/utils';
import { findUrls } from '../link-urls';

export type LinkState = {
  url: string;
  status: 'reading' | 'ready' | 'failed';
  title: string;
  error: string | null;
};

export function LinkChips({ links, onRemove }: { links: LinkState[]; onRemove: (url: string) => void }) {
  const failed = links.filter(link => link.status === 'failed');

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label="Reference links" className="flex flex-wrap gap-2">
        {links.map(link => (
          <li
            key={link.url}
            title={link.url}
            className={cn(
              'flex min-h-10 max-w-full items-center gap-2 rounded-full pr-1 pl-3.5 text-sm font-medium',
              link.status === 'failed' ? 'bg-danger-soft text-danger' : 'bg-inset text-ink',
            )}
          >
            {link.status === 'reading' ? (
              <PixelLoader />
            ) : (
              <LinkIcon size={16} className={link.status === 'ready' ? 'text-accent' : undefined} />
            )}
            <span className="max-w-64 truncate">{link.title}</span>
            {link.status === 'reading' && <span className="sr-only">Reading</span>}
            <button
              type="button"
              aria-label={`Remove ${link.title}`}
              onClick={() => onRemove(link.url)}
              className="press flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-line hover:text-ink"
            >
              <CloseIcon size={14} />
            </button>
          </li>
        ))}
      </ul>
      {failed.map(link => (
        <p key={link.url} role="alert" className="text-sm text-danger">
          {link.title}: {link.error}
        </p>
      ))}
    </div>
  );
}

export function AddLinkButton({ disabled, onAdd }: { disabled: boolean; onAdd: (urls: string[]) => void }) {
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState('');

  const addTyped = () => {
    const trimmed = value.trim();
    setValue('');
    setTyping(false);
    if (!trimmed) return;
    const urls = findUrls(/^(https?:\/\/|www\.)/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (urls.length > 0) onAdd(urls);
  };

  if (typing) {
    return (
      <input
        aria-label="Paste a link"
        value={value}
        placeholder="Paste a link"
        className="min-h-10 w-64 rounded-full bg-inset px-4 text-base text-ink placeholder:text-muted focus:bg-surface focus:shadow-control sm:text-sm"
        onChange={event => setValue(event.target.value)}
        onBlur={addTyped}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTyped();
          } else if (event.key === 'Escape') {
            setValue('');
            setTyping(false);
          }
        }}
        ref={element => element?.focus()}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const clipboard = navigator.clipboard;
        if (!clipboard?.readText) {
          setTyping(true);
          return;
        }
        clipboard.readText().then(
          text => {
            const urls = findUrls(text);
            if (urls.length > 0) onAdd(urls);
            else setTyping(true);
          },
          () => setTyping(true),
        );
      }}
      className="press inline-flex min-h-10 items-center gap-2 rounded-full bg-inset px-4 text-sm font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
    >
      <LinkIcon size={16} className="text-muted" />
      Add link
    </button>
  );
}
