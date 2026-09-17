import { addDays, daysBetween } from '@/lib/dates';
import type { Stakes, TalkType } from '@/lib/domain';
import { capitalize } from '@/lib/utils';

export type ParsedTalkText = {
  title: string;
  date: string | null;
  time: string | null;
  lengthMinutes: number | null;
  type: TalkType | null;
  stakes: Stakes | null;
};

const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthPattern = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';

const pad = (value: number) => value.toString().padStart(2, '0');

function clock(hours: number, minutes: number) {
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function parseLength(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\bhalf an hour\b/.test(lower)) return 30;
  const hours = lower.match(/\b(\d+(?:\.\d+)?)\s*-?\s*(?:hours?|hrs?|h)\b/);
  const minutes = lower.match(/\b(\d+)\s*-?\s*(?:minutes?|mins?|m)\b/);
  const hourCount = hours?.[1] ? Number(hours[1]) : /\b(?:an|one) hour\b/.test(lower) ? 1 : 0;
  const minuteCount = minutes?.[1] ? Number(minutes[1]) : 0;
  const total = Math.round(hourCount * 60 + minuteCount);
  return total >= 1 && total <= 600 ? total : null;
}

export function parseTime(text: string): string | null {
  const lower = text.toLowerCase();
  const meridiem = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (meridiem?.[1] && meridiem[3]) {
    const hour = Number(meridiem[1]) % 12;
    return clock(meridiem[3] === 'pm' ? hour + 12 : hour, Number(meridiem[2] ?? 0));
  }
  const twentyFour = lower.match(/\b(\d{1,2}):(\d{2})\b/);
  if (twentyFour?.[1] && twentyFour[2]) return clock(Number(twentyFour[1]), Number(twentyFour[2]));
  const bareHour = lower.match(/\bat\s+(\d{1,2})\b(?!\s*(?:minutes?|mins?|hours?|%|people))/);
  if (bareHour?.[1]) {
    const hour = Number(bareHour[1]);
    return clock(hour >= 1 && hour < 8 ? hour + 12 : hour, 0);
  }
  if (/\bnoon\b/.test(lower)) return '12:00';
  if (/\bmorning\b/.test(lower)) return '09:00';
  if (/\bafternoon\b/.test(lower)) return '14:00';
  if (/\b(evening|tonight)\b/.test(lower)) return '18:00';
  return null;
}

function weekdayOf(day: string) {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

function datedThisYear(today: string, month: number, date: number) {
  const year = Number(today.slice(0, 4));
  const candidate = `${year}-${pad(month + 1)}-${pad(date)}`;
  if (date < 1 || date > 31) return null;
  return daysBetween(today, candidate) < 0 ? `${year + 1}-${pad(month + 1)}-${pad(date)}` : candidate;
}

export function parseDate(text: string, today: string): string | null {
  const lower = text.toLowerCase();
  const iso = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];
  if (/\bday after tomorrow\b/.test(lower)) return addDays(today, 2);
  if (/\btomorrow\b/.test(lower)) return addDays(today, 1);
  if (/\b(today|tonight|this (morning|afternoon|evening))\b/.test(lower)) return today;

  const inDays = lower.match(/\bin (\d+) days?\b/);
  if (inDays?.[1]) return addDays(today, Number(inDays[1]));
  if (/\b(next week|in a week)\b/.test(lower)) return addDays(today, 7);

  const monthFirst = lower.match(new RegExp(`\\b(${monthPattern})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`));
  if (monthFirst?.[1] && monthFirst[2]) {
    return datedThisYear(today, monthNames.indexOf(monthFirst[1]), Number(monthFirst[2]));
  }
  const dayFirst = lower.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthPattern})[a-z]*\\b`));
  if (dayFirst?.[1] && dayFirst[2]) {
    return datedThisYear(today, monthNames.indexOf(dayFirst[2]), Number(dayFirst[1]));
  }

  const weekday = lower.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday|mon|tue|wed|thu|fri)\b/);
  if (weekday?.[1]) {
    const prefix = weekday[1];
    const target = weekdayNames.findIndex(name => name.startsWith(prefix));
    const ahead = (target - weekdayOf(today) + 7) % 7;
    return addDays(today, ahead === 0 ? 7 : ahead);
  }
  return null;
}

const typeKeywords: [TalkType, RegExp][] = [
  ['interview-panel', /\b(interview|panel)\b/],
  ['pitch', /\b(pitch|pitching|investors?|fundrais\w*|demo day)\b/],
  ['all-hands', /\b(all-hands|all hands|town hall|company meeting)\b/],
  ['webinar', /\b(webinar|livestream)\b/],
  ['workshop', /\b(workshop|training|hands-on)\b/],
  ['lecture', /\b(lecture|class|lesson|seminar|course)\b/],
  ['conference-talk', /\b(conference|meetup|summit|keynote|tech talk)\b/],
  ['exec-update', /\b(board|exec|execs|executive|executives|leadership|quarterly|qbr|ceo|cfo|cto)\b/],
  ['team-meeting', /\b(team|standup|stand-up|sprint|retro|sync)\b/],
];

function parseType(text: string): TalkType | null {
  const lower = text.toLowerCase();
  return typeKeywords.find(([, pattern]) => pattern.test(lower))?.[0] ?? null;
}

function parseStakes(text: string): Stakes | null {
  const lower = text.toLowerCase();
  if (/\b(board|investors?|interview|promotion|funding|keynote|important|high stakes)\b/.test(lower)) return 'high';
  if (/\b(casual|informal|quick sync|standup|stand-up|low stakes)\b/.test(lower)) return 'low';
  return null;
}

const leadIn =
  /^(?:i'?m|i am|we'?re|we are|i have|i've got|i need to)?\s*(?:giving|presenting|doing|running|pitching|hosting|delivering|leading)\s+(?:a |an |the |my |our )?/i;
const trailingWhen = new RegExp(
  `\\s+(?:(?:on|this|next)\\s+)?(?:today|tonight|tomorrow|next week|in \\d+ days?|in a week|at \\d|${weekdayNames.join('|')}|(?:${monthPattern})[a-z]*\\.?\\s+\\d).*$`,
  'i',
);

export function titleFromText(text: string) {
  const firstClause = text.trim().split(/[\n,;.!?]/)[0] ?? '';
  const cleaned = firstClause.replace(leadIn, '').replace(trailingWhen, '').trim();
  if (!cleaned) return '';
  const capped = cleaned.length > 80 ? cleaned.slice(0, 80).replace(/\s+\S*$/, '') : cleaned;
  return capitalize(capped);
}

export function parseTalkText(text: string, today: string): ParsedTalkText {
  return {
    title: titleFromText(text),
    date: parseDate(text, today),
    time: parseTime(text),
    lengthMinutes: parseLength(text),
    type: parseType(text),
    stakes: parseStakes(text),
  };
}
