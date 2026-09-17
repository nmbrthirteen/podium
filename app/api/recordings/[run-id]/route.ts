import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { eq } from 'drizzle-orm';
import { assertUsageAllowed, recordUsage, UsageLimitError } from '@/features/billing/usage';
import { currentUserId } from '@/lib/auth/current-user';
import { ownedRun } from '@/lib/auth/talk-access';
import { database } from '@/lib/db/client';
import { runs } from '@/lib/db/schema';
import { dataPath } from '@/lib/paths';

export const maxDuration = 300;

const maxRecordingBytes = 2 * 1024 * 1024 * 1024;
const megabyte = 1024 * 1024;

type Context = { params: Promise<{ 'run-id': string }> };

async function findOwnedRun(context: Context) {
  const userId = await currentUserId();
  if (!userId) return { userId: null, run: null };
  const { 'run-id': runId } = await context.params;
  const owned = await ownedRun(runId, userId);
  return { userId, run: owned?.run ?? null };
}

export async function POST(request: Request, context: Context) {
  const { userId, run } = await findOwnedRun(context);
  if (!userId) return Response.json({ error: 'Sign in to save a recording.' }, { status: 401 });
  if (!run) return Response.json({ error: 'This run no longer exists. Start a new recorded run.' }, { status: 404 });

  const data = new Uint8Array(await request.arrayBuffer());
  if (data.byteLength === 0) {
    return Response.json({ error: 'The recording was empty. Record the run again.' }, { status: 400 });
  }
  if (data.byteLength > maxRecordingBytes) {
    return Response.json({ error: 'The recording is over 2 GB. Record a shorter run.' }, { status: 413 });
  }

  const megabytes = Math.ceil(data.byteLength / megabyte);
  try {
    await assertUsageAllowed(userId, 'recording-mb', megabytes);
  } catch (error) {
    if (error instanceof UsageLimitError) return Response.json({ error: error.message }, { status: 402 });
    throw error;
  }

  const relative = path.posix.join('recordings', run.talkId, `${run.id}.webm`);
  await mkdir(path.dirname(dataPath(relative)), { recursive: true });
  await writeFile(dataPath(relative), data);
  const db = await database();
  await db.update(runs).set({ recordingPath: relative }).where(eq(runs.id, run.id));
  await recordUsage(userId, 'recording-mb', megabytes);
  return Response.json({ url: `/api/recordings/${run.id}` });
}

export async function GET(request: Request, context: Context) {
  const { run } = await findOwnedRun(context);
  if (!run?.recordingPath) return new Response('Not found', { status: 404 });

  const file = dataPath(run.recordingPath);
  const info = await stat(file).catch(() => null);
  if (!info) return new Response('Not found', { status: 404 });

  const headers = { 'content-type': 'video/webm', 'accept-ranges': 'bytes', 'cache-control': 'private, no-store' };
  const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);

  if (!range) {
    const body = Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>;
    return new Response(body, { headers: { ...headers, 'content-length': String(info.size) } });
  }

  const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
  if (start > end || start >= info.size) {
    return new Response(null, { status: 416, headers: { 'content-range': `bytes */${info.size}` } });
  }

  const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream<Uint8Array>;
  return new Response(body, {
    status: 206,
    headers: {
      ...headers,
      'content-length': String(end - start + 1),
      'content-range': `bytes ${start}-${end}/${info.size}`,
    },
  });
}
