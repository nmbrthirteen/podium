export type BreathingPattern = 'box' | 'slow';

export type BreathPhase = { label: string; secondsLeft: number };

const patterns: Record<BreathingPattern, { label: string; seconds: number }[]> = {
  box: [
    { label: 'Breathe in', seconds: 4 },
    { label: 'Hold', seconds: 4 },
    { label: 'Breathe out', seconds: 4 },
    { label: 'Hold', seconds: 4 },
  ],
  slow: [
    { label: 'Breathe in', seconds: 5 },
    { label: 'Breathe out', seconds: 5 },
  ],
};

export function cycleSeconds(pattern: BreathingPattern) {
  return patterns[pattern].reduce((sum, phase) => sum + phase.seconds, 0);
}

export function breathPhaseAt(pattern: BreathingPattern, elapsedSeconds: number): BreathPhase {
  const steps = patterns[pattern];
  let offset = elapsedSeconds % cycleSeconds(pattern);
  for (const step of steps) {
    if (offset < step.seconds) return { label: step.label, secondsLeft: Math.ceil(step.seconds - offset) };
    offset -= step.seconds;
  }
  return { label: steps[0]?.label ?? 'Breathe in', secondsLeft: steps[0]?.seconds ?? 4 };
}
