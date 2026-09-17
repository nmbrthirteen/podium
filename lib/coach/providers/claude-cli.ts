import 'server-only';
import { z } from 'zod';
import { CoachError, type CoachProvider, parseStructured } from '../provider';
import { toCliJsonSchema } from './json-schema';
import { findExecutable, minimalEnv, runCli, withTempDir } from './run-cli';

const envelopeSchema = z.object({
  is_error: z.boolean().optional(),
  result: z.string().optional(),
  structured_output: z.unknown().optional(),
});

export function parseClaudeEnvelope(stdout: string): unknown {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new CoachError('invalid-output', 'Claude returned output that is not JSON. Try again.');
  }

  const envelope = envelopeSchema.safeParse(parsed);
  if (!envelope.success) throw new CoachError('invalid-output', 'Claude returned an unexpected envelope. Try again.');
  if (envelope.data.is_error) {
    throw new CoachError('failed', envelope.data.result || 'Claude returned an error. Try again.');
  }
  if (envelope.data.structured_output !== undefined) return envelope.data.structured_output;
  if (envelope.data.result) {
    try {
      return JSON.parse(envelope.data.result);
    } catch {
      throw new CoachError('invalid-output', 'Claude returned no structured output. Try again.');
    }
  }
  throw new CoachError('invalid-output', 'Claude returned no structured output. Try again.');
}

export const claudeCli: CoachProvider = {
  id: 'claude-cli',

  async detect() {
    const executable = await findExecutable('claude');
    return executable ? { available: true } : { available: false, reason: 'Claude Code is not on your PATH.' };
  },

  async generate(request) {
    const executable = await findExecutable('claude');
    if (!executable) throw new CoachError('unavailable', 'Claude Code is not installed. Install it, then try again.');

    return withTempDir(async cwd => {
      const { stdout } = await runCli({
        executable,
        cwd,
        env: minimalEnv(),
        signal: request.signal,
        stdin: request.prompt,
        args: [
          '-p',
          '--model',
          'sonnet',
          '--output-format',
          'json',
          '--json-schema',
          JSON.stringify(toCliJsonSchema(request.schema)),
          '--tools',
          '',
          '--no-session-persistence',
          '--setting-sources',
          'project',
          '--strict-mcp-config',
          '--exclude-dynamic-system-prompt-sections',
          '--system-prompt',
          request.system,
        ],
      });
      return parseStructured(request.schema, parseClaudeEnvelope(stdout));
    });
  },
};
