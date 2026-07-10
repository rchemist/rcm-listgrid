import { useMemo } from 'react';
import type { CheckboxField, SelectOption } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldMeta, useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Checkbox GROUP renderer (EA-A fan-out). Transplant of 0.3.x
// `CheckboxField.tsx:24-37` (→ `<CheckBox limit combo options ...>`): the
// field's value is a `string[]` SET of selected option values — NOT a single
// boolean (briefing pitfall) — so this renders one `@listgrid/ui-default`
// `CheckBox` primitive PER declared option and toggles membership in the
// array on change, rather than delegating to the single-boolean
// `BooleanRenderer` shape (default-renderers.tsx).
//
// EF1: an imperative options override (setMeta(name, { options })) wins over
// the field's declared options, same convention as SelectRenderer
// (default-renderers.tsx) — a live onChanges handler can reshape the choices
// without re-declaring the field.
//
// a11y: the outer FieldRenderer wrapper already renders a `<label
// htmlFor={name}>` pointing at this field's resolved value (FieldRenderer.tsx)
// — that label targets the FIRST rendered checkbox (`id={name}`); every
// other option gets an `id={name}-{index}` and its own inline `<label>` for
// its own text. `role="group"` + describedBy on the wrapping <span> carries
// the shared error association (aria-describedby) for the whole group, since
// a single option checkbox is not "the field" the error belongs to.
export function CheckboxFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { CheckBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string[]>(name);
  // EF1 override wins over the field's declared options (SelectRenderer parity).
  const metaOptions = useFieldMeta(name).options;
  const cbField = field as CheckboxField;
  const options: SelectOption[] = metaOptions ?? cbField.options ?? [];
  const direction = cbField.combo?.direction ?? 'column';

  const selected = useMemo(() => new Set((value ?? []).map(String)), [value]);

  function toggle(optionValue: SelectOption['value'], checked: boolean): void {
    const key = String(optionValue);
    const current = value ?? [];
    const next = checked
      ? current.includes(key)
        ? current
        : [...current, key]
      : current.filter((v) => v !== key);
    store.getState().setValue(name, next);
  }

  return (
    <span
      data-field="checkbox"
      data-combo-direction={direction}
      role="group"
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
    >
      {options.map((option, index) => {
        const key = String(option.value);
        const inputId = index === 0 ? name : `${name}-${index}`;
        return (
          <label key={key} htmlFor={inputId}>
            <CheckBox
              id={inputId}
              checked={selected.has(key)}
              onChange={(checked) => toggle(option.value, checked)}
              {...(readOnly !== undefined ? { disabled: readOnly } : {})}
              {...(required ? { required: true } : {})}
              {...(invalid ? { invalid: true } : {})}
              {...(describedBy !== undefined ? { describedBy } : {})}
            />
            {option.label}
          </label>
        );
      })}
    </span>
  );
}
