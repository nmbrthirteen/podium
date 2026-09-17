import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { applyBillingEvent, assertUsageAllowed, recordUsage, UsageLimitError, usageSummary } from './usage';

const dataDir = mkdtempSync(path.join(os.tmpdir(), 'podium-usage-test-'));

beforeAll(() => {
  process.env.PODIUM_DATA_DIR = dataDir;
  process.env.PODIUM_MODE = 'hosted';
});

afterAll(() => {
  delete process.env.PODIUM_DATA_DIR;
  delete process.env.PODIUM_MODE;
  rmSync(dataDir, { recursive: true, force: true });
});

describe('usage metering', () => {
  it('blocks the free plan past its limit and lifts it on pro', async () => {
    const userId = 'user-free';
    for (let call = 0; call < 40; call += 1) {
      await assertUsageAllowed(userId, 'coach-call', 1);
      await recordUsage(userId, 'coach-call', 1);
    }
    await expect(assertUsageAllowed(userId, 'coach-call', 1)).rejects.toBeInstanceOf(UsageLimitError);

    const free = await usageSummary(userId);
    expect(free.plan.id).toBe('free');
    expect(free.usage.find(item => item.kind === 'coach-call')).toEqual({ kind: 'coach-call', used: 40, limit: 40 });

    await applyBillingEvent({
      type: 'subscription-updated',
      userId,
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: null,
      providerCustomerId: 'customer-1',
    });
    await expect(assertUsageAllowed(userId, 'coach-call', 1)).resolves.toBeUndefined();
    expect((await usageSummary(userId)).plan.id).toBe('pro');

    await applyBillingEvent({ type: 'subscription-canceled', userId });
    expect((await usageSummary(userId)).plan.id).toBe('free');
  });

  it('keeps usage separate per user', async () => {
    await recordUsage('user-a', 'deck-upload', 3);
    await expect(assertUsageAllowed('user-a', 'deck-upload', 1)).rejects.toBeInstanceOf(UsageLimitError);
    await expect(assertUsageAllowed('user-b', 'deck-upload', 1)).resolves.toBeUndefined();
  });

  it('skips limits in local mode', async () => {
    process.env.PODIUM_MODE = 'local';
    try {
      await expect(assertUsageAllowed('user-free', 'coach-call', 1)).resolves.toBeUndefined();
    } finally {
      process.env.PODIUM_MODE = 'hosted';
    }
  });
});
