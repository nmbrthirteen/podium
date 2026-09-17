import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isHosted } from '@/lib/env';
import { getAuth } from './auth';
import { localUserId } from './local-user';

export type CurrentUser = { id: string; name: string; email: string };

export async function currentUser(): Promise<CurrentUser | null> {
  if (!isHosted()) return { id: localUserId, name: 'You', email: '' };
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

export async function currentUserId() {
  return (await currentUser())?.id ?? null;
}

export async function requireUserId() {
  const id = await currentUserId();
  if (!id) redirect('/sign-in');
  return id;
}
