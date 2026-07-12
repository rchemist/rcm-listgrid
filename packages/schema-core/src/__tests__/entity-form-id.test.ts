import { describe, expect, it } from 'vitest';
import { EntityForm } from '../index';

// EntityForm.withId / getId (spec §3.1, R10) — the record-id declaration.
// Covers: round-trip, undefined clear (L4 "undefined = release"),
// chainability, and replace semantics. Mirrors revision.test.ts's
// withRevision coverage shape.

function BareForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget');
}

describe('EntityForm.withId / getId (round-trip)', () => {
  it('an EntityForm with no withId() call reports getId() === undefined', () => {
    const form = BareForm();
    expect(form.getId()).toBeUndefined();
  });

  it("withId('42') round-trips: getId() === '42'", () => {
    const form = BareForm().withId('42');
    expect(form.getId()).toBe('42');
  });

  it('withId(undefined) clears a previously-set id back to undefined (L4)', () => {
    const form = BareForm().withId('42');
    expect(form.getId()).toBe('42');
    form.withId(undefined);
    expect(form.getId()).toBeUndefined();
  });

  it('withId() is chainable (returns this)', () => {
    const form = BareForm();
    expect(form.withId('42')).toBe(form);
  });

  it('a later withId() call REPLACES the previous declaration (L1 with* semantics)', () => {
    const form = BareForm().withId('first');
    form.withId('second');
    expect(form.getId()).toBe('second');
  });
});
