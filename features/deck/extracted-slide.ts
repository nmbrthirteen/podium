import { wordCount } from '@/lib/utils';

export type ExtractedSlide = { number: number; text: string; notes: string; wordCount: number };

export class DeckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeckError';
  }
}

export function toExtractedSlide(number: number, text: string, notes: string): ExtractedSlide {
  return { number, text, notes, wordCount: wordCount(text) };
}

export function slideTitle(slide: { number: number; text: string }) {
  const firstLine = slide.text.split('\n').find(line => line.trim());
  return firstLine?.trim().slice(0, 120) || `Slide ${slide.number}`;
}

export function deckTextForCoach(slides: { number: number; text: string; notes: string }[]) {
  return slides
    .map(slide => `Slide ${slide.number}: ${slide.text}${slide.notes ? `\nNotes: ${slide.notes}` : ''}`)
    .join('\n\n');
}
