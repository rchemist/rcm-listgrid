import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore, type FormMessage } from '../form-store';

// W2-3 (spec §6.1) — the form-level banner channel (`messages`), replacing
// the old inert `formErrors: string[]`. Covers: the empty seed, addMessage
// (append + same-key replace), removeMessage(key), and clearMessages'
// persistent-aware clear-on-success semantics (spec §6.2 canonical save
// flow's "성공: 비persistent messages clear" step). This is NOT a
// field-error store (see FormMessage doc, form-store.ts) — field errors are
// covered by the existing field-slice `.errors` tests elsewhere.

function WidgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

describe('FormStoreState.messages — seed', () => {
  it('seeds an empty array', () => {
    const store = createFormStore(WidgetForm());
    expect(store.getState().messages).toEqual([]);
  });
});

describe('store.addMessage', () => {
  it('appends a message', () => {
    const store = createFormStore(WidgetForm());
    const msg: FormMessage = { key: 'save-error', severity: 'error', text: 'Save failed' };
    store.getState().addMessage(msg);
    expect(store.getState().messages).toEqual([msg]);
  });

  it('appends multiple distinct-key messages in call order', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'a', severity: 'error', text: 'A' });
    store.getState().addMessage({ key: 'b', severity: 'warning', text: 'B' });
    expect(store.getState().messages.map((m) => m.key)).toEqual(['a', 'b']);
  });

  it('a message with an already-present key REPLACES the existing entry (not a duplicate)', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'dup', severity: 'error', text: 'first' });
    store.getState().addMessage({ key: 'dup', severity: 'warning', text: 'second' });
    expect(store.getState().messages).toEqual([
      { key: 'dup', severity: 'warning', text: 'second' },
    ]);
  });
});

describe('store.removeMessage', () => {
  it('removes the message with the given key', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'a', severity: 'error', text: 'A' });
    store.getState().addMessage({ key: 'b', severity: 'info', text: 'B' });
    store.getState().removeMessage('a');
    expect(store.getState().messages).toEqual([{ key: 'b', severity: 'info', text: 'B' }]);
  });

  it('is a no-op when the key is absent', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'a', severity: 'error', text: 'A' });
    store.getState().removeMessage('missing');
    expect(store.getState().messages).toEqual([{ key: 'a', severity: 'error', text: 'A' }]);
  });
});

describe('store.clearMessages', () => {
  it('with no opts, clears only non-persistent messages (clear-on-success, spec §6.2)', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'transient', severity: 'error', text: 'gone' });
    store.getState().addMessage({
      key: 'sticky',
      severity: 'warning',
      text: 'stays',
      persistent: true,
    });
    store.getState().clearMessages();
    expect(store.getState().messages).toEqual([
      { key: 'sticky', severity: 'warning', text: 'stays', persistent: true },
    ]);
  });

  it('with empty opts ({}), also clears only non-persistent messages', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'transient', severity: 'error', text: 'gone' });
    store.getState().addMessage({
      key: 'sticky',
      severity: 'warning',
      text: 'stays',
      persistent: true,
    });
    store.getState().clearMessages({});
    expect(store.getState().messages).toEqual([
      { key: 'sticky', severity: 'warning', text: 'stays', persistent: true },
    ]);
  });

  it('{ includePersistent: true } clears every message', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'transient', severity: 'error', text: 'gone' });
    store.getState().addMessage({
      key: 'sticky',
      severity: 'warning',
      text: 'stays',
      persistent: true,
    });
    store.getState().clearMessages({ includePersistent: true });
    expect(store.getState().messages).toEqual([]);
  });

  it('round-trips: add, remove one, clear the rest', () => {
    const store = createFormStore(WidgetForm());
    store.getState().addMessage({ key: 'a', severity: 'error', text: 'A' });
    store.getState().addMessage({ key: 'b', severity: 'info', text: 'B' });
    store.getState().removeMessage('a');
    expect(store.getState().messages).toEqual([{ key: 'b', severity: 'info', text: 'B' }]);
    store.getState().clearMessages({ includePersistent: true });
    expect(store.getState().messages).toEqual([]);
  });
});
