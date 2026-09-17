export const seenStepIds = ['brief', 'cards'] as const;
export type SeenStepId = (typeof seenStepIds)[number];

export type SetupStepId = 'slides' | SeenStepId | 'run';
export type SetupStep = { id: SetupStepId; done: boolean };

type SetupInput = { hasDeck: boolean; seen: readonly string[]; runs: number };

export function setupStepsFor({ hasDeck, seen, runs }: SetupInput): SetupStep[] {
  return [
    ...(hasDeck ? [{ id: 'slides' as const, done: true }] : []),
    { id: 'brief', done: seen.includes('brief') },
    { id: 'cards', done: seen.includes('cards') },
    { id: 'run', done: runs > 0 },
  ];
}

export function currentStep(steps: SetupStep[]) {
  return steps.find(step => !step.done)?.id ?? null;
}
