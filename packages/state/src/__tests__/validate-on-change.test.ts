import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityForm, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';
import { initializeFormStore } from '../initialize-form-store';

// EF5 — validate-on-change (opt-in). Covers: default-off zero-change, the
// touched-gated trailing debounce (schedule/reset/fire), cascade writes never
// touching/scheduling (old renderer-onChange asymmetry —
// FieldRenderer.tsx:97-101 parity), an untouched sibling never validated by
// another field's edit, custom debounceMs, and the initializeFormStore
// passthrough. validateField is async, so timer assertions use
// advanceTimersByTimeAsync (flushes the microtask the trailing timer's
// `void get().validateField(name)` schedules) rather than the sync variant.

function RequiredForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 1).withRequired(true).withLabel('Name'),
      new StringField('other', 2).withRequired(true).withLabel('Other'),
    ],
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('form-store validate-on-change (EF5)', () => {
  it('default off: setValue never triggers validation (no error for an invalid required field)', async () => {
    const store = createFormStore(RequiredForm());
    store.getState().setValue('name', '');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(store.getState().fields.name.errors).toBeUndefined();
  });

  it('on: top-level setValue of an invalid touched field validates after the debounce window', async () => {
    const store = createFormStore(RequiredForm(), { validateOnChange: true });
    store.getState().setValue('name', '');
    expect(store.getState().fields.name.errors).toBeUndefined(); // not yet — debounce pending

    await vi.advanceTimersByTimeAsync(299);
    expect(store.getState().fields.name.errors).toBeUndefined();

    await vi.advanceTimersByTimeAsync(1);
    expect(store.getState().fields.name.errors?.length).toBe(1);
  });

  it('typing again within the debounce window resets the timer — only one validation at the trailing edge', async () => {
    const store = createFormStore(RequiredForm(), { validateOnChange: true });

    store.getState().setValue('name', '');
    await vi.advanceTimersByTimeAsync(200);
    store.getState().setValue('name', 'ab'); // resets the 300ms window, now valid
    await vi.advanceTimersByTimeAsync(200);
    expect(store.getState().fields.name.errors).toBeUndefined(); // still pending — only 200ms since reset

    await vi.advanceTimersByTimeAsync(100);
    // exactly one trailing validation ran, on the latest ('ab') value — not
    // on the stale intermediate '' value the first timer would have used.
    expect(store.getState().getValue('name')).toBe('ab');
    expect(store.getState().fields.name.errors?.length).toBe(0);
  });

  it('a subsequently valid value clears the error', async () => {
    const store = createFormStore(RequiredForm(), { validateOnChange: true });
    store.getState().setValue('name', '');
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.name.errors?.length).toBe(1);

    store.getState().setValue('name', 'filled');
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.name.errors?.length).toBe(0);
  });

  it('cascade writes (onChanges setting a sibling) do not mark it touched / schedule validation, while the user-edited source field still validates', async () => {
    const form = RequiredForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'name') m.setValue('other', ''); // nested, invalid
    });
    const store = createFormStore(form, { validateOnChange: true });
    store.getState().setValue('name', ''); // top-level, invalid — also cascades 'other'
    await vi.advanceTimersByTimeAsync(300);

    expect(store.getState().fields.name.errors?.length).toBe(1); // source field validated
    expect(store.getState().fields.other.errors).toBeUndefined(); // cascade write: untouched, unscheduled
  });

  it('untouched field is never validated by another field editing', async () => {
    const store = createFormStore(RequiredForm(), { validateOnChange: true });
    store.getState().setValue('name', 'valid');
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.other.errors).toBeUndefined();
  });

  it('custom debounceMs is honored', async () => {
    const store = createFormStore(RequiredForm(), { validateOnChange: { debounceMs: 50 } });
    store.getState().setValue('name', '');

    await vi.advanceTimersByTimeAsync(49);
    expect(store.getState().fields.name.errors).toBeUndefined();

    await vi.advanceTimersByTimeAsync(1);
    expect(store.getState().fields.name.errors?.length).toBe(1);
  });

  it('EF-R2: removeField + duplicate-name addField clears a pending stale timer/touched-mark for the replaced name — the new field is not spuriously validated', async () => {
    // Reproduces the review-gate defect: user edits 'name' (touched, trailing
    // debounce timer scheduled) — WITHIN that debounce window, an onChanges
    // handler triggered by editing a different field ('other') removes
    // 'name' and re-adds a brand-new field also named 'name' (documented
    // duplicate-replace path). Without cleanup, the stale timer for the old
    // 'name' fires validateField('name') against the new, never-touched
    // field and writes a spurious error into its slice.
    const form = RequiredForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'other') {
        m.removeField('name');
        m.addField(new StringField('name', 1).withRequired(true).withLabel('Name'));
      }
    });
    const store = createFormStore(form, { validateOnChange: true });

    store.getState().setValue('name', 'valid'); // touched, schedules a 300ms trailing timer for 'name'
    await vi.advanceTimersByTimeAsync(200); // still within the debounce window

    store.getState().setValue('other', 'valid'); // triggers onChanges: swap out/in 'name' mid-flight

    await vi.advanceTimersByTimeAsync(300); // past both the old and new timer windows

    expect(store.getState().fields.name.errors).toBeUndefined(); // new field is untouched — never validated

    // normal validate-on-change still works after the swap once the user
    // edits the new field directly.
    store.getState().setValue('name', '');
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.name.errors?.length).toBe(1);
  });

  it('initializeFormStore passes validateOnChange through to the built store', async () => {
    const { store } = await initializeFormStore({
      entityForm: RequiredForm(),
      validateOnChange: true,
    });
    store.getState().setValue('name', '');
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.name.errors?.length).toBe(1);
  });
});
