import { useEffect, useState } from 'react';
// NOTE: `CustomOptionField` is this port's own new schema-core file, not yet
// re-exported from the `@listgrid/schema-core` barrel (index.ts is a shared
// file this agent must not edit — the orchestrator adds
// `export { CustomOptionField } from './field/custom-option-field'` from the
// registration manifest). Imported here as a TYPE ONLY (erased at build time
// under the root tsconfig's `isolatedModules`, same posture the sibling
// birthday-renderer.tsx/datetime-renderer.tsx ports already take for their
// own not-yet-barreled field classes) via the package specifier rather than
// a relative disk path — packages/react's tsconfig is a TS project-reference
// "composite" build against schema-core's pre-built dist/, so a relative
// import straight into schema-core's `src/` fails with TS6305 ("output file
// ... has not been built from source") until dist is rebuilt; the package
// specifier resolves through the (currently stale, soon-to-be-rebuilt)
// dist/index.d.ts instead and self-heals once the orchestrator's barrel
// export + a rebuild land — no follow-up edit needed here.
import type { CustomOptionField, SelectOption } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useCustomOptions } from '../providers/custom-option';
import { useFieldMeta, useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// CustomOptionField renderer (EA-B fan-out — ea-b-scout-briefing.md PART C
// §CustomOption). Transplant of the render half of 0.3.x
// `src/listgrid/components/fields/CustomOptionField.tsx` (renderInstance
// :70-118, fetch-on-render gate :72-74) — re-verified against source
// 2026-07-11.
//
// FETCH: 0.3.x fetched `getCustomOptionValues(alias)` itself, the first time
// renderInstance ran with `this.options === undefined || this.options.length
// === 0` (:72-74), caching settled values in a module-scope Map. Here the
// field never fetches (schema-core is React-free, custom-option-field.ts
// header); this renderer resolves the SAME condition
// (`declaredOptions === undefined || declaredOptions.length === 0`) through
// `useCustomOptions()` (CustomOptionProvider, EA-B0 PART D item 4) in a
// cancellation-safe useEffect — same shape as ManyToOneRenderer's reference
// resolution (many-to-one-renderer.tsx:46-62). The provider's Promise-cache
// (keyed on the normalized alias, in-flight dedup + evict-on-fail) is what
// now plays the role of 0.3.x's module-scope cache.
//
// RENDER: 0.3.x's 4-branch renderInstance (combo&multiple->CheckBox /
// combo&!multiple->RadioInput / !combo&multiple->MultiSelectBox /
// !combo&!multiple->SelectBox) is DESCOPED to 2 branches — no combo/radio
// primitive exists in the new engine's UIComponents (same rationale as
// multi-select-renderer.tsx, MultiSelect precedent): `multiple` ->
// checkbox-per-option GROUP (multi-select-renderer.tsx's pattern, cloned
// here rather than shared — CustomOption's option source, fetch state, and
// combo carry-along differ enough that a shared component would need its own
// prop surface); `!multiple` -> the existing `SelectBox` primitive
// (SelectRenderer's pattern, default-renderers.tsx).
//
// STORE-WRITE ONLY for the value (ADR-0002 — the store IS the state); the
// `fetchedOptions`/`loading` useState below are TRANSIENT LOCAL UI STATE for
// the async option-list resolution, the same category of local state
// ManyToOneRenderer keeps for `resolvedLabel` — never the field's VALUE.
//
// a11y: same posture as MultiSelectFieldRenderer when `multiple` (a group of
// independent checkboxes, no single focusable control the outer
// `<label htmlFor={name}>` resolves to — role="group" +
// aria-required/aria-invalid/aria-describedby on the group, aria-label per
// checkbox) and the same posture as SelectRenderer when `!multiple` (id=name
// resolves the outer label, aria-* forwarded straight onto SelectBox).
export function CustomOptionFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { CheckBox, SelectBox } = useUI();
  const store = useFormStore();
  const resolveOptions = useCustomOptions();
  const custom = field as CustomOptionField;
  const multiple = custom.multiple === true;

  const declaredOptions = custom.options;
  const [fetchedOptions, setFetchedOptions] = useState<SelectOption[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 0.3.x parity: fetch when the field carries no (or an empty) declared
  // option list (CustomOptionField.tsx:72-74) — the provider's own cache
  // makes a repeated resolve of the same alias across renderer mounts a
  // no-op fetch, so this effect re-running (e.g. StrictMode double-invoke)
  // never double-hits the network.
  useEffect(() => {
    let cancelled = false;
    if (declaredOptions === undefined || declaredOptions.length === 0) {
      setLoading(true);
      resolveOptions(custom.alias)
        .then((opts) => {
          if (!cancelled) {
            setFetchedOptions(opts);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFetchedOptions([]);
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [custom.alias, declaredOptions, resolveOptions]);

  // EF1: an imperative options override (setMeta(name, { options })) wins
  // over both the declared and the fetched list, same merge
  // SelectRenderer/MultiSelectFieldRenderer use (default-renderers.tsx /
  // multi-select-renderer.tsx).
  const metaOptions = useFieldMeta(name).options;
  const options = metaOptions ?? fetchedOptions ?? declaredOptions ?? [];

  // Single `useFieldValue` call regardless of `multiple` (rules-of-hooks —
  // the two branches below need different shapes of the same store value,
  // not two separate subscriptions).
  const rawValue = useFieldValue<unknown>(name);

  if (multiple) {
    const selected = (Array.isArray(rawValue) ? rawValue : []) as Array<string | number | boolean>;

    function toggle(optionValue: string | number | boolean) {
      const next = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];
      store.getState().setValue(name, next);
    }

    return (
      <div
        data-field="customOption"
        role="group"
        {...(required ? { 'aria-required': true } : {})}
        {...(invalid ? { 'aria-invalid': true } : {})}
        {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
      >
        {loading && options.length === 0 ? (
          <span data-loading="true">불러오는 중...</span>
        ) : (
          options.map((option) => (
            <CheckBox
              key={String(option.value)}
              id={`${name}-${String(option.value)}`}
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              ariaLabel={option.label}
              {...(readOnly ? { disabled: true } : {})}
            />
          ))
        )}
      </div>
    );
  }

  const value = rawValue as string | number | boolean | undefined;
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
