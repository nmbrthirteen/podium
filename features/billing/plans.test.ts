import { describe, expect, it } from 'vitest';
import { checkLimit, defaultSubscription, effectivePlan, plans, usagePeriod } from './plans';

const now = new Date('2026-09-15T12:00:00Z');

describe('effectivePlan', () => {
  it('uses the free plan by default', () => {
    expect(effectivePlan(defaultSubscription, now).id).toBe('free');
  });

  it('uses pro while the subscription is active and inside its period', () => {
    expect(effectivePlan({ plan: 'pro', status: 'active', currentPeriodEnd: '2026-10-01T00:00:00Z' }, now).id).toBe(
      'pro',
    );
    expect(effectivePlan({ plan: 'pro', status: 'past-due', currentPeriodEnd: null }, now).id).toBe('pro');
  });

  it('falls back to free when canceled or expired', () => {
    expect(effectivePlan({ plan: 'pro', status: 'canceled', currentPeriodEnd: null }, now).id).toBe('free');
    expect(effectivePlan({ plan: 'pro', status: 'active', currentPeriodEnd: '2026-09-01T00:00:00Z' }, now).id).toBe(
      'free',
    );
  });
});

describe('usagePeriod', () => {
  it('covers the calendar month in UTC', () => {
    expect(usagePeriod(now)).toEqual({ start: '2026-09-01T00:00:00.000Z', end: '2026-10-01T00:00:00.000Z' });
    expect(usagePeriod(new Date('2026-12-31T23:59:59Z')).end).toBe('2027-01-01T00:00:00.000Z');
  });
});

describe('checkLimit', () => {
  const resetsOn = usagePeriod(now).end;

  it('allows usage up to the limit', () => {
    expect(checkLimit(plans.free, 'coach-call', 39, 1, resetsOn)).toEqual({ allowed: true });
  });

  it('blocks usage past the limit with the reset date', () => {
    expect(checkLimit(plans.free, 'coach-call', 40, 1, resetsOn)).toEqual({
      allowed: false,
      message: 'You used 40 checks of 40 checks on the Free plan this month. It resets on Oct 1.',
    });
  });

  it('counts units for recording storage', () => {
    expect(checkLimit(plans.free, 'recording-mb', 480, 30, resetsOn).allowed).toBe(false);
    expect(checkLimit(plans.pro, 'recording-mb', 480, 30, resetsOn).allowed).toBe(true);
  });
});
