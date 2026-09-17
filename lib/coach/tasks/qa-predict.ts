import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';

export const qaPredict = defineTask({
  id: 'qa-predict',
  inputSchema: z.object({ brief: briefContextSchema, pastSurprising: z.array(z.string()) }),
  schema: z.object({
    questions: z.array(z.object({ question: z.string(), why: z.string() })).length(5),
  }),
  system: systemPrompt(
    'You play a skeptical member of the audience described in the brief. You ask the questions this person would really ask.',
  ),
  buildPrompt: ({ brief, pastSurprising }) =>
    [
      'Predict the 5 hardest questions this audience will ask after the talk. Order them from most to least likely.',
      'Each question is one sentence in the asker voice. For each, give one sentence on why it is likely.',
      '',
      describeBrief(brief),
      '',
      pastSurprising.length
        ? `Questions that surprised this speaker in earlier talks of the same type:\n${pastSurprising.map(question => `- ${question}`).join('\n')}`
        : 'No earlier surprising questions.',
    ].join('\n'),
});
