import type { SelectField, TextareaField } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { registerFieldRenderer, type FieldRendererComponentProps } from './field-renderer-registry';
import { ManyToOneRenderer } from './many-to-one-renderer';

// Default field-type renderers (task item 3). Every one of these follows the
// same shape: read this field's resolved value via useFieldValue, resolve the
// injected primitive via useUI(), write back through
// `store.getState().setValue(name, v)` (never through React state — the store
// IS the state, ADR-0002). ManyToOne is deliberately NOT a real editor yet
// (V0.4 scope) — a read-only placeholder so a College/Professor-shaped form
// never crashes on `dean`.
//
// NOTE: every optional prop below (readOnly/disabled/value) is spread
// conditionally rather than passed as `x={maybeUndefined}` — the root
// tsconfig's `exactOptionalPropertyTypes` treats an explicit `undefined` on
// an optional prop as a type error, distinct from omitting the prop.

function TextRenderer({ name, readOnly }: FieldRendererComponentProps) {
  const { TextInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  return (
    <TextInput
      id={name}
      value={value ?? ''}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
    />
  );
}

function TextareaRenderer({ field, name, readOnly }: FieldRendererComponentProps) {
  const { Textarea } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  const rows = (field as TextareaField).rows;
  return (
    <Textarea
      id={name}
      value={value ?? ''}
      rows={rows}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
    />
  );
}

function NumberRenderer({ name, readOnly }: FieldRendererComponentProps) {
  const { NumberInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<number>(name);
  return (
    <NumberInput
      id={name}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(value !== undefined ? { value } : {})}
      {...(readOnly !== undefined ? { readOnly } : {})}
    />
  );
}

function BooleanRenderer({ name, readOnly }: FieldRendererComponentProps) {
  const { CheckBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<boolean>(name);
  return (
    <CheckBox
      id={name}
      checked={value ?? false}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { disabled: readOnly } : {})}
    />
  );
}

function SelectRenderer({ field, name, readOnly }: FieldRendererComponentProps) {
  const { SelectBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string | number | boolean>(name);
  const options = (field as SelectField).options ?? [];
  return (
    <SelectBox
      id={name}
      options={options}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(value !== undefined ? { value } : {})}
      {...(readOnly !== undefined ? { disabled: readOnly } : {})}
    />
  );
}

/** markdown → Textarea fallback (task item 3: a real rich-text editor is V1). */
function MarkdownRenderer({ name, readOnly }: FieldRendererComponentProps) {
  const { Textarea } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  return (
    <Textarea
      id={name}
      value={value ?? ''}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { readOnly } : {})}
    />
  );
}

/**
 * Register the built-in renderers for text/textarea/number/boolean/select/
 * markdown/manyToOne. Safe to call more than once (each call just re-sets the
 * same registry entries) — but call it BEFORE any host `registerFieldRenderer`
 * overrides, since the last write to a given type wins. The manyToOne renderer
 * (a Modal + ViewListGrid picker) requires an <AdapterProvider> in the tree.
 */
export function registerDefaultRenderers(): void {
  registerFieldRenderer('text', TextRenderer);
  registerFieldRenderer('textarea', TextareaRenderer);
  registerFieldRenderer('number', NumberRenderer);
  registerFieldRenderer('boolean', BooleanRenderer);
  registerFieldRenderer('select', SelectRenderer);
  registerFieldRenderer('markdown', MarkdownRenderer);
  registerFieldRenderer('manyToOne', ManyToOneRenderer);
}
