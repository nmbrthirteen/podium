import { MeterBar } from '@/components/ui/meter-bar';
import { formatResetDate, type UsageKind, usageLabels } from '@/features/billing/plans';
import { SignOutButton } from './sign-out-button';

type AccountOverviewProps = {
  email: string;
  planLabel: string;
  resetsOn: string;
  usage: { kind: UsageKind; used: number; limit: number }[];
  upgradesOpen: boolean;
};

export function AccountOverview({ email, planLabel, resetsOn, usage, upgradesOpen }: AccountOverviewProps) {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="profile-heading" className="flex flex-col items-start gap-3">
        <h2 id="profile-heading" className="font-display text-xl font-semibold">
          Signed in
        </h2>
        <p>{email}</p>
        <SignOutButton />
      </section>

      <section aria-labelledby="plan-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="plan-heading" className="font-display text-xl font-semibold">
            {planLabel} plan
          </h2>
          <p className="text-muted">Usage resets on {formatResetDate(resetsOn)}.</p>
        </div>
        <ul className="flex flex-col gap-5">
          {usage.map(item => {
            const label = usageLabels[item.kind];
            const share = item.limit > 0 ? Math.min(1, item.used / item.limit) : 0;
            return (
              <li key={item.kind} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{label.name}</span>
                  <span className="text-muted tabular-nums">
                    {label.unit(item.used)} of {label.unit(item.limit)}
                  </span>
                </div>
                <meter className="sr-only" aria-label={label.name} min={0} max={item.limit} value={item.used} />
                <MeterBar value={share} />
              </li>
            );
          })}
        </ul>
        <p className="text-muted">
          {upgradesOpen ? 'Upgrade to Pro for more coach checks and storage.' : 'Paid plans open soon.'}
        </p>
      </section>
    </div>
  );
}
