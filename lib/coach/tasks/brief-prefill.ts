import { z } from 'zod';
import { stakesLevels, talkTypes } from '@/lib/domain';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { fieldGuides } from './draft-field';

const maxDeckCharacters = 60_000;
const maxReferenceCharacters = 12_000;

export const briefPrefill = defineTask({
  id: 'brief-prefill',
  inputSchema: z.object({
    text: z.string(),
    deckText: z.string(),
    references: z
      .array(z.object({ url: z.string(), title: z.string(), text: z.string() }))
      .max(5)
      .default([]),
    today: z.string(),
    known: z.object({
      title: z.string(),
      goal: z.string(),
      audience: z.string(),
      bigIdea: z.string(),
      openingLine: z.string(),
      closingLine: z.string(),
    }),
  }),
  schema: z.object({
    title: z.string(),
    type: z.enum(talkTypes),
    stakes: z.enum(stakesLevels),
    date: z.string(),
    time: z.string(),
    lengthMinutes: z.number().int(),
    goal: z.string(),
    audience: z.string(),
    bigIdea: z.string(),
    points: z.array(z.object({ text: z.string(), example: z.string() })).max(3),
    openingLine: z.string(),
    closingLine: z.string(),
  }),
  system: systemPrompt(
    'You help one speaker prepare one talk. From a few words about the talk, and their slides when they have a deck, you set up the talk and draft its brief. The speaker edits your drafts later.',
  ),
  buildPrompt: ({ text, deckText, references, today, known }) =>
    [
      'Set up this talk and draft its brief.',
      '',
      'Fields:',
      '- title: a short talk title in sentence case, with only the first word and names capitalized. Use the name the speaker or the deck gives.',
      '- type: the closest talk type.',
      '- stakes: high for boards, investors, interviews, or a talk the speaker calls important. low for casual check-ins. normal otherwise.',
      '- date: the talk day as YYYY-MM-DD, worked out from today. Empty string when the speaker names no day.',
      '- time: the start time as HH:MM on a 24 hour clock. Empty string when the speaker names no time.',
      '- lengthMinutes: the talk length in minutes. 0 when the speaker names no length.',
      `- goal: ${fieldGuides.goal}`,
      `- audience: ${fieldGuides.audience}`,
      `- bigIdea: ${fieldGuides.bigIdea} Count the words. One sentence only.`,
      '- points: up to 3 supporting points, each with one concrete example or number.',
      `- openingLine: ${fieldGuides.openingLine}`,
      `- closingLine: ${fieldGuides.closingLine}`,
      '',
      'Draft every text field, even when the speaker wrote little. Use what they wrote, the deck, and the reference pages.',
      'Take facts and numbers from the reference pages when they fit the talk. Ignore page menus and ads.',
      'Never invent numbers. When you lack one, name the kind of example the speaker should add.',
      'Write in the speaker voice, in the first person where it fits.',
      'Keep every known value exactly as written.',
      '',
      `Today: ${today}`,
      '',
      'What the speaker wrote:',
      text.trim() || '(nothing)',
      '',
      'Known values:',
      ...Object.entries(known).map(([key, value]) => `${key}: ${value.trim() || '(empty)'}`),
      '',
      'Deck text:',
      deckText.trim() ? deckText.slice(0, maxDeckCharacters) : '(no deck)',
      '',
      'Reference pages the speaker shared:',
      ...(references.length > 0
        ? references.map(
            reference =>
              `From "${reference.title}" (${reference.url}):\n${reference.text.slice(0, maxReferenceCharacters)}`,
          )
        : ['(none)']),
    ].join('\n'),
});
