import type { TalkType } from '@/lib/domain';

export type TemplateSection = { title: string; minutes: number };

export const talkTypeLabels: Record<TalkType, string> = {
  'exec-update': 'Exec update',
  'team-meeting': 'Team meeting',
  pitch: 'Pitch',
  'conference-talk': 'Conference talk',
  lecture: 'Lecture or class',
  workshop: 'Workshop',
  webinar: 'Webinar',
  'all-hands': 'All-hands',
  'interview-panel': 'Interview or panel',
};

export const talkTemplates: Record<TalkType, TemplateSection[]> = {
  'exec-update': [
    { title: 'Answer first', minutes: 1 },
    { title: 'Situation and change', minutes: 1 },
    { title: 'Reasons', minutes: 6 },
    { title: 'Ask and close', minutes: 2 },
  ],
  'team-meeting': [
    { title: 'Decision needed', minutes: 1 },
    { title: 'Reason', minutes: 2 },
    { title: 'Deadline and owner', minutes: 1 },
  ],
  pitch: [
    { title: 'Attention', minutes: 1 },
    { title: 'Need', minutes: 2 },
    { title: 'Solution', minutes: 3 },
    { title: 'Picture of the future', minutes: 2 },
    { title: 'Ask', minutes: 2 },
  ],
  'conference-talk': [
    { title: 'Promise', minutes: 1 },
    { title: 'Idea part 1', minutes: 2.5 },
    { title: 'Idea part 2', minutes: 2.5 },
    { title: 'What it is not', minutes: 1 },
    { title: 'Idea part 3', minutes: 2 },
    { title: 'Contributions close', minutes: 1 },
  ],
  lecture: [
    { title: 'Promise', minutes: 1 },
    { title: 'Part 1, with example and check question', minutes: 2.5 },
    { title: 'Part 2', minutes: 2.5 },
    { title: 'Part 3', minutes: 2.5 },
    { title: 'Recap', minutes: 1.5 },
  ],
  workshop: [
    { title: 'Outcome', minutes: 1 },
    { title: 'Demo', minutes: 3 },
    { title: 'Guided practice', minutes: 4 },
    { title: 'Recap', minutes: 2 },
  ],
  webinar: [
    { title: 'Promise', minutes: 1 },
    { title: 'Three parts', minutes: 7 },
    { title: 'Recap and ask', minutes: 2 },
  ],
  'all-hands': [
    { title: 'Headline', minutes: 1 },
    { title: 'Three updates', minutes: 6 },
    { title: 'What we need', minutes: 2 },
    { title: 'Close', minutes: 1 },
  ],
  'interview-panel': [],
};

const step = 0.5;

function roundToStep(value: number) {
  return Math.round(value / step) * step;
}

function exactSplit(template: TemplateSection[], lengthMinutes: number) {
  const baseTotal = template.reduce((sum, section) => sum + section.minutes, 0);
  const scaled = template.map(section => ({
    title: section.title,
    minutes: Math.round(((section.minutes * lengthMinutes) / baseTotal) * 100) / 100,
  }));
  const drift = lengthMinutes - scaled.reduce((sum, section) => sum + section.minutes, 0);
  const last = scaled.at(-1);
  if (last) last.minutes = Math.round((last.minutes + drift) * 100) / 100;
  return scaled;
}

export function scaleTemplate(type: TalkType, lengthMinutes: number): TemplateSection[] {
  const template = talkTemplates[type];
  if (template.length === 0) return [];
  if (lengthMinutes < template.length * step) return exactSplit(template, lengthMinutes);

  const baseTotal = template.reduce((sum, section) => sum + section.minutes, 0);
  const scaled = template.map(section => ({
    title: section.title,
    minutes: Math.max(step, roundToStep((section.minutes * lengthMinutes) / baseTotal)),
  }));

  let drift = roundToStep(lengthMinutes - scaled.reduce((sum, section) => sum + section.minutes, 0));
  const byLength = [...scaled].sort((a, b) => b.minutes - a.minutes);
  let index = 0;
  let guard = 0;
  while (Math.abs(drift) >= step && guard < 1000) {
    const target = byLength[index % byLength.length];
    if (target && (drift > 0 || target.minutes > step)) {
      target.minutes += drift > 0 ? step : -step;
      drift += drift > 0 ? -step : step;
    }
    index += 1;
    guard += 1;
  }

  const total = scaled.reduce((sum, section) => sum + section.minutes, 0);
  return Math.abs(total - lengthMinutes) < 0.001 ? scaled : exactSplit(template, lengthMinutes);
}
