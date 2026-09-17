import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';

export const slideContentSchema = z.object({
  title: z.string(),
  points: z.array(z.string()).max(3),
  visual: z.string(),
  script: z.string(),
});

export const slideFieldGuides = [
  '- title: the one idea of the slide as a claim the audience can repeat, 8 words or fewer.',
  '- points: up to 3 short cues, 5 words or fewer each. Use an empty list when the visual carries the slide.',
  '- visual: one concrete picture, chart, or diagram to show, in one sentence. Name the data when a chart fits.',
  '- script: the exact words the speaker says aloud while this slide is up, in one or two sentences. Write it as speech to the audience. Put missing data in the cues as "Add ..." and keep the script speakable around it.',
];

export const slideCoachRole =
  'You are a speaking coach who designs simple slides. Slides support the speaker and hold very few words.';

export const slidesDraft = defineTask({
  id: 'slides-draft',
  inputSchema: z.object({
    brief: briefContextSchema,
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        minutes: z.number(),
        keywords: z.array(z.string()),
        verbatim: z.string(),
      }),
    ),
  }),
  schema: z.object({ slides: z.array(slideContentSchema.extend({ sectionId: z.string() })).max(40) }),
  system: systemPrompt(slideCoachRole),
  buildPrompt: ({ brief, sections }) =>
    [
      'Draft a slide deck for this talk.',
      '- Give each section one slide for every 1 to 2 minutes, and at least one slide.',
      '- sectionId: the id of the section the slide belongs to. Keep the sections in order.',
      ...slideFieldGuides,
      'The first slide sets up the opening. The last slide lands the ask.',
      'Build the deck from the brief and the cue card cues. Never invent numbers; name the data the speaker should add.',
      '',
      describeBrief(brief),
      '',
      'Sections:',
      ...sections.map(
        section =>
          `- id ${section.id}: ${section.title}, ${section.minutes} minutes. Cues: ${section.keywords.join(', ') || '(none)'}${section.verbatim ? `. Exact words: ${section.verbatim}` : ''}`,
      ),
    ].join('\n'),
});
