import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityForm, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EA-B0 — setValue(name, value, { cascade?: boolean }). cascade:false skips
// ONLY the dispatchOnChanges call (old-engine FieldRenderer.tsx
// propagation=false parity, ea-b-scout-briefing.md PART A) — writeValue/dirty
// recompute, touched marking, and validate-on-change scheduling all stay
// exactly as they are without the option. Independent condition from the
// isTopLevel/dispatchBatch loop-guard (EF2); not exposed on FormMutator
// (handler-driven setValue is unaffected — this option only exists on the
// store's own setValue).

function TwoFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('a', 1).withRequired(true).withLabel('A'),
      new StringField('b', 2).withLabel('B'),
    ],
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('form-store setValue cascade option (EA-B0)', () => {
  it('cascade:false skips onChanges dispatch for that write; a sibling default setValue still dispatches', () => {
    const calls: string[] = [];
    const form = TwoFieldForm().onChange((_m, changedField) => {
      calls.push(changedField);
    });
    const store = createFormStore(form);

    store.getState().setValue('a', 'mid-keystroke', { cascade: false });
    expect(calls).toEqual([]);

    store.getState().setValue('b', 'default-call'); // no opts — dispatches as before
    expect(calls).toEqual(['b']);
  });

  it('cascade:false still writes the value and recomputes dirty', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setValue('a', 'x', { cascade: false });
    expect(store.getState().getValue('a')).toBe('x');
    expect(store.getState().fields.a.dirty).toBe(true);
  });

  it('cascade:false still marks touched + schedules validate-on-change (validateOnChange:true)', async () => {
    const store = createFormStore(TwoFieldForm(), { validateOnChange: true });
    store.getState().setValue('a', '', { cascade: false }); // invalid (required), mid-keystroke style
    expect(store.getState().fields.a.errors).toBeUndefined(); // debounce pending

    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().fields.a.errors?.length).toBe(1); // touched + scheduled despite cascade:false
  });

  it('the loop-guard is unaffected: a handler-driven cascade write (no opts) still runs, and re-entry still terminates', () => {
    let bDispatchCount = 0;
    const form = TwoFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') {
        m.setValue('b', 'from-a');
      } else if (changedField === 'b') {
        bDispatchCount++;
        m.setValue('a', 'from-b'); // re-entrant — must not re-dispatch 'a' handlers
      }
    });
    const store = createFormStore(form);

    // a cascade:false top-level write does not even start the chain...
    store.getState().setValue('a', 'quiet', { cascade: false });
    expect(store.getState().getValue('b')).toBeUndefined();
    expect(bDispatchCount).toBe(0);

    // ...but a normal top-level write still runs the full A -> B -> A chain
    // and the loop-guard still stops it after one 'b' dispatch.
    expect(() => store.getState().setValue('a', 'start')).not.toThrow();
    expect(store.getState().getValue('b')).toBe('from-a');
    expect(store.getState().getValue('a')).toBe('from-b');
    expect(bDispatchCount).toBe(1);
  });

  it('FormMutator handler-driven setValue is unchanged (no opts param, always cascades)', () => {
    const calls: string[] = [];
    const form = TwoFieldForm().onChange((m: FormMutator, changedField) => {
      calls.push(changedField);
      if (changedField === 'a') m.setValue('b', 'derived');
    });
    const store = createFormStore(form);
    store.getState().setValue('a', 'go');
    expect(calls).toEqual(['a', 'b']); // 'b' handler-driven write dispatched too
    expect(store.getState().getValue('b')).toBe('derived');
  });

  it('omitting opts entirely (2-arg call) keeps default cascading behavior (back-compat)', () => {
    const calls: string[] = [];
    const form = TwoFieldForm().onChange((_m, changedField) => calls.push(changedField));
    const store = createFormStore(form);
    store.getState().setValue('a', 'x');
    expect(calls).toEqual(['a']);
  });
});
