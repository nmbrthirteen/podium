import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { database } from '@/lib/db/client';
import { authAccounts, authSessions, authUsers, authVerifications } from '@/lib/db/schema';
import { readEnv } from '@/lib/env';

async function createAuth() {
  const db = await database();
  const env = readEnv();
  const google =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : undefined;

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: { user: authUsers, session: authSessions, account: authAccounts, verification: authVerifications },
    }),
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    socialProviders: google,
    plugins: [nextCookies()],
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;

let authInstance: Promise<Auth> | null = null;

export function getAuth() {
  authInstance ??= createAuth();
  return authInstance;
}

export function googleSignInEnabled() {
  const env = readEnv();
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}
