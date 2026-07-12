// JSON + localStorage/sessionStorage helpers — transplanted verbatim from
// src/listgrid/misc/index.ts (0.3.x jsonUtils.ts, LocalStorageUtils.ts,
// SessionStorageUtil.ts). GX-3. React-free, zero runtime dependencies.
// May use browser globals (`window`/`localStorage`/`sessionStorage`) guarded
// by `safeWindow()` — SSR-safe (returns undefined/no-ops when unavailable).

import { isBlank } from './internal';

// -- JSON helpers ------------------------------------------------------------

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null) {
    const record = value as { dataType?: string; value?: Iterable<readonly [unknown, unknown]> };
    if (record.dataType === 'Map' && record.value) {
      return new Map(record.value);
    }
  }
  return value;
}

function mapReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Set) return [...value];
  return value;
}

export function stringify(obj: unknown, beautify?: boolean): string {
  const seen = new WeakSet<object>();
  const circularSafeReplacer = (key: string, value: unknown): unknown => {
    const mapped = mapReplacer(key, value);
    if (typeof mapped !== 'object' || mapped === null) return mapped;
    if (seen.has(mapped as object)) return '[Circular Reference]';
    seen.add(mapped as object);
    return mapped;
  };
  try {
    return beautify
      ? JSON.stringify(obj, circularSafeReplacer, 2)
      : JSON.stringify(obj, circularSafeReplacer);
  } catch (e) {
    console.error('stringify error:', e);
    return '{}';
  }
}

// Generic JSON parser with Map reviver support.
// Default type parameter is `unknown` — callers should narrow explicitly via
// `parse<T>(str)` or `parse(str) as T`. This is stricter than the prior `any`
// contract and nudges consumers toward explicit schema knowledge.
export function parse<T = unknown>(str: string): T {
  return JSON.parse(str, reviver) as T;
}

// -- Storage helpers ---------------------------------------------------------
// Matches the original CachedStorageItem wrapper exactly so data written by
// host code (or by older 0.3.x-era hosts) remains readable — wire-compat.
class CachedStorageItem {
  private readonly value: string;
  private readonly expiry: number | undefined;

  constructor(value: string, expiry?: number) {
    this.value = value;
    this.expiry = expiry;
  }

  static create(props: { value: string; expiry?: number }): CachedStorageItem {
    return new CachedStorageItem(props.value, props.expiry);
  }

  isAvailable(): boolean {
    if (this.expiry) return Date.now() <= this.expiry;
    return true;
  }

  getData(): string | undefined {
    if (!this.isAvailable()) return undefined;
    return this.value;
  }
}

function safeWindow(): boolean {
  return typeof window !== 'undefined';
}

export function removeLocalStorageItem(key: string): void {
  if (!safeWindow()) return;
  localStorage.removeItem(key);
}

export function setLocalStorageItem(key: string, value: string, expirySeconds?: number): void {
  if (!safeWindow()) return;
  const item = new CachedStorageItem(
    value,
    expirySeconds ? Date.now() + expirySeconds * 1000 : undefined,
  );
  localStorage.setItem(key, stringify(item));
}

export function getLocalStorageItem(key: string): string | undefined {
  if (!safeWindow()) return undefined;
  const itemJson = localStorage.getItem(key);
  if (!itemJson) return undefined;
  try {
    const item = CachedStorageItem.create({
      ...parse<{ value: string; expiry?: number }>(itemJson),
    });
    if (item.isAvailable()) return item.getData();
    localStorage.removeItem(key);
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

export function getLocalStorageObject<T>(
  key: string,
  customParse?: (value: string) => T | undefined,
): T | undefined {
  const value = getLocalStorageItem(key);
  if (isBlank(value)) return undefined;
  if (customParse !== undefined) return customParse(value!);
  return parse<T>(value!);
}

export function removeSessionStorageItem(key: string): void {
  if (!safeWindow()) return;
  sessionStorage.removeItem(key);
}

export function setSessionStorageItem(key: string, value: string, expirySeconds?: number): void {
  if (!safeWindow()) return;
  const item = new CachedStorageItem(
    value,
    expirySeconds ? Date.now() + expirySeconds * 1000 : undefined,
  );
  sessionStorage.setItem(key, stringify(item));
}

export function getSessionStorageItem(key: string): string | undefined {
  if (!safeWindow()) return undefined;
  const itemJson = sessionStorage.getItem(key);
  if (!itemJson) return undefined;
  try {
    const obj = parse<{ value: string; expiry?: number }>(itemJson);
    const item = new CachedStorageItem(obj.value, obj.expiry);
    if (item.isAvailable()) return item.getData();
    sessionStorage.removeItem(key);
  } catch {
    sessionStorage.removeItem(key);
  }
  return undefined;
}

export function getSessionStorageObject<T>(
  key: string,
  customParse?: (value: string) => T | undefined,
): T | undefined {
  const value = getSessionStorageItem(key);
  if (value === undefined) return undefined;
  if (customParse !== undefined) return customParse(value);
  return parse<T>(value!);
}
