import type { SelectField, TextareaField } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldMeta, useFieldValue, useFormStore } from '../providers/form-store';
import { registerFieldRenderer, type FieldRendererComponentProps } from './field-renderer-registry';
import { ManyToOneRenderer } from './many-to-one-renderer';
import { SubCollectionRenderer } from './sub-collection-renderer';
import { CheckboxFieldRenderer } from './checkbox-renderer';
import { MultiSelectFieldRenderer } from './multi-select-renderer';
import { PasswordFieldRenderer } from './password-renderer';
import { MonthFieldRenderer } from './month-renderer';
import { YearFieldRenderer } from './year-renderer';
import { TimeFieldRenderer } from './time-renderer';
import { LinkFieldRenderer } from './link-renderer';
import { TagFieldRenderer } from './tag-renderer';
import { ColorPresetFieldRenderer } from './color-preset-renderer';
import { MessageViewFieldRenderer } from './message-view-renderer';
import { ProfileFieldRenderer } from './profile-renderer';
import { MappedJoinFieldRenderer } from './mapped-join-renderer';
import { DatetimeFieldRenderer } from './datetime-renderer';
import { CustomOptionFieldRenderer } from './custom-option-renderer';
import { BirthdayFieldRenderer } from './birthday-renderer';
import { TelephoneNumberFieldRenderer } from './telephone-number-renderer';
import { ColorFieldRenderer } from './color-renderer';
import { FileFieldRenderer } from './file-renderer';
import { ImageFieldRenderer } from './image-renderer';
import { MultipleAssetFieldRenderer } from './multiple-asset-renderer';
import { InlineMapFieldRenderer } from './inline-map-renderer';
import { AddressFieldRenderer } from './address-renderer';

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

function TextRenderer({
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

function TextareaRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
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
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}

function NumberRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { NumberInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<number>(name);
  return (
    <NumberInput
      id={name}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(value !== undefined ? { value } : {})}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}

function DateRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { DateInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  return (
    <DateInput
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

function BooleanRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { CheckBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<boolean>(name);
  return (
    <CheckBox
      id={name}
      checked={value ?? false}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(readOnly !== undefined ? { disabled: readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}

function SelectRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { SelectBox } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string | number | boolean>(name);
  // EF1: an imperative options override (setMeta(name, { options })) wins over
  // the field's declared options; the declared list remains the fallback.
  const metaOptions = useFieldMeta(name).options;
  const options = metaOptions ?? (field as SelectField).options ?? [];
  return (
    <SelectBox
      id={name}
      options={options}
      onChange={(v) => store.getState().setValue(name, v)}
      {...(value !== undefined ? { value } : {})}
      {...(readOnly !== undefined ? { disabled: readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}

/** markdown → Textarea fallback (task item 3: a real rich-text editor is V1). */
function MarkdownRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { Textarea } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  return (
    <Textarea
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

/**
 * Register the built-in renderers for text/textarea/number/date/datetime/
 * boolean/select/markdown/manyToOne. 'datetime' reuses DateRenderer (native
 * <input type="date">) for now — no schema-core DateTimeField/DateTimeInput
 * exists yet, so this is a deliberately trivial placeholder, not a real
 * datetime-local editor. Safe to call more than once (each call just re-sets the
 * same registry entries) — but call it BEFORE any host `registerFieldRenderer`
 * overrides, since the last write to a given type wins. The manyToOne renderer
 * (a Modal + ViewListGrid picker) requires an <AdapterProvider> in the tree.
 */
export function registerDefaultRenderers(): void {
  registerFieldRenderer('text', TextRenderer);
  // email/phone reuse the text input; the field class carries the validation.
  registerFieldRenderer('email', TextRenderer);
  registerFieldRenderer('phone', TextRenderer);
  registerFieldRenderer('textarea', TextareaRenderer);
  registerFieldRenderer('number', NumberRenderer);
  registerFieldRenderer('date', DateRenderer);
  registerFieldRenderer('datetime', DatetimeFieldRenderer);
  registerFieldRenderer('boolean', BooleanRenderer);
  registerFieldRenderer('select', SelectRenderer);
  registerFieldRenderer('markdown', MarkdownRenderer);
  registerFieldRenderer('manyToOne', ManyToOneRenderer);
  registerFieldRenderer('subCollection', SubCollectionRenderer);
  // EA-A trivial fields (fan-out port of the 0.3.x catalog)
  registerFieldRenderer('checkbox', CheckboxFieldRenderer);
  registerFieldRenderer('multiselect', MultiSelectFieldRenderer);
  registerFieldRenderer('password', PasswordFieldRenderer);
  registerFieldRenderer('month', MonthFieldRenderer);
  registerFieldRenderer('year', YearFieldRenderer);
  registerFieldRenderer('time', TimeFieldRenderer);
  registerFieldRenderer('link', LinkFieldRenderer);
  registerFieldRenderer('tag', TagFieldRenderer);
  registerFieldRenderer('colorPreset', ColorPresetFieldRenderer);
  registerFieldRenderer('messageView', MessageViewFieldRenderer);
  registerFieldRenderer('profile', ProfileFieldRenderer);
  registerFieldRenderer('mappedJoin', MappedJoinFieldRenderer);
  // EA-B moderate fields (fan-out port of the 0.3.x catalog)
  registerFieldRenderer('customOption', CustomOptionFieldRenderer);
  registerFieldRenderer('birthday', BirthdayFieldRenderer);
  registerFieldRenderer('telephoneNumber', TelephoneNumberFieldRenderer);
  registerFieldRenderer('color', ColorFieldRenderer);
  // EA-C upload fields (fan-out port; ContentAsset deferred — dead in 0.3.x)
  registerFieldRenderer('file', FileFieldRenderer);
  registerFieldRenderer('image', ImageFieldRenderer);
  registerFieldRenderer('multipleAsset', MultipleAssetFieldRenderer);
  // EA-D InlineMap (single delegate; store-direct-write redesign, no pendingRef)
  registerFieldRenderer('inlineMap', InlineMapFieldRenderer);
  // EB2 Address (Daum 우편번호 composite; renders + owns its 5 renderedBy-suppressed siblings)
  registerFieldRenderer('address', AddressFieldRenderer);
}
