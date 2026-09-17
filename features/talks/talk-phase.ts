import { pluralize } from '@/lib/utils';

export type TalkPhase = 'before' | 'talk-day' | 'after';

function localStart(startsAt: string) {
  const [year = 0, month = 1, day = 1] = startsAt.slice(0, 10).split('-').map(Number);
  const [hours = 0, minutes = 0] = startsAt.slice(11, 16).split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function talkPhase(startsAt: string, lengthMinutes: number, now: Date): TalkPhase {
  const start = localStart(startsAt);
  const end = start.getTime() + lengthMinutes * 60_000;
  if (now.getTime() >= end) return 'after';
  return sameDay(start, now) ? 'talk-day' : 'before';
}

export function countdownText(startsAt: string, now: Date) {
  const minutes = Math.round((localStart(startsAt).getTime() - now.getTime()) / 60_000);
  if (minutes <= 0) return 'Starting now';
  if (minutes < 60) return `In ${pluralize(minutes, 'minute')}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `In ${pluralize(hours, 'hour')}`;
  return `In ${pluralize(Math.round(hours / 24), 'day')}`;
}

export function daysAwayText(daysAway: number) {
  if (daysAway < 0) return 'Talk given';
  if (daysAway === 0) return 'Talk today';
  return `${pluralize(daysAway, 'day')} to go`;
}

export function daysAwayShort(daysAway: number) {
  if (daysAway < 0) return 'Past';
  if (daysAway === 0) return 'Today';
  return `${daysAway}d`;
}
