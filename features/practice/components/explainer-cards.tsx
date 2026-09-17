'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';

function EvidenceTag({ kind }: { kind: 'research' | 'practitioner' }) {
  return (
    <Tag title={kind === 'research' ? 'Backed by published studies' : 'Advice from experienced speakers'}>
      {kind === 'research' ? 'Research' : 'Practitioner'}
    </Tag>
  );
}

const explainers = [
  {
    title: 'People notice your nerves less than you think.',
    body: 'Listeners pick up about half the nervousness that speakers believe they show.',
  },
  {
    title: 'Nervous energy can help you perform.',
    body: 'A racing heart is your body getting ready. Reading it as fuel gave a small lift in studies.',
  },
];

export function ExplainerCards({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const card = explainers[index];

  useEffect(() => {
    primaryRef.current?.focus();
  }, [index]);

  if (!card) return null;
  const last = index === explainers.length - 1;
  const advance = () => {
    if (last) onDone();
    else setIndex(index + 1);
  };

  return (
    <section
      key={card.title}
      aria-labelledby="explainer-title"
      className="enter-stagger flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted tabular-nums">
          {index + 1} of {explainers.length}
        </p>
        <EvidenceTag kind="research" />
      </div>
      <h2 id="explainer-title" className="font-display text-2xl font-semibold">
        {card.title}
      </h2>
      <p className="text-lg">{card.body}</p>
      <div className="flex flex-wrap gap-2">
        <Button ref={primaryRef} variant="primary" onClick={advance}>
          {last ? 'Got it' : 'Next'}
        </Button>
        <Button variant="quiet" onClick={advance}>
          Skip
        </Button>
      </div>
    </section>
  );
}
