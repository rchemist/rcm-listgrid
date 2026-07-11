import { describe, expect, it } from 'vitest';
import {
  changeHidden,
  changeRequired,
  changeSelectOptions,
  EntityForm,
  StringField,
  type FormMutator,
} from '../index';

// EF2 — onChanges cascade (schema-core layer). Covers EntityForm.withOnChanges/
// getOnChanges + clone propagation, and the 3-builder catalog (port of
// src/listgrid/config/OnChangeEntityForm.ts:76-361) against a fake FormMutator
// — no store dependency, per the schema-core purity constraint (ADR-0003).

function OneFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

/**
 * Minimal in-memory FormMutator double for unit-testing builders in
 * isolation. addField/removeField (EF4) and setTabHidden (EC3-0) are unused
 * by the EF2 builder catalog under test here — no-op stubs, present only to
 * satisfy the interface.
 */
function fakeMutator(values: Record<string, unknown> = {}): FormMutator & {
  metaCalls: Array<[string, Record<string, unknown>]>;
} {
  const meta: Array<[string, Record<string, unknown>]> = [];
  return {
    getValue: (name) => values[name],
    getValues: () => ({ ...values }),
    setValue: (name, value) => {
      values[name] = value;
    },
    setMeta: (name, partial) => {
      meta.push([name, partial as Record<string, unknown>]);
    },
    addField: () => {},
    removeField: () => {},
    setTabHidden: () => {},
    metaCalls: meta,
  };
}

describe('EntityForm.withOnChanges / getOnChanges (EF2)', () => {
  it('withOnChanges appends handlers; getOnChanges returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().withOnChanges(h1).withOnChanges(h2);
    expect(form.getOnChanges()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onChanges handlers', () => {
    expect(OneFieldForm().getOnChanges()).toEqual([]);
  });

  it('clone() propagates onChanges (0.3.x parity — EntityForm.tsx:94)', () => {
    const h1 = () => {};
    const original = OneFieldForm().withOnChanges(h1);
    const cloned = original.clone();
    expect(cloned.getOnChanges()).toEqual([h1]);

    // independent arrays — mutating one does not affect the other.
    cloned.withOnChanges(() => {});
    expect(original.getOnChanges()).toHaveLength(1);
    expect(cloned.getOnChanges()).toHaveLength(2);
  });
});

describe('EntityForm.withOnInitialize / getOnInitialize (EF3)', () => {
  it('appends handlers; getOnInitialize returns them in registration order', () => {
    const h1 = (ef: EntityForm) => ef;
    const h2 = (ef: EntityForm) => ef;
    const form = OneFieldForm().withOnInitialize(h1).withOnInitialize(h2);
    expect(form.getOnInitialize()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onInitialize handlers', () => {
    expect(OneFieldForm().getOnInitialize()).toEqual([]);
  });

  it('clone() propagates onInitialize independently of the original', () => {
    const h1 = (ef: EntityForm) => ef;
    const original = OneFieldForm().withOnInitialize(h1);
    const cloned = original.clone();
    expect(cloned.getOnInitialize()).toEqual([h1]);

    cloned.withOnInitialize((ef) => ef);
    expect(original.getOnInitialize()).toHaveLength(1);
    expect(cloned.getOnInitialize()).toHaveLength(2);
  });
});

describe('EntityForm.withOnFetchData / getOnFetchData (EF3)', () => {
  it('appends handlers; getOnFetchData returns them in registration order', () => {
    const h1 = (ef: EntityForm) => ef;
    const h2 = (ef: EntityForm) => ef;
    const form = OneFieldForm().withOnFetchData(h1).withOnFetchData(h2);
    expect(form.getOnFetchData()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onFetchData handlers', () => {
    expect(OneFieldForm().getOnFetchData()).toEqual([]);
  });

  it('clone() propagates onFetchData independently of the original', () => {
    const h1 = (ef: EntityForm) => ef;
    const original = OneFieldForm().withOnFetchData(h1);
    const cloned = original.clone();
    expect(cloned.getOnFetchData()).toEqual([h1]);

    cloned.withOnFetchData((ef) => ef);
    expect(original.getOnFetchData()).toHaveLength(1);
    expect(cloned.getOnFetchData()).toHaveLength(2);
  });
});

describe('changeHidden builder', () => {
  it('single clause: matched target gets the declared boolean, unmatched gets its negation', () => {
    const handler = changeHidden('kind', { value: 'a', result: { x: true, y: false } });
    const m = fakeMutator({ kind: 'a' });
    handler(m, 'kind');
    expect(m.metaCalls).toContainEqual(['x', { hidden: true }]);
    expect(m.metaCalls).toContainEqual(['y', { hidden: false }]);

    const m2 = fakeMutator({ kind: 'not-a' });
    handler(m2, 'kind');
    expect(m2.metaCalls).toContainEqual(['x', { hidden: false }]);
    expect(m2.metaCalls).toContainEqual(['y', { hidden: true }]);
  });

  it('array of clauses: only the matching clause applies, no negation for the rest', () => {
    const handler = changeHidden('kind', [
      { value: 'a', result: { x: true } },
      { value: 'b', result: { y: true } },
    ]);
    const m = fakeMutator({ kind: 'a' });
    handler(m, 'kind');
    expect(m.metaCalls).toEqual([['x', { hidden: true }]]);
  });

  it('does not dispatch when the changed field is not the source field', () => {
    const handler = changeHidden('kind', { value: 'a', result: { x: true } });
    const m = fakeMutator({ kind: 'a' });
    handler(m, 'unrelated');
    expect(m.metaCalls).toEqual([]);
  });

  it('supports a predicate value matcher', () => {
    const handler = changeHidden('count', {
      value: (v: unknown) => typeof v === 'number' && v > 5,
      result: { x: true },
    });
    const m = fakeMutator({ count: 10 });
    handler(m, 'count');
    expect(m.metaCalls).toEqual([['x', { hidden: true }]]);
  });
});

describe('changeRequired builder', () => {
  it('single clause toggles required with negation for unmatched target values', () => {
    const handler = changeRequired('kind', { value: 'business', result: { taxId: true } });
    const matched = fakeMutator({ kind: 'business' });
    handler(matched, 'kind');
    expect(matched.metaCalls).toEqual([['taxId', { required: true }]]);

    const unmatched = fakeMutator({ kind: 'personal' });
    handler(unmatched, 'kind');
    expect(unmatched.metaCalls).toEqual([['taxId', { required: false }]]);
  });
});

describe('changeSelectOptions builder', () => {
  const A_OPTIONS = [{ value: 'x', label: 'X' }];

  it('matched clause sets the target options', () => {
    const handler = changeSelectOptions('country', { value: 'US', result: { state: A_OPTIONS } });
    const m = fakeMutator({ country: 'US' });
    handler(m, 'country');
    expect(m.metaCalls).toEqual([['state', { options: A_OPTIONS }]]);
  });

  it('unmatched clause reverts (clears) the target options override', () => {
    const handler = changeSelectOptions('country', { value: 'US', result: { state: A_OPTIONS } });
    const m = fakeMutator({ country: 'KR' });
    handler(m, 'country');
    expect(m.metaCalls).toEqual([['state', { options: undefined }]]);
  });

  it('array of clauses: each clause independently applies or reverts', () => {
    const handler = changeSelectOptions('country', [
      { value: 'US', result: { state: A_OPTIONS } },
      { value: 'KR', result: { province: A_OPTIONS } },
    ]);
    const m = fakeMutator({ country: 'US' });
    handler(m, 'country');
    expect(m.metaCalls).toEqual([
      ['state', { options: A_OPTIONS }],
      ['province', { options: undefined }],
    ]);
  });
});
