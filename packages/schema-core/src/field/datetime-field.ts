import type { MinMaxStringLimit } from './basic-fields';
import { FormField } from './form-field';

// Datetime field (EA-B fan-out, PART C §Datetime). Transplant of 0.3.x
// `src/listgrid/components/fields/DatetimeField.tsx:1-131`, base class
// `abstract/AbstractDateField.tsx:13-83`. Per the Time precedent (EA-A) and
// the briefing's explicit call ("base: 불요(Time 선례로 limit/range 인라인)"),
// AbstractDateField's limit/range meta + withLimit/withRange/withMin/withMax
// builders are inlined directly onto DatetimeField rather than extracted to a
// shared base — Datetime is (like Time was) effectively a single consumer of
// that shape in the new engine.
//
// Value shape: `yyyy-MM-dd'T'HH:mm` string, or a `[start, end]` tuple when
// `range` is true — mirrors the old renderer's FlatPickr datetime range mode.
export type DatetimeFieldValue = string | [string, string];

/**
 * Datetime input, optionally a start/end range. Transplant of
 * `DatetimeField.tsx:22-131` — MINUS the instance `getCurrentValue()`
 * override (:27-41) that resolved a `'today'` sentinel at read time.
 * schema-core has no instance-level runtime-value hook (ADR-0002 — value
 * logic is store-side free functions, not field methods), so per the EA-B
 * briefing's Conductor decision ⑦ the `'today'` sentinel is resolved
 * RENDERER-side (`@listgrid/react`'s datetime-renderer.tsx, cloning the Time
 * precedent), not here. This class stays pure declaration meta: the raw
 * stored value (including the literal string `'today'`) passes through
 * untouched.
 *
 * `limit` is a UI hint only (old engine has no validate()-time enforcement
 * for Datetime — only MonthField does lexicographic limit checks); no such
 * check is invented here (briefing: "limit validate 추가 금지").
 */
export class DatetimeField extends FormField<DatetimeFieldValue> {
  limit?: MinMaxStringLimit;
  range?: boolean;

  constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, 'datetime');
    if (limit !== undefined) this.limit = limit;
    if (range !== undefined) this.range = range;
  }

  /** Transplant of `AbstractDateField.withRange:37-41`. */
  withRange(range?: boolean): this {
    if (range !== undefined) this.range = range;
    else delete this.range;
    return this;
  }

  /** Transplant of `AbstractDateField.withLimit:47-51`. */
  withLimit(limit?: MinMaxStringLimit): this {
    if (limit !== undefined) this.limit = limit;
    else delete this.limit;
    return this;
  }

  /** Transplant of `AbstractDateField.withMin:57-63`. */
  withMin(min?: string): this {
    const newLimit: MinMaxStringLimit = {};
    if (min !== undefined) newLimit.min = min;
    if (this.limit?.max !== undefined) newLimit.max = this.limit.max;
    this.limit = newLimit;
    return this;
  }

  /** Transplant of `AbstractDateField.withMax:69-75`. */
  withMax(max?: string): this {
    const newLimit: MinMaxStringLimit = {};
    if (this.limit?.min !== undefined) newLimit.min = this.limit.min;
    if (max !== undefined) newLimit.max = max;
    this.limit = newLimit;
    return this;
  }
}
