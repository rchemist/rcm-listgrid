import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  fDate,
  fDateTime,
  fTimestamp,
  fToNow,
  formatYearMonth,
  getCurrentYear,
  getCurrentMonth,
  getCurrentYearMonth,
  getCurrentHour,
  getFormattedTime,
  getDefinedDates,
} from '../date';

// Pins TZ=UTC so date-only ISO string inputs (`new Date('2026-01-01')` parses
// as UTC midnight per ECMA-262, then this module reads LOCAL getters) resolve
// deterministically regardless of the machine/CI running this file — same
// rationale as packages/excel/src/__tests__/value-transform.test.ts. Date
// objects built via the local-component constructor (`new Date(y,m,d,h,mi,s)`)
// are already TZ-independent (construction and reads both use local
// semantics), so most cases below don't strictly need the pin — it's kept for
// the handful of string-input cases and for safety/consistency.
const ORIGINAL_TZ = process.env.TZ;
beforeAll(() => {
  process.env.TZ = 'UTC';
});
afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

/**
 * Byte-identical parity with the 0.3.x oracle (src/listgrid/misc/index.ts,
 * date-fns@3.6.0-backed `fDate`/`fDateTime`) — verified against a live
 * `date-fns.format()` call for every pattern below before porting (GX-3).
 */
describe('fDate / fDateTime — byte-identical parity with the date-fns-backed oracle', () => {
  const cases: Array<[Date, string]> = [
    [new Date(2024, 0, 2, 0, 0, 0), '2024-01-02T00:00:00'],
    [new Date(2024, 0, 2, 15, 4, 0), '2024-01-02T15:04:00'],
    [new Date(2024, 5, 9, 9, 5, 3), '2024-06-09T09:05:03'],
    [new Date(2024, 11, 31, 23, 59, 59), '2024-12-31T23:59:59'],
    [new Date(2024, 0, 1, 12, 0, 0), '2024-01-01T12:00:00'],
    [new Date(2024, 0, 1, 0, 5, 9), '2024-01-01T00:05:09'],
  ];

  it.each(cases)('fDate default (yyyy-MM-dd) for %s', (d) => {
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(fDate(d)).toBe(expected);
  });

  it('fDateTime default (yyyy-MM-dd p) — locale-time-short, en-US, unpadded hour', () => {
    expect(fDateTime(new Date(2024, 0, 2, 0, 0, 0))).toBe('2024-01-02 12:00 AM');
    expect(fDateTime(new Date(2024, 0, 2, 15, 4, 0))).toBe('2024-01-02 3:04 PM');
    expect(fDateTime(new Date(2024, 5, 9, 9, 5, 3))).toBe('2024-06-09 9:05 AM');
    expect(fDateTime(new Date(2024, 11, 31, 23, 59, 59))).toBe('2024-12-31 11:59 PM');
    expect(fDateTime(new Date(2024, 0, 1, 12, 0, 0))).toBe('2024-01-01 12:00 PM');
    expect(fDateTime(new Date(2024, 0, 1, 0, 5, 9))).toBe('2024-01-01 12:05 AM');
  });

  it('fDate/fDateTime support HH:mm[:ss] and quoted-literal T patterns (DatetimeField/DateField/RevisionField call sites)', () => {
    const d = new Date(2024, 0, 2, 15, 4, 0);
    expect(fDate(d, 'yyyy-MM-dd HH:mm')).toBe('2024-01-02 15:04');
    expect(fDate(d, "yyyy-MM-dd'T'HH:mm")).toBe('2024-01-02T15:04');
    expect(fDateTime(d, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-02 15:04:00');
    expect(fDateTime(d, 'yyyyMMddHHmmss')).toBe('20240102150400');
  });

  it('fDate returns empty string for falsy input', () => {
    expect(fDate('' as unknown as string)).toBe('');
  });

  it('fDate swallows invalid input (matches the try/catch fallback of the date-fns-backed original)', () => {
    expect(fDate(new Date('invalid'))).toBe('');
  });

  it('fDate throws-then-swallows an unsupported format token instead of silently mis-formatting', () => {
    // 'E' (day-of-week) isn't in the supported token set — this exercises the
    // RangeError branch, still surfacing as '' at the public API boundary.
    expect(fDate(new Date(2024, 0, 2), 'EEEE')).toBe('');
  });

  it('fDateTime and fTimestamp tolerate undefined', () => {
    expect(fDateTime(undefined)).toBe('');
    expect(fTimestamp(undefined)).toBe('');
  });
});

describe('fTimestamp', () => {
  it('returns a numeric millisecond timestamp for a valid date', () => {
    const d = new Date(2024, 0, 1, 0, 0, 0);
    expect(fTimestamp(d)).toBe(d.getTime());
  });

  it('returns empty string for falsy input', () => {
    expect(fTimestamp('')).toBe('');
  });
});

describe('fToNow', () => {
  it('non-relative mode delegates to fDate', () => {
    const d = new Date(2024, 0, 2, 0, 0, 0);
    expect(fToNow(d)).toBe(fDate(d));
  });

  it('returns empty for undefined/falsy input', () => {
    expect(fToNow(undefined)).toBe('');
    expect(fToNow('')).toBe('');
  });

  it('relative mode within the default 1-day threshold returns a Korean Intl.RelativeTimeFormat string', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(fToNow(tenMinutesAgo, { relative: true })).toBe('10분 전');

    const twoHoursAhead = new Date(now.getTime() + 2 * 3600 * 1000);
    expect(fToNow(twoHoursAhead, { relative: true })).toBe('2시간 후');
  });

  it('relative mode falls back to fDate once the diff exceeds diffDays', () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    // default diffDays=1 → 3 days ago exceeds the threshold → absolute date.
    expect(fToNow(threeDaysAgo, { relative: true })).toBe(fDate(threeDaysAgo));
    // widening diffDays to 5 brings it back into relative range.
    expect(fToNow(threeDaysAgo, { relative: true, diffDays: 5 })).toBe('3일 전');
  });

  it('relative mode picks minute/hour/day/month/year Intl units by magnitude', () => {
    const now = new Date();
    expect(fToNow(new Date(now.getTime() - 45 * 1000), { relative: true, diffDays: 400 })).toBe(
      '45초 전',
    );
    expect(
      fToNow(new Date(now.getTime() - 3 * 24 * 3600 * 1000), { relative: true, diffDays: 400 }),
    ).toBe('3일 전');
  });
});

describe('formatYearMonth', () => {
  it('converts dashed YYYY-MM to "YYYY년 MM월"', () => {
    expect(formatYearMonth('2024-03')).toBe('2024년 03월');
  });

  it('converts dotted YYYY.MM to "YYYY년 MM월"', () => {
    expect(formatYearMonth('2024.03')).toBe('2024년 03월');
  });

  it('converts 6-digit numeric input (via string coercion)', () => {
    expect(formatYearMonth(202403)).toBe('2024년 03월');
  });

  it('short inputs are returned verbatim', () => {
    expect(formatYearMonth('2024')).toBe('2024');
  });

  it('returns empty string for falsy input', () => {
    expect(formatYearMonth(undefined)).toBe('');
  });
});

describe('current-time helpers', () => {
  it('getCurrentYear returns the current year', () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
  });

  it('getCurrentMonth returns 1-12 as a string', () => {
    const m = Number(getCurrentMonth());
    expect(m).toBeGreaterThanOrEqual(1);
    expect(m).toBeLessThanOrEqual(12);
  });

  it('getCurrentYearMonth returns YYYY-MM', () => {
    expect(getCurrentYearMonth()).toMatch(/^\d{4}-\d{2}$/);
  });

  it('getCurrentHour returns 2-digit hour', () => {
    expect(getCurrentHour()).toMatch(/^\d{2}$/);
  });
});

describe('getFormattedTime', () => {
  it('applies hour and minute offsets', () => {
    const d = new Date(2024, 0, 1, 12, 30, 0);
    expect(getFormattedTime(d, 1, -5)).toBe('13:25');
  });

  it('pads single-digit hours/minutes to 2 chars', () => {
    const d = new Date(2024, 0, 1, 5, 7, 0);
    expect(getFormattedTime(d, 0, 0)).toBe('05:07');
  });
});

describe('getDefinedDates', () => {
  it('returns a [start, end] pair covering today', () => {
    const [start, end] = getDefinedDates('TODAY');
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(start!.getHours()).toBe(0);
    expect(end!.getHours()).toBe(23);
  });

  it('WEEK rewinds 7 days', () => {
    const [start, end] = getDefinedDates('WEEK');
    const diff = end!.getTime() - start!.getTime();
    expect(diff).toBeGreaterThan(6 * 24 * 3600 * 1000);
    expect(diff).toBeLessThan(8 * 24 * 3600 * 1000);
  });

  it('MONTH / MONTH3 / MONTH6 / YEAR each return a start before end', () => {
    for (const t of ['MONTH', 'MONTH3', 'MONTH6', 'YEAR'] as const) {
      const [start, end] = getDefinedDates(t);
      expect(start!.getTime()).toBeLessThan(end!.getTime());
    }
  });
});
