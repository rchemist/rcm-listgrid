import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt } from './simpleCrypt';
import { configureRuntime } from '../config/RuntimeConfig';

/**
 * P0-7 (ADR-0006) — simpleCrypt fallback key removal. A shared hard-coded
 * fallback key would let any consumer of the library decrypt any host's
 * data, so encrypt/decrypt must throw instead of silently using a default
 * when the host has not configured a cryptKey.
 */
describe('simpleCrypt — cryptKey required (no hard-coded fallback)', () => {
  beforeEach(() => {
    // Explicitly clear cryptKey so we don't rely on ordering against other
    // test files / suites that may have configured one.
    configureRuntime({ cryptKey: '' });
  });

  it('encrypt throws a clear error when cryptKey is not configured', () => {
    expect(() => encrypt('secret')).toThrow(/cryptKey/i);
  });

  it('decrypt throws a clear error when cryptKey is not configured', () => {
    expect(() => decrypt('ciphertext')).toThrow(/cryptKey/i);
  });

  it('encrypt/decrypt work normally once a cryptKey is configured', () => {
    configureRuntime({ cryptKey: 'configured-key' });
    const cipher = encrypt('hello');
    expect(cipher).not.toBe('hello');
    expect(decrypt(cipher)).toBe('hello');
  });
});
