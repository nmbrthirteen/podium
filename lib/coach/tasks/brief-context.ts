import { z } from 'zod';
import { talkTypes } from '@/lib/domain';

export const briefContextSchema = z.object({
  title: z.string(),
  type: z.enum(talkTypes),
  goal: z.string(),
  audience: z.string(),
  bigIdea: z.string(),
  points: z.array(z.object({ text: z.string(), example: z.string() })),
  openingLine: z.string(),
  closingLine: z.string(),
  lengthMinutes: z.number(),
});

export type BriefContext = z.infer<typeof briefContextSchema>;

const orEmpty = (value: string) => value.trim() || '(empty)';

export function describeBrief(brief: BriefContext) {
  const points = brief.points.length
    ? brief.points.map((point, index) => `  ${index + 1}. ${orEmpty(point.text)} Example: ${orEmpty(point.example)}`)
    : ['  (none yet)'];
  return [
    `Title: ${orEmpty(brief.title)}`,
    `Talk type: ${brief.type}`,
    `Length: ${brief.lengthMinutes} minutes`,
    `Goal, what the audience should decide or do: ${orEmpty(brief.goal)}`,
    `Audience, who is in the room and what they believe now: ${orEmpty(brief.audience)}`,
    `Big idea: ${orEmpty(brief.bigIdea)}`,
    'Points:',
    ...points,
    `Opening line: ${orEmpty(brief.openingLine)}`,
    `Closing line: ${orEmpty(brief.closingLine)}`,
  ].join('\n');
}
