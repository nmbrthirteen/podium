import Link from 'next/link';
import { IconBadge } from '@/components/ui/icon-badge';
import { ArrowRightIcon, CheckIcon } from '@/components/ui/icons';
import { MetaChip } from '@/components/ui/meta-chip';
import { cn, pluralize } from '@/lib/utils';
import { currentStep, type SetupStep, type SetupStepId } from '../setup-steps';

type SetupGuideProps = { talkId: string; slideCount: number; steps: SetupStep[] };

export function SetupGuide({ talkId, slideCount, steps }: SetupGuideProps) {
  const hasDeck = steps.some(step => step.id === 'slides');
  const current = currentStep(steps);
  const doneCount = steps.filter(step => step.done).length;

  const labels: Record<SetupStepId, string> = {
    slides: `${pluralize(slideCount, 'slide')} added`,
    brief: 'Check the brief',
    cards: hasDeck ? 'Link cards to your slides' : 'Shape your cue cards',
    run: 'Do a first run',
  };
  const hrefs: Record<SetupStepId, string> = {
    slides: `/talks/${talkId}/cards#slides-heading`,
    brief: `/talks/${talkId}/brief`,
    cards: `/talks/${talkId}/cards`,
    run: `/talks/${talkId}/practice`,
  };

  return (
    <section aria-labelledby="setup-heading" className="flex flex-col gap-4 rounded-2xl bg-inset p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="setup-heading" className="font-display text-xl font-semibold">
          {hasDeck ? 'Get ready with your slides' : 'Get ready, no slides needed'}
        </h2>
        <MetaChip tone="surface">
          {doneCount} of {steps.length}
        </MetaChip>
      </div>

      <ol className={cn('grid gap-2', steps.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        {steps.map((step, index) => {
          const isCurrent = step.id === current;
          return (
            <li key={step.id}>
              <Link
                href={hrefs[step.id]}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'press flex h-full min-h-24 flex-col justify-between gap-3 rounded-xl p-4 transition-colors',
                  isCurrent ? 'bg-accent text-accent-ink' : 'bg-surface text-ink shadow-card hover:bg-surface/70',
                )}
              >
                <span className="flex items-center justify-between">
                  <IconBadge
                    size="7"
                    tone={step.done ? 'soft' : isCurrent ? 'on-accent' : 'neutral'}
                    className="text-sm font-semibold tabular-nums"
                  >
                    {step.done ? <CheckIcon size={14} /> : index + 1}
                  </IconBadge>
                  {isCurrent && <ArrowRightIcon size={18} />}
                </span>
                <span className={cn('font-medium', step.done && 'text-muted')}>{labels[step.id]}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {!hasDeck && (
        <Link
          href={`/talks/${talkId}/cards#slides-heading`}
          className="self-start text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          No slides? Upload a deck or let the coach draft them
        </Link>
      )}
    </section>
  );
}
