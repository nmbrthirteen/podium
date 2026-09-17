import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { plans, usageKinds, usageLabels } from '@/features/billing/plans';
import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { LandingArtifact } from './landing-artifact';

const findings = [
  {
    claim: 'Practiced recall held up under stress, while rereading collapsed.',
    source: 'Science, 2016',
    href: 'https://www.science.org/doi/10.1126/science.aah5067',
  },
  {
    claim: 'Speaking practice lowered anxiety across 30 trials, and the effect grew at follow-up.',
    source: 'Meta-analysis, 2019',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6428748/',
  },
  {
    claim: 'Audiences notice about half the nervousness that speakers think they show.',
    source: 'Journal of Experimental Social Psychology, 2003',
    href: 'https://www.sciencedirect.com/science/article/abs/pii/S0022103103000568',
  },
];

const stages = [
  {
    name: 'Prepare',
    detail: 'Upload a deck or answer 3 questions. Rule checks point at what hurts a talk, one fix at a time.',
    sample: 'Your big idea has 22 words. Cut it to 15 or fewer.',
  },
  {
    name: 'Practice',
    detail: 'One button starts the right session. Notes stay hidden, and every peek is counted.',
    sample: '4 peeks, 1:10 over in part 2. Next: loop part 2.',
  },
  {
    name: 'Present',
    detail: 'Live mode shows your keywords and the time left. The Lost button restates your last point.',
    sample: 'Let me come back to the one thing I want you to remember.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="font-display text-xl font-semibold">{brand.name}</span>
        <Link href="/sign-in" className={buttonVariants({ variant: 'quiet', size: 'sm' })}>
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-10 pb-24 sm:px-6">
        <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col items-start gap-6">
            <h1 className="max-w-[18ch] font-display text-4xl leading-tight font-semibold sm:text-5xl">
              Rehearse your next talk out loud until it holds under pressure.
            </h1>
            <p className="max-w-prose text-lg text-muted">
              Upload your deck or answer 3 questions. {brand.name} builds the brief, cue cards, and a spoken rehearsal
              plan, then coaches every run.
            </p>
            <Link href="/sign-up" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Start free
            </Link>
          </div>
          <LandingArtifact />
        </section>

        <section aria-labelledby="evidence-heading" className="flex flex-col gap-8">
          <h2 id="evidence-heading" className="max-w-[24ch] font-display text-3xl font-semibold">
            Built on how memory behaves when you are nervous
          </h2>
          <ul className="grid gap-8 md:grid-cols-3">
            {findings.map(finding => (
              <li key={finding.href} className="flex flex-col gap-3 border-t border-line pt-5">
                <p className="text-lg">{finding.claim}</p>
                <a
                  href={finding.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center text-sm text-muted underline hover:text-ink"
                >
                  {finding.source}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="stages-heading" className="flex flex-col gap-8">
          <h2 id="stages-heading" className="font-display text-3xl font-semibold">
            From first draft to the stage
          </h2>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {stages.map((stage, index) => (
              <li key={stage.name} className="grid gap-4 py-8 md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)]">
                <p className="font-display text-2xl font-semibold">
                  <span className="text-muted tabular-nums">{index + 1}. </span>
                  {stage.name}
                </p>
                <p className="text-lg">{stage.detail}</p>
                <p className="self-start rounded-card bg-surface p-4 shadow-card">{stage.sample}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="plans-heading" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 id="plans-heading" className="font-display text-3xl font-semibold">
              Plans
            </h2>
            <p className="max-w-prose text-muted">Everyone starts on Free. Paid plans open soon.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.values(plans).map(plan => (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col gap-4 rounded-card p-6',
                  plan.id === 'free' ? 'bg-surface shadow-card' : 'bg-inset',
                )}
              >
                <h3 className="font-display text-2xl font-semibold">{plan.label}</h3>
                <ul className="flex flex-col gap-2">
                  {usageKinds.map(kind => (
                    <li key={kind} className="flex justify-between gap-4 border-b border-line pb-2">
                      <span className="text-muted">{usageLabels[kind].name} each month</span>
                      <span className="font-medium tabular-nums">{usageLabels[kind].unit(plan.limits[kind])}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted">{plan.id === 'free' ? 'Available now.' : 'Opens soon.'}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="final-heading" className="flex flex-col items-start gap-6">
          <h2 id="final-heading" className="max-w-[20ch] font-display text-4xl font-semibold">
            Add the talk you are dreading most.
          </h2>
          <Link href="/sign-up" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Start free
          </Link>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 text-sm text-muted sm:px-6">
          <span>{brand.name}</span>
          <Link href="/sign-in" className="flex min-h-11 items-center hover:text-ink">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
