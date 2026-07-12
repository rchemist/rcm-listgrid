// Date formatters — hand-rolled zero-dependency port of src/listgrid/misc/index.ts
// (0.3.x formatTime.ts, backed there by `date-fns`). GX-3 decision (2026-07-12,
// w7-post-seal-gap-analysis.md §GX-3 OQ①): 0.4's whole thesis is minimal
// footprint (peers 26→6, schema-core React-runtime-0) — forcing `date-fns` on
// every consumer of this package would contradict that. `date-fns` stays a
// devDependency of the repo root only; it is NOT a dependency of this package.
//
// `fDate`/`fDateTime`'s `dateFormat`/`newFormat` parameter accepts a small,
// FIXED token vocabulary (see `formatToken` below) — exactly the tokens the
// 0.3.x call sites actually use (`yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, the
// locale-time-short `p` token, and single-quoted literals like `'T'`).
// Verified byte-identical against `date-fns@3.6.0`'s `format()` for every
// format string found across the 0.3.x oracle (see __tests__/date.test.ts).
// An unsupported token throws (mirrors date-fns's own "unescaped latin
// alphabet character" failure mode) rather than silently mis-formatting.

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

function formatToken(d: Date, token: string, len: number): string {
  switch (token) {
    case 'y':
      return len >= 4 ? String(d.getFullYear()) : pad(d.getFullYear() % 100);
    case 'M': {
      const m = d.getMonth() + 1;
      return len >= 2 ? pad(m) : String(m);
    }
    case 'd': {
      const day = d.getDate();
      return len >= 2 ? pad(day) : String(day);
    }
    case 'H': {
      const h = d.getHours();
      return len >= 2 ? pad(h) : String(h);
    }
    case 'm': {
      const mi = d.getMinutes();
      return len >= 2 ? pad(mi) : String(mi);
    }
    case 's': {
      const s = d.getSeconds();
      return len >= 2 ? pad(s) : String(s);
    }
    case 'p': {
      // date-fns's locale-time-short token, en-US form (no call site passes
      // a locale, so date-fns's own default renders in English) — e.g.
      // "3:04 PM" / "12:00 AM". Hour is NOT zero-padded (date-fns parity).
      const h24 = d.getHours();
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      return `${h12}:${pad(d.getMinutes())} ${ampm}`;
    }
    default:
      throw new RangeError(
        `@listgrid/utils date formatter: unsupported format token "${token.repeat(len)}" ` +
          '(supported: y, M, d, H, m, s, p, and \'single-quoted\' literals)',
      );
  }
}

/** Formats `d` against a fixed-token pattern (see module doc). Throws
 *  `RangeError` for an invalid Date or an unsupported token — callers
 *  (`fDate`/`fDateTime`) catch and translate to `''`, matching the 0.3.x
 *  date-fns-backed originals' `try { ... } catch { return '' }` contract. */
function formatDatePattern(d: Date, pattern: string): string {
  if (Number.isNaN(d.getTime())) {
    throw new RangeError('Invalid time value');
  }
  let out = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i]!;
    if (ch === "'") {
      let j = i + 1;
      let literal = '';
      while (j < pattern.length && pattern[j] !== "'") {
        literal += pattern[j];
        j++;
      }
      out += literal;
      i = j + 1;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < pattern.length && pattern[j] === ch) j++;
      out += formatToken(d, ch, j - i);
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function fDate(date: Date | string, dateFormat?: string): string {
  const fm = dateFormat ?? 'yyyy-MM-dd';
  try {
    return date ? formatDatePattern(new Date(date), fm) : '';
  } catch {
    return '';
  }
}

export function fDateTime(date: Date | string | undefined, newFormat?: string): string {
  const fm = newFormat ?? 'yyyy-MM-dd p';
  try {
    return date ? formatDatePattern(new Date(date), fm) : '';
  } catch {
    return '';
  }
}

export function fTimestamp(date: Date | string | undefined): number | string {
  try {
    return date ? new Date(date).getTime() : '';
  } catch {
    return '';
  }
}

export interface FToNowOptions {
  relative?: boolean;
  format?: string;
  diffDays?: number;
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

/** Korean relative-time string via the built-in, zero-dependency
 *  `Intl.RelativeTimeFormat` — GX-3 decision: replaces date-fns's
 *  `formatDistanceToNow(d, { addSuffix: true, locale: ko })`. Not required
 *  to reproduce date-fns's exact bucket thresholds byte-for-byte (decision
 *  explicitly swaps the implementation, not just the wording) — this picks
 *  the largest sensible unit the same way most relative-time helpers do. */
function toRelativeKorean(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
  if (absMs < MINUTE_MS) return rtf.format(Math.round(diffMs / SECOND_MS), 'second');
  if (absMs < HOUR_MS) return rtf.format(Math.round(diffMs / MINUTE_MS), 'minute');
  if (absMs < DAY_MS) return rtf.format(Math.round(diffMs / HOUR_MS), 'hour');
  if (absMs < MONTH_MS) return rtf.format(Math.round(diffMs / DAY_MS), 'day');
  if (absMs < YEAR_MS) return rtf.format(Math.round(diffMs / MONTH_MS), 'month');
  return rtf.format(Math.round(diffMs / YEAR_MS), 'year');
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
    const days = Math.ceil(diff / DAY_MS);
    if (days > (opts.diffDays ?? 1)) {
      return fDate(d, opts.format);
    }
    return toRelativeKorean(d, now);
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

// Mutates the input date — matches original signature/behavior (misc/index.ts).
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
