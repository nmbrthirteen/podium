import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { googleSignInEnabled } from '@/lib/auth/auth';
import { currentUserId } from '@/lib/auth/current-user';
import { isHosted } from '@/lib/env';
import { AuthForm } from './auth-form';

type AuthPageProps = { mode: 'sign-in' | 'sign-up'; title: string };

export async function AuthPage({ mode, title }: AuthPageProps) {
  if (!isHosted() || (await currentUserId())) redirect('/');

  return (
    <AppShell brandMark>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <AuthForm mode={mode} googleEnabled={googleSignInEnabled()} />
      </div>
    </AppShell>
  );
}
