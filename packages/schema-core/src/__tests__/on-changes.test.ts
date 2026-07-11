import { describe, expect, it } from 'vitest';
import {
  changeHidden,
  changeRequired,
  changeSelectOptions,
  EntityForm,
  StringField,
  type FormMutator,
} from '../index';

// EF2 — onChange cascade (schema-core layer). Covers EntityForm.onChange/
// getChangeHandlers + clone propagation (W2-1 rename from withOnChanges/
// getOnChanges), the onInit/getInitHandlers registration surface (spec
// §3.3/§4.1; W2-1 consolidation of the former withOnFetchData/
// withOnInitialize pair), and the 3-builder catalog (port of
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

describe('EntityForm.onChange / getChangeHandlers (EF2; W2-1 renamed from withOnChanges/getOnChanges)', () => {
  it('onChange appends handlers; getChangeHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onChange(h1).onChange(h2);
    expect(form.getChangeHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no change handlers', () => {
    expect(OneFieldForm().getChangeHandlers()).toEqual([]);
  });

  it('clone() propagates changeHandlers (0.3.x parity — EntityForm.tsx:94)', () => {
    const h1 = () => {};
    const original = OneFieldForm().onChange(h1);
    const cloned = original.clone();
    expect(cloned.getChangeHandlers()).toEqual([h1]);

    // independent arrays — mutating one does not affect the other.
    cloned.onChange(() => {});
    expect(original.getChangeHandlers()).toHaveLength(1);
    expect(cloned.getChangeHandlers()).toHaveLength(2);
  });
});

// spec §3.3/§4.1 (W2-1) — onInit consolidates the former separate
// withOnFetchData/withOnInitialize arrays into one; these registration-order/
// clone-propagation tests are behavior-equivalent to the old
// withOnInitialize/withOnFetchData describe blocks they replace (only the
// registration surface changed — dispatch-order semantics are covered at the
// pipe level, @listgrid/state/__tests__/initialize-form-store.test.ts).
describe('EntityForm.onInit / getInitHandlers (spec §3.3/§4.1)', () => {
  it('onInit appends handlers; getInitHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onInit(h1).onInit(h2);
    expect(form.getInitHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no init handlers', () => {
    expect(OneFieldForm().getInitHandlers()).toEqual([]);
  });

  it('clone() propagates initHandlers independently of the original', () => {
    const h1 = () => {};
    const original = OneFieldForm().onInit(h1);
    const cloned = original.clone();
    expect(cloned.getInitHandlers()).toEqual([h1]);

    cloned.onInit(() => {});
    expect(original.getInitHandlers()).toHaveLength(1);
    expect(cloned.getInitHandlers()).toHaveLength(2);
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

  it('a matched clause wins over an unmatched same-field clause regardless of order (W2-8 race)', () => {
    const KR_OPTIONS = [{ value: 'kr', label: 'KR' }];
    // Both clauses target `state`: US matches (apply A_OPTIONS), KR does not
    // (would revert). Old single-pass: the apply and the revert raced, so the
    // settled options depended on clause order. Two-pass: the match always
    // wins, and each field settles with exactly ONE setMeta call.
    const forward = changeSelectOptions('country', [
      { value: 'US', result: { state: A_OPTIONS } },
      { value: 'KR', result: { state: KR_OPTIONS } },
    ]);
    const reversed = changeSelectOptions('country', [
      { value: 'KR', result: { state: KR_OPTIONS } },
      { value: 'US', result: { state: A_OPTIONS } },
    ]);

    const mForward = fakeMutator({ country: 'US' });
    forward(mForward, 'country');
    expect(mForward.metaCalls).toEqual([['state', { options: A_OPTIONS }]]);

    const mReversed = fakeMutator({ country: 'US' });
    reversed(mReversed, 'country');
    expect(mReversed.metaCalls).toEqual([['state', { options: A_OPTIONS }]]);
  });

  it('reverts a field no matched clause claims, even when a sibling field is matched', () => {
    // `state` matched (US) → applied; `zip` only appears in the unmatched KR
    // clause → reverted. One settled setMeta per field.
    const handler = changeSelectOptions('country', [
      { value: 'US', result: { state: A_OPTIONS } },
      { value: 'KR', result: { zip: A_OPTIONS } },
    ]);
    const m = fakeMutator({ country: 'US' });
    handler(m, 'country');
    expect(m.metaCalls).toEqual([
      ['state', { options: A_OPTIONS }],
      ['zip', { options: undefined }],
    ]);
  });
});
