'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/current-user';
import { userSettingKey } from '@/lib/auth/local-user';
import { providerPreferenceSchema } from '@/lib/coach/run-task';
import { isHosted } from '@/lib/env';
import { writeSetting } from '@/lib/settings';

export async function saveProviderPreference(raw: string) {
  if (isHosted()) throw new Error('The coach provider is set by the server in hosted mode.');
  await writeSetting('coach-provider', providerPreferenceSchema.parse(raw));
  revalidatePath('/settings');
}

export async function resetExplainers() {
  const userId = await requireUserId();
  await writeSetting(userSettingKey(userId, 'explainers-seen'), false);
}
