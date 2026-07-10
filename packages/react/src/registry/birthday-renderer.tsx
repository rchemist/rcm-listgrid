import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { BirthdayField } from '@listgrid/schema-core';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Birthday renderer (EA-B fan-out, ea-b-scout-briefing.md PART C §Birthday).
// Transplant of 0.3.x `BirthdayField.tsx`'s `BirthdayInput` (:33-219) — raw
// `<input type="text" inputMode="numeric">` with live YYYY-MM-DD masking, NO
// ui-default primitive needed (briefing: "프리미티브 불요"). Store-write only
// for the VALUE (ADR-0002); `displayValue`/`validationError` are transient
// local UI state, same posture the old component had (its own useState).
//
// EA-B0 seam (setValue cascade option): intermediate keystrokes commit with
// `{ cascade: false }` (old commit=false / propagation=false parity, PART A);
// blur commits with the default (cascading) setValue — mirrors the old
// component's `onChange(value, commit)` where `commit` flowed into
// FieldRenderer.tsx's `propagation` argument (BirthdayField.tsx:250-252).

function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

/** Transplant of `BirthdayInput.formatToDate` (:141-153). */
function formatToDate(digits: string): string {
  let formatted = '';
  if (digits.length > 0) {
    formatted = digits.substring(0, Math.min(4, digits.length));
  }
  if (digits.length > 4) {
    formatted += '-' + digits.substring(4, Math.min(6, digits.length));
  }
  if (digits.length > 6) {
    formatted += '-' + digits.substring(6, Math.min(8, digits.length));
  }
  return formatted;
}

/** Mount/external-sync helper: raw store value (`YYYYMMDD` or already
 *  hyphenated) -> display string. Mirrors the old `useEffect` mount-sync
 *  branch (:47-59). */
function toDisplayValue(raw: string | undefined): string {
  if (!raw) return '';
  if (/^\d{8}$/.test(raw)) {
    return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
  }
  return raw;
}

/** Transplant of `BirthdayInput.getReturnValue` (:156-161). */
function toStoreValue(formatted: string, includeHyphen: boolean): string {
  return includeHyphen ? formatted : formatted.replace(/-/g, '');
}

/**
 * Transplant of `BirthdayInput.validateDate` (:64-131) — UI-only local
 * validation (no entityForm-level validate hook, briefing decision). Old
 * code tracked validity via a `setValidationError` side effect; here the
 * same branches return the Korean message (or null) directly.
 */
function validateDate(dateStr: string): string | null {
  if (!dateStr || dateStr.replace(/-/g, '').length === 0) {
    return null;
  }

  const digits = dateStr.replace(/-/g, '');

  if (digits.length < 8) {
    if (digits.length >= 4) {
      const year = parseInt(digits.substring(0, 4), 10);
      if (year < 1900 || year > new Date().getFullYear()) {
        return '올바른 연도를 입력해 주세요 (1900~현재)';
      }
    }
    if (digits.length >= 6) {
      const month = parseInt(digits.substring(4, 6), 10);
      if (month < 1 || month > 12) {
        return '올바른 월을 입력해 주세요 (01~12)';
      }
    }
    return null;
  }

  const year = parseInt(digits.substring(0, 4), 10);
  const month = parseInt(digits.substring(4, 6), 10);
  const day = parseInt(digits.substring(6, 8), 10);

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return '올바른 연도를 입력해 주세요 (1900~현재)';
  }
  if (month < 1 || month > 12) {
    return '올바른 월을 입력해 주세요 (01~12)';
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return `올바른 일을 입력해 주세요 (01~${daysInMonth})`;
  }

  const inputDate = new Date(year, month - 1, day);
  if (inputDate > new Date()) {
    return '미래 날짜는 입력할 수 없습니다';
  }

  return null;
}

export function BirthdayFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const store = useFormStore();
  const birthdayField = field as BirthdayField;
  const includeHyphen = birthdayField.includeHyphen ?? false;
  const raw = useFieldValue<string>(name);

  const [displayValue, setDisplayValue] = useState(() => toDisplayValue(raw));
  const [validationError, setValidationError] = useState<string | null>(() =>
    validateDate(toDisplayValue(raw)),
  );

  // Deviation (recorded — not one of the briefing's explicit decisions): the
  // old component resynced `displayValue` from ITS OWN `value` prop on every
  // change (:47-59 useEffect), which was safe there because the parent-side
  // async `renderInstance` re-render didn't feed back into that effect on
  // every keystroke in a way that fought the just-typed hyphenated string.
  // The new engine's `useFieldValue` subscribes synchronously to the store,
  // and per PART A `writeValue` always runs (even for cascade:false writes)
  // — so without this guard, every keystroke's own commit would re-enter
  // this effect and re-derive `displayValue` from the (possibly
  // hyphen-stripped, includeHyphen=false) store value, clobbering the
  // in-progress masked string (e.g. typing '199001' -> committed store
  // value '199001' -> naive resync would show '199001' instead of
  // '1990-01'). Comparing digit-content against the digits WE last wrote
  // lets external changes (mount, cascade from elsewhere, form reset) still
  // resync, while our own commits don't fight the local mask.
  const lastWrittenDigits = useRef(digitsOnly(toDisplayValue(raw)));

  useEffect(() => {
    if (digitsOnly(raw ?? '') === lastWrittenDigits.current) return;
    const next = toDisplayValue(raw);
    setDisplayValue(next);
    setValidationError(validateDate(next));
    lastWrittenDigits.current = digitsOnly(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const commit = (formatted: string, cascade: boolean) => {
    const storeValue = toStoreValue(formatted, includeHyphen);
    lastWrittenDigits.current = digitsOnly(formatted);
    store.getState().setValue(name, storeValue, cascade ? undefined : { cascade: false });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = digitsOnly(e.target.value).substring(0, 8);
    const formatted = formatToDate(digits);
    setDisplayValue(formatted);
    setValidationError(validateDate(formatted));
    commit(formatted, false);
  };

  // Transplant of `BirthdayInput.handleKeyDown` (:180-196) — backspace right
  // after a hyphen deletes the hyphen + preceding digit together.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    const input = e.currentTarget;
    const cursorPos = input.selectionStart ?? 0;
    if (cursorPos > 0 && displayValue[cursorPos - 1] === '-') {
      e.preventDefault();
      const digits = digitsOnly(displayValue);
      const formatted = formatToDate(digits.substring(0, digits.length - 1));
      setDisplayValue(formatted);
      setValidationError(validateDate(formatted));
      commit(formatted, false);
    }
  };

  const handleBlur = () => {
    commit(displayValue, true);
  };

  const hasError = invalid || validationError != null;
  const errorId = `${name}-birthday-error`;

  return (
    <div data-field="birthday">
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder="YYYY-MM-DD"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        readOnly={readOnly}
        maxLength={10}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy ?? (validationError ? errorId : undefined)}
      />
      {validationError && (
        <p role="alert" id={errorId}>
          {validationError}
        </p>
      )}
    </div>
  );
}
