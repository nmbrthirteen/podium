import { formatShortDate } from '@/lib/dates';
import { type PlanId, type SubscriptionStatus, type UsageKind, usageKinds } from '@/lib/domain';

export type { PlanId, SubscriptionStatus, UsageKind };
export { usageKinds };

export type Plan = { id: PlanId; label: string; limits: Record<UsageKind, number> };

export const plans: Record<PlanId, Plan> = {
  free: { id: 'free', label: 'Free', limits: { 'coach-call': 40, 'deck-upload': 3, 'recording-mb': 500 } },
  pro: { id: 'pro', label: 'Pro', limits: { 'coach-call': 600, 'deck-upload': 50, 'recording-mb': 10_000 } },
};

export const usageLabels: Record<UsageKind, { name: string; unit: (count: number) => string }> = {
  'coach-call': {
    name: 'Coach checks',
    unit: count => `${count.toLocaleString('en-US')} ${count === 1 ? 'check' : 'checks'}`,
  },
  'deck-upload': {
    name: 'Deck uploads',
    unit: count => `${count.toLocaleString('en-US')} ${count === 1 ? 'deck' : 'decks'}`,
  },
  'recording-mb': { name: 'Recording storage', unit: count => `${count.toLocaleString('en-US')} MB` },
};

export type SubscriptionState = {
  plan: PlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
};

export const defaultSubscription: SubscriptionState = { plan: 'free', status: 'active', currentPeriodEnd: null };

export function effectivePlan(subscription: SubscriptionState, now: Date): Plan {
  if (subscription.plan === 'free') return plans.free;
  if (subscription.status === 'canceled') return plans.free;
  if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getTime() < now.getTime()) {
    return plans.free;
  }
  return plans[subscription.plan];
}

export function usagePeriod(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatResetDate(iso: string) {
  return formatShortDate(iso.slice(0, 10));
}

export type LimitCheck = { allowed: true } | { allowed: false; message: string };

export function checkLimit(plan: Plan, kind: UsageKind, used: number, adding: number, resetsOn: string): LimitCheck {
  const limit = plan.limits[kind];
  if (used + adding <= limit) return { allowed: true };
  const label = usageLabels[kind];
  return {
    allowed: false,
    message: `You used ${label.unit(Math.min(used, limit))} of ${label.unit(limit)} on the ${plan.label} plan this month. It resets on ${formatResetDate(resetsOn)}.`,
  };
}
