import { z } from 'zod';
import type { DeckKind } from '@/lib/domain';

export const maxDeckBytes = 100 * 1024 * 1024;

export function deckKindOf(fileName: string): DeckKind | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pptx')) return 'pptx';
  if (lower.endsWith('.pdf')) return 'pdf';
  return null;
}

export const savedDeckSchema = z.object({
  deckId: z.string(),
  kind: z.enum(['pptx', 'pdf']),
  fileName: z.string(),
  slides: z.array(
    z.object({
      number: z.number(),
      text: z.string(),
      notes: z.string(),
      wordCount: z.number(),
      hasThumbnail: z.boolean(),
    }),
  ),
});

export type SavedDeck = z.infer<typeof savedDeckSchema>;
