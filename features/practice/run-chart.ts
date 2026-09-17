import type { SectionTiming } from '@/lib/domain';

export type SectionBar = {
  id: string;
  title: string;
  seconds: number;
  budgetSeconds: number;
  peeks: number;
  ratio: number;
  over: boolean;
};

export function sectionBars(timings: SectionTiming[], sections: { id: string; title: string }[]): SectionBar[] {
  return sections.flatMap(section => {
    const timing = timings.find(item => item.sectionId === section.id);
    if (!timing) return [];
    return [
      {
        id: section.id,
        title: section.title,
        seconds: timing.seconds,
        budgetSeconds: timing.budgetSeconds,
        peeks: timing.peeks,
        ratio: timing.budgetSeconds > 0 ? timing.seconds / timing.budgetSeconds : 0,
        over: timing.seconds - timing.budgetSeconds >= 1,
      },
    ];
  });
}

export function barScale(bars: SectionBar[]) {
  return Math.max(1.25, ...bars.map(bar => bar.ratio));
}
