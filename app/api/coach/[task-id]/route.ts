import { z } from 'zod';
import { assertUsageAllowed, recordUsage, UsageLimitError } from '@/features/billing/usage';
import { currentUserId } from '@/lib/auth/current-user';
import { CoachError, type CoachErrorCode } from '@/lib/coach/provider';
import { runCoachTask } from '@/lib/coach/run-task';
import { coachTasks, isCoachTaskId } from '@/lib/coach/tasks';

export const maxDuration = 200;

const bodySchema = z.object({ input: z.unknown(), fresh: z.boolean().optional() });

const statusByCode: Record<CoachErrorCode, number> = {
  unavailable: 503,
  timeout: 504,
  aborted: 499,
  failed: 502,
  'invalid-input': 400,
  'invalid-output': 502,
};

export async function POST(request: Request, context: { params: Promise<{ 'task-id': string }> }) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Sign in to use the coach.' }, { status: 401 });

  const { 'task-id': taskId } = await context.params;
  if (!isCoachTaskId(taskId)) {
    return Response.json({ error: `There is no coach task named ${taskId}.` }, { status: 404 });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: 'The request body was not valid JSON.' }, { status: 400 });

  try {
    await assertUsageAllowed(userId, 'coach-call', 1);
    const result = await runCoachTask(coachTasks[taskId], body.data.input, {
      signal: request.signal,
      fresh: body.data.fresh,
    });
    if (!result.cached) await recordUsage(userId, 'coach-call', 1);
    return Response.json(result);
  } catch (error) {
    if (error instanceof UsageLimitError) return Response.json({ error: error.message }, { status: 402 });
    if (error instanceof CoachError) {
      return Response.json({ error: error.message, code: error.code }, { status: statusByCode[error.code] });
    }
    return Response.json({ error: 'The coach failed. Try again.' }, { status: 500 });
  }
}
