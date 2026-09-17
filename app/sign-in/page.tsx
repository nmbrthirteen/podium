import type { Metadata } from 'next';
import { AuthPage } from '@/features/account/components/auth-page';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return <AuthPage mode="sign-in" title="Sign in" />;
}
