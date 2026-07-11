import { describe, expect, it, vi } from 'vitest';
import { EntityForm, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EF2 — onChanges cascade (state layer). Covers: dispatch order, sibling
// setValue/setMeta visibility through the FormMutator adapter, the
// synchronous-batch loop-guard (A -> B -> A terminates, A -> B -> C fully
// executes), and async fire-and-forget not blocking setValue.

function ThreeFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('a', 1).withLabel('A'),
      new StringField('b', 2).withLabel('B'),
      new StringField('c', 3).withLabel('C'),
    ],
  });
}

describe('form-store onChanges cascade (EF2)', () => {
  it('runs every registered handler, in registration order, on every setValue', () => {
    const calls: string[] = [];
    const form = ThreeFieldForm()
      .onChange(() => {
        calls.push('first');
      })
      .onChange(() => {
        calls.push('second');
      });
    const store = createFormStore(form);
    store.getState().setValue('a', 'x');
    expect(calls).toEqual(['first', 'second']);
  });

  it('every handler runs on every field change (not just its "own" field)', () => {
    const seen: Array<[string, string]> = [];
    const form = ThreeFieldForm().onChange((_m, changedField) => {
      seen.push(['handler', changedField]);
    });
    const store = createFormStore(form);
    store.getState().setValue('a', '1');
    store.getState().setValue('b', '2');
    expect(seen).toEqual([
      ['handler', 'a'],
      ['handler', 'b'],
    ]);
  });

  it('a handler mutating a sibling field via m.setValue is visible in the store', () => {
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') m.setValue('b', `derived-from-${m.getValue('a')}`);
    });
    const store = createFormStore(form);
    store.getState().setValue('a', 'hello');
    expect(store.getState().getValue('b')).toBe('derived-from-hello');
  });

  it('a handler mutating meta via m.setMeta is visible via the EF1 meta read path', () => {
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') m.setMeta('b', { required: true, hidden: true });
    });
    const store = createFormStore(form);
    store.getState().setValue('a', 'x');
    expect(store.getState().getMeta('b')).toEqual({ required: true, hidden: true });
  });

  it('chain A -> B -> C fully executes', () => {
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') m.setValue('b', 'from-a');
      if (changedField === 'b') m.setValue('c', 'from-b');
    });
    const store = createFormStore(form);
    store.getState().setValue('a', 'go');
    expect(store.getState().getValue('b')).toBe('from-a');
    expect(store.getState().getValue('c')).toBe('from-b');
  });

  it('loop-guard: A -> B -> A terminates and both values are written', () => {
    let bDispatchCount = 0;
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') {
        m.setValue('b', 'from-a');
      } else if (changedField === 'b') {
        bDispatchCount++;
        // re-entrant: try to bounce back to 'a' — must not re-dispatch 'a' handlers
        m.setValue('a', 'from-b');
      }
    });
    const store = createFormStore(form);
    expect(() => store.getState().setValue('a', 'start')).not.toThrow();

    // both values ARE written (nested setValue always writes)...
    expect(store.getState().getValue('b')).toBe('from-a');
    expect(store.getState().getValue('a')).toBe('from-b');
    // ...but the guard stopped the loop: b's handler body only ran once
    // (the re-entrant 'a' write did not re-dispatch, so it never produced a
    // second 'b' write / infinite recursion).
    expect(bDispatchCount).toBe(1);
  });

  it('a later, independent top-level setValue starts a fresh batch (not blocked by a prior guard)', () => {
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') m.setValue('b', 'from-a');
    });
    const store = createFormStore(form);
    store.getState().setValue('a', '1st');
    store.getState().setValue('a', '2nd');
    expect(store.getState().getValue('b')).toBe('from-a');
  });

  it('an async handler is fire-and-forget: setValue returns synchronously and does not throw', async () => {
    let resolveHandler!: () => void;
    const pending = new Promise<void>((resolve) => {
      resolveHandler = resolve;
    });
    const form = ThreeFieldForm().onChange(async (m: FormMutator, changedField) => {
      if (changedField !== 'a') return;
      await pending;
      m.setValue('b', 'after-await');
    });
    const store = createFormStore(form);

    // setValue itself must be synchronous — it does not wait for the handler.
    expect(() => store.getState().setValue('a', 'go')).not.toThrow();
    expect(store.getState().getValue('b')).toBeUndefined();

    resolveHandler();
    await vi.waitFor(() => expect(store.getState().getValue('b')).toBe('after-await'));
  });

  it('an async handler rejection does not surface as an unhandled rejection / does not throw', async () => {
    const form = ThreeFieldForm().onChange(async (_m, changedField) => {
      if (changedField === 'a') throw new Error('boom');
    });
    const store = createFormStore(form);
    expect(() => store.getState().setValue('a', 'go')).not.toThrow();
    // let the rejected promise settle
    await new Promise((r) => setTimeout(r, 0));
  });

  it('mutator.getValues() snapshots every field’s resolved current value', () => {
    let snapshot: Record<string, unknown> = {};
    const form = ThreeFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'a') snapshot = m.getValues();
    });
    const store = createFormStore(form);
    store.getState().setValue('b', 'B1');
    store.getState().setValue('a', 'A1');
    expect(snapshot).toEqual({ a: 'A1', b: 'B1', c: undefined });
  });
});
