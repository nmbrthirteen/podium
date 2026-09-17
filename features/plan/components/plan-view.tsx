'use client';

import { useState, useTransition } from 'react';
import { Disclosure } from '@/components/ui/disclosure';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { saveTalkDetails } from '@/features/brief/actions';
import { talkDayOf } from '@/lib/dates';
import type { PlanSession, Section, Talk } from '@/lib/db/schema';
import { type Depth, depths } from '@/lib/domain';
import { depthLabels } from '../depth';
import { PlanPath } from './plan-path';

const depthOptions = depths.map(value => ({ value, label: depthLabels[value] }));

type PlanViewProps = { talk: Talk; sessions: PlanSession[]; sections: Section[]; today: string };

export function PlanView({ talk, sessions, sections, today }: PlanViewProps) {
  const [depth, setDepth] = useState<Depth>(talk.depth);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-10">
      <PlanPath
        talkId={talk.id}
        talkDay={talkDayOf(talk.startsAt)}
        sessions={sessions}
        sections={sections}
        today={today}
      />

      <Disclosure summary={`Prep depth: ${depthLabels[depth]}`} className="border-b">
        <SegmentedControl
          label="Prep depth"
          value={depth}
          options={depthOptions}
          onValueChange={next => {
            setDepth(next);
            startTransition(async () => {
              await saveTalkDetails(talk.id, { depth: next });
            });
          }}
          className={pending ? 'opacity-70' : undefined}
        />
      </Disclosure>
    </div>
  );
}
