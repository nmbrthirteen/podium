import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';

const maxSlideCharacters = 1_500;

export const cardsGenerate = defineTask({
  id: 'cards-generate',
  inputSchema: z.object({
    brief: briefContextSchema,
    sections: z.array(z.object({ id: z.string(), title: z.string(), minutes: z.number(), holdsVerbatim: z.boolean() })),
    slides: z.array(z.object({ number: z.number(), text: z.string(), notes: z.string() })),
  }),
  schema: z.object({
    sections: z.array(
      z.object({
        id: z.string(),
        keywords: z.array(z.string()).max(7),
        verbatim: z.string(),
        slideNumbers: z.array(z.number()),
      }),
    ),
  }),
  system: systemPrompt(
    'You are a speaking coach. You turn a talk into cue cards the speaker glances at while speaking from memory.',
  ),
  buildPrompt: ({ brief, sections, slides }) =>
    [
      'Write one cue card per section.',
      '- keywords: at most 7 short cues of 1 to 4 words each, in speaking order. Never full sentences.',
      '- verbatim: for sections marked verbatim, the exact words to say. Use the brief opening or closing line when present. Every other section gets an empty string.',
      '- slideNumbers: the slides this section covers, in order. Each slide belongs to at most one section. Use an empty list when there are no slides.',
      'Return every section id exactly once, in the same order.',
      '',
      describeBrief(brief),
      '',
      'Sections:',
      ...sections.map(
        section =>
          `- id ${section.id}: ${section.title}, ${section.minutes} minutes${section.holdsVerbatim ? ', verbatim' : ''}`,
      ),
      '',
      slides.length ? 'Slides:' : 'No slides.',
      ...slides.map(
        slide =>
          `Slide ${slide.number}: ${slide.text.slice(0, maxSlideCharacters)}${slide.notes ? `\nNotes: ${slide.notes.slice(0, maxSlideCharacters)}` : ''}`,
      ),
    ].join('\n'),
});
