'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';

type KeywordsEditorProps = { cardTitle: string; keywords: string[]; onChange: (keywords: string[]) => void };

export function KeywordsEditor({ cardTitle, keywords, onChange }: KeywordsEditorProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const keyword = draft.trim();
    setDraft('');
    if (!keyword || keywords.some(existing => existing.toLowerCase() === keyword.toLowerCase())) return;
    onChange([...keywords, keyword]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <ul className="flex flex-wrap items-center gap-2" aria-label={`Keywords on ${cardTitle}`}>
        {keywords.map(keyword => (
          <li key={keyword} className="flex items-center rounded-full bg-inset pl-3.5">
            <span>{keyword}</span>
            <button
              type="button"
              aria-label={`Remove ${keyword}`}
              className="press flex size-9 items-center justify-center text-muted hover:text-ink"
              onClick={() => onChange(keywords.filter(existing => existing !== keyword))}
            >
              <CloseIcon size={16} />
            </button>
          </li>
        ))}
        <li className="min-w-40 flex-1">
          <input
            aria-label={`Add a keyword to ${cardTitle}`}
            value={draft}
            placeholder={keywords.length > 0 ? 'Add a keyword' : 'Tap to add keywords'}
            className="min-h-9 w-full rounded-full bg-transparent px-3 text-base text-ink placeholder:text-muted hover:bg-inset focus:bg-surface focus:shadow-control"
            onChange={event => setDraft(event.target.value)}
            onBlur={add}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                add();
              }
            }}
          />
        </li>
      </ul>
      {keywords.length > 7 && (
        <p className="text-sm font-medium text-danger">This card has {keywords.length} keywords. Keep 7 or fewer.</p>
      )}
    </div>
  );
}
