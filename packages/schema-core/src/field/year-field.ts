import type { MinMaxLimit } from './basic-fields';
import { FormField } from './form-field';

// Year (0.3.x YearField, type 'year' — already in FieldType). Transplant of
// src/listgrid/components/fields/YearField.tsx:14-134. valueShape: a year
// STRING (e.g. '2026'), not a number — the renderer builds a descending
// SelectOption[] from `limit` and options carry string values.
//
// PITFALL (EA-A briefing PART 2 §Year, faithful-transplant conductor decision):
// min/max default to 1900/`new Date().getFullYear()` and are computed EAGERLY
// — both in the constructor AND every `withLimit()` call — not lazily at
// render time. `withLimit()` always re-merges against the (recomputed) current-
// year default rather than clearing/leaving `limit` partially set; do not
// "fix" this into a lazy/optional-limit shape.

/** Searchable/typeable year field (0.3.x YearField). No shared base — limit is
 *  this field's only knob (props-object convention not triggered, PART 1). */
export class YearField extends FormField<string> {
  limit: MinMaxLimit;

  constructor(name: string, order: number, limit?: MinMaxLimit) {
    super(name, order, 'year');
    const defaultMin = 1900;
    const defaultMax = new Date().getFullYear();
    this.limit = {
      min: limit?.min ?? defaultMin,
      max: limit?.max ?? defaultMax,
    };
  }

  /** Transplant of YearField.withLimit:121-129 — eager default recompute, not
   *  a plain merge (faithful transplant, do not lazy-ify). */
  withLimit(limit?: MinMaxLimit): this {
    const defaultMin = 1900;
    const defaultMax = new Date().getFullYear();
    this.limit = {
      min: limit?.min ?? defaultMin,
      max: limit?.max ?? defaultMax,
    };
    return this;
  }
}
