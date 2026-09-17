'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ProviderPreference, ProviderStatus } from '@/lib/coach/registry';
import { resetExplainers, saveProviderPreference } from '../actions';

const providerNames: Record<string, string> = {
  'claude-cli': 'Claude Code',
  'codex-cli': 'Codex',
  'ai-sdk': 'OpenRouter API',
};
const installLinks: Record<string, string> = {
  'claude-cli': 'https://docs.claude.com/en/docs/claude-code/setup',
  'codex-cli': 'https://github.com/openai/codex',
  'ai-sdk': 'https://openrouter.ai/keys',
};

const preferenceOptions: { value: ProviderPreference; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'claude-cli', label: 'Claude Code' },
  { value: 'codex-cli', label: 'Codex' },
  { value: 'ai-sdk', label: 'OpenRouter' },
];

type CoachSettingsProps = { statuses: ProviderStatus[]; preference: ProviderPreference };

export function CoachSettings({ statuses, preference: initialPreference }: CoachSettingsProps) {
  const [preference, setPreference] = useState(initialPreference);
  const [explainersReset, setExplainersReset] = useState(false);
  const [, startTransition] = useTransition();
  const noneAvailable = statuses.every(status => !status.available);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="coach-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="coach-heading" className="font-display text-xl font-semibold">
            Coach
          </h2>
          <p className="max-w-prose text-muted">
            The coach runs through Claude Code or Codex on this computer, with your own subscription. Nothing else
            leaves the machine.
          </p>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {statuses.map(status => (
            <li key={status.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="font-medium">{providerNames[status.id] ?? status.id}</span>
              {status.available ? (
                <span>Installed</span>
              ) : (
                <span className="flex flex-wrap items-center gap-2 text-muted">
                  {status.reason ?? 'Not installed.'}
                  <a
                    href={installLinks[status.id]}
                    className="font-medium text-accent underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Install instructions
                  </a>
                </span>
              )}
            </li>
          ))}
        </ul>
        {noneAvailable && (
          <p className="font-medium text-danger">
            No coach is installed. Install Claude Code or Codex, sign in, then reload this page.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="font-medium">Preferred coach</span>
          <SegmentedControl
            label="Preferred coach"
            value={preference}
            options={preferenceOptions}
            onValueChange={next => {
              setPreference(next);
              startTransition(async () => {
                await saveProviderPreference(next);
              });
            }}
          />
          <span className="text-sm text-muted">Automatic uses Claude Code when both are installed.</span>
        </div>
      </section>

      <section aria-labelledby="explainers-heading" className="flex flex-col items-start gap-3">
        <h2 id="explainers-heading" className="font-display text-xl font-semibold">
          Explainer cards
        </h2>
        <p className="text-muted">The two cards about nerves show once, before your first run.</p>
        <Button
          variant="secondary"
          disabled={explainersReset}
          onClick={() =>
            startTransition(async () => {
              await resetExplainers();
              setExplainersReset(true);
            })
          }
        >
          {explainersReset ? 'Cards show before your next run' : 'Show the cards again'}
        </Button>
      </section>
    </div>
  );
}
