// AsyncValidation (spec §5.3, CAP-05 — 구 CheckButtonValidation 재설계, EG6).
// A ValidationItem subclass — NOT a dedicated field class (charter C5 single
// channel: `withValidations()` already accepts any Validation, so AsyncValidation
// rides that same seam a sync RegexValidation/CustomValidation/etc. does). This
// is the fix for the 0.3.x design the spec calls out: `LinkField` extended a
// dedicated `CheckButtonValidationField` base purely to gain the optional
// "중복확인" button (see `../field/link-field.ts` header) — a consumer who
// wanted async-check-on-a-field-that-wasn't-Link had no path in and gave up
// (spec §5.3: "소비자가 '시도 후 포기'한 구 API"). AsyncValidation removes that
// constraint: ANY field gets the capability by attaching one to
// `withValidations()`.
//
// Two-channel split (deliberate, spec §5.3):
//   1. The SYNC channel — `validate()`, inherited from ValidationItem, called
//      by `FormField.validate()`/`validateAll` (form-store.ts). AsyncValidation
//      is NEUTRAL here — its `validate()` always resolves
//      `ValidateResult.success()` and never runs the real `check`. Running the
//      real (potentially slow, potentially network-bound) `check` inline with
//      every `validateAll()` call would silently turn every save/blur into a
//      network round trip — the spec's asyncState tri-state exists
//      specifically so the ASYNC determination is a separate, explicitly
//      triggered/debounced flow instead. NOTE (W4-3a save-gating, spec
//      §5.3/§6.2): `validate()` staying neutral does NOT mean save ignores the
//      async result — `validateAll` SEPARATELY gates on the STORED `asyncState`
//      (a dirty field not resolved to 'valid' is invalid), so no network runs
//      at validate time yet an unconfirmed/failed check still blocks save.
//   2. The REAL channel — the public `check` property, invoked directly by
//      the form store's dedicated action (`FormStoreState.runAsyncValidation`,
//      @listgrid/state/form-store.ts) which owns the `asyncState`
//      ('unchecked'|'checking'|'valid'|'invalid') tri-state on the field's
//      value slice. schema-core (this file) declares the contract only — the
//      store/renderer own the runtime wiring (ADR-0003 layering).
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult, ValidationItem } from '../validation';

export class AsyncValidation extends ValidationItem {
  /** The real (possibly network-bound) check — invoked ONLY by the store's dedicated action, never by the sync `validate()` below. */
  check: (value: unknown, ctx: FieldEvalContext) => Promise<ValidateResult>;
  /**
   * 'change' (debounced, automatic) | 'button' (explicit "확인" affordance).
   * DEVIATION (spec §5.3 silent on a default): defaults to 'change' — the
   * lower-friction behavior when a consumer omits `opts` entirely; a
   * dedicated 중복확인 button is an explicit opt-in via `{ trigger: 'button' }`.
   */
  trigger: 'change' | 'button';
  /** Confirm-button label (trigger:'button' only). Default '확인' (spec example). */
  buttonLabel: string;
  /** Debounce window (trigger:'change' only). Default 300ms (spec example — same default EF5 validateOnChange uses). */
  debounceMs: number;

  constructor(
    check: (value: unknown, ctx: FieldEvalContext) => Promise<ValidateResult>,
    opts?: { trigger?: 'change' | 'button'; buttonLabel?: string; debounceMs?: number },
  ) {
    // No `id` param on this constructor (spec §5.3 signature is exact — check
    // + opts only), unlike the other concrete validations (EmailValidation
    // etc.) which accept an optional id defaulting to their class name. Same
    // fallback-to-class-name convention here, just with no override seam —
    // AsyncValidation's identity inside `field.validations` is established by
    // `instanceof` (form-store.ts), never by `id` lookup.
    super('AsyncValidation');
    this.check = check;
    this.trigger = opts?.trigger ?? 'change';
    this.buttonLabel = opts?.buttonLabel ?? '확인';
    this.debounceMs = opts?.debounceMs ?? 300;
  }

  /**
   * The sync ValidationItem contract (FormField.validate/validateAll). ALWAYS
   * neutral — see the file header's two-channel split. Params are unused by
   * design (this never runs `check`).
   */
  async validate(
    _ctx: FieldEvalContext,
    _value: FieldValue | undefined,
    _message?: string,
  ): Promise<ValidateResult> {
    return ValidateResult.success();
  }
}
