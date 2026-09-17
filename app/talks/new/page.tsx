import type { Metadata } from 'next';
import { connection } from 'next/server';
import { AppShell } from '@/components/app-shell';
import { AddTalkScreen } from '@/features/talks/components/add-talk-screen';
import { requireUserId } from '@/lib/auth/current-user';

export const metadata: Metadata = { title: 'Add a talk' };

export default async function NewTalkPage() {
  await connection();
  await requireUserId();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">New talk</h1>
      <AddTalkScreen />
    </AppShell>
  );
}
