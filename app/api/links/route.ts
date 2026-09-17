import { z } from 'zod';
import { fetchPage, LinkError } from '@/features/links/fetch-page';
import { currentUserId } from '@/lib/auth/current-user';

const bodySchema = z.object({ url: z.string().trim().min(1).max(2000) });

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Sign in to add links.' }, { status: 401 });

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: 'Send a link to read.' }, { status: 400 });

  try {
    return Response.json(await fetchPage(body.data.url));
  } catch (error) {
    const message = error instanceof LinkError ? error.message : 'Could not read that page.';
    return Response.json({ error: message }, { status: 422 });
  }
}
