import type { DatetimeField, DatetimeFieldValue } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Datetime renderer (EA-B fan-out, PART C §Datetime). Native
// <input type="datetime-local"> (ui-default's TextInput `type='datetime-local'`
// slot, EA-B0 union extension) replaces the old FlatPickrDateField
// (`DatetimeField.tsx:63-70`). List-cell / filter rendering globally deferred.
//
// Conductor decision ⑦: the old instance `getCurrentValue()` override
// (`DatetimeField.tsx:27-41`) resolved a `'today'` sentinel stored value to
// the wall-clock date/time AT READ TIME. schema-core has no instance value
// hook (ADR-0002), so that resolution happens HERE, renderer-side, as a pure
// display-value transform over the raw store value — the store itself keeps
// holding the literal `'today'` string until the user actually edits the
// field (identical to the old engine, and to the Time renderer precedent).

/** Zero-pad to 2 digits (local calendar/clock components, no date-fns dep in
 *  this package — mirrors the Time renderer's `getFormattedTime` approach). */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Transplant of the `value === 'today'` single-value branch of
 *  `DatetimeField.getCurrentValue` (:37): `fDate(new Date(), "yyyy-MM-dd'T'HH:mm")`
 *  — date-fns `format` with a literal `'T'` separator. */
function formatDatetimeT(date: Date): string {
  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

/** Transplant of the `value === 'today'` range branch of
 *  `DatetimeField.getCurrentValue` (:35): `fDate(d, "yyyy-MM-dd HH:mm")` —
 *  NOTE the old source literally uses a space, not a `'T'`, as the
 *  date/time separator here (unlike the single-value branch above). This is
 *  preserved verbatim (faithful transplant — not "fixed" to match the
 *  single-value branch or the `datetime-local` input's native format).
 *  Functionally neutral either way: a native `datetime-local` input's value
 *  sanitization algorithm (spec-mandated, jsdom + real browsers alike)
 *  normalizes a space separator to `'T'` on assignment, so the
 *  DOM-observable value ends up `'T'`-separated regardless (verified via
 *  this file's test suite). */
function formatDatetimeSpace(date: Date): string {
  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  return `${y}-${mo}-${d} ${h}:${mi}`;
}

/** Transplant of the `value === 'today'` branch of
 *  `DatetimeField.getCurrentValue` (:27-41): range → `[today, tomorrow]`
 *  (space-separated, per the old source); single → `today` formatted with a
 *  `'T'` separator. Any other raw value (including undefined) passes through
 *  untouched. */
function resolveDisplayValue(
  raw: DatetimeFieldValue | undefined,
  range: boolean | undefined,
): DatetimeFieldValue | undefined {
  if (raw === 'today') {
    if (range) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return [formatDatetimeSpace(today), formatDatetimeSpace(tomorrow)];
    }
    return formatDatetimeT(new Date());
  }
  return raw;
}

export function DatetimeFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { TextInput } = useUI();
  const store = useFormStore();
  const datetimeField = field as DatetimeField;
  const raw = useFieldValue<DatetimeFieldValue>(name);
  const display = resolveDisplayValue(raw, datetimeField.range);

  const sharedProps = {
    ...(readOnly !== undefined ? { readOnly } : {}),
    ...(required ? { required: true } : {}),
    ...(invalid ? { invalid: true } : {}),
    ...(describedBy !== undefined ? { describedBy } : {}),
  };

  if (datetimeField.range) {
    const [start, end] = Array.isArray(display) ? display : ['', ''];
    return (
      <span data-field="datetime-range">
        <TextInput
          id={name}
          type="datetime-local"
          value={start ?? ''}
          {...(typeof field.getLabel() === 'string' ? { ariaLabel: String(field.getLabel()) } : {})}
          onChange={(v) => store.getState().setValue(name, [v, end ?? ''] as DatetimeFieldValue)}
          {...sharedProps}
        />
        <TextInput
          id={`${name}-end`}
          type="datetime-local"
          value={end ?? ''}
          ariaLabel="종료 일시"
          onChange={(v) => store.getState().setValue(name, [start ?? '', v] as DatetimeFieldValue)}
          {...sharedProps}
        />
      </span>
    );
  }

  const value = typeof display === 'string' ? display : '';
  return (
    <TextInput
      id={name}
      type="datetime-local"
      value={value}
      onChange={(v) => store.getState().setValue(name, v)}
      {...sharedProps}
    />
  );
}
