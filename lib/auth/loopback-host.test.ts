import { describe, expect, it } from 'vitest';
import { isLoopbackHost } from './loopback-host';

describe('isLoopbackHost', () => {
  it('accepts loopback names with and without a port', () => {
    for (const host of ['localhost', 'localhost:3000', '127.0.0.1:3000', '[::1]:3000', 'LOCALHOST:3000']) {
      expect(isLoopbackHost(host)).toBe(true);
    }
  });

  it('rejects other hosts and a missing header', () => {
    for (const host of ['evil.example', 'evil.example:3000', '192.168.1.5:3000', 'localhost.evil.example', '']) {
      expect(isLoopbackHost(host)).toBe(false);
    }

    expect(isLoopbackHost(null)).toBe(false);
  });
});
