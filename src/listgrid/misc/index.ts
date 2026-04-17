// Stage 3c — miscellaneous exports that the original `@gjcu/ui` root barrel
// provided. Mix of regex patterns, simple formatters, storage helpers, API
// stubs, and configurable constants.
//
// Pure, portable helpers are implemented here. Host-specific concerns (API
// calls, full-featured date formatting with i18n) defer to their respective
// Stage 5 / future stages.

// -- Regex patterns --------------------------------------------------------
export const RegexAlias = /^[a-zA-Z0-9_-]{3,32}$/;
export const RegexEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RegexLowerEnglishNumber = /^[a-z0-9]+$/;
export const RegexPasswordNormal = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const RegexPhoneNumber = /^01[016789]-?\d{3,4}-?\d{4}$/;
export const RegexTelephoneNumber = /^(0\d{1,2})-?\d{3,4}-?\d{4}$/;
export const RegexUrlBody = /^https?:\/\/[^\s]+$/;

// -- Date formatters (minimal) --------------------------------------------
function pad(n: number): string {
    return n < 10 ? '0' + n : String(n);
}

function applyFormat(d: Date, fmt: string): string {
    return fmt
        .replace(/yyyy/g, String(d.getFullYear()))
        .replace(/yy/g, String(d.getFullYear()).slice(-2))
        .replace(/MM/g, pad(d.getMonth() + 1))
        .replace(/dd/g, pad(d.getDate()))
        .replace(/HH/g, pad(d.getHours()))
        .replace(/mm/g, pad(d.getMinutes()))
        .replace(/ss/g, pad(d.getSeconds()));
}

export function fDate(value: any, format?: string): string {
    if (!value) return '';
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return format
            ? applyFormat(d, format)
            : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
        return String(value);
    }
}

export function fDateTime(value: any, format?: string): string {
    if (!value) return '';
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return format
            ? applyFormat(d, format)
            : `${fDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
        return String(value);
    }
}

export function fToNow(value: any): string {
    // Minimal "N days ago" style. Host apps with i18n/relative-time needs override.
    if (!value) return '';
    try {
        const d = value instanceof Date ? value : new Date(value);
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return '방금';
        if (mins < 60) return `${mins}분 전`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    } catch {
        return String(value);
    }
}

export function getFormattedTime(value?: any, offsetHours?: number): string {
    const base = value ? (value instanceof Date ? value : new Date(value)) : new Date();
    if (isNaN(base.getTime())) return String(value ?? '');
    const d = offsetHours ? new Date(base.getTime() + offsetHours * 3600 * 1000) : base;
    return fDateTime(d);
}

export function formatPrice(value: any, currency: string = 'KRW'): string {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (isNaN(n)) return String(value);
    const opts: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    };
    try {
        return new Intl.NumberFormat('ko-KR', opts).format(n);
    } catch {
        return String(n);
    }
}

// -- Comparison / validation helpers --------------------------------------
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

export function isEquals(a: any, b: any): boolean {
    return a === b;
}

export function isEqualsIgnoreCase(a: any, b: any): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return a === b;
    return a.toLowerCase() === b.toLowerCase();
}

export function isEqualCollection<T>(
    a: readonly T[] | null | undefined,
    b: readonly T[] | null | undefined,
    ignoreOrder?: boolean
): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    if (ignoreOrder) {
        const sortedA = [...a].map(String).sort();
        const sortedB = [...b].map(String).sort();
        return sortedA.every((v, i) => v === sortedB[i]);
    }
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function isPositive(value: any): boolean {
    const n = Number(value);
    return !isNaN(n) && n > 0;
}

export function normalizeUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url.replace(/\/+$/g, '').replace(/\\/g, '/');
}

export function removeTrailingSeparator(value: string | null | undefined, sep: string = '/'): string {
    if (!value) return '';
    let s = value;
    while (s.endsWith(sep)) s = s.slice(0, -sep.length);
    return s;
}

export function parse<T = any>(value: string | null | undefined, fallback?: T): T {
    if (!value) return fallback as T;
    try {
        return JSON.parse(value);
    } catch {
        return fallback as T;
    }
}

// -- Storage helpers -------------------------------------------------------
function safeLocalStorage(): Storage | null {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

function safeSessionStorage(): Storage | null {
    return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
}

export function getLocalStorageItem(key: string): string | null {
    return safeLocalStorage()?.getItem(key) ?? null;
}

export function setLocalStorageItem(key: string, value: string): void {
    safeLocalStorage()?.setItem(key, value);
}

export function getSessionStorageObject<T = any>(
    key: string,
    reviver?: (raw: string) => T
): T | undefined {
    const raw = safeSessionStorage()?.getItem(key);
    if (!raw) return undefined;
    try {
        if (reviver) return reviver(raw);
        return JSON.parse(raw) as T;
    } catch {
        return undefined;
    }
}

export function setSessionStorageItem(key: string, value: any): void {
    const s = safeSessionStorage();
    if (!s) return;
    s.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

// -- Configurable constants ------------------------------------------------
let _assetServerUrl: string = '';

export function configureAssetServerUrl(url: string): void {
    _assetServerUrl = url.replace(/\/+$/, '');
}

export const ASSET_SERVER_URL: any = {
    toString() {
        return _assetServerUrl;
    },
    valueOf() {
        return _assetServerUrl;
    },
    get url() {
        return _assetServerUrl;
    },
};

export function getAccessableAssetUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return _assetServerUrl ? `${_assetServerUrl}/${path.replace(/^\/+/, '')}` : path;
}

export function removeAssetServerPrefix(value: string | null | undefined): string {
    if (!value || !_assetServerUrl) return value ?? '';
    return value.startsWith(_assetServerUrl) ? value.slice(_assetServerUrl.length).replace(/^\/+/, '') : value;
}

// -- DefinedDate helpers (stub) -------------------------------------------
// The original exported a DefinedDateType enum + helpers for common ranges
// ("이번 주", "이번 달", etc.). Stub a minimal enum; host apps can override.
export type DefinedDateType = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | string;

export function getDefinedDates(type: DefinedDateType): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    if (type === 'yesterday') {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
    } else if (type === 'this-week') {
        start.setDate(start.getDate() - start.getDay());
    } else if (type === 'last-week') {
        start.setDate(start.getDate() - start.getDay() - 7);
        end.setDate(end.getDate() - end.getDay() - 1);
    } else if (type === 'this-month') {
        start.setDate(1);
    } else if (type === 'last-month') {
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
    }
    return { start, end };
}

// -- API re-exports (host-supplied ApiClient; see src/listgrid/api) --------
export {
    callExternalHttpRequest,
    getExternalApiData,
    getExternalApiDataWithError,
} from '../api';

// -- Other -----------------------------------------------------------------
export const RequestUtil: any = {};
export type EntityError = any;
export const EntityError: any = undefined;

// ResponseData re-exported from the api module (Stage 5).
export { ResponseData } from '../api';

// Re-export common utils for convenience so downstream code that used
// `from "../misc"` barrel-style still gets isEmpty etc. via our unified barrel.
