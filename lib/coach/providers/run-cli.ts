import 'server-only';
import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CoachError, coachTimeoutMs } from '../provider';
import { envKeys, executableNames, pathEntries, type SpawnPlan, spawnPlan } from './cli-platform';

const windows = process.platform === 'win32';

export function minimalEnv(extra: Record<string, string> = {}) {
  const env: Record<string, string> = {};
  for (const key of envKeys(process.platform)) {
    const value = process.env[key];
    if (value) env[key] = value;
  }
  return { ...env, ...extra };
}

function searchDirs() {
  const home = os.homedir();
  const fromPath = pathEntries(process.env.PATH ?? '', path.delimiter);
  const common = windows
    ? [path.join(home, '.local', 'bin'), process.env.APPDATA ? path.join(process.env.APPDATA, 'npm') : '']
    : [path.join(home, '.local', 'bin'), '/opt/homebrew/bin', '/usr/local/bin'];
  return [...new Set([...fromPath, ...common].filter(Boolean))];
}

function isExecutable(file: string) {
  return access(file, constants.X_OK).then(
    () => true,
    () => false,
  );
}

export async function findExecutable(name: string) {
  const names = executableNames(name, process.platform, process.env.PATHEXT);
  for (const dir of searchDirs()) {
    for (const file of names) {
      const candidate = path.join(dir, file);
      if (await isExecutable(candidate)) return candidate;
    }
  }
  return null;
}

export async function withTempDir<T>(work: (dir: string) => Promise<T>) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'podium-coach-'));
  try {
    return await work(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export type CliRun = {
  executable: string;
  args: string[];
  stdin: string;
  cwd: string;
  env: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

const firstLine = (text: string) =>
  text
    .split(/\r?\n/)
    .find(line => line.trim())
    ?.trim() ?? '';

const ignore = () => undefined;

export async function runCli(run: CliRun) {
  const shim = windows && /\.(cmd|bat)$/i.test(run.executable) ? await readFile(run.executable, 'utf8') : null;
  const plan = spawnPlan(run.executable, run.args, process.platform, process.execPath, shim);
  if (!plan) {
    throw new CoachError(
      'unavailable',
      `Could not launch ${path.basename(run.executable)}. Reinstall it with npm or its installer, then try again.`,
    );
  }
  return runProcess(plan, run);
}

function runProcess(
  { command, args }: SpawnPlan,
  { executable, stdin, cwd, env, signal, timeoutMs = coachTimeoutMs }: CliRun,
) {
  const name = path.basename(executable);

  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CoachError('aborted', 'The coach request was cancelled.'));
      return;
    }

    const child = spawn(command, args, {
      cwd,
      env: { ...env, NODE_ENV: 'production' },
      detached: !windows,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let stopReason: 'timeout' | 'aborted' | null = null;

    const stop = (reason: 'timeout' | 'aborted') => {
      stopReason = reason;
      if (!child.pid) return;
      if (windows) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true }).on('error', ignore);
        return;
      }
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        child.kill('SIGKILL');
      }
    };

    const timer = setTimeout(() => stop('timeout'), timeoutMs);
    const onAbort = () => stop('aborted');
    signal?.addEventListener('abort', onAbort, { once: true });

    const finish = (error: CoachError | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve({ stdout, stderr });
    };

    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.stdin.on('error', ignore);

    child.on('error', error => finish(new CoachError('failed', `Could not start ${name}: ${error.message}`)));
    child.on('close', code => {
      if (stopReason === 'timeout') {
        finish(new CoachError('timeout', 'The coach took longer than 90 seconds. Try again.'));
      } else if (stopReason === 'aborted') {
        finish(new CoachError('aborted', 'The coach request was cancelled.'));
      } else if (code !== 0) {
        finish(new CoachError('failed', firstLine(stderr) || firstLine(stdout) || `${name} exited with code ${code}.`));
      } else {
        finish(null);
      }
    });

    child.stdin.end(stdin);
  });
}
