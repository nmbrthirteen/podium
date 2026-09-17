import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { AppShell } from '@/components/app-shell';
import { CoachSettings } from '@/features/settings/components/coach-settings';
import { providerStatuses } from '@/lib/coach/registry';
import { providerPreference } from '@/lib/coach/run-task';
import { isHosted } from '@/lib/env';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  await connection();
  if (isHosted()) redirect('/account');
  const [statuses, preference] = await Promise.all([providerStatuses(), providerPreference()]);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <CoachSettings statuses={statuses} preference={preference} />
    </AppShell>
  );
}
