import { describe, expect, it } from 'vitest';
import {
  ALWAYS,
  HIDDEN,
  HAS_VALUE_READONLY,
  extractPermissions,
  getConditionalBoolean,
  getConditionalString,
  getStaticConditionalBoolean,
  getViewPreset,
  isPermitted,
  mergeRequiredPermissions,
  type FieldEvalContext,
  type Session,
} from '../index';

// Characterization suite for the P3-1 schema-core contract — locks the behavior
// of the transplanted PURE logic so P4/P5 field ports can rely on it. Cases
// mirror the 0.3.x source (EntityTab.isPermitted, Config.getConditional*) so a
// drift from the original engine fails here.

describe('PermissionPolicy.isPermitted (transplant of EntityTab.ts:42-50 — ANY-OF)', () => {
  it('empty/undefined requiredPermissions ⇒ visible', () => {
    expect(isPermitted(undefined, [])).toBe(true);
    expect(isPermitted([], ['admin'])).toBe(true);
  });

  it('non-empty required + empty/undefined user ⇒ hidden', () => {
    expect(isPermitted(['admin'], undefined)).toBe(false);
    expect(isPermitted(['admin'], [])).toBe(false);
  });

  it('visible iff user holds at least one required permission', () => {
    expect(isPermitted(['admin', 'staff'], ['staff'])).toBe(true);
    expect(isPermitted(['admin'], ['staff'])).toBe(false);
  });
});

describe('extractPermissions (2-way roles ?? authentication.roles, no instance fallback)', () => {
  it('reads roles directly off the session', () => {
    expect(extractPermissions({ roles: ['a'] })).toEqual(['a']);
  });
  it('falls back to authentication.roles', () => {
    expect(extractPermissions({ authentication: { roles: ['b'] } })).toEqual(['b']);
  });
  it('undefined session ⇒ empty', () => {
    expect(extractPermissions(undefined)).toEqual([]);
    expect(extractPermissions({} as Session)).toEqual([]);
  });
});

describe('mergeRequiredPermissions (Set-dedup, additive)', () => {
  it('dedups across existing + added', () => {
    expect(mergeRequiredPermissions(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(mergeRequiredPermissions(undefined, ['a', 'a'])).toEqual(['a']);
  });
});

describe('getConditionalBoolean (transplant of Config.ts:108-135)', () => {
  const create: FieldEvalContext = { renderType: 'create' };
  const update: FieldEvalContext = { renderType: 'update' };

  it('undefined ⇒ false', async () => {
    expect(await getConditionalBoolean(create, undefined)).toBe(false);
  });
  it('boolean literal passes through', async () => {
    expect(await getConditionalBoolean(create, true)).toBe(true);
  });
  it('OptionalBoolean resolves per renderType', async () => {
    const cond = { onCreate: true, onUpdate: false };
    expect(await getConditionalBoolean(create, cond)).toBe(true);
    expect(await getConditionalBoolean(update, cond)).toBe(false);
  });
  it('function branch receives the context', async () => {
    expect(
      await getConditionalBoolean(update, (ctx) => Promise.resolve(ctx.renderType === 'update')),
    ).toBe(true);
  });
  it('no renderType ⇒ onCreate ?? onUpdate', async () => {
    expect(await getConditionalBoolean({}, { onUpdate: true })).toBe(true);
  });
});

describe('getStaticConditionalBoolean (W3-1 — sync static resolution, blueprint EG4 근사)', () => {
  it('undefined ⇒ false', () => {
    expect(getStaticConditionalBoolean(undefined, 'create')).toBe(false);
  });
  it('boolean literal passes through', () => {
    expect(getStaticConditionalBoolean(true, 'create')).toBe(true);
    expect(getStaticConditionalBoolean(false, 'create')).toBe(false);
  });
  it('OptionalBoolean resolves per renderType — create reads onCreate, update reads onUpdate', () => {
    const cond = { onCreate: true, onUpdate: false };
    expect(getStaticConditionalBoolean(cond, 'create')).toBe(true);
    expect(getStaticConditionalBoolean(cond, 'update')).toBe(false);
  });
  it('the async ValuedBoolean (function) branch cannot be resolved synchronously ⇒ false', () => {
    const fn = (_ctx: FieldEvalContext): Promise<boolean> => Promise.resolve(true);
    expect(getStaticConditionalBoolean(fn, 'create')).toBe(false);
  });
  it('no renderType ⇒ onCreate ?? onUpdate', () => {
    expect(getStaticConditionalBoolean({ onUpdate: true }, undefined)).toBe(true);
  });
});

describe('getConditionalString (transplant of Config.ts:137-162)', () => {
  it('undefined ⇒ empty string', async () => {
    expect(await getConditionalString({ renderType: 'create' }, undefined)).toBe('');
  });
  it('string literal passes through', async () => {
    expect(await getConditionalString({ renderType: 'create' }, 'hi')).toBe('hi');
  });
  it('OptionalString resolves per renderType (update-first branch order)', async () => {
    const cond = { onCreate: 'c', onUpdate: 'u' };
    expect(await getConditionalString({ renderType: 'update' }, cond)).toBe('u');
    expect(await getConditionalString({ renderType: 'create' }, cond)).toBe('c');
  });
});

describe('view presets', () => {
  it('getViewPreset maps names to the consolidated preset table', () => {
    expect(getViewPreset('ALWAYS')).toBe(ALWAYS);
    expect(getViewPreset('HIDDEN')).toBe(HIDDEN);
  });

  it('HAS_VALUE_READONLY becomes readonly once the field has a value', async () => {
    const withValue: FieldEvalContext = { value: { current: 'x' } };
    const empty: FieldEvalContext = { value: {} };
    const readonlyFn = HAS_VALUE_READONLY.readOnly as (ctx: FieldEvalContext) => Promise<boolean>;
    expect(await readonlyFn(withValue)).toBe(true);
    expect(await readonlyFn(empty)).toBe(false);
  });
});
