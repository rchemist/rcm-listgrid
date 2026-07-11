import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AsyncValidation, EntityForm, StringField, ValidateResult } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

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
});
