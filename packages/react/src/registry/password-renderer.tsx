import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Password renderer (EA-A fan-out — per-file, per Conductor decision ①).
// Transplant of src/listgrid/components/fields/PasswordField.tsx:47-62 —
// 0.3.x branched on `this.strength` to swap in a host-owned
// `PasswordStrengthView` widget. That widget has no new-engine UI slot (the
// EA-A0 pre-stage only added a `type` prop to TextInput, not a strength-meter
// primitive — briefing PART 2 §Password renderer note: "TextInput type prop
// 확장 후 사용"), so this renderer is a single `<input type="password">` via
// TextInput for every PasswordField, strength-declared or not. The
// `PasswordField.strength` meta (and the RegexValidation entries it produces)
// still drives validation regardless of what widget renders it — only the
// strength-meter VISUALIZATION is out of scope here (host can register its own
// renderer for 'password' to add one, same seam as any other override).

export function PasswordFieldRenderer({
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
      type="password"
      value={value ?? ''}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
