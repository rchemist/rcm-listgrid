import { describe, it, expect } from 'vitest';
import { createParser, parseAsString, type UrlParser } from './types';

/**
 * `createParser` and `parseAsString` are pure factory/constant exports. Tests
 * assert the parse/serialize contract and that createParser does not mutate or
 * share state with its input.
 */

describe('parseAsString', () => {
  it('parse returns the input string verbatim', () => {
    expect(parseAsString.parse('hello')).toBe('hello');
    expect(parseAsString.parse('')).toBe('');
  });

  it('serialize returns the input string verbatim', () => {
    expect(parseAsString.serialize('world')).toBe('world');
    expect(parseAsString.serialize('')).toBe('');
  });

  it('is usable as a UrlParser<string>', () => {
    // Structural check — if parseAsString did not match the interface, TS
    // would have flagged it. The runtime assertion keeps it meaningful.
    const parser: UrlParser<string> = parseAsString;
    expect(typeof parser.parse).toBe('function');
    expect(typeof parser.serialize).toBe('function');
  });
});

describe('createParser', () => {
  it('returns an object exposing the same parse / serialize functions', () => {
    const parse = (v: string) => Number(v);
    const serialize = (v: number) => String(v);
    const parser = createParser<number>({ parse, serialize });
    expect(parser.parse('42')).toBe(42);
    expect(parser.serialize(42)).toBe('42');
  });

  it('preserves an optional eq comparator', () => {
    const eq = (a: number, b: number) => a === b;
    const parser = createParser<number>({
      parse: (v) => Number(v),
      serialize: (v) => String(v),
      eq,
    });
    expect(parser.eq).toBe(eq);
    expect(parser.eq!(1, 1)).toBe(true);
    expect(parser.eq!(1, 2)).toBe(false);
  });

  it('is defensive against mutation of the returned object (new identity)', () => {
    const input: UrlParser<string> = {
      parse: (v) => v,
      serialize: (v) => v,
    };
    const parser = createParser(input);
    expect(parser).not.toBe(input);
  });

  it('round-trips null when parse returns null', () => {
    const parser = createParser<number | null>({
      parse: (v) => (v === '' ? null : Number(v)),
      serialize: (v) => (v === null ? '' : String(v)),
    });
    expect(parser.parse('')).toBeNull();
    expect(parser.serialize(null)).toBe('');
  });
});
