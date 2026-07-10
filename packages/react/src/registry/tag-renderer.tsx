import type { TagField } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Tag renderer (EA-A fan-out) — transplant of 0.3.x
// `src/listgrid/components/fields/TagField.tsx:45-89` (renderInstance ->
// TagsInput data/filter/onValidateTag/minTags/maxTags). New engine reuses the
// EA-A0 pre-stage `TagsInput` UI slot (`@listgrid/ui-default` primitive +
// `UIComponents.TagsInput`), same posture as every other renderer here:
// resolve the primitive via useUI(), read the value via useFieldValue, write
// back through the store (never React state, ADR-0002).
//
// Pitfall carried over faithfully: `field.tagValidation` (renderer-level,
// per-tag async gate — NOT a Validation catalog entry, see tag-field.ts) is
// forwarded to the primitive's `onValidateTag` prop verbatim/as-is.
//
// Deviation from 0.3.x (recorded, not a bug): the old renderer's
// `optionsFilter` (case-insensitive word-token suggestion filter,
// TagField.tsx:52-60) has no home in the new engine — the EA-A0 pre-stage
// `TagsInputProps` (ui-default/src/types.ts) does not expose a pluggable
// `filter` prop (its ui-default fallback feeds `data` straight into a native
// `<datalist>`, no custom filter UI). `field.options` are forwarded as the
// raw suggestion pool (`data`); filtering, if any, is entirely the injected
// TagsInput primitive's concern now, not the field's. A host implementation
// of `UIComponents.TagsInput` MAY reintroduce word-token filtering.
export function TagFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { TagsInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string[]>(name);
  const tagField = field as TagField;
  const data = tagField.options?.map((option) => String(option.value));

  return (
    <TagsInput
      id={name}
      value={value ?? []}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(data !== undefined ? { data } : {})}
      {...(tagField.tagValidation ? { onValidateTag: tagField.tagValidation } : {})}
      {...(tagField.limit?.min !== undefined ? { minTags: tagField.limit.min } : {})}
      {...(tagField.limit?.max !== undefined ? { maxTags: tagField.limit.max } : {})}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
