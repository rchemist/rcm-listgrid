import type { FieldMetaOverride } from './field-meta';
import type { FormField } from './form-field';

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
  /**
   * Register a new field mid-lifecycle (EF4 — post-init dynamic add; init-time
   * additions already go through initializeFormStore's onInitialize/
   * build-after-hooks pipe, EF3). Creates the field's value slice, seeded from
   * its declared default/current, then — if hydrate() already ran and
   * retained a fetched-data payload — rebinds it from that payload (dotted-path
   * aware, 0.3.x EntityForm.tsx:268-302 parity). A duplicate name REPLACES the
   * existing field definition and resets its slices (0.3.x `fields.set`
   * parity — the field instance IS the value's home in the old engine).
   * Bumps the store's structureVersion; does NOT itself dispatch onChanges for
   * the new field (only a subsequent setValue on it does).
   */
  addField(field: FormField): void;
  /**
   * Remove field `name` — deletes its value/meta slices and clears its
   * validation errors. A nonexistent name is a silent no-op (no version
   * bump). Otherwise bumps the store's structureVersion.
   */
  removeField(name: string): void;
  /**
   * Runtime tab-hidden override (EC3-0) — writes the form store's
   * `tabHidden` slice for `tabId`, which ViewEntityForm consults (winning
   * over TabDef.hidden) to decide whether the tab BUTTON renders at all
   * (0.3.x getViewableTabs parity — old engine's withHidden({type:'TAB',
   * ...})). Renderers subscribed to the store's tabHidden slice re-render;
   * if the currently active tab becomes hidden, ViewEntityForm falls back
   * to the first still-visible tab.
   *
   * Deliberately does NOT cascade to field-level `hidden` meta on the
   * tab's fields (unlike the 0.3.x dual write — EntityForm.tsx:349-353/
   * 413-428) — a field hidden via setMeta(name, {hidden:true}) is skipped
   * by validate(); silently skipping validation for every field in a
   * hidden tab is a decision only the form author can make correctly (a
   * hidden tab is not always inapplicable — see the EB1 lesson). A form
   * that wants the old MAJOR-form behavior (hidden tab's fields also stop
   * validating) must pair setTabHidden with per-field setMeta(name,
   * {hidden: true}) calls for each field in that tab — this method only
   * ever touches the tab bar.
   */
  setTabHidden(tabId: string, hidden: boolean): void;
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
