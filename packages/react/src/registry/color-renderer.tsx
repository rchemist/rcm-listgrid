import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Color renderer (EA-B fan-out, PART C §Color). Native `<input type="color">`
// via ui-default's TextInput `type='color'` slot (EA-B0 union) replaces the
// old mantine ColorInput (`ColorField.tsx:58-101`) — old headless mode was
// already a plain native input fallback, so no feature loss (briefing note).
//
// Old semantics: ColorInput's `onChangeEnd` commits exactly ONCE, with no
// intermediate calls while the picker is open (ColorField.tsx:76-79). A
// native `<input type="color">` fires change/input at a browser-dependent
// frequency (continuously while dragging in some browsers), so per Conductor
// decision ②: every onChange writes `setValue(name, v, { cascade: false })`
// (the live value is visible immediately, but no onChanges cascade runs),
// and blur commits with a plain `setValue(name, v)` — guaranteeing the
// cascade fires exactly once, old-parity, regardless of how many onChange
// events the browser fired in between.
//
// blur is captured on a wrapping <span>, not passed as a TextInputProps prop
// — TextInputProps (ui-default, a file this field must not edit) has no
// onBlur slot. This relies on React's synthetic event system, where
// onBlur/onFocus bubble (via focusout/focusin) even though the native DOM
// blur/focus events do not — so a parent element's onBlur fires for a blur
// originating on the inner <input>, without touching the TextInput
// primitive itself.
//
// No local React state: the store already holds the live value (mirrored
// on every onChange), so there's nothing for a local mirror to add — unlike
// the old renderer's local `useState` + `useEffect` sync, which existed only
// to satisfy mantine ColorInput's controlled-prop contract.
export function ColorFieldRenderer({
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
    <span
      data-field="color"
      onBlur={() => {
        const current = store.getState().getValue(name) as string | undefined;
        store.getState().setValue(name, current);
      }}
    >
      <TextInput
        id={name}
        type="color"
        value={value ?? ''}
        onChange={(v) => store.getState().setValue(name, v, { cascade: false })}
        {...(readOnly !== undefined ? { readOnly } : {})}
        {...(required ? { required: true } : {})}
        {...(invalid ? { invalid: true } : {})}
        {...(describedBy !== undefined ? { describedBy } : {})}
      />
    </span>
  );
}
