import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

// EF7 — EntityForm.setValue/setFetchedValue (schema-core layer). Ported from
// the 0.3.x EntityForm.tsx setFetchedValue (135-152) — setValue is the new
// override primitive an onFetchData/onInitialize handler uses to win over a
// value the initializeFormStore pipe's BIND step already wrote (see
// @listgrid/state initialize-form-store.ts). Unit-level coverage,
// complementing the pipe-level integration tests in
// @listgrid/state/__tests__/initialize-form-store.test.ts.

function OneFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

describe('EntityForm.setValue (EF7)', () => {
  it('sets the field current value; is chainable (returns this)', () => {
    const ef = OneFieldForm();
    const returned = ef.setValue('name', 'set-via-setValue');
    expect(returned).toBe(ef);
    expect(ef.getField('name')?.value?.current).toBe('set-via-setValue');
  });

  it('UNCONDITIONALLY overwrites a pre-existing current value (override semantics)', () => {
    const ef = OneFieldForm();
    ef.getField('name')!.value = { fetched: 'record-value', current: 'record-value' };
    ef.setValue('name', 'override');
    expect(ef.getField('name')?.value?.current).toBe('override');
    // fetched is untouched — setValue never touches the fetched baseline.
    expect(ef.getField('name')?.value?.fetched).toBe('record-value');
  });

  it('a nonexistent field name is a silent no-op', () => {
    const ef = OneFieldForm();
    expect(() => ef.setValue('does-not-exist', 'x')).not.toThrow();
  });
});

describe('EntityForm.setFetchedValue (EF7)', () => {
  it('sets the field fetched value; is chainable (returns this)', () => {
    const ef = OneFieldForm();
    const returned = ef.setFetchedValue('name', 'from-record');
    expect(returned).toBe(ef);
    expect(ef.getField('name')?.value?.fetched).toBe('from-record');
  });

  it('also sets current when current was undefined', () => {
    const ef = OneFieldForm();
    ef.setFetchedValue('name', 'from-record');
    expect(ef.getField('name')?.value?.current).toBe('from-record');
  });

  it('does NOT overwrite an already-set current (declared withValue / an earlier setValue wins)', () => {
    const ef = OneFieldForm();
    ef.setValue('name', 'declared-current');
    ef.setFetchedValue('name', 'from-record');
    expect(ef.getField('name')?.value?.current).toBe('declared-current');
    expect(ef.getField('name')?.value?.fetched).toBe('from-record');
  });

  it('a nonexistent field name is a silent no-op', () => {
    const ef = OneFieldForm();
    expect(() => ef.setFetchedValue('does-not-exist', 'x')).not.toThrow();
  });
});
