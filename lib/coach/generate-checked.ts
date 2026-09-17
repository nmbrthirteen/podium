import { describeViolations, lintOutput } from './output-lint';
import type { CoachProvider, CoachRequest } from './provider';

export type CheckedOutput<T> = { output: T; flagged: boolean };

export async function generateChecked<T>(provider: CoachProvider, request: CoachRequest<T>): Promise<CheckedOutput<T>> {
  const first = await provider.generate(request);
  const violations = lintOutput(first);
  if (violations.length === 0) return { output: first, flagged: false };

  const retryPrompt = `${request.prompt}\n\nYour last answer broke these style rules. Return the same content with them fixed:\n${describeViolations(violations)}`;
  const second = await provider.generate({ ...request, prompt: retryPrompt });
  return { output: second, flagged: lintOutput(second).length > 0 };
}
