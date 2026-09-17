import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';

export const qaFeedback = defineTask({
  id: 'qa-feedback',
  inputSchema: z.object({
    audience: z.string(),
    question: z.string(),
    answer: z.string(),
  }),
  schema: z.object({
    hasAnswer: z.boolean(),
    hasExample: z.boolean(),
    hasRelevance: z.boolean(),
    action: z.string(),
  }),
  system: systemPrompt(
    'You are a speaking coach. You check a short answer to an audience question against a three part format: answer, example, why it matters to the asker.',
  ),
  buildPrompt: ({ audience, question, answer }) =>
    [
      'Check the typed answer.',
      '- hasAnswer: true when it answers the question directly in the first sentence.',
      '- hasExample: true when it gives one concrete example or number.',
      '- hasRelevance: true when it says why the answer matters to this asker.',
      '- action: one improvement the speaker can make next time, in one sentence.',
      '',
      `Audience: ${audience || '(not described)'}`,
      `Question: ${question}`,
      `Answer: ${answer || '(empty)'}`,
    ].join('\n'),
});
