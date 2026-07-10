import type { SelectOption } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldMeta, useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// MultiSelect renderer (EA-A fan-out — MultiSelect). 0.3.x MultiSelectField
// (src/listgrid/components/fields/MultiSelectField.tsx:60-101) chose between
// two render modes at runtime — CheckBoxChip (combo/chip UI) and
// MultiSelectBox — neither of which exists as a new-engine UIComponents
// primitive (packages/ui-default/src/types.ts has no chip or native-multiple
// SelectBox slot; SelectBoxProps.value/onChange are single-valued). Per the
// task's explicit scope ("minimal options+limit render via existing
// primitives") this renders a checkbox-per-option GROUP using the existing
// `CheckBox` primitive, toggling membership in the field's `string[]` value
// — the faithful behavioral core every 0.3.x mode shared (multi-select from
// a declared option list), without inventing a new UI primitive.
//
// a11y: there is no single focusable control this field's value binds to
// (it's a group of independent checkboxes), so — same posture as
// ManyToOneRenderer (which is also not a single-input field) — the outer
// FieldRenderer's `<label htmlFor={name}>` does not resolve to a form
// control here. The group itself carries `role="group"` +
// aria-required/aria-invalid/aria-describedby (forwarded from the
// FieldRenderer props, same values every other renderer forwards); each
// option's checkbox carries its own `aria-label` (the option's label) so it
// is independently reachable via accessible-name queries.
export function MultiSelectFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { CheckBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<Array<string | number | boolean>>(name);
  const selected = value ?? [];

  // EF1: an imperative options override (setMeta(name, { options })) wins
  // over the field's declared options, same merge SelectRenderer uses
  // (default-renderers.tsx) — `changeSelectOptions` (EF2 onChanges catalog)
  // is not select-specific at the FieldMetaOverride level.
  const metaOptions = useFieldMeta(name).options;
  const declaredOptions = (field as unknown as { options?: SelectOption[] }).options;
  const options = metaOptions ?? declaredOptions ?? [];

  function toggle(optionValue: string | number | boolean) {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    store.getState().setValue(name, next);
  }

  return (
    <div
      data-field="multiselect"
      role="group"
      {...(required ? { 'aria-required': true } : {})}
      {...(invalid ? { 'aria-invalid': true } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
    >
      {options.map((option) => (
        <CheckBox
          key={String(option.value)}
          id={`${name}-${String(option.value)}`}
          checked={selected.includes(option.value)}
          onChange={() => toggle(option.value)}
          ariaLabel={option.label}
          {...(readOnly ? { disabled: true } : {})}
        />
      ))}
    </div>
  );
}
