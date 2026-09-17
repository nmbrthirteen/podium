import type { PlanId, SubscriptionStatus } from './plans';

export type BillingEvent =
  | {
      type: 'subscription-updated';
      userId: string;
      plan: PlanId;
      status: SubscriptionStatus;
      currentPeriodEnd: string | null;
      providerCustomerId: string | null;
    }
  | { type: 'subscription-canceled'; userId: string };

export interface BillingProvider {
  id: string;
  createCheckout(input: { userId: string; plan: PlanId; returnUrl: string }): Promise<{ url: string }>;
  createPortal(input: { userId: string; returnUrl: string }): Promise<{ url: string }>;
  parseWebhook(request: Request): Promise<BillingEvent | null>;
}

export function billingProvider(): BillingProvider | null {
  return null;
}
