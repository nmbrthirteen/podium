import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { AppShell } from '@/components/app-shell';
import { AccountOverview } from '@/features/account/components/account-overview';
import { billingProvider } from '@/features/billing/billing-provider';
import { usageSummary } from '@/features/billing/usage';
import { currentUser } from '@/lib/auth/current-user';
import { isHosted } from '@/lib/env';

export const metadata: Metadata = { title: 'Account' };

export default async function AccountPage() {
  await connection();
  if (!isHosted()) redirect('/settings');
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const summary = await usageSummary(user.id);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Account</h1>
      <AccountOverview
        email={user.email}
        planLabel={summary.plan.label}
        resetsOn={summary.resetsOn}
        usage={summary.usage}
        upgradesOpen={billingProvider() !== null}
      />
    </AppShell>
  );
}
