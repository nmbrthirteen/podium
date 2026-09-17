import { describe, expect, it } from 'vitest';
import { readEnv } from '@/lib/env';
import { databaseConfig } from './config';

describe('databaseConfig', () => {
  it('uses a local file under data by default', () => {
    expect(databaseConfig(readEnv({}), '/app')).toEqual({ url: 'file:/app/data/podium.db', local: true });
  });

  it('honors PODIUM_DATA_DIR', () => {
    expect(databaseConfig(readEnv({ PODIUM_DATA_DIR: '/tmp/podium' }), '/app').url).toBe('file:/tmp/podium/podium.db');
  });

  it('writes Windows folders with forward slashes', () => {
    expect(databaseConfig(readEnv({ PODIUM_DATA_DIR: 'C:\\Users\\me\\podium' }), 'C:\\app').url).toMatch(
      /^file:C:\/Users\/me\/podium\/podium\.db$/,
    );
  });

  it('uses Turso when a database URL is set', () => {
    const env = readEnv({ TURSO_DATABASE_URL: 'libsql://podium.turso.io', TURSO_AUTH_TOKEN: 'token' });
    expect(databaseConfig(env, '/app')).toEqual({ url: 'libsql://podium.turso.io', authToken: 'token', local: false });
  });
});

describe('readEnv', () => {
  it('defaults to local mode and treats blank values as unset', () => {
    const env = readEnv({ PODIUM_MODE: '', OPENROUTER_API_KEY: '' });
    expect(env.PODIUM_MODE).toBe('local');
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.PODIUM_AI_MODEL).toBe('anthropic/claude-sonnet-5');
  });

  it('rejects an unknown mode', () => {
    expect(() => readEnv({ PODIUM_MODE: 'cloud' })).toThrow();
  });
});
