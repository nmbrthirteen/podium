'use client';

import { useEffect, useRef, useState } from 'react';
import { deckTextForCoach } from '@/features/deck/extracted-slide';
import type { TalkBundle } from '@/features/talks/queries';
import { todayForCoach } from '@/features/talks/talk-from-text';
import { useCoachTask } from '@/hooks/use-coach-task';
import { briefPrefill } from '@/lib/coach/tasks/brief-prefill';
import { toDay } from '@/lib/dates';
import type { Brief, Point } from '@/lib/db/schema';
import { applyBriefDraft } from './actions';

type DraftedBrief = { version: number; brief: Brief; points: Point[] };

export function useAutoBrief({ talk, brief, points, slides }: TalkBundle) {
  const coach = useCoachTask(briefPrefill);
  const [drafted, setDrafted] = useState<DraftedBrief | null>(null);
  const attempted = useRef(false);
  const missing =
    drafted === null && [brief.goal, brief.bigIdea, brief.openingLine, brief.closingLine].some(value => !value.trim());

  const draft = async () => {
    const now = new Date();
    const output = await coach.run({
      text: talk.title,
      deckText: deckTextForCoach(slides),
      today: todayForCoach(now, toDay(now)),
      known: {
        title: talk.title,
        goal: brief.goal,
        audience: brief.audience,
        bigIdea: brief.bigIdea,
        openingLine: brief.openingLine,
        closingLine: brief.closingLine,
      },
    });
    if (!output) return;
    const saved = await applyBriefDraft(talk.id, { ...output, points: points.length > 0 ? [] : output.points });
    if (saved.brief) setDrafted({ version: 1, brief: saved.brief, points: saved.points });
  };

  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!missing || attempted.current) return;
    attempted.current = true;
    void draftRef.current();
    return () => {
      attempted.current = false;
    };
  }, [missing]);

  return {
    brief: drafted?.brief ?? brief,
    points: drafted?.points ?? points,
    version: drafted?.version ?? 0,
    running: coach.state.status === 'running',
    failed: coach.state.status === 'error',
    cancel: coach.cancel,
  };
}
