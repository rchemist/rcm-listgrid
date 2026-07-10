import type { MinMaxStringLimit } from './basic-fields';
import { FormField } from './form-field';

// Time field (EA-A fan-out, PART 2 §Time). Transplant of 0.3.x
// `src/listgrid/components/fields/TimeField.tsx:13-59`, base class
// `abstract/AbstractDateField.tsx:13-83`. AbstractDateField has exactly one
// 0.3.x consumer (Time — Month does NOT extend it, `basic-fields.ts`
// MonthField note), so per PART 3 ("단일 소비자라 base 미이식") its
// limit/range meta + withLimit/withRange/withMin/withMax builders are
// inlined directly onto TimeField rather than extracted to a shared base.
//
// Value shape: `HH:mm` string, or a `[start, end]` tuple when `range` is
// true (both HH:mm strings) — mirrors the old renderer's FlatPickr range
// mode. NOT modeled as a dedicated union alias in the barrel; the field is
// generic over TValue like every other FormField subclass.
export type TimeFieldValue = string | [string, string];

/**
 * `HH:mm` time input, optionally a start/end range. Transplant of
 * `TimeField.tsx:13-59` — MINUS the instance `getCurrentValue()` override
 * (:18-31) that resolved a `'now'` sentinel at read time. schema-core has no
 * instance-level runtime-value hook (ADR-0002 — value logic is store-side
 * free functions, not field methods), so per the EA-A briefing's Conductor
 * decision ⑤ the `'now'` sentinel is resolved RENDERER-side
 * (`@listgrid/react`'s time-renderer.tsx), not here. This class stays pure
 * declaration meta: the raw stored value (including the literal string
 * `'now'`) passes through untouched.
 */
export class TimeField extends FormField<TimeFieldValue> {
  limit?: MinMaxStringLimit;
  range?: boolean;

  constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, 'time');
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
