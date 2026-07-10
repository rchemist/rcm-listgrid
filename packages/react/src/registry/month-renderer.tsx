import { useUI } from '../providers/ui';
import { useFormStore, useFieldValue } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Month renderer (EA-A fan-out). Transplant of 0.3.x
// `src/listgrid/components/fields/MonthField.tsx:27-38` — native
// `<input type="month">` (via the shared TextInput primitive's `type` slot,
// EA-A0 pre-stage) instead of the 0.3.x TextInput. `field.limit` (YYYY-MM
// min/max) is the actual validation gate (MonthField.validate,
// lexicographic) — TextInputProps carries no min/max passthrough, so the
// native browser min/max hint is not wired here (deviation: see manifest).

export function MonthFieldRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { TextInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);

  return (
    <TextInput
      id={name}
      type="month"
      value={value ?? ''}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
