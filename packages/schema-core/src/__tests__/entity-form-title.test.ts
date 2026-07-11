import { describe, expect, it } from 'vitest';
import { EntityForm } from '../index';

// EntityForm.withTitle/getTitle (spec §3.1; W4-1) — the 5-step resolution
// chain (text → fromField's values → the `name` field's values → id →
// renderType fallback), each step's "empty" test being null/undefined/''/
// whitespace-only (String-convert then trim). Seals the named 0.3.x defect
// (L8: old getTitle's `''` default) — getTitle() must ALWAYS be a non-empty
// string, even with no `withTitle` call and no `values` argument at all.

function BareForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget');
}

describe("EntityForm.getTitle (spec §3.1) — always non-empty (old `''` bug sealed)", () => {
  it('no withTitle call, no args: falls all the way to the final fallback, non-empty', () => {
    const title = BareForm().getTitle();
    expect(title).not.toBe('');
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it('no withTitle call, empty values object: still non-empty', () => {
    const title = BareForm().getTitle({});
    expect(title).not.toBe('');
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it('final fallback is EntityForm.name (deviation — spec-silent on exact copy)', () => {
    expect(BareForm().getTitle()).toBe('WidgetEntityForm');
  });
});

describe('EntityForm.getTitle — chain priority (spec §3.1)', () => {
  it('step 1: declared text (withTitle(string)) wins over everything else', () => {
    const form = BareForm().withTitle('Explicit Title').withId('42');
    expect(form.getTitle({ name: 'Field Name', other: 'x' })).toBe('Explicit Title');
  });

  it('step 1 (object form): withTitle({text}) behaves the same as withTitle(string)', () => {
    const form = BareForm().withTitle({ text: 'Object Title' });
    expect(form.getTitle()).toBe('Object Title');
  });

  it('step 2: no text, fromField declared → values[fromField] wins over the name field / id', () => {
    const form = BareForm().withTitle({ fromField: 'label' }).withId('42');
    expect(form.getTitle({ label: 'From Field', name: 'From Name Field' })).toBe('From Field');
  });

  it('step 3: no text, no fromField (or fromField empty) → values["name"] wins over id', () => {
    const form = BareForm().withId('42');
    expect(form.getTitle({ name: 'Named Record' })).toBe('Named Record');
  });

  it('step 3: fromField declared but its value is empty → falls through to values["name"]', () => {
    const form = BareForm().withTitle({ fromField: 'label' }).withId('42');
    expect(form.getTitle({ label: '   ', name: 'Named Record' })).toBe('Named Record');
  });

  it('step 4: no text/fromField-value/name-value → falls to getId()', () => {
    const form = BareForm().withId('rec-42');
    expect(form.getTitle()).toBe('rec-42');
    expect(form.getTitle({})).toBe('rec-42');
  });

  it('step 3 value empty → falls through to id (step 4)', () => {
    const form = BareForm().withId('rec-42');
    expect(form.getTitle({ name: '' })).toBe('rec-42');
  });

  it('step 5: no text/fromField/name/id → final fallback (EntityForm.name)', () => {
    const form = BareForm();
    expect(form.getTitle({ name: '' })).toBe('WidgetEntityForm');
  });

  it('withTitle({text}) empty falls through to fromField', () => {
    const form = BareForm().withTitle({ text: '   ', fromField: 'label' });
    expect(form.getTitle({ label: 'From Field' })).toBe('From Field');
  });
});

describe('EntityForm.getTitle — non-empty accepts non-string values (String-convert)', () => {
  it("a numeric fromField value counts as non-empty (String(0) !== '')", () => {
    const form = BareForm().withTitle({ fromField: 'code' });
    expect(form.getTitle({ code: 0 })).toBe('0');
  });
});

describe('EntityForm.withTitle — replace semantics (L1 with* default: set/replace, no merge)', () => {
  it('a later withTitle call fully replaces the earlier declaration', () => {
    const form = BareForm().withTitle({ fromField: 'label' }).withTitle('Plain String');
    expect(form.getTitle({ label: 'ignored' })).toBe('Plain String');
  });
});

describe('EntityForm.clone() — titleSpec propagates independently (spec §3.1)', () => {
  it('cloned form keeps the original title declaration', () => {
    const original = BareForm().withTitle({ fromField: 'label' });
    const cloned = original.clone();
    expect(cloned.getTitle({ label: 'From Clone' })).toBe('From Clone');
  });

  it('mutating the clone does not affect the original', () => {
    const original = BareForm().withTitle('Original');
    const cloned = original.clone().withTitle('Replaced');
    expect(original.getTitle()).toBe('Original');
    expect(cloned.getTitle()).toBe('Replaced');
  });
});

// Backward-compat guard — the pre-existing no-args call pattern
// (field-core.test.ts / initialize-form-store.test.ts) must keep working
// unchanged: getTitle() with no `values` argument still resolves step 1.
describe('EntityForm.getTitle — no-args call (backward-compat, pre-existing test pattern)', () => {
  it('withTitle(string) then getTitle() with no arguments returns the declared text', () => {
    const form = BareForm().withTitle('menu.academic.university.college');
    expect(form.getTitle()).toBe('menu.academic.university.college');
  });
});
