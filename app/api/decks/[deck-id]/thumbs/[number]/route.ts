import { readFile } from 'node:fs/promises';
import { and, eq } from 'drizzle-orm';
import { currentUserId } from '@/lib/auth/current-user';
import { database } from '@/lib/db/client';
import { decks, slides } from '@/lib/db/schema';
import { dataPath } from '@/lib/paths';

export async function GET(_request: Request, context: { params: Promise<{ 'deck-id': string; number: string }> }) {
  const userId = await currentUserId();
  if (!userId) return new Response('Sign in to see slide thumbnails.', { status: 401 });

  const { 'deck-id': deckId, number } = await context.params;
  const slideNumber = Number.parseInt(number, 10);
  if (!Number.isInteger(slideNumber)) return new Response('Not found', { status: 404 });

  const db = await database();
  const deck = await db.query.decks.findFirst({ where: and(eq(decks.id, deckId), eq(decks.userId, userId)) });
  if (!deck) return new Response('Not found', { status: 404 });

  const slide = await db.query.slides.findFirst({
    where: and(eq(slides.deckId, deckId), eq(slides.number, slideNumber)),
  });
  if (!slide?.thumbnailPath) return new Response('Not found', { status: 404 });

  const image = await readFile(dataPath(slide.thumbnailPath)).catch(() => null);
  if (!image) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(image), {
    headers: { 'content-type': 'image/png', 'cache-control': 'private, max-age=3600' },
  });
}
