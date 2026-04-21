import { describe, it, expect } from 'vitest';
import { stringify, parse, replacer, reviver } from './jsonUtils';

describe('jsonUtils', () => {
  describe('stringify', () => {
    it('serializes plain objects', () => {
      expect(stringify({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
    });

    it('pretty-prints when beautify=true', () => {
      const out = stringify({ a: 1 }, true);
      expect(out).toContain('\n');
      expect(out).toContain('  "a": 1');
    });

    it('converts Map into plain object', () => {
      const m = new Map<string, number>();
      m.set('a', 1);
      m.set('b', 2);
      expect(stringify(m)).toBe('{"a":1,"b":2}');
    });

    it('converts Set into array', () => {
      const s = new Set([1, 2, 3]);
      expect(stringify(s)).toBe('[1,2,3]');
    });

    it('handles circular references gracefully', () => {
      const a: Record<string, unknown> = { x: 1 };
      a.self = a;
      const out = stringify(a);
      // Should not throw. Either produces a string containing the marker
      // or falls back to "{}". Either is an acceptable "no-throw" contract.
      expect(typeof out).toBe('string');
    });
  });

  describe('parse', () => {
    it('parses simple JSON strings', () => {
      expect(parse('{"a":1}')).toEqual({ a: 1 });
    });

    it('revives Map-tagged payloads', () => {
      const payload = JSON.stringify(new Map([['k', 'v']]), replacer);
      const result = parse(payload);
      expect(result).toBeInstanceOf(Map);
      expect((result as Map<string, string>).get('k')).toBe('v');
    });
  });

  describe('replacer / reviver', () => {
    it('round-trips a Map via replacer+reviver', () => {
      const source = new Map<string, number>();
      source.set('a', 1);
      source.set('b', 2);
      const json = JSON.stringify(source, replacer);
      const parsed = JSON.parse(json, reviver);
      expect(parsed).toBeInstanceOf(Map);
      expect((parsed as Map<string, number>).get('a')).toBe(1);
      expect((parsed as Map<string, number>).get('b')).toBe(2);
    });

    it('replacer passes plain values through', () => {
      expect(replacer('key', 42)).toBe(42);
      expect(replacer('key', 'hello')).toBe('hello');
    });

    it('reviver passes unknown objects through', () => {
      const input = { foo: 'bar' };
      expect(reviver('key', input)).toBe(input);
    });
  });
});
