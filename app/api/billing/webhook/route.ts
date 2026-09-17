import { billingProvider } from '@/features/billing/billing-provider';
import { applyBillingEvent } from '@/features/billing/usage';

export async function POST(request: Request) {
  const provider = billingProvider();
  if (!provider) {
    return Response.json({ error: 'Billing is not set up yet. Connect a billing provider first.' }, { status: 501 });
  }
  const event = await provider.parseWebhook(request);
  if (!event) return Response.json({ error: 'The webhook signature or payload was not valid.' }, { status: 400 });
  await applyBillingEvent(event);
  return Response.json({ received: true });
}
