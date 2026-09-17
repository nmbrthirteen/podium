import 'server-only';
import { and, eq, gte, lt, sum } from 'drizzle-orm';
import { database } from '@/lib/db/client';
import { subscriptions, usageEvents } from '@/lib/db/schema';
import { isHosted } from '@/lib/env';
import { newId } from '@/lib/utils';
import type { BillingEvent } from './billing-provider';
import {
  checkLimit,
  defaultSubscription,
  effectivePlan,
  type SubscriptionState,
  type UsageKind,
  usageKinds,
  usagePeriod,
} from './plans';

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageLimitError';
  }
}

async function subscriptionFor(userId: string): Promise<SubscriptionState> {
  const db = await database();
  const row = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) });
  return row ? { plan: row.plan, status: row.status, currentPeriodEnd: row.currentPeriodEnd } : defaultSubscription;
}

async function usageInPeriod(userId: string, kind: UsageKind, now = new Date()) {
  const db = await database();
  const period = usagePeriod(now);
  const [row] = await db
    .select({ total: sum(usageEvents.units) })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.kind, kind),
        gte(usageEvents.createdAt, period.start),
        lt(usageEvents.createdAt, period.end),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function assertUsageAllowed(userId: string, kind: UsageKind, units: number) {
  if (!isHosted()) return;
  const now = new Date();
  const plan = effectivePlan(await subscriptionFor(userId), now);
  const result = checkLimit(plan, kind, await usageInPeriod(userId, kind, now), units, usagePeriod(now).end);
  if (!result.allowed) throw new UsageLimitError(result.message);
}

export async function recordUsage(userId: string, kind: UsageKind, units: number) {
  if (!isHosted() || units <= 0) return;
  const db = await database();
  await db.insert(usageEvents).values({ id: newId(), userId, kind, units, createdAt: new Date().toISOString() });
}

export async function usageSummary(userId: string) {
  const now = new Date();
  const subscription = await subscriptionFor(userId);
  const plan = effectivePlan(subscription, now);
  const period = usagePeriod(now);
  const usage = await Promise.all(
    usageKinds.map(async kind => ({ kind, used: await usageInPeriod(userId, kind, now), limit: plan.limits[kind] })),
  );
  return { plan, subscription, resetsOn: period.end, usage };
}

export async function applyBillingEvent(event: BillingEvent) {
  const db = await database();
  const updatedAt = new Date().toISOString();
  if (event.type === 'subscription-canceled') {
    await db.update(subscriptions).set({ status: 'canceled', updatedAt }).where(eq(subscriptions.userId, event.userId));
    return;
  }
  const values = {
    plan: event.plan,
    status: event.status,
    currentPeriodEnd: event.currentPeriodEnd,
    providerCustomerId: event.providerCustomerId,
    updatedAt,
  };
  await db
    .insert(subscriptions)
    .values({ userId: event.userId, ...values })
    .onConflictDoUpdate({ target: subscriptions.userId, set: values });
}
