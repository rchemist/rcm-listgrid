import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { getCurrentValue, type EntityField, type FieldEvalContext } from '@listgrid/schema-core';
import { useSession } from '../providers/auth';
import { useFormField, useFormStore, snapshotFieldValues } from '../providers/form-store';
import { getFieldRenderer } from '../registry/field-renderer-registry';

// FieldRenderer — the per-field wrapper (task item 4): label + required
// asterisk + the type-dispatched input + error list. Subscribes to exactly
// this field's slice (useFormField, decision D4) so a keystroke re-renders one
// field. required/readonly/hidden are resolved from field.isRequired/
// isReadonly/isHidden — all `Promise<boolean>` predicates over a
// FieldEvalContext — so they're resolved ASYNCHRONOUSLY in an effect into
// local state; until resolved the field defaults to visible + not-required
// (never hidden-by-default, so a slow predicate never hides required input).

export interface FieldRendererProps {
  field: EntityField;
  /** override the store-slice key; defaults to `field.getName()`. */
  name?: string;
}

export function FieldRenderer({ field, name }: FieldRendererProps) {
  const fieldName = name ?? field.getName();
  const store = useFormStore();
  const session = useSession();
  const slice = useFormField(fieldName);

  // Cross-field cascade (ADR-0002 §Consequences): subscribe to the values of
  // the sibling fields this field's conditionals declare via `dependsOn`, as a
  // single stable signal — so predicates re-resolve when a dependency changes,
  // without subscribing to the whole store (D4 stays intact).
  const dependsOn = field.dependsOn ?? [];
  const depSignal = useStore(store, (s) =>
    dependsOn
      .map((n) => JSON.stringify(getCurrentValue(s.fields[n], s.renderType) ?? null))
      .join('|'),
  );

  const [hidden, setHidden] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = store.getState();
      const ownSlice = state.fields[fieldName];
      const ctx: FieldEvalContext = {
        renderType: state.renderType,
        values: snapshotFieldValues(state),
        ...(ownSlice !== undefined ? { value: ownSlice } : {}),
        ...(session !== undefined ? { session } : {}),
      };

      const [isHidden, isRequired, isReadonly] = await Promise.all([
        field.isHidden(ctx),
        field.isRequired(ctx),
        field.isReadonly(ctx),
      ]);

      if (!cancelled) {
        setHidden(isHidden);
        setRequired(isRequired);
        setReadOnly(isReadonly);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-resolve on: own slice edits (`slice`) AND declared cross-field
    // dependency changes (`depSignal`). Subscribing to `depSignal` (not the
    // whole store) keeps D4 — only fields that DECLARE a dependency pay for it.
  }, [store, session, field, fieldName, slice, depSignal]);

  if (hidden) return null;

  const label = field.getLabel();
  const Renderer = getFieldRenderer(field.type);
  const errors = slice.errors ?? [];

  return (
    <div data-field-name={fieldName}>
      {!field.hideLabel && label !== false && (
        <label htmlFor={fieldName}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      )}
      {Renderer ? (
        <Renderer field={field} name={fieldName} readOnly={readOnly} />
      ) : (
        <span role="alert">Unsupported field type: {field.type}</span>
      )}
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((err, i) => (
            <li key={i}>{err.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
