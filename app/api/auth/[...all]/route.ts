import { getAuth } from '@/lib/auth/auth';
import { isHosted } from '@/lib/env';

async function handle(request: Request) {
  if (!isHosted()) {
    return Response.json({ error: 'Accounts are off in local mode.' }, { status: 404 });
  }
  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
