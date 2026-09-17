import { describe, expect, it } from 'vitest';
import { providerOrder } from './provider-order';

describe('providerOrder', () => {
  it('prefers Claude Code, then Codex, then the API in local mode', () => {
    expect(providerOrder('local', 'auto')).toEqual(['claude-cli', 'codex-cli', 'ai-sdk']);
  });

  it('moves the preferred provider first in local mode', () => {
    expect(providerOrder('local', 'codex-cli')).toEqual(['codex-cli', 'claude-cli', 'ai-sdk']);
    expect(providerOrder('local', 'ai-sdk')).toEqual(['ai-sdk', 'claude-cli', 'codex-cli']);
  });

  it('disables the CLI providers in hosted mode', () => {
    expect(providerOrder('hosted', 'auto')).toEqual(['ai-sdk']);
    expect(providerOrder('hosted', 'claude-cli')).toEqual(['ai-sdk']);
  });
});
