import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AsyncValidation,
  CustomValidation,
  EntityForm,
  StringField,
  ValidateResult,
  type BackendAdapter,
} from '@listgrid/schema-core';
import { createFormStore } from '../form-store';
import { createFormController } from '../form-controller';
import { initializeFormStore } from '../initialize-form-store';

// W4-3 (spec §5.3, CAP-05) — the store-owned half of AsyncValidation: the
// asyncState tri-state ('unchecked'|'checking'|'valid'|'invalid'), the
// 'button'-trigger explicit runAsyncValidation() action, and the
// 'change'-trigger debounce scheduler (setValue -> debounce -> run). Same
// fake-timer + advanceTimersByTimeAsync harness as validate-on-change.test.ts
// (EF5's sibling feature) — `check` is async, so timer assertions must flush
// the microtask each debounced call schedules.

type Check = (value: unknown, ctx?: unknown) => Promise<ValidateResult>;

function ButtonForm(check: Check): EntityForm {
  return new EntityForm('AsyncButtonEntityForm', '/async-button').addFields({
    items: [
      new StringField('alias', 1)
        .withLabel('Alias')
        .withValidations(new AsyncValidation(check, { trigger: 'button' })),
    ],
  });
}

function ChangeForm(check: Check, debounceMs = 300): EntityForm {
  return new EntityForm('AsyncChangeEntityForm', '/async-change').addFields({
    items: [
      new StringField('alias', 1)
        .withLabel('Alias')
        .withValidations(new AsyncValidation(check, { debounceMs })),
    ],
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("form-store AsyncValidation (W4-3) — 'button' trigger tri-state", () => {
  it('starts unchecked before any trigger', () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
  });

  it('a field with NO AsyncValidation never gets an asyncState key', () => {
    const store = createFormStore(
      new EntityForm('PlainEntityForm', '/plain').addFields({
        items: [new StringField('name', 1)],
      }),
    );
    expect(store.getState().fields.name?.asyncState).toBeUndefined();
  });

  it('transitions unchecked -> checking synchronously on trigger, then -> valid on a passing check', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'unique-alias');

    const pending = store.getState().runAsyncValidation('alias');
    // synchronous up to the first `await` inside runAsyncValidation/check —
    // 'checking' must already be visible before the check promise resolves.
    expect(store.getState().fields.alias?.asyncState).toBe('checking');

    await pending;
    expect(store.getState().fields.alias?.asyncState).toBe('valid');
    expect(store.getState().fields.alias?.errors).toEqual([]);
  });

  it('transitions checking -> invalid + the ValidateResult message on a failing check', async () => {
    const store = createFormStore(
      ButtonForm(async () => ValidateResult.fail('이미 사용 중인 별칭입니다')),
    );
    store.getState().setValue('alias', 'taken');

    await store.getState().runAsyncValidation('alias');

    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
    expect(store.getState().fields.alias?.errors).toEqual([
      { message: '이미 사용 중인 별칭입니다' },
    ]);
  });

  it('passes the CURRENT value + a FieldEvalContext (renderType) to check', async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const store = createFormStore(ButtonForm(check));
    store.getState().setValue('alias', 'probe-value');

    await store.getState().runAsyncValidation('alias');

    expect(check).toHaveBeenCalledTimes(1);
    const [value, ctx] = check.mock.calls[0] as [unknown, { renderType?: string }];
    expect(value).toBe('probe-value');
    expect(ctx.renderType).toBe('create');
  });

  it('a field with no declared AsyncValidation is a silent no-op (no state change, check never invoked)', async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const store = createFormStore(
      new EntityForm('PlainEntityForm', '/plain').addFields({
        items: [new StringField('name', 1)],
      }),
    );
    await store.getState().runAsyncValidation('name');
    expect(check).not.toHaveBeenCalled();
    expect(store.getState().fields.name?.asyncState).toBeUndefined();
  });

  it('an unknown field name is a silent no-op', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    await expect(store.getState().runAsyncValidation('nonexistent')).resolves.toBeUndefined();
  });

  // W4-6 FIX #3 (phase-end hardening) — resetValue (schema-core/field/
  // value.ts, pre-W4-3) cleared current/dirty/errors but never touched the
  // W4-3 `asyncState` slice field: after store.reset() a field checked
  // 'valid' for a now-reverted value kept showing "사용 가능" (or a
  // mid-flight 'checking' left the confirm button disabled forever). reset()
  // must bring a declared-AsyncValidation field's asyncState back to
  // 'unchecked' — a reset value is by definition unchecked again.
  it('store.reset() brings a checked field back to asyncState "unchecked" (W4-6 FIX #3)', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'unique-alias');
    await store.getState().runAsyncValidation('alias');
    expect(store.getState().fields.alias?.asyncState).toBe('valid');

    store.getState().reset();

    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
  });
});

describe("form-store AsyncValidation (W4-3) — 'change' trigger debounce", () => {
  it('does NOT run immediately on setValue — only after the debounce window elapses', async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const store = createFormStore(ChangeForm(check));

    store.getState().setValue('alias', 'foo');
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(check).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(299);
    expect(check).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(check).toHaveBeenCalledTimes(1);
    expect(store.getState().fields.alias?.asyncState).toBe('valid');
  });

  it('typing again within the debounce window resets the timer — check runs once, on the LATEST value', async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const store = createFormStore(ChangeForm(check));

    store.getState().setValue('alias', 'first');
    await vi.advanceTimersByTimeAsync(200);
    store.getState().setValue('alias', 'second'); // resets the 300ms window
    await vi.advanceTimersByTimeAsync(200);
    expect(check).not.toHaveBeenCalled(); // still pending — only 200ms since reset

    await vi.advanceTimersByTimeAsync(100);
    expect(check).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledWith('second', expect.anything());
  });

  it('resolves to invalid + message when the debounced check fails', async () => {
    const store = createFormStore(
      ChangeForm(async () => ValidateResult.fail('중복된 값입니다'), 50),
    );
    store.getState().setValue('alias', 'taken');
    await vi.advanceTimersByTimeAsync(50);

    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
    expect(store.getState().fields.alias?.errors).toEqual([{ message: '중복된 값입니다' }]);
  });

  it("a cascade (non-top-level) write never schedules the 'change'-trigger AsyncValidation", async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const form = ChangeForm(check).onChange((m, changedField) => {
      if (changedField === 'other') m.setValue('alias', 'cascaded'); // nested, non-top-level
    });
    const withOther = form.addFields({ items: [new StringField('other', 2)] });
    const store = createFormStore(withOther);

    store.getState().setValue('other', 'x'); // top-level write of 'other' cascades 'alias'
    await vi.advanceTimersByTimeAsync(1000);

    expect(check).not.toHaveBeenCalled();
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
  });

  it('a per-instance custom debounceMs is honored (independent of the store-level EF5 validateOnChange option, which is unset here)', async () => {
    const check = vi.fn(async () => ValidateResult.success());
    const store = createFormStore(ChangeForm(check, 50));

    store.getState().setValue('alias', 'x');
    await vi.advanceTimersByTimeAsync(49);
    expect(check).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(check).toHaveBeenCalledTimes(1);
  });

  it('an explicit runAsyncValidation() call cancels a pending change-trigger debounce so the stale timer cannot clobber the immediate result', async () => {
    const check = vi
      .fn<Check>()
      .mockResolvedValueOnce(ValidateResult.fail('immediate-invalid'))
      .mockResolvedValueOnce(ValidateResult.success());
    const store = createFormStore(ChangeForm(check, 300));

    store.getState().setValue('alias', 'x'); // schedules a 300ms debounced run
    await store.getState().runAsyncValidation('alias'); // explicit call runs immediately + cancels the pending timer

    expect(check).toHaveBeenCalledTimes(1);
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');

    // the cancelled debounce timer never fires a second (stale) run.
    await vi.advanceTimersByTimeAsync(1000);
    expect(check).toHaveBeenCalledTimes(1);
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
  });

  it('reset() during a pending change-trigger debounce cancels the timer — no stale check resurrects on the reset field (R11)', async () => {
    const check = vi.fn(async () => ValidateResult.fail('중복된 값입니다'));
    const store = createFormStore(ChangeForm(check, 300));

    store.getState().setValue('alias', 'x'); // schedules a 300ms debounced check
    store.getState().reset(); // reset happens WITHIN the debounce window

    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(store.getState().fields.alias?.errors).toBeUndefined();

    // without the R11 fix, this advance fires the stale timer: 'checking'
    // flashes on the reset field, then a wasted network check resolves it
    // to 'invalid' with a stale error — on a field the user never touched
    // again after reset.
    await vi.advanceTimersByTimeAsync(1000);

    expect(check).not.toHaveBeenCalled();
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(store.getState().fields.alias?.errors).toBeUndefined();
  });
});

// W4-3a (D1) — async SAVE-GATING (spec §5.3/§6.2, resolving the W4-3
// Needs-Review #W4-3a). validateAll treats a DIRTY AsyncValidation field whose
// asyncState !== 'valid' as invalid, so an unconfirmed/failed 중복확인 blocks
// save; a value change resets the tri-state ('unchecked') so a stale 'valid'
// can't survive an edit; an in-flight check whose value moved on is discarded;
// an untouched (not-dirty) field is exempt. No network at validate time — the
// sync validate() stays neutral and validateAll only reads the stored state.

/** Minimal BackendAdapter double for the controller.save gating tests. */
function fakeAdapter(overrides: Partial<BackendAdapter> = {}): BackendAdapter {
  return {
    list: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  };
}

describe('form-store AsyncValidation (W4-3a) — save-gating in validateAll', () => {
  it('a DIRTY field left unchecked is invalid (validateAll false) + gets a gate message', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'candidate'); // dirty, still 'unchecked'
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');

    expect(await store.getState().validateAll()).toBe(false);
    expect(store.getState().fields.alias?.errors).toEqual([{ message: '확인이 필요합니다.' }]);
  });

  it('a DIRTY field checked INVALID stays invalid at save time (validateAll false)', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.fail('이미 사용 중')));
    store.getState().setValue('alias', 'taken');
    await store.getState().runAsyncValidation('alias');
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');

    expect(await store.getState().validateAll()).toBe(false);
  });

  it('a DIRTY field checked VALID passes (validateAll true, no gate error)', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'unique');
    await store.getState().runAsyncValidation('alias');
    expect(store.getState().fields.alias?.asyncState).toBe('valid');

    expect(await store.getState().validateAll()).toBe(true);
    expect(store.getState().fields.alias?.errors ?? []).toEqual([]);
  });

  it("a field 'checking' (in flight) blocks save (validateAll false)", async () => {
    let resolveCheck!: (r: ValidateResult) => void;
    const store = createFormStore(
      ButtonForm(() => new Promise<ValidateResult>((res) => (resolveCheck = res))),
    );
    store.getState().setValue('alias', 'candidate');
    const pending = store.getState().runAsyncValidation('alias'); // -> 'checking', not awaited
    expect(store.getState().fields.alias?.asyncState).toBe('checking');

    expect(await store.getState().validateAll()).toBe(false);

    resolveCheck(ValidateResult.success());
    await pending;
  });

  it("resets to 'unchecked' when the value changes after a passing check (edit can't survive the gate)", async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'unique');
    await store.getState().runAsyncValidation('alias');
    expect(store.getState().fields.alias?.asyncState).toBe('valid');

    store.getState().setValue('alias', 'edited'); // stale 'valid' must not survive
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(await store.getState().validateAll()).toBe(false);
  });

  it('setValue with the SAME value does NOT reset a passing check', async () => {
    const store = createFormStore(ButtonForm(async () => ValidateResult.success()));
    store.getState().setValue('alias', 'unique');
    await store.getState().runAsyncValidation('alias');

    store.getState().setValue('alias', 'unique'); // no-op echo
    expect(store.getState().fields.alias?.asyncState).toBe('valid');
    expect(await store.getState().validateAll()).toBe(true);
  });

  it('drops a stale in-flight result when the value moved on before it resolved', async () => {
    let resolveCheck!: (r: ValidateResult) => void;
    const store = createFormStore(
      ButtonForm(() => new Promise<ValidateResult>((res) => (resolveCheck = res))),
    );
    store.getState().setValue('alias', 'first');
    const pending = store.getState().runAsyncValidation('alias'); // checks 'first'
    store.getState().setValue('alias', 'second'); // value moved on -> 'unchecked'
    resolveCheck(ValidateResult.success()); // resolves for the stale 'first'
    await pending;

    // the stale 'valid' (for 'first') must NOT be written back over 'second'.
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(await store.getState().validateAll()).toBe(false);
  });

  it('an untouched (not-dirty) update-form field is exempt — its persisted value needs no re-check', async () => {
    const form = new EntityForm('AsyncUpdateEntityForm', '/async-update').addFields({
      items: [
        new StringField('alias', 1)
          .withLabel('Alias')
          .withValidations(
            new AsyncValidation(async () => ValidateResult.success(), { trigger: 'button' }),
          ),
      ],
    });
    const adapter = fakeAdapter({ getOne: vi.fn(async () => ({ alias: 'persisted' })) });
    const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });

    expect(store.getState().renderType).toBe('update');
    expect(store.getState().fields.alias?.dirty ?? false).toBe(false);
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    // not dirty -> the async gate is skipped, so the untouched record saves.
    expect(await store.getState().validateAll()).toBe(true);
  });
});

// R4 (analysis 2026-07-13/midpoint-code-review.md §4.3, MEDIUM) —
// validateAll's final write must not clobber a concurrently-resolving
// AsyncValidation check back to a stale pre-loop snapshot.
describe('form-store AsyncValidation — R4: validateAll must not clobber a concurrently-resolving async check', () => {
  it('a change-triggered async check that resolves during validateAll\'s await window ends "valid" (not stuck "checking"), and a later save is not blocked', async () => {
    let resolveAliasCheck!: (r: ValidateResult) => void;
    let resolveSlowCheck!: (r: ValidateResult) => void;
    let slowCallCount = 0;
    // R4 test-sync (main-session repair, see §Needs Review): validateAll
    // suspends at its FIRST await ('alias'), so resolveSlowCheck is NOT yet
    // assigned right after the call returns — the spec's back-to-back
    // resolveSlowCheck(...) threw "not a function". This promise fires when the
    // loop reaches 'slow' (assigns the resolver + parks), so the test resolves
    // the checks inside the real R4 race window instead of before it exists.
    let slowStarted!: () => void;
    const slowStartedP = new Promise<void>((res) => (slowStarted = res));
    const form = new EntityForm('R4EntityForm', '/r4').addFields({
      items: [
        new StringField('alias', 1)
          .withLabel('Alias')
          .withValidations(
            new AsyncValidation(
              () => new Promise<ValidateResult>((res) => (resolveAliasCheck = res)),
              { debounceMs: 50 },
            ),
          ),
        // 'slow' exists purely to hold validateAll's per-field await loop
        // open (via a real pending Promise) so 'alias'’s AsyncValidation check
        // can settle WHILE validateAll is still mid-loop — the exact race the
        // R4 bug depends on. Only the FIRST invocation blocks; the second
        // validateAll() call below (post-race) must resolve immediately or
        // it would hang forever.
        new StringField('slow', 2)
          .withLabel('Slow')
          .withValidations(
            new CustomValidation('slow-check', () => {
              slowCallCount += 1;
              if (slowCallCount === 1) {
                slowStarted();
                return new Promise<ValidateResult>((res) => (resolveSlowCheck = res));
              }
              return Promise.resolve(ValidateResult.success());
            }),
          ),
      ],
    });
    const store = createFormStore(form);

    store.getState().setValue('alias', 'candidate'); // dirty, schedules the 'change'-trigger debounce
    await vi.advanceTimersByTimeAsync(50); // fires the debounce -> runAsyncValidationNow -> 'checking', now parked awaiting the held check promise
    expect(store.getState().fields.alias?.asyncState).toBe('checking');

    const validateAllPending = store.getState().validateAll();
    // validateAll's snapshot (taken synchronously above, before the check
    // settles) sees 'checking' and gates THIS call — expected, orthogonal to
    // R4. Wait until its loop reaches 'slow' and parks awaiting the held
    // CustomValidation (resolveSlowCheck now assigned): it has NOT reached its
    // final write yet — this is the R4 race window.
    await slowStartedP;

    resolveAliasCheck(ValidateResult.success()); // the async check settles WHILE validateAll is still mid-loop
    resolveSlowCheck(ValidateResult.success()); // release validateAll's remaining field so it can reach its final write
    await validateAllPending;

    // R4 fix: the final write must not clobber the just-settled 'valid' back
    // to the pre-race 'checking' snapshot.
    expect(store.getState().fields.alias?.asyncState).toBe('valid');

    // save is not blocked: a fresh validateAll (post-race) reads the settled
    // 'valid' state and passes cleanly. Pre-fix, asyncState stayed stuck
    // 'checking' forever (no new trigger ever fires for an already-settled
    // check), permanently blocking save via asyncGateMessage.
    expect(await store.getState().validateAll()).toBe(true);
    expect(store.getState().fields.alias?.errors ?? []).toEqual([]);
  });
});

describe('createFormController.save (W4-3a async gate — spec §6.2)', () => {
  it('blocks save on a dirty unchecked async field: adapter never called, { ok: false }', async () => {
    const entityForm = ButtonForm(async () => ValidateResult.success());
    const store = createFormStore(entityForm);
    store.getState().setValue('alias', 'candidate'); // dirty, unchecked
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'validation' });
    expect(create).not.toHaveBeenCalled();
  });

  it('allows save once the async field resolves valid: adapter called, { ok: true }', async () => {
    const entityForm = ButtonForm(async () => ValidateResult.success());
    const store = createFormStore(entityForm);
    store.getState().setValue('alias', 'unique');
    await store.getState().runAsyncValidation('alias');
    const created = { id: '1', alias: 'unique' };
    const create = vi.fn(async () => created);
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: true, result: created });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('skipValidation bypasses the async gate entirely (headless-host escape hatch)', async () => {
    const entityForm = ButtonForm(async () => ValidateResult.success());
    const store = createFormStore(entityForm);
    store.getState().setValue('alias', 'candidate'); // dirty, unchecked
    const create = vi.fn(async () => ({ id: '1' }));
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save({ skipValidation: true });

    expect(outcome).toEqual({ ok: true, result: { id: '1' } });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
