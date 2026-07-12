import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, type DataFieldSpec } from '../index';

// EntityForm.withDataTransfer/getDataTransfer (spec §3.5, CAP-16; W6-1) — the
// data-transfer DECLARATION surface only (no /excel runtime here). Covers:
// with/get round-trip (explicit fields verbatim), the :448 regression (import
// must never fall back to export's fields), auto-derive in declaration
// (order-sorted) order, getDataTransfer() being synchronous, and clone()
// propagation. Value-transform/xlsx behavior is out of scope (W6-2).

// Declared out of push order (c, a, b) but with `order` 1/2/3 for a/b/c
// respectively — getFields() (and therefore auto-derive) must reflect the
// ORDER-sorted sequence a, b, c, proving the derivation rides getFields()'s
// own declaration-order contract rather than raw push/array order.
function ThreeFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('c', 3).withLabel('C'),
      new StringField('a', 1).withLabel('A'),
      new StringField('b', 2).withLabel('B'),
    ],
  });
}

describe('EntityForm.getDataTransfer() — undeclared default', () => {
  it('returns undefined when withDataTransfer() was never called', () => {
    expect(ThreeFieldForm().getDataTransfer()).toBeUndefined();
  });
});

describe('EntityForm.withDataTransfer/getDataTransfer — round-trip (explicit fields verbatim)', () => {
  it('explicit export.fields + fileName round-trip verbatim (no auto-derive)', () => {
    const explicitFields: DataFieldSpec[] = [{ name: 'custom', label: 'Custom', type: 'text' }];
    const form = ThreeFieldForm().withDataTransfer({
      export: { fields: explicitFields, fileName: 'widgets.xlsx' },
    });
    expect(form.getDataTransfer()).toEqual({
      export: { fields: explicitFields, fileName: 'widgets.xlsx' },
    });
  });

  it('explicit import.fields round-trip verbatim (no auto-derive)', () => {
    const explicitFields: DataFieldSpec[] = [{ name: 'onlyThis' }];
    const form = ThreeFieldForm().withDataTransfer({ import: { fields: explicitFields } });
    expect(form.getDataTransfer()).toEqual({ import: { fields: explicitFields } });
  });

  it('withDataTransfer() is chainable (returns this)', () => {
    const form = ThreeFieldForm();
    expect(form.withDataTransfer({ export: {} })).toBe(form);
  });

  it('a side never declared in the input stays undefined in the resolved output', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: { fields: [{ name: 'a' }] } });
    const dt = form.getDataTransfer();
    expect(dt?.export).toBeDefined();
    expect(dt?.import).toBeUndefined();
  });

  it('export.fields without fileName resolves without a fileName key', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: { fields: [{ name: 'a' }] } });
    expect(form.getDataTransfer()?.export?.fileName).toBeUndefined();
    expect(Object.keys(form.getDataTransfer()?.export ?? {})).not.toContain('fileName');
  });
});

describe(':448 regression — import fallback reads ONLY import.fields, never export.fields', () => {
  it('export.fields SET + import.fields EMPTY: import auto-derives from declared fields, not from export', () => {
    const form = ThreeFieldForm().withDataTransfer({
      export: { fields: [{ name: 'x', label: 'X' }] },
      import: {},
    });
    const dt = form.getDataTransfer();
    // import must NOT pick up export's 'x' field.
    expect(dt?.import?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
    // export stays exactly what was declared, untouched by import's resolution.
    expect(dt?.export?.fields).toEqual([{ name: 'x', label: 'X' }]);
  });

  it('export.fields SET + import.fields = [] (explicit empty array): same auto-derive, not export', () => {
    const form = ThreeFieldForm().withDataTransfer({
      export: { fields: [{ name: 'x', label: 'X' }] },
      import: { fields: [] },
    });
    const dt = form.getDataTransfer();
    expect(dt?.import?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('symmetric case: import.fields SET + export.fields EMPTY — export auto-derives, not from import', () => {
    const form = ThreeFieldForm().withDataTransfer({
      export: {},
      import: { fields: [{ name: 'y', label: 'Y' }] },
    });
    const dt = form.getDataTransfer();
    expect(dt?.export?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
    expect(dt?.import?.fields).toEqual([{ name: 'y', label: 'Y' }]);
  });
});

describe('auto-derive — declaration (order-sorted) order + label/type derivation', () => {
  it('both sides unset (fields omitted) auto-derive in the same order-sorted sequence as getFields()', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: {}, import: {} });
    const dt = form.getDataTransfer();
    expect(dt?.export?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
    expect(dt?.import?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('auto-derived DataFieldSpec carries label (string getLabel()) and type verbatim from the declared field', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: {} });
    const fields = form.getDataTransfer()?.export?.fields;
    expect(fields).toEqual([
      { name: 'a', label: 'A', type: 'text' },
      { name: 'b', label: 'B', type: 'text' },
      { name: 'c', label: 'C', type: 'text' },
    ]);
  });

  it('a field with a non-string label (withLabel(false)) auto-derives with label omitted (undefined)', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({ items: [new StringField('hiddenLabel', 1).withLabel(false)] })
      .withDataTransfer({ export: {} });
    const fields = form.getDataTransfer()?.export?.fields;
    expect(fields).toEqual([{ name: 'hiddenLabel', type: 'text' }]);
    expect(fields?.[0]?.label).toBeUndefined();
  });
});

describe('getDataTransfer() is synchronous (no Promise)', () => {
  it('the result is usable directly, with no await, and is not a Promise instance', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: {} });
    const result = form.getDataTransfer();
    expect(result).not.toBeInstanceOf(Promise);
    // Using the resolved value directly (no `await`) proves synchronicity —
    // a Promise would have no `.export` property and this would fail.
    expect(result?.export?.fields).toHaveLength(3);
  });
});

describe('EntityForm.clone() propagates the declared data-transfer config', () => {
  it('clone() carries over an explicitly-declared config', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: { fields: [{ name: 'x' }] } });
    const cloned = form.clone();
    expect(cloned.getDataTransfer()).toEqual({ export: { fields: [{ name: 'x' }] } });
  });

  it('clone() of a form with no declared data-transfer stays undefined', () => {
    const form = ThreeFieldForm();
    expect(form.clone().getDataTransfer()).toBeUndefined();
  });

  it("clone() also propagates auto-derive behavior (resolves against the CLONE's own getFields())", () => {
    const form = ThreeFieldForm().withDataTransfer({ export: {} });
    const cloned = form.clone();
    expect(cloned.getDataTransfer()?.export?.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('clone independence — mutating the CLONE via withDataTransfer does not affect the original', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: { fields: [{ name: 'original' }] } });
    const cloned = form.clone();
    cloned.withDataTransfer({ export: { fields: [{ name: 'mutated' }] } });
    expect(cloned.getDataTransfer()).toEqual({ export: { fields: [{ name: 'mutated' }] } });
    expect(form.getDataTransfer()).toEqual({ export: { fields: [{ name: 'original' }] } });
  });

  it('clone independence — mutating the ORIGINAL via withDataTransfer after clone() does not affect the clone', () => {
    const form = ThreeFieldForm().withDataTransfer({ export: { fields: [{ name: 'original' }] } });
    const cloned = form.clone();
    form.withDataTransfer({ export: { fields: [{ name: 'mutated' }] } });
    expect(form.getDataTransfer()).toEqual({ export: { fields: [{ name: 'mutated' }] } });
    expect(cloned.getDataTransfer()).toEqual({ export: { fields: [{ name: 'original' }] } });
  });
});
