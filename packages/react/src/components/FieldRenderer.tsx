import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import {
  AsyncValidation,
  extractPermissions,
  getCurrentValue,
  type EntityField,
  type FieldEvalContext,
} from '@listgrid/schema-core';
import { useSession } from '../providers/auth';
import {
  useFieldMeta,
  useFormField,
  useFormStore,
  snapshotFieldValues,
} from '../providers/form-store';
import { getFieldRenderer } from '../registry/field-renderer-registry';

// FieldRenderer — the per-field wrapper (task item 4): label + required
// asterisk + the type-dispatched input + error list. Subscribes to exactly
// this field's slice (useFormField, decision D4) so a keystroke re-renders one
// field. required/readOnly/hidden are resolved from field.isRequired/
// isReadOnly/isHidden — all `Promise<boolean>` predicates over a
// FieldEvalContext — so they're resolved ASYNCHRONOUSLY in an effect into
// local state; until resolved the field defaults to visible + not-required
// (never hidden-by-default, so a slow predicate never hides required input).

export interface FieldRendererProps {
  field: EntityField;
  /** override the store-slice key; defaults to `field.getName()`. */
  name?: string;
  /** identity declared on the owning EntityForm (not a field value). */
  entityId?: string | undefined;
}

export function FieldRenderer({ field, name, entityId }: FieldRendererProps) {
  const fieldName = name ?? field.getName();
  const store = useFormStore();
  const session = useSession();
  const slice = useFormField(fieldName);
  const metaOverride = useFieldMeta(fieldName);

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

  // Declared-level form read-only seed (spec §3.1/§6.1, CAP-27; W3-5) — ORs
  // into effReadOnly below regardless of the field's own declared/meta
  // readOnly, independent of the permission hard-gate (effHidden).
  const formReadOnly = useStore(store, (s) => s.formReadOnly);
  const saving = useStore(store, (s) => s.saving);

  const [hidden, setHidden] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = store.getState();
      const ownSlice = state.fields[fieldName];
      const ctx: FieldEvalContext = {
        ...(entityId !== undefined ? { entityId } : {}),
        renderType: state.renderType,
        values: snapshotFieldValues(state),
        ...(ownSlice !== undefined ? { value: ownSlice } : {}),
        ...(session !== undefined ? { session } : {}),
      };

      // R5 — Promise.allSettled (NOT Promise.all): one throwing predicate must
      // NOT drop the other two gates to their permissive `false` default, and
      // the discarded rejected promise must not surface as an unhandled
      // rejection. On a rejected predicate we KEEP the field's last-known
      // resolved value (never fall to permissive false — the useState seed is
      // also the declared-static value, since only the async ValuedBoolean
      // branch can throw). `required` additionally fails CLOSED (stays
      // required) so a throwing predicate can never silently disable the `*`
      // and the required-validation gate. Sibling posture: many-to-one-
      // renderer.tsx / custom-option-renderer.tsx both `.catch` their async
      // resolves rather than let them reject.
      const [hiddenResult, requiredResult, readOnlyResult] = await Promise.allSettled([
        field.isHidden(ctx),
        field.isRequired(ctx),
        field.isReadOnly(ctx),
      ]);

      if (!cancelled) {
        if (hiddenResult.status === 'fulfilled') setHidden(hiddenResult.value);
        else
          console.error(
            '[@listgrid/react] FieldRenderer isHidden predicate threw',
            fieldName,
            hiddenResult.reason,
          );

        if (readOnlyResult.status === 'fulfilled') setReadOnly(readOnlyResult.value);
        else
          console.error(
            '[@listgrid/react] FieldRenderer isReadOnly predicate threw',
            fieldName,
            readOnlyResult.reason,
          );

        if (requiredResult.status === 'fulfilled') setRequired(requiredResult.value);
        else {
          // fail CLOSED — a throwing required predicate must NOT drop the field
          // to not-required (that would disable the `*` and the required gate).
          setRequired(true);
          console.error(
            '[@listgrid/react] FieldRenderer isRequired predicate threw; failing closed (required)',
            fieldName,
            requiredResult.reason,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-resolve on: own slice edits (`slice`) AND declared cross-field
    // dependency changes (`depSignal`). Subscribing to `depSignal` (not the
    // whole store) keeps D4 — only fields that DECLARE a dependency pay for it.
  }, [store, session, field, fieldName, entityId, slice, depSignal]);

  // EG2 — security hard-gate: permission is resolved synchronously (no
  // predicate/async involved) straight from the field's declared
  // requiredPermissions + the session in scope.
  const permitted = field.isPermitted(extractPermissions(session));

  // EF1: the imperative meta override wins over the async-resolved
  // predicate/declared value when a key has been set via setMeta() — EXCEPT
  // permission, which is a hard gate: `!permitted` must short-circuit FIRST
  // (before the `??`) so that setMeta(name, { hidden: false }) can never
  // un-hide a field the session isn't permitted for.
  const effHidden = !permitted || (metaOverride.hidden ?? hidden);
  const effRequired = metaOverride.required ?? required;
  // A save owns an immutable input snapshot. Lock every renderer until the
  // controller settles so the user cannot create a validate/send race.
  const effReadOnly = saving || formReadOnly || (metaOverride.readOnly ?? readOnly);

  if (effHidden) return null;

  const label = field.getLabel();
  const Renderer = getFieldRenderer(field.type);
  const errors = slice.errors ?? [];
  const hasErrors = errors.length > 0;
  const errorId = `${fieldName}-error`;

  // W4-3 (spec §5.3, CAP-05) — a `trigger:'button'` AsyncValidation gets a
  // confirm-button affordance next to the field; `trigger:'change'` (the
  // default) never renders one — its check runs automatically, debounced,
  // from the store's setValue path (@listgrid/state/form-store.ts). The
  // invalid-message case reuses the SAME `errors` list rendered below — the
  // store's runAsyncValidation action writes an invalid ValidateResult's
  // message onto this field's `errors` slice (the existing per-field error
  // channel), so no separate message UI is needed here.
  const asyncValidation = (field.validations ?? []).find(
    (v): v is AsyncValidation => v instanceof AsyncValidation && v.trigger === 'button',
  );

  return (
    <div className="rcm-field-root" data-field-name={fieldName}>
      {!field.hideLabel && label !== false && (
        <div className="rcm-field-label-row">
          <label className="rcm-field-label" htmlFor={fieldName}>
            {label}
          </label>
          {effRequired ? (
            <span className="rcm-field-icon rcm-field-icon-required" aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </div>
      )}
      {Renderer ? (
        <Renderer
          field={field}
          name={fieldName}
          {...(entityId !== undefined ? { entityId } : {})}
          readOnly={effReadOnly}
          required={effRequired}
          invalid={hasErrors}
          {...(hasErrors ? { describedBy: errorId } : {})}
        />
      ) : (
        <span role="alert">Unsupported field type: {field.type}</span>
      )}
      {asyncValidation && (
        <span>
          <button
            type="button"
            onClick={() => void store.getState().runAsyncValidation(fieldName)}
            disabled={saving || effReadOnly || slice.asyncState === 'checking'}
          >
            {asyncValidation.buttonLabel}
          </button>
          {slice.asyncState === 'checking' && <span role="status">확인 중…</span>}
          {slice.asyncState === 'valid' && <span role="status">사용 가능</span>}
        </span>
      )}
      {hasErrors && (
        <ul className="rcm-field-error" id={errorId} role="alert">
          {errors.map((err, i) => (
            <li key={i}>{err.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
