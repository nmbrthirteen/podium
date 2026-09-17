import 'server-only';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { eq, inArray } from 'drizzle-orm';
import { database } from '@/lib/db/client';
import { decks, slides, talks } from '@/lib/db/schema';
import { dataPath } from '@/lib/paths';
import { newId } from '@/lib/utils';
import { deckKindOf, maxDeckBytes, type SavedDeck } from './deck-limits';
import { extractPdf } from './extract-pdf';
import { extractPptx } from './extract-pptx';
import { DeckError } from './extracted-slide';

export async function canUploadDeckFor(talkId: string, userId: string) {
  const db = await database();
  const talk = await db.query.talks.findFirst({ where: eq(talks.id, talkId) });
  if (talk) return talk.userId === userId;
  const existing = await db.select({ userId: decks.userId }).from(decks).where(eq(decks.talkId, talkId));
  return existing.every(deck => deck.userId === userId);
}

export async function saveDeck(
  talkId: string,
  userId: string,
  file: File,
  thumbnails: Map<number, File>,
): Promise<SavedDeck> {
  const kind = deckKindOf(file.name);
  if (!kind) throw new DeckError('Upload a PPTX or PDF. Keynote and Google Slides decks need to be exported first.');
  if (file.size > maxDeckBytes) throw new DeckError('This deck is over 100 MB. Export a smaller copy, then upload it.');

  const data = new Uint8Array(await file.arrayBuffer());
  const extracted = kind === 'pptx' ? await extractPptx(data) : await extractPdf(data.slice());

  const deckDir = dataPath('decks', talkId);
  await rm(deckDir, { recursive: true, force: true });
  await mkdir(path.join(deckDir, 'thumbs'), { recursive: true });
  const storedName = `deck.${kind}`;
  await writeFile(path.join(deckDir, storedName), data);

  const thumbnailPaths = new Map<number, string>();
  if (kind === 'pdf') {
    for (const slide of extracted) {
      const thumbnail = thumbnails.get(slide.number);
      if (thumbnail?.type !== 'image/png') continue;
      const relative = path.posix.join('decks', talkId, 'thumbs', `${slide.number}.png`);
      await writeFile(dataPath(relative), new Uint8Array(await thumbnail.arrayBuffer()));
      thumbnailPaths.set(slide.number, relative);
    }
  }

  const db = await database();
  const deckId = newId();
  await db.transaction(async tx => {
    const previous = await tx.select({ id: decks.id }).from(decks).where(eq(decks.talkId, talkId));
    if (previous.length > 0) {
      const previousIds = previous.map(deck => deck.id);
      await tx.delete(slides).where(inArray(slides.deckId, previousIds));
      await tx.delete(decks).where(inArray(decks.id, previousIds));
    }
    await tx.insert(decks).values({
      id: deckId,
      talkId,
      userId,
      fileName: path.basename(file.name),
      kind,
      slideCount: extracted.length,
      path: path.posix.join('decks', talkId, storedName),
      uploadedAt: new Date().toISOString(),
    });
    await tx.insert(slides).values(
      extracted.map(slide => ({
        id: newId(),
        deckId,
        number: slide.number,
        text: slide.text,
        notes: slide.notes,
        wordCount: slide.wordCount,
        thumbnailPath: thumbnailPaths.get(slide.number) ?? null,
      })),
    );
  });

  return {
    deckId,
    kind,
    fileName: path.basename(file.name),
    slides: extracted.map(slide => ({ ...slide, hasThumbnail: thumbnailPaths.has(slide.number) })),
  };
}
