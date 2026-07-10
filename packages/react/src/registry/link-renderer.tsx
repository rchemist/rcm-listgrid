import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Link renderer (EA-A fan-out — Link). 0.3.x LinkField
// (src/listgrid/components/fields/LinkField.tsx:26-39) rendered a plain
// TextInput whenever no checkButtonValidation was configured — the
// CheckButtonValidationInput branch is descoped for the transplant (conductor
// decision ⑧, see link-field.ts). So this renderer IS the "no
// checkButtonValidation" branch: a plain text input carrying the field's
// value, same shape as the default text renderer (default-renderers.tsx
// TextRenderer) but registered under the dedicated 'link' type so a host can
// override it (e.g. to add URL-format affordances) without touching the
// generic text renderer.
//
// The 0.3.x list-cell click-to-open behavior (stopPropagation +
// window.open(normalizeUrl(value)), LinkField.tsx:70-98) is deferred with the
// rest of list-cell per-type dispatch (briefing decision ⑦) — not
// implemented here.
export function LinkFieldRenderer({
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
      value={value ?? ''}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
