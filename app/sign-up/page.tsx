import type { Metadata } from 'next';
import { AuthPage } from '@/features/account/components/auth-page';

export const metadata: Metadata = { title: 'Create an account' };

export default function SignUpPage() {
  return <AuthPage mode="sign-up" title="Create an account" />;
}
