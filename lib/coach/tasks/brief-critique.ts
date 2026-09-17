import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';

export const critiqueFields = ['goal', 'audience', 'bigIdea', 'points', 'openingLine', 'closingLine'] as const;

export const briefCritique = defineTask({
  id: 'brief-critique',
  inputSchema: z.object({ brief: briefContextSchema }),
  schema: z.object({
    issues: z.array(z.object({ field: z.enum(critiqueFields), problem: z.string(), action: z.string() })).max(3),
  }),
  system: systemPrompt(
    'You are a speaking coach. You critique a talk brief and the speaker rewrites it. You never rewrite the brief yourself.',
  ),
  buildPrompt: ({ brief }) =>
    [
      'Critique this talk brief. Return at most 3 issues, the ones that matter most. Return no issues when the brief is ready.',
      '',
      'Judge only what a rule in code cannot:',
      '- Does the big idea take a position someone could disagree with?',
      '- Does each point serve the big idea?',
      '- What will this audience resist, and does the brief answer it?',
      '- Does the goal name a decision or action?',
      '',
      'Skip word counts, the number of points, missing examples, greetings in the opening, and thank you closings. Code checks those.',
      '',
      'Each issue names one field, states the problem in one sentence, and gives one concrete action.',
      '',
      describeBrief(brief),
    ].join('\n'),
});
