// Stage 3c — miscellaneous utilities that the original kit's root barrel
// provided. Ported to match the original semantics exactly so library-internal
// callers (DatetimeField, FormField, PasswordValidation, etc.) behave the same
// as before extraction.
//
// Sources (in utils/):
//   validation.ts, formatTime.ts, NumberUtil.ts, CompareUtil.ts, Server.ts,
//   StringUtil.ts, RequestUtil.ts, jsonUtils.ts, BooleanUtil.ts,
//   LocalStorageUtils.ts, SessionStorageUtil.ts

import { format, formatDistanceToNow, getTime } from 'date-fns';
import { ko } from 'date-fns/locale';

// -- Regex patterns --------------------------------------------------------
// From validation.ts. These are the exact originals — changing them breaks
// validators (PasswordValidation, PhoneNumberValidation, etc.).
export const RegexPhoneNumber: RegExp = /^[0-9]{10,11}$/;
export const RegexTelephoneNumber: RegExp = /^[0-9]{9,11}$/;
export const RegexPasswordNormal: RegExp =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&+~()=_-])[A-Za-z\d@$!%*#?&+~()=_-]{8,25}$/;
export const RegexEmailAddress: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export const RegexKoreanName: RegExp = /^[가-힣]{2,5}$/;
export const RegexLoginName: RegExp = /^[a-z][a-z0-9]{4,23}$/;
export const RegexLoginNameForSignIn: RegExp = /^[a-zA-Z][a-zA-Z0-9._-]{1,23}$/;
export const RegexStudentLoginName: RegExp = /^\d{10}$/;
export const RegexAlias: RegExp = /^[a-z0-9-_]{3,24}$/;
export const RegexUrlBody: RegExp = /^[a-zA-Z0-9-\/가-힣]{2,100}$/;
export const RegexDomain: RegExp = /^(https?:\/\/)[^\s\/$.?#].[^\s]*[^\/?]$/;
export const RegexLowerEnglish: RegExp = /^[a-z]{1,100}$/;
export const RegexLowerEnglishNumber: RegExp = /^[a-z0-9]{1,100}$/;
export const RegexEnglishNumber: RegExp = /^[a-zA-Z0-9]{1,100}$/;
export const RegexNumber: RegExp = /^[0-9]{1,100}$/;

// -- Boolean helper (subset of BooleanUtil used by CompareUtil) ------------
function isTrue(value: boolean | string | undefined | unknown, defaultValue?: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue ?? false;
  }
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 'on' || value === 'yes' || value === '예';
}

// -- String helpers (subset of StringUtil used by library-internal callers) -
function isBlank(data: unknown): boolean {
  return data === undefined || data === null || data === '';
}

// -- Date formatters (from formatTime.ts) ----------------------------------
export function fDate(date: Date | string, dateFormat?: string): string {
  const fm = dateFormat ?? 'yyyy-MM-dd';
  try {
    return date ? format(new Date(date), fm) : '';
  } catch {
    return '';
  }
}

export function fDateTime(date: Date | string | undefined, newFormat?: string): string {
  const fm = newFormat ?? 'yyyy-MM-dd p';
  try {
    return date ? format(new Date(date), fm) : '';
  } catch {
    return '';
  }
}

export function fTimestamp(date: Date | string | undefined): number | string {
  try {
    return date ? getTime(new Date(date)) : '';
  } catch {
    return '';
  }
}

export interface FToNowOptions {
  relative?: boolean;
  format?: string;
  diffDays?: number;
}

export function fToNow(date: Date | string | undefined, options?: FToNowOptions): string {
  try {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const opts = options ?? {};
    if (!opts.relative) {
      return fDate(d, opts.format);
    }
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days > (opts.diffDays ?? 1)) {
      return fDate(d, opts.format);
    }
    return formatDistanceToNow(d, { addSuffix: true, locale: ko });
  } catch {
    return '';
  }
}

export function formatYearMonth(date: string | number | undefined): string {
  if (!date) return '';
  if (typeof date === 'number') return formatYearMonth(date.toString());
  if (date.length < 6) return date;
  if (date.includes('-')) return date.split('-')[0] + '년 ' + date.split('-')[1] + '월';
  if (date.includes('.')) return date.split('.')[0] + '년 ' + date.split('.')[1] + '월';
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  return `${year}년 ${month}월`;
}

function paddingMonth(mon: number): string | number {
  return mon < 10 ? `0${mon}` : mon;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): string {
  return new Date().getMonth() + 1 + '';
}

export function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${paddingMonth(d.getMonth() + 1)}`;
}

export function getCurrentHour(): string {
  const h = new Date().getHours();
  return h < 10 ? `0${h}` : `${h}`;
}

// Mutates the input date — matches original signature/behavior.
export function getFormattedTime(
  date: Date = new Date(),
  hourOffset: number = 0,
  minuteOffset: number = 0,
): string {
  date.setHours(date.getHours() + hourOffset);
  date.setMinutes(date.getMinutes() + minuteOffset);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hh}:${mm}`;
}

// -- NumberUtil.formatPrice ------------------------------------------------
export function formatPrice(value: number, localeCode?: string): string {
  if (localeCode) {
    try {
      return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'KRW' }).format(
        value,
      );
    } catch {
      /* fall through */
    }
  }
  const formattedNumber = value.toLocaleString('en-US');
  if (localeCode === '원') return `${formattedNumber} 원`;
  if (localeCode) return `${localeCode}${formattedNumber}`;
  return formattedNumber;
}

// -- CompareUtil -----------------------------------------------------------
export function isNulls(value: unknown, other: unknown): boolean {
  if (value === undefined && other === undefined) return true;
  if (value === undefined) {
    if (other === null) return true;
    if (other === '') return true;
  } else if (other === undefined) {
    if (value === null) return true;
    if (value === '') return true;
  }
  return false;
}

export function isEquals(value: unknown, other: unknown): boolean {
  if (isNulls(value, other)) return true;
  if (value === other) return true;

  // plain object deep comparison (matches original CompareUtil.isEquals)
  if (
    typeof value === 'object' &&
    typeof other === 'object' &&
    value !== null &&
    other !== null &&
    !Array.isArray(value) &&
    !Array.isArray(other)
  ) {
    const a = value as Record<string, unknown>;
    const b = other as Record<string, unknown>;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => keysB.includes(key) && isEquals(a[key], b[key]));
  }
  return false;
}

export function isEqualsIgnoreCase(
  value: string | null | undefined,
  other: string | null | undefined,
): boolean {
  if (isNulls(value, other)) return true;
  if (value == null || other == null) return false;
  return value.toLowerCase() === other.toLowerCase();
}

export function isEqualCollection(
  value: unknown[],
  other: unknown[],
  ignoreOrder: boolean = false,
): boolean {
  if (value.length !== other.length) return false;
  if (isTrue(ignoreOrder)) {
    return value.every((v) => other.includes(v));
  }
  return value.every((v, i) => isEquals(v, other[i]));
}

export function isEmpty(collection: Map<unknown, unknown> | unknown[] | undefined | null): boolean {
  if (collection === undefined || collection === null) return true;
  if (collection instanceof Map) return collection.size === 0;
  return collection.length === 0;
}

export function isPositive(value?: number): boolean {
  if (value === undefined || value === null) return false;
  return value > 0;
}

export function isNegative(value?: number): boolean {
  if (value === undefined || value === null) return false;
  return value < 0;
}

// -- URL helpers -----------------------------------------------------------
// From RequestUtil.normalizeUrl — prefixes '/' for relative paths, preserves
// absolute http(s) URLs. NOT the trailing-slash variant previously here.
export function normalizeUrl(url: string): string {
  if (isBlank(url)) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!trimmed.startsWith('/')) return `/${trimmed}`;
  return trimmed;
}

// From StringUtil.removeTrailingSeparator — separator is REQUIRED and the
// logic strips the trailing segment up to (and including) the last separator.
export function removeTrailingSeparator(input: string, separator: string): string {
  const parts = input.split(separator);
  const lastPart = parts[parts.length - 1]!;
  if (lastPart.trim() !== '') {
    return input.slice(0, input.lastIndexOf(separator));
  }
  return input;
}

// -- JSON helpers (from jsonUtils.ts) --------------------------------------
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
// `parse<T>(str)` or `parse(str) as T`. This is stricter than prior `any`
// contract and nudges consumers toward explicit schema knowledge.
export function parse<T = unknown>(str: string): T {
  return JSON.parse(str, reviver) as T;
}

// -- Storage helpers (from LocalStorageUtils.ts / SessionStorageUtil.ts) ---
// Matches the original CachedStorageItem wrapper exactly so data written by
// host code (or by older versions of the library) remains readable.
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

// -- Server / asset URL helpers (from Server.ts) ---------------------------
// Originals are module-level constants pulled from env. Library-consumer
// Next.js bundles substitute NEXT_PUBLIC_* at build time, so this reads the
// same env var and matches the original shape (plain strings, not Proxies).
export const ASSET_SERVER_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) ||
  'http://127.0.0.1:8320';

export const ASSET_PREFIX: string = '/static-resource/';

// Host-configuration override — hosts that set the env var don't need this;
// hosts that bootstrap at runtime (non-Next environments) can override here.
let _assetServerUrlOverride: string | undefined;
let _assetPrefixOverride: string | undefined;

export function configureAssetServerUrl(url: string): void {
  _assetServerUrlOverride = url.replace(/\/+$/, '');
}

export function configureAssetPrefix(prefix: string): void {
  _assetPrefixOverride = prefix;
}

function effectiveAssetServerUrl(): string {
  return _assetServerUrlOverride ?? ASSET_SERVER_URL;
}

function effectiveAssetPrefix(): string {
  return _assetPrefixOverride ?? ASSET_PREFIX;
}

export function getAccessableAssetUrl(imgUrl: string | null | undefined): string {
  if (!imgUrl) return '';
  let u = removeAssetServerPrefix(imgUrl);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) u = u.substring(1);
  return effectiveAssetServerUrl() + effectiveAssetPrefix() + u;
}

export function removeAssetServerPrefix(url: string | null | undefined): string {
  if (!url) return '';
  let u = url;
  const server = effectiveAssetServerUrl();
  const prefix = effectiveAssetPrefix();
  if (u.startsWith(server)) u = u.substring(server.length);
  if (u.startsWith(prefix)) u = u.substring(prefix.length);
  // URL-encode each path segment; keeps '/' untouched so callers can
  // concatenate the result with a base URL as before.
  return u.split('/').map(encodeURIComponent).join('/');
}

export function validatedAssetFileName(fileName: string): string {
  fileName = fileName.replace(/ /g, '_');
  fileName = fileName.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '_');
  return fileName;
}

// -- DefinedDate helpers (from formatTime.ts) ------------------------------
export type DefinedDateType = 'TODAY' | 'WEEK' | 'MONTH' | 'MONTH3' | 'MONTH6' | 'YEAR';

export function getDefinedDates(type: DefinedDateType): Date[] {
  const now = new Date();
  const start = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (type === 'TODAY') {
    start.setHours(0, 0, 0, 0);
  } else if (type === 'WEEK') {
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'MONTH') {
    start.setMonth(now.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'MONTH3') {
    start.setMonth(now.getMonth() - 3);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'MONTH6') {
    start.setMonth(now.getMonth() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'YEAR') {
    start.setFullYear(now.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
  }
  return [start, end];
}

// -- API re-exports (host-supplied ApiClient; see src/listgrid/api) --------
export { callExternalHttpRequest, getExternalApiData, getExternalApiDataWithError } from '../api';

// -- Other -----------------------------------------------------------------
// intentional: legacy placeholders kept for API parity with the original kit surface
// (consumers dereference fields on these dynamically — tightening breaks out-of-scope)
export const RequestUtil: any = {};
export type EntityError = any;
export const EntityError: any = undefined;

export { ResponseData } from '../api';
