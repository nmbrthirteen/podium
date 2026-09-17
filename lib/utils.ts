import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId() {
  return crypto.randomUUID();
}

export function formatClock(totalSeconds: number) {
  const sign = totalSeconds < 0 ? '-' : '';
  const seconds = Math.abs(Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${sign}${minutes}:${rest.toString().padStart(2, '0')}`;
}

export function formatMinutes(minutes: number) {
  const rounded = Math.round(minutes * 10) / 10;
  return `${rounded} ${rounded === 1 ? 'minute' : 'minutes'}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
