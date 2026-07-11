import { describe, expect, it } from 'vitest';
import { EntityForm } from '../index';

// EntityForm.withMeta/getMeta (spec §3.1, CAP-23; W4-5) — the SOLE escape
// hatch replacing the 0.3.x 9-way attribute-bag sprawl. Shallow-merge
// semantics (never replace — the withCapabilities clobber-avoidance
// precedent, verified dx-6): multiple withMeta calls (preset + wrapper)
// compose without a later call blowing away sibling keys an earlier call
// set. A key set to `undefined` in the patch REMOVES that key (L4
// "undefined = clear").

function BareForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget');
}

describe('EntityForm.getMeta — defaults to {} (spec §3.1)', () => {
  it('withMeta never called: getMeta() returns {}', () => {
    expect(BareForm().getMeta()).toEqual({});
  });
});

describe('EntityForm.withMeta/getMeta — shallow-merge (spec §3.1, CAP-23, dx-6)', () => {
  it('two preset-style withMeta calls compose — no first-call clobber', () => {
    const form = BareForm().withMeta({ a: 1 }).withMeta({ b: 2 });
    expect(form.getMeta()).toEqual({ a: 1, b: 2 });
  });

  it('re-assigning the same key: last write wins', () => {
    const form = BareForm().withMeta({ a: 1 }).withMeta({ a: 2 });
    expect(form.getMeta()).toEqual({ a: 2 });
  });

  it('a single withMeta call with multiple keys merges all of them', () => {
    const form = BareForm().withMeta({ a: 1, b: 2, c: 3 });
    expect(form.getMeta()).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('does NOT replace — a later call with an unrelated key keeps earlier keys', () => {
    const form = BareForm().withMeta({ a: 1, b: 2 }).withMeta({ c: 3 });
    expect(form.getMeta()).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe('EntityForm.withMeta — undefined key = removal (spec L4)', () => {
  it('withMeta({ a: undefined }) removes the previously-set key a, keeps b', () => {
    const form = BareForm().withMeta({ a: 1, b: 2 }).withMeta({ a: undefined });
    expect(form.getMeta()).toEqual({ b: 2 });
    expect(Object.prototype.hasOwnProperty.call(form.getMeta(), 'a')).toBe(false);
  });

  it('removing a key that was never set is a no-op', () => {
    const form = BareForm().withMeta({ b: 2 }).withMeta({ a: undefined });
    expect(form.getMeta()).toEqual({ b: 2 });
  });
});

describe('EntityForm.clone() — meta propagates independently (spec §3.1, dx-5)', () => {
  it('cloned form keeps the original meta declaration', () => {
    const original = BareForm().withMeta({ a: 1 });
    const cloned = original.clone();
    expect(cloned.getMeta()).toEqual({ a: 1 });
  });

  it('mutating the clone via a later withMeta call does not affect the original', () => {
    const original = BareForm().withMeta({ a: 1 });
    const cloned = original.clone().withMeta({ b: 2 });
    expect(original.getMeta()).toEqual({ a: 1 });
    expect(cloned.getMeta()).toEqual({ a: 1, b: 2 });
  });

  it('mutating the original via a later withMeta call does not affect the clone', () => {
    const original = BareForm().withMeta({ a: 1 });
    const cloned = original.clone();
    original.withMeta({ a: 99 });
    expect(cloned.getMeta()).toEqual({ a: 1 });
    expect(original.getMeta()).toEqual({ a: 99 });
  });
});

// getCapabilities returns the live stored object (no defensive copy) —
// getMeta follows the same convention (see entity-form.ts getMeta doc).
// This test documents that posture rather than asserting isolation.
describe('EntityForm.getMeta — no defensive copy (mirrors getCapabilities convention)', () => {
  it('mutating the object returned by getMeta() affects subsequent getMeta() reads', () => {
    const form = BareForm().withMeta({ a: 1 });
    const meta = form.getMeta();
    (meta as Record<string, unknown>)['a'] = 999;
    expect(form.getMeta()).toEqual({ a: 999 });
  });
});
