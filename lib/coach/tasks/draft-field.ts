import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';

const draftableFields = ['goal', 'audience', 'bigIdea', 'openingLine', 'closingLine', 'recoveryLine'] as const;
export type DraftableField = (typeof draftableFields)[number];

export const fieldGuides: Record<DraftableField, string> = {
  goal: 'One sentence naming what the audience should decide or do when the talk ends.',
  audience: 'One or two sentences: who is in the room and what they believe now.',
  bigIdea: 'One position the talk argues, 15 words or fewer.',
  openingLine:
    'The first one or two sentences the speaker says. Start with a fact, a question, or a short story. Never thank, greet, introduce the speaker, or list an agenda.',
  closingLine:
    'The last one or two sentences the speaker says. End on the big idea or the ask. Never end with thank you or questions.',
  recoveryLine:
    'One short sentence the speaker can say when they blank, which buys a moment and returns to the big idea.',
};

export const draftField = defineTask({
  id: 'draft-field',
  inputSchema: z.object({ brief: briefContextSchema, field: z.enum(draftableFields) }),
  schema: z.object({ text: z.string() }),
  system: systemPrompt('You are a speaking coach. The speaker asked you to draft one field of their talk brief.'),
  buildPrompt: ({ brief, field }) =>
    [
      `Draft the ${field} field.`,
      `Guide: ${fieldGuides[field]}`,
      'Write in the speaker voice, in the first person where it fits. Use facts from the brief only.',
      '',
      describeBrief(brief),
    ].join('\n'),
});
