import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  stringify,
  parse,
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
  getLocalStorageObject,
  setSessionStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  getSessionStorageObject,
} from '../storage';

describe('JSON helpers', () => {
  it('stringify handles plain objects', () => {
    expect(stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('stringify beautifies when beautify=true', () => {
    expect(stringify({ a: 1 }, true)).toContain('\n');
  });

  it('stringify preserves Maps as plain objects', () => {
    expect(stringify(new Map([['a', 1]]))).toBe('{"a":1}');
  });

  it('stringify preserves Sets as arrays', () => {
    expect(stringify(new Set(['a', 'b']))).toBe('["a","b"]');
  });

  it('stringify avoids infinite recursion on circular references', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(() => stringify(a)).not.toThrow();
  });

  it('parse revives dataType:"Map" envelopes into Maps (wire-compat with 0.3.x hosts)', () => {
    const json = JSON.stringify({ dataType: 'Map', value: [['a', 1]] });
    const result = parse(json) as Map<string, number>;
    expect(result).toBeInstanceOf(Map);
    expect(result.get('a')).toBe(1);
  });

  it('parse returns plain objects when no Map envelope is present', () => {
    expect(parse('{"a":1}')).toEqual({ a: 1 });
  });
});

describe('localStorage helpers (jsdom-backed)', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it('set + get round-trips a string value', () => {
    setLocalStorageItem('key', 'hello');
    expect(getLocalStorageItem('key')).toBe('hello');
  });

  it('removeLocalStorageItem clears the value', () => {
    setLocalStorageItem('key', 'hello');
    removeLocalStorageItem('key');
    expect(getLocalStorageItem('key')).toBeUndefined();
  });

  it('expired items return undefined (CachedStorageItem wrapper)', () => {
    setLocalStorageItem('key', 'hello', -1); // immediately expired
    expect(getLocalStorageItem('key')).toBeUndefined();
  });

  it('getLocalStorageItem returns undefined for a missing key', () => {
    expect(getLocalStorageItem('does-not-exist')).toBeUndefined();
  });

  it('getLocalStorageObject parses a JSON payload', () => {
    setLocalStorageItem('k', '{"a":1}');
    expect(getLocalStorageObject<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('getLocalStorageObject supports a custom parse fn', () => {
    setLocalStorageItem('k', 'plain');
    expect(getLocalStorageObject<string>('k', (v) => v.toUpperCase())).toBe('PLAIN');
  });
});

describe('sessionStorage helpers (jsdom-backed)', () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it('set + get round-trips a string value', () => {
    setSessionStorageItem('key', 'hello');
    expect(getSessionStorageItem('key')).toBe('hello');
  });

  it('remove clears the value', () => {
    setSessionStorageItem('key', 'hello');
    removeSessionStorageItem('key');
    expect(getSessionStorageItem('key')).toBeUndefined();
  });

  it('getSessionStorageObject parses JSON', () => {
    setSessionStorageItem('k', '{"x":2}');
    expect(getSessionStorageObject<{ x: number }>('k')).toEqual({ x: 2 });
  });

  it('getSessionStorageObject returns undefined for a missing key', () => {
    expect(getSessionStorageObject('missing')).toBeUndefined();
  });
});
