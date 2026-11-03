import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
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

class RecordingTooLargeError extends Error {}

const recordingTypes = new Map([
  ['video/webm', { extension: 'webm', contentType: 'video/webm' }],
  ['video/mp4', { extension: 'mp4', contentType: 'video/mp4' }],
]);

function contentTypeForFile(file: string) {
  return file.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
}

async function saveBody(body: ReadableStream<Uint8Array>, file: string, limit: number) {
  let size = 0;

  const counter = new Transform({
    transform(chunk: Buffer, _encoding, done) {
      size += chunk.byteLength;
      done(size > limit ? new RecordingTooLargeError() : null, chunk);
    },
  });

  // SAFETY: the DOM and node:stream/web ReadableStream types differ only in declaration; the runtime object is the same.
  await pipeline(Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]), counter, createWriteStream(file));

  return size;
}

export async function POST(request: Request, context: Context) {
  const { userId, run } = await findOwnedRun(context);

  if (!userId) return Response.json({ error: 'Sign in to save a recording.' }, { status: 401 });

  if (!run) return Response.json({ error: 'This run no longer exists. Start a new recorded run.' }, { status: 404 });

  const declared = Number(request.headers.get('content-length'));

  if (!Number.isInteger(declared) || declared <= 0 || !request.body) {
    return Response.json({ error: 'The recording was empty. Record the run again.' }, { status: 400 });
  }

  if (declared > maxRecordingBytes) {
    return Response.json({ error: 'The recording is over 2 GB. Record a shorter run.' }, { status: 413 });
  }

  const mediaType = (request.headers.get('content-type') ?? 'video/webm').split(';')[0]?.trim().toLowerCase() ?? '';
  const format = recordingTypes.get(mediaType);

  if (!format) {
    return Response.json(
      { error: 'This recording format is not supported. Record again in Chrome or Safari.' },
      { status: 415 },
    );
  }

  try {
    await assertUsageAllowed(userId, 'recording-mb', Math.ceil(declared / megabyte));
  } catch (error) {
    if (error instanceof UsageLimitError) return Response.json({ error: error.message }, { status: 402 });
    throw error;
  }

  const relative = path.posix.join('recordings', run.talkId, `${run.id}.${format.extension}`);
  const target = dataPath(relative);
  const partial = `${target}.part`;
  await mkdir(path.dirname(target), { recursive: true });

  let size: number;

  try {
    size = await saveBody(request.body, partial, declared);
  } catch (error) {
    await rm(partial, { force: true });

    if (error instanceof RecordingTooLargeError) {
      return Response.json(
        { error: 'The recording was larger than its declared size. Record the run again.' },
        { status: 400 },
      );
    }

    throw error;
  }

  if (size === 0) {
    await rm(partial, { force: true });

    return Response.json({ error: 'The recording was empty. Record the run again.' }, { status: 400 });
  }

  await rename(partial, target);

  if (run.recordingPath && run.recordingPath !== relative) await rm(dataPath(run.recordingPath), { force: true });
  const db = await database();
  await db.update(runs).set({ recordingPath: relative }).where(eq(runs.id, run.id));
  await recordUsage(userId, 'recording-mb', Math.ceil(size / megabyte));

  return Response.json({ url: `/api/recordings/${run.id}` });
}

export async function GET(request: Request, context: Context) {
  const { run } = await findOwnedRun(context);

  if (!run?.recordingPath) return new Response('Not found', { status: 404 });

  const file = dataPath(run.recordingPath);
  const info = await stat(file).catch(() => null);

  if (!info) return new Response('Not found', { status: 404 });

  const headers = {
    'content-type': contentTypeForFile(file),
    'accept-ranges': 'bytes',
    'cache-control': 'private, no-store',
  };

  const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);

  if (!range) {
    // SAFETY: Readable.toWeb yields a byte stream; node:stream/web and DOM ReadableStream are the same runtime object.
    const body = Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>;

    return new Response(body, { headers: { ...headers, 'content-length': String(info.size) } });
  }

  const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;

  if (start > end || start >= info.size) {
    return new Response(null, { status: 416, headers: { 'content-range': `bytes */${info.size}` } });
  }

  // SAFETY: Readable.toWeb yields a byte stream; node:stream/web and DOM ReadableStream are the same runtime object.
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
