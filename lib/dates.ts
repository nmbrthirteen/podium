const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toDay(date: Date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayToUtc(day: string) {
  const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
}

export function addDays(day: string, count: number) {
  const date = new Date(dayToUtc(day) + count * 86_400_000);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((dayToUtc(to) - dayToUtc(from)) / 86_400_000);
}

export function talkDayOf(startsAt: string) {
  return startsAt.slice(0, 10);
}

export function formatShortDate(day: string) {
  const date = new Date(dayToUtc(day));
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatDay(day: string, today: string) {
  const offset = daysBetween(today, day);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  if (offset > 1 && offset < 7) return weekdays[new Date(dayToUtc(day)).getUTCDay()] ?? day;
  return formatShortDate(day);
}

export function formatTime(startsAt: string) {
  const [hours = 0, minutes = 0] = startsAt.slice(11, 16).split(':').map(Number);
  const suffix = hours >= 12 ? 'pm' : 'am';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0 ? `${hour} ${suffix}` : `${hour}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

export function formatWhen(startsAt: string, today: string) {
  return `${formatDay(talkDayOf(startsAt), today)}, ${formatTime(startsAt)}`;
}
