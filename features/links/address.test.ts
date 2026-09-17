import { describe, expect, it } from 'vitest';
import { isPrivateAddress } from './address';

describe('isPrivateAddress', () => {
  it('flags loopback, private, link-local, and metadata addresses', () => {
    for (const address of [
      '127.0.0.1',
      '10.1.2.3',
      '172.20.0.5',
      '192.168.1.10',
      '169.254.169.254',
      '0.0.0.0',
      '::1',
    ]) {
      expect(isPrivateAddress(address)).toBe(true);
    }
    expect(isPrivateAddress('fd12::1')).toBe(true);
    expect(isPrivateAddress('fe80::1')).toBe(true);
    expect(isPrivateAddress('::ffff:127.0.0.1')).toBe(true);
  });

  it('allows public addresses', () => {
    expect(isPrivateAddress('93.184.216.34')).toBe(false);
    expect(isPrivateAddress('172.32.0.1')).toBe(false);
    expect(isPrivateAddress('2606:4700::1111')).toBe(false);
  });

  it('treats anything that is not an address as private', () => {
    expect(isPrivateAddress('localhost')).toBe(true);
  });
});
