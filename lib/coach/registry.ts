import 'server-only';
import { readEnv } from '@/lib/env';
import type { CoachProvider, CoachProviderId } from './provider';
import { type ProviderPreference, providerOrder } from './provider-order';
import { aiSdk } from './providers/ai-sdk';
import { claudeCli } from './providers/claude-cli';
import { codexCli } from './providers/codex-cli';

export type { ProviderPreference };
export type ProviderStatus = { id: CoachProviderId; available: boolean; reason?: string };

const providers: Record<CoachProviderId, CoachProvider> = {
  'claude-cli': claudeCli,
  'codex-cli': codexCli,
  'ai-sdk': aiSdk,
};

export async function providerStatuses(): Promise<ProviderStatus[]> {
  const mode = readEnv().PODIUM_MODE;
  return Promise.all(providerOrder(mode, 'auto').map(async id => ({ id, ...(await providers[id].detect()) })));
}

export async function resolveProvider(preference: ProviderPreference) {
  const env = readEnv();
  if (env.PODIUM_COACH === 'off') return null;
  for (const id of providerOrder(env.PODIUM_MODE, preference)) {
    const provider = providers[id];
    if ((await provider.detect()).available) return provider;
  }
  return null;
}
