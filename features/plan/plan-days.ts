import { daysBetween } from '@/lib/dates';

type DaySession = { id: string; day: string; completedRunId: string | null };

export type PlanDay<S extends DaySession> = {
  day: string;
  sessions: S[];
  done: number;
  total: number;
  isToday: boolean;
  isTalkDay: boolean;
  isPast: boolean;
};

export function planDays<S extends DaySession>(sessions: S[], today: string, talkDay: string): PlanDay<S>[] {
  const byDay = new Map<string, S[]>();
  for (const session of sessions) byDay.set(session.day, [...(byDay.get(session.day) ?? []), session]);
  if (!byDay.has(talkDay)) byDay.set(talkDay, []);

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({
      day,
      sessions: items,
      done: items.filter(item => item.completedRunId !== null).length,
      total: items.length,
      isToday: day === today,
      isTalkDay: day === talkDay,
      isPast: daysBetween(today, day) < 0,
    }));
}

export function initialDay(days: { day: string; done: number; total: number }[], today: string) {
  const due = days.find(day => day.day <= today && day.done < day.total);
  const upcoming = days.find(day => day.day >= today && day.done < day.total);
  return due?.day ?? upcoming?.day ?? days.find(day => day.day >= today)?.day ?? days.at(-1)?.day ?? today;
}
