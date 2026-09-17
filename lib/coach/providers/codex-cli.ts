import 'server-only';
import { lstat, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { dataPath } from '@/lib/paths';
import { CoachError, type CoachProvider, parseStructured } from '../provider';
import { toCliJsonSchema } from './json-schema';
import { findExecutable, minimalEnv, runCli, withTempDir } from './run-cli';

export function parseCodexOutput(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new CoachError('invalid-output', 'Codex returned output that is not JSON. Try again.');
  }
}

async function codexHomeEnv(): Promise<Record<string, string>> {
  const userHome = process.env.CODEX_HOME;
  const home = dataPath('codex-home');
  await mkdir(home, { recursive: true });
  const link = path.join(home, 'auth.json');
  const linked = await lstat(link).then(
    () => true,
    () => false,
  );
  if (linked) return { CODEX_HOME: home };

  const source = path.join(userHome ?? path.join(os.homedir(), '.codex'), 'auth.json');
  const fallback: Record<string, string> = userHome ? { CODEX_HOME: userHome } : {};
  return symlink(source, link).then(
    () => ({ CODEX_HOME: home }),
    () => fallback,
  );
}

export const codexCli: CoachProvider = {
  id: 'codex-cli',

  async detect() {
    const executable = await findExecutable('codex');
    return executable ? { available: true } : { available: false, reason: 'Codex is not on your PATH.' };
  },

  async generate(request) {
    const executable = await findExecutable('codex');
    if (!executable) throw new CoachError('unavailable', 'Codex is not installed. Install it, then try again.');
    const codexEnv = await codexHomeEnv();

    return withTempDir(async cwd => {
      const schemaPath = path.join(cwd, 'schema.json');
      const outputPath = path.join(cwd, 'output.json');
      await writeFile(schemaPath, JSON.stringify(toCliJsonSchema(request.schema)));

      await runCli({
        executable,
        cwd,
        env: minimalEnv(codexEnv),
        signal: request.signal,
        stdin: `${request.system}\n\n${request.prompt}`,
        args: [
          'exec',
          '--ignore-rules',
          '--output-schema',
          schemaPath,
          '-o',
          outputPath,
          '--ephemeral',
          '--skip-git-repo-check',
          '-s',
          'read-only',
          '-',
        ],
      });

      const text = await readFile(outputPath, 'utf8').catch(() => {
        throw new CoachError('invalid-output', 'Codex wrote no output file. Try again.');
      });
      return parseStructured(request.schema, parseCodexOutput(text));
    });
  },
};
