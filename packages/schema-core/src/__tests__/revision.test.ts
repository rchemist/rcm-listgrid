import { describe, expect, it } from 'vitest';
import { EntityForm } from '../index';

// EntityForm.withRevision / getRevisionEntityName (spec §3.1/§6.2, CAP-07;
// W4-4) — the revision/audit-trail entity name declaration. Covers:
// round-trip, undefined clear, chainability, and the sealed 0.3.x defect —
// the old `getRevisionEntityName()` always fell back to
// `revisionEntityName || menuUrl || name` (always-truthy, dead-code guards
// elsewhere in the codebase); the new getter reports EXACTLY what was
// declared, `undefined` when nothing was, with NO menuUrl/name fallback.
// Save/delete payload injection (createFormController, @listgrid/state) is
// covered separately in form-controller.test.ts — this file is the pure
// declaration layer only.

function BareForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget');
}

describe('EntityForm.withRevision / getRevisionEntityName (round-trip)', () => {
  it('an EntityForm with no withRevision() call reports undefined (no menuUrl/name fallback — 0.3.x always-truthy bug sealed)', () => {
    const form = BareForm();
    expect(form.getRevisionEntityName()).toBeUndefined();
  });

  it("withRevision('x') round-trips: getRevisionEntityName() === 'x'", () => {
    const form = BareForm().withRevision('x');
    expect(form.getRevisionEntityName()).toBe('x');
  });

  it('withRevision(undefined) clears a previously-declared value back to undefined', () => {
    const form = BareForm().withRevision('x');
    expect(form.getRevisionEntityName()).toBe('x');
    form.withRevision(undefined);
    expect(form.getRevisionEntityName()).toBeUndefined();
  });

  it('withRevision() is chainable (returns this)', () => {
    const form = BareForm();
    expect(form.withRevision('x')).toBe(form);
  });

  it('a later withRevision() call REPLACES the previous declaration (L1 with* semantics)', () => {
    const form = BareForm().withRevision('first');
    form.withRevision('second');
    expect(form.getRevisionEntityName()).toBe('second');
  });

  it('getRevisionEntityName() never falls back to the form name or url, even when both are non-empty (0.3.x menuUrl/name fallback removed)', () => {
    const form = new EntityForm('SomeEntity', '/some-url');
    expect(form.getRevisionEntityName()).toBeUndefined();
    expect(form.getRevisionEntityName()).not.toBe('SomeEntity');
    expect(form.getRevisionEntityName()).not.toBe('/some-url');
  });
});

describe('EntityForm.clone() propagates the declared revision entity name', () => {
  it('clone() carries over an explicitly-declared value', () => {
    const form = BareForm().withRevision('x');
    const cloned = form.clone();
    expect(cloned.getRevisionEntityName()).toBe('x');
  });

  it('clone() of a form with no declared revision stays undefined', () => {
    const form = BareForm();
    expect(form.clone().getRevisionEntityName()).toBeUndefined();
  });

  it('clone independence — mutating the CLONE via withRevision does not affect the original', () => {
    const form = BareForm().withRevision('original');
    const cloned = form.clone();
    cloned.withRevision('mutated-on-clone');
    expect(cloned.getRevisionEntityName()).toBe('mutated-on-clone');
    expect(form.getRevisionEntityName()).toBe('original');
  });

  it('clone independence — mutating the ORIGINAL via withRevision after clone() does not affect the clone', () => {
    const form = BareForm().withRevision('original');
    const cloned = form.clone();
    form.withRevision('mutated-on-original');
    expect(form.getRevisionEntityName()).toBe('mutated-on-original');
    expect(cloned.getRevisionEntityName()).toBe('original');
  });
});
