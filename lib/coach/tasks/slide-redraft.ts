import { z } from 'zod';
import { systemPrompt } from '../style-rules';
import { defineTask } from '../task';
import { briefContextSchema, describeBrief } from './brief-context';
import { slideCoachRole, slideContentSchema, slideFieldGuides } from './slides-draft';

export const slideTweaks = ['more-visual', 'fewer-words', 'stronger-title', 'new-idea'] as const;
export type SlideTweak = (typeof slideTweaks)[number];

const tweakGuides: Record<SlideTweak, string> = {
  'more-visual': 'Make the slide more visual. Move the words into the picture and keep at most one cue.',
  'fewer-words': 'Cut words. Keep the title to 6 words or fewer and at most two cues of 4 words or fewer.',
  'stronger-title': 'Rewrite the title as a sharper claim the audience can repeat. Keep the rest close.',
  'new-idea': 'Show the same point in a different way, with a new visual and new cues.',
};

export const slideRedraft = defineTask({
  id: 'slide-redraft',
  inputSchema: z.object({
    brief: briefContextSchema,
    sectionTitle: z.string(),
    slide: slideContentSchema.extend({ points: z.array(z.string()) }),
    before: z.string(),
    after: z.string(),
    tweak: z.enum(slideTweaks),
  }),
  schema: slideContentSchema,
  system: systemPrompt(slideCoachRole),
  buildPrompt: ({ brief, sectionTitle, slide, before, after, tweak }) =>
    [
      `Redraft one slide in the section "${sectionTitle}".`,
      `Change: ${tweakGuides[tweak]}`,
      ...slideFieldGuides,
      '',
      'Current slide:',
      `Title: ${slide.title || '(empty)'}`,
      `Cues: ${slide.points.join(', ') || '(none)'}`,
      `Visual: ${slide.visual || '(empty)'}`,
      `Script: ${slide.script || '(empty)'}`,
      `Slide before: ${before || '(none)'}`,
      `Slide after: ${after || '(none)'}`,
      '',
      describeBrief(brief),
    ].join('\n'),
});
