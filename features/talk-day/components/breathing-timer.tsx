'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useNow } from '@/hooks/use-now';
import { useStoredState } from '@/hooks/use-stored-state';
import { formatClock } from '@/lib/utils';
import { type BreathingPattern, breathPhaseAt } from '../breathing';

const patternOptions: { value: BreathingPattern; label: string }[] = [
  { value: 'box', label: 'Box, 4-4-4-4' },
  { value: 'slow', label: 'Slow, 6 per minute' },
];
const durationOptions = [
  { value: '2', label: '2 minutes' },
  { value: '5', label: '5 minutes' },
];

const prefsSchema = z.object({ pattern: z.enum(['box', 'slow']), minutes: z.enum(['2', '5']) });
const defaultPrefs: z.infer<typeof prefsSchema> = { pattern: 'box', minutes: '2' };

export function BreathingTimer() {
  const [prefs, setPrefs] = useStoredState('breathing-prefs', defaultPrefs, prefsSchema);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useNow(startedAt !== null);
  const totalSeconds = Number(prefs.minutes) * 60;
  const elapsed = startedAt === null ? 0 : (now - startedAt) / 1000;
  const finished = startedAt !== null && elapsed >= totalSeconds;
  const running = startedAt !== null && !finished;
  const phase = breathPhaseAt(prefs.pattern, elapsed);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SegmentedControl
          label="Breathing pattern"
          value={prefs.pattern}
          options={patternOptions}
          onValueChange={pattern => {
            setPrefs({ ...prefs, pattern });
            setStartedAt(null);
          }}
        />
        <SegmentedControl
          label="Session length"
          value={prefs.minutes}
          options={durationOptions}
          onValueChange={minutes => {
            const match = durationOptions.find(option => option.value === minutes);
            if (match) setPrefs({ ...prefs, minutes: match.value === '5' ? '5' : '2' });
            setStartedAt(null);
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative flex size-56 items-center justify-center">
          <span
            key={`${prefs.pattern}-${startedAt ?? 'idle'}`}
            aria-hidden="true"
            data-pattern={prefs.pattern}
            data-running={running}
            className="breath-circle absolute inset-0 rounded-full bg-accent-soft"
          />
          <div className="relative flex flex-col items-center gap-1 text-center" aria-live="polite">
            <span className="font-display text-2xl font-semibold">
              {finished ? 'Done' : running ? phase.label : 'Ready'}
            </span>
            {running && <span className="font-mono text-3xl tabular-nums">{phase.secondsLeft}</span>}
          </div>
        </div>
        <p className="font-mono text-muted tabular-nums">{formatClock(Math.max(0, totalSeconds - elapsed))} left</p>
        {running ? (
          <Button variant="secondary" onClick={() => setStartedAt(null)}>
            Stop breathing timer
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setStartedAt(Date.now())}>
            {finished ? 'Breathe again' : `Start ${prefs.minutes} minutes`}
          </Button>
        )}
      </div>
    </div>
  );
}
