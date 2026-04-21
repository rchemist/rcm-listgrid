import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt, hash, generateUUID } from './simpleCrypt';
import { configureRuntime } from '../config/RuntimeConfig';

describe('simpleCrypt', () => {
  beforeEach(() => {
    // Use an explicit key so we don't rely on default
    configureRuntime({ cryptKey: 'test-secret-key' });
  });

  describe('encrypt / decrypt', () => {
    it('round-trips ASCII text', () => {
      const input = 'hello world';
      expect(decrypt(encrypt(input))).toBe(input);
    });

    it('round-trips Korean / Unicode text', () => {
      const input = '안녕하세요 🚀';
      expect(decrypt(encrypt(input))).toBe(input);
    });

    it('round-trips empty string', () => {
      expect(decrypt(encrypt(''))).toBe('');
    });

    it('produces ciphertext that differs from input', () => {
      const input = 'something-secret';
      const cipher = encrypt(input);
      expect(cipher).not.toBe(input);
      expect(cipher.length).toBeGreaterThan(0);
    });

    it('uses the configured runtime cryptKey (round-trips with updated key)', () => {
      configureRuntime({ cryptKey: 'another-key' });
      const cipher = encrypt('hello');
      expect(decrypt(cipher)).toBe('hello');
    });
  });

  describe('hash', () => {
    it('produces a deterministic 64-char hex SHA-256 for string input', () => {
      const h = hash('hello');
      expect(h).toMatch(/^[0-9a-f]{64}$/);
      expect(hash('hello')).toBe(h);
    });

    it('produces different hashes for different inputs', () => {
      expect(hash('a')).not.toBe(hash('b'));
    });

    it('supports multiple arguments and object inputs', () => {
      const h1 = hash('a', 'b');
      const h2 = hash('a', 'b');
      expect(h1).toBe(h2);
      expect(hash({ x: 1 })).toMatch(/^[0-9a-f]{64}$/);
    });

    it('treats null/undefined via _NULL_ sentinel (deterministic)', () => {
      expect(hash(null)).toBe(hash(undefined));
    });
  });

  describe('generateUUID', () => {
    it('returns a RFC-4122 version-4 UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique values on repeated calls', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) ids.add(generateUUID());
      expect(ids.size).toBe(50);
    });
  });
});
