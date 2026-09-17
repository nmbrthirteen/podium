import { z } from 'zod';
import { sessionKinds } from '@/lib/domain';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';

const practiceKinds = sessionKinds.filter(kind => kind !== 'talk-day-checklist');

export const nextFocus = defineTask({
  id: 'next-focus',
  inputSchema: z.object({
    debriefs: z.array(
      z.object({
        kind: z.enum(sessionKinds),
        excelled: z.string(),
        workOn: z.string(),
        challenge: z.string(),
        peeks: z.number(),
        overrunSeconds: z.number(),
      }),
    ),
    fullRuns: z.number(),
    totalRuns: z.number(),
    fixedFocuses: z.array(z.string()),
  }),
  schema: z.object({
    focus: z.string(),
    reason: z.string(),
    kind: z.enum(practiceKinds),
  }),
  system: systemPrompt(
    'You are a speaking coach. You read the speaker notes from recent rehearsal runs and pick the one thing to focus on next.',
  ),
  buildPrompt: ({ debriefs, fullRuns, totalRuns, fixedFocuses }) =>
    [
      'Pick one focus for the next run.',
      '- focus: a short phrase naming what to practice, 8 words or fewer.',
      '- reason: one sentence that points to what the notes or counts show.',
      '- kind: the session kind that best practices this focus.',
      'Build on the notes. Never repeat a focus the speaker already marked fixed.',
      '',
      `Runs so far: ${totalRuns}, of which ${fullRuns} full runs.`,
      fixedFocuses.length
        ? `Marked fixed:\n${fixedFocuses.map(focus => `- ${focus}`).join('\n')}`
        : 'Marked fixed: none.',
      '',
      'Recent runs, newest last:',
      ...debriefs.map(
        (debrief, index) =>
          `${index + 1}. ${debrief.kind}, ${debrief.peeks} peeks, ${Math.round(debrief.overrunSeconds)} seconds over. Excelled at: ${debrief.excelled || '(empty)'}. Work on: ${debrief.workOn || '(empty)'}. Challenge: ${debrief.challenge || '(empty)'}.`,
      ),
    ].join('\n'),
});
