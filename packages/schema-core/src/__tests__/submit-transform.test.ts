import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

// EF6 — submit-transform hook (schema-core layer). Covers EntityForm.
// withSubmitTransform/getSubmitTransform + clone propagation, mirroring the
// EF2/EF3 hook-registration test pattern (on-changes.test.ts). Successor to
// the 0.3.x `withOverrideSubmitData` (single-slot, not a list — parity).

function OneFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

describe('EntityForm submit-transform (EF6)', () => {
  it('getSubmitTransform is undefined when none registered', () => {
    const ef = OneFieldForm();
    expect(ef.getSubmitTransform()).toBeUndefined();
  });

  it('withSubmitTransform registers a handler retrievable via getSubmitTransform', () => {
    const ef = OneFieldForm();
    const handler = (data: Record<string, unknown>) => ({ ...data, extra: true });
    const returned = ef.withSubmitTransform(handler);
    expect(returned).toBe(ef); // builder returns `this` (charter C1 grammar)
    expect(ef.getSubmitTransform()).toBe(handler);
  });

  it('withSubmitTransform is single-slot — a later call REPLACES, not appends', () => {
    const ef = OneFieldForm();
    const first = (data: Record<string, unknown>) => ({ ...data, tag: 'first' });
    const second = (data: Record<string, unknown>) => ({ ...data, tag: 'second' });
    ef.withSubmitTransform(first).withSubmitTransform(second);
    expect(ef.getSubmitTransform()).toBe(second);
    expect(ef.getSubmitTransform()).not.toBe(first);
  });

  it('the registered handler receives (data, entityForm) and its return value flows through', () => {
    const ef = OneFieldForm();
    let seenEntityForm: EntityForm | undefined;
    ef.withSubmitTransform((data, entityFormArg) => {
      seenEntityForm = entityFormArg;
      return { ...data, contracted: data.contracted === 'CONTRACTED' };
    });
    const handler = ef.getSubmitTransform();
    expect(handler).toBeDefined();
    const out = handler!({ contracted: 'CONTRACTED' }, ef);
    expect(out).toEqual({ contracted: true });
    expect(seenEntityForm).toBe(ef);
  });

  it('clone() propagates the registered submitTransform handler', () => {
    const ef = OneFieldForm();
    const handler = (data: Record<string, unknown>) => ({ ...data, cloned: true });
    ef.withSubmitTransform(handler);
    const copy = ef.clone();
    expect(copy).not.toBe(ef);
    expect(copy.getSubmitTransform()).toBe(handler);
  });

  it('clone() with no registered submitTransform stays undefined on the copy', () => {
    const ef = OneFieldForm();
    const copy = ef.clone();
    expect(copy.getSubmitTransform()).toBeUndefined();
  });
});
