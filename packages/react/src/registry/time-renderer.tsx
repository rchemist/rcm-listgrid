import type { TimeField, TimeFieldValue } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Time renderer (EA-A fan-out, PART 2 §Time). Native <input type="time">
// (ui-default's TextInput `type='time'` slot, PART 3 item 5①) replaces the
// old FlatPickrDateField (`TimeField.tsx:36-47`).
//
// Conductor decision ⑤: the old instance `getCurrentValue()` override
// (`TimeField.tsx:18-31`) resolved a `'now'` sentinel stored value to the
// wall-clock time AT READ TIME. schema-core has no instance value hook
// (ADR-0002), so that resolution happens HERE, renderer-side, as a pure
// display-value transform over the raw store value — the store itself keeps
// holding the literal `'now'` string until the user actually edits the
// field (identical to the old engine, where the sentinel also only lived in
// the persisted value, never mutated on read).

/** Transplant of `src/listgrid/misc/index.ts:135-147` (`getFormattedTime`),
 *  verified against the real source (NOT the briefing's "+12min" gloss —
 *  the actual old call site is `getFormattedTime(new Date(), 12)`, i.e. the
 *  second positional arg is `hourOffset`, not minutes; see this file's
 *  deviations note). */
function getFormattedTime(date: Date = new Date(), hourOffset = 0, minuteOffset = 0): string {
  date.setHours(date.getHours() + hourOffset);
  date.setMinutes(date.getMinutes() + minuteOffset);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hh}:${mm}`;
}

/** Transplant of the `value === 'now'` branch of `TimeField.getCurrentValue`
 *  (:18-31): range → `[now, now+12h]`; single → `now`. Any other raw value
 *  (including undefined) passes through untouched. */
function resolveDisplayValue(
  raw: TimeFieldValue | undefined,
  range: boolean | undefined,
): TimeFieldValue | undefined {
  if (raw === 'now') {
    if (range) {
      return [getFormattedTime(), getFormattedTime(new Date(), 12)];
    }
    return getFormattedTime();
  }
  return raw;
}

export function TimeFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { TextInput } = useUI();
  const store = useFormStore();
  const timeField = field as TimeField;
  const raw = useFieldValue<TimeFieldValue>(name);
  const display = resolveDisplayValue(raw, timeField.range);

  const sharedProps = {
    ...(readOnly !== undefined ? { readOnly } : {}),
    ...(required ? { required: true } : {}),
    ...(invalid ? { invalid: true } : {}),
    ...(describedBy !== undefined ? { describedBy } : {}),
  };

  if (timeField.range) {
    const [start, end] = Array.isArray(display) ? display : ['', ''];
    return (
      <span data-field="time-range">
        <TextInput
          id={name}
          type="time"
          value={start ?? ''}
          {...(typeof field.getLabel() === 'string' ? { ariaLabel: String(field.getLabel()) } : {})}
          onChange={(v) => store.getState().setValue(name, [v, end ?? ''] as TimeFieldValue)}
          {...sharedProps}
        />
        <TextInput
          id={`${name}-end`}
          type="time"
          value={end ?? ''}
          ariaLabel="종료 시각"
          onChange={(v) => store.getState().setValue(name, [start ?? '', v] as TimeFieldValue)}
          {...sharedProps}
        />
      </span>
    );
  }

  const value = typeof display === 'string' ? display : '';
  return (
    <TextInput
      id={name}
      type="time"
      value={value}
      onChange={(v) => store.getState().setValue(name, v)}
      {...sharedProps}
    />
  );
}
