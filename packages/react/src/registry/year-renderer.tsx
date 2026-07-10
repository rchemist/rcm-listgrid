import { useMemo } from 'react';
import type { YearField } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Year renderer (EA-A, PART 2 §Year). Transplant of the input path of
// src/listgrid/components/fields/YearField.tsx:31-59 — builds a descending
// SelectOption[] from `limit.min..limit.max` and reuses SelectBox (briefing:
// "기존 SelectBox 재사용 — 신규 프리미티브 불요, 최저비용"). YearField's `limit`
// is ALWAYS eagerly defaulted (1900..current year) in both the constructor and
// withLimit(), so the old renderer's `limit undefined -> NumberInput` fallback
// branch is unreachable dead code there too — faithfully omitted here rather
// than carried over as dead code.

export function YearFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { SelectBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  const limit = (field as YearField).limit;
  const min = limit?.min ?? 1900;
  const max = limit?.max ?? new Date().getFullYear();

  // transplant of YearField.tsx:34-42 — loop min..max, sort desc by value.
  const options = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let i = min; i <= max; i++) {
      opts.push({ value: `${i}`, label: `${i}` });
    }
    opts.sort((a, b) => Number(b.value) - Number(a.value));
    return opts;
  }, [min, max]);

  return (
    <SelectBox
      id={name}
      options={options}
      onChange={(v) => store.getState().setValue(name, String(v))}
      {...(value !== undefined ? { value } : {})}
      {...(readOnly !== undefined ? { disabled: readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
