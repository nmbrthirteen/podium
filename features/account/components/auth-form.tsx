'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { authClient } from '@/lib/auth/auth-client';

type AuthFormProps = { mode: 'sign-in' | 'sign-up'; googleEnabled: boolean };

export function AuthForm({ mode, googleEnabled }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const signingUp = mode === 'sign-up';

  const submit = () =>
    startTransition(async () => {
      setError(null);
      const result = signingUp
        ? await authClient.signUp.email({ name: name.trim() || email, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          signingUp
            ? `The account was not created: ${result.error.message ?? 'check the email and password'}. Try again.`
            : 'The email or password did not match. Check both, then sign in again.',
        );
        return;
      }
      router.push('/');
      router.refresh();
    });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={event => {
        event.preventDefault();
        submit();
      }}
    >
      {signingUp && (
        <Field label="Name">
          <Input value={name} autoComplete="name" onChange={event => setName(event.target.value)} />
        </Field>
      )}
      <Field label="Email">
        <Input
          type="email"
          value={email}
          required
          autoComplete="email"
          onChange={event => setEmail(event.target.value)}
        />
      </Field>
      <Field label="Password" description={signingUp ? 'At least 10 characters.' : undefined}>
        <Input
          type="password"
          value={password}
          required
          minLength={signingUp ? 10 : undefined}
          autoComplete={signingUp ? 'new-password' : 'current-password'}
          onChange={event => setPassword(event.target.value)}
        />
      </Field>
      {error && (
        <p role="alert" className="font-medium text-danger">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        pending={pending}
        pendingLabel={signingUp ? 'Creating your account' : 'Signing in'}
      >
        {signingUp ? 'Create account' : 'Sign in'}
      </Button>
      {googleEnabled && (
        <Button
          variant="secondary"
          size="lg"
          onClick={() => void authClient.signIn.social({ provider: 'google', callbackURL: '/' })}
        >
          Continue with Google
        </Button>
      )}
      <p className="text-muted">
        {signingUp ? 'Already have an account? ' : 'New here? '}
        <Link href={signingUp ? '/sign-in' : '/sign-up'} className="font-medium text-accent underline">
          {signingUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
