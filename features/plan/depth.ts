import { daysBetween, talkDayOf, toDay } from '@/lib/dates';
import type { Depth, Stakes } from '@/lib/domain';

export type DepthInput = { now: Date; startsAt: string; stakes: Stakes; lengthMinutes: number };

export function suggestDepth({ now, startsAt, stakes, lengthMinutes }: DepthInput): Depth {
  const hoursAway = (new Date(startsAt).getTime() - now.getTime()) / 3_600_000;
  if (hoursAway <= 24 || (stakes === 'low' && lengthMinutes <= 10)) return 'quick';
  const daysAway = daysBetween(toDay(now), talkDayOf(startsAt));
  if (daysAway >= 7 || stakes === 'high') return 'deep';
  return 'standard';
}

export const depthLabels: Record<Depth, string> = {
  quick: 'Quick',
  standard: 'Standard',
  deep: 'Deep',
};
