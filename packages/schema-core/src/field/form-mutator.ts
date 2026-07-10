import type { FieldMetaOverride } from './field-meta';

// FormMutator (EF2) — the state-agnostic mutation surface an onChanges
// handler receives. Declared here (schema-core), not @listgrid/state,
// because passing the store/EntityForm instance directly into handlers (as
// 0.3.x did — src/listgrid/config/EntityForm.tsx onChanges: (EntityForm,
// string) => void) would create a schema-core -> state reverse dependency,
// breaking the pure-meta package boundary (ADR-0003). @listgrid/state's
// createFormStore implements this interface with a store-backed adapter and
// injects it at dispatch time; the builder catalog below (and any host
// handler) is written against this interface only.

/**
 * Mutation surface passed to an {@link OnChangesHandler}. Backed by the form
 * store (@listgrid/state) — getValue/getValues read the resolved current
 * value (create->default, update->fetched, else explicit current, per
 * @listgrid/schema-core getCurrentValue); setValue/setMeta write through to
 * the store's value slice / EF1 meta-override slice respectively.
 */
export interface FormMutator {
  /** the resolved current value of field `name`. */
  getValue(name: string): unknown;
  /** every field's resolved current value, keyed by field name. */
  getValues(): Record<string, unknown>;
  /** write field `name`'s value (may itself trigger nested onChanges dispatch — see the state-layer loop-guard doc). */
  setValue(name: string, value: unknown): void;
  /** shallow-merge `partial` into field `name`'s EF1 meta override. */
  setMeta(name: string, partial: FieldMetaOverride): void;
}

/**
 * An onChanges handler (EF2). Registered on an EntityForm via
 * `withOnChanges`; dispatched by the form store after every setValue, in
 * registration order, once per handler per changed field (0.3.x parity —
 * src/listgrid/config/EntityForm.tsx:122-127: EVERY handler runs on EVERY
 * change and is expected to filter itself by `changedField`). Async handlers
 * are fire-and-forget: the store does not await them, and setValue's own
 * signature stays synchronous, matching 0.3.x executeOnChanges.
 */
export type OnChangesHandler = (mutator: FormMutator, changedField: string) => void | Promise<void>;
