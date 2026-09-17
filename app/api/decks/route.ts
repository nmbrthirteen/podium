import { z } from 'zod';
import { assertUsageAllowed, recordUsage, UsageLimitError } from '@/features/billing/usage';
import { DeckError } from '@/features/deck/extracted-slide';
import { canUploadDeckFor, saveDeck } from '@/features/deck/save-deck';
import { currentUserId } from '@/lib/auth/current-user';

export const maxDuration = 120;

const talkIdSchema = z.uuid();

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Sign in to upload a deck.' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: 'The upload did not arrive. Try again.' }, { status: 400 });

  const talkId = talkIdSchema.safeParse(form.get('talkId'));
  const file = form.get('file');
  if (!talkId.success || !(file instanceof File)) {
    return Response.json({ error: 'Choose a PPTX or PDF file to upload.' }, { status: 400 });
  }
  if (!(await canUploadDeckFor(talkId.data, userId))) {
    return Response.json({ error: 'This talk is not in your account. Open it from your talk list.' }, { status: 404 });
  }

  const thumbnails = new Map<number, File>();
  for (const [key, value] of form.entries()) {
    const match = key.match(/^thumb-(\d+)$/);
    if (match && value instanceof File) thumbnails.set(Number(match[1]), value);
  }

  try {
    await assertUsageAllowed(userId, 'deck-upload', 1);
    const saved = await saveDeck(talkId.data, userId, file, thumbnails);
    await recordUsage(userId, 'deck-upload', 1);
    return Response.json(saved);
  } catch (error) {
    if (error instanceof UsageLimitError) return Response.json({ error: error.message }, { status: 402 });
    if (error instanceof DeckError) return Response.json({ error: error.message }, { status: 422 });
    return Response.json(
      { error: 'The deck could not be read. Export it again as PDF, then upload it.' },
      { status: 500 },
    );
  }
}
