import { describe, expect, it } from 'vitest';
import { PasswordValidation } from '../index';
import type { FieldEvalContext } from '../index';
// PasswordField is NOT yet re-exported from the schema-core barrel (fan-out
// convention — the orchestrator wires new field classes into index.ts from
// each field's manifest), so it's imported directly from its own module.
import { PasswordField } from '../field/password-field';

// EA-A fan-out — PasswordField unit tests. Transplant oracle for
// src/listgrid/components/fields/PasswordField.tsx:15-100 (0.3.x). Covers:
// builders (withStrength), validate() (default PasswordValidation +
// strength-driven RegexValidation swap, id-tag filtering), and clone
// preservation of `strength`.
//
// EA-R1 #4: the `PasswordField.create(props)` static factory (0.3.x
// factory-pattern relic) was dropped — `new PasswordField(...)` + chaining
// is the only construction path now (message-view-field.ts precedent).

const ctx = (renderType: FieldEvalContext['renderType'] = 'create'): FieldEvalContext => ({
  renderType,
});

describe('PasswordField construction', () => {
  it('auto-attaches a default PasswordValidation when none is supplied', () => {
    const field = new PasswordField('password', 1);
    expect(field.type).toBe('password');
    expect(field.validations).toHaveLength(1);
    expect(field.validations?.[0]).toBeInstanceOf(PasswordValidation);
    expect(field.validations?.[0].id).toBe('PasswordValidation');
  });

  it('honors an explicit validations array over the default (copied, not aliased)', () => {
    const custom = [new PasswordValidation('CustomPwd')];
    const field = new PasswordField('password', 1, custom);
    expect(field.validations).not.toBe(custom);
    expect(field.validations).toEqual(custom);
    expect(field.validations?.[0].id).toBe('CustomPwd');
  });

  it('constructor strength.regex[] filters out the default and appends RegexValidation entries', () => {
    const field = new PasswordField('password', 1, undefined, {
      regex: [{ pattern: /[A-Z]/, error: 'need an uppercase letter' }],
    });
    expect(field.strength).toBeDefined();
    expect(field.validations).toHaveLength(2);
    expect(field.validations?.[0]).toBeInstanceOf(PasswordValidation);
    expect(field.validations?.[1].id).toBe('passwordStrength-password');
  });
});

describe('PasswordField.withStrength', () => {
  it('filters the id-tagged PasswordValidation out and appends one RegexValidation per strength rule', () => {
    const field = new PasswordField('password', 1).withStrength({
      regex: [
        { pattern: /[A-Z]/, error: 'uppercase required' },
        { pattern: /[0-9]/, error: 'digit required' },
      ],
    });
    expect(field.validations).toHaveLength(2);
    expect(field.validations?.every((v) => v.id !== 'PasswordValidation')).toBe(true);
    expect(field.validations?.map((v) => v.id)).toEqual([
      'passwordStrength-password',
      'passwordStrength-password',
    ]);
  });

  it('leaves non-PasswordValidation entries in place (id-tag match is load-bearing, not a wholesale reset)', () => {
    const other: import('../validation').Validation = {
      id: 'CustomRule',
      async validate() {
        return { error: false, message: '', hasError: () => false } as never;
      },
      getErrorMessage: () => '',
    };
    const field = new PasswordField('password', 1, [new PasswordValidation(), other]).withStrength({
      regex: [{ pattern: /[A-Z]/, error: 'uppercase required' }],
    });
    const ids = field.validations?.map((v) => v.id);
    expect(ids).toContain('CustomRule');
    expect(ids).not.toContain('PasswordValidation');
    expect(ids).toContain('passwordStrength-password');
  });

  it('clearing strength (undefined) keeps the current validations array untouched', () => {
    const field = new PasswordField('password', 1);
    const before = field.validations;
    field.withStrength(undefined);
    expect(field.strength).toBeUndefined();
    expect(field.validations).toBe(before);
  });

  it('returns `this` for chaining', () => {
    const field = new PasswordField('password', 1);
    expect(field.withStrength(undefined)).toBe(field);
  });
});

describe('PasswordField.validate', () => {
  it('passes a strong password under the default PasswordValidation', async () => {
    const field = new PasswordField('password', 1);
    const results = await field.validate(ctx(), undefined);
    // no value set + not required -> no required-blank error either
    expect(results).toEqual([]);
    const passResults = await field.validate({ ...ctx(), value: { current: 'Abcdef1!' } });
    expect(passResults).toEqual([]);
  });

  it('fails a password missing a special character under the default RegexPasswordNormal rule', async () => {
    const field = new PasswordField('password', 1);
    const results = await field.validate({ ...ctx(), value: { current: 'Abcdefgh1' } });
    expect(results).toHaveLength(1);
  });

  it('required + blank fails with the required message before any regex check runs', async () => {
    const field = new PasswordField('password', 1).withRequired(true);
    const results = await field.validate({ ...ctx(), value: { current: '' } });
    expect(results).toHaveLength(1);
    expect(results[0].message).toMatch(/필수/);
  });

  it('strength regex rules replace the default check — a value satisfying strength but not RegexPasswordNormal passes', async () => {
    const field = new PasswordField('password', 1).withStrength({
      regex: [{ pattern: /^[A-Z]+$/, error: 'uppercase-only required' }],
    });
    // 'ABCDEF' fails RegexPasswordNormal (no digit/special char) but satisfies
    // the strength-only rule — proves the default PasswordValidation was
    // actually swapped out, not just supplemented.
    const results = await field.validate({ ...ctx(), value: { current: 'ABCDEF' } });
    expect(results).toEqual([]);
  });

  it('strength regex rules report their own error message on failure', async () => {
    const field = new PasswordField('password', 1).withStrength({
      regex: [{ pattern: /^[A-Z]+$/, error: 'uppercase-only required' }],
    });
    const results = await field.validate({ ...ctx(), value: { current: 'lowercase' } });
    expect(results).toHaveLength(1);
    expect(results[0].message).toBe('uppercase-only required');
  });
});

describe('PasswordField.clone', () => {
  it('preserves strength + validations on a structural clone', () => {
    const field = new PasswordField('password', 1).withStrength({
      regex: [{ pattern: /[A-Z]/, error: 'uppercase required' }],
    });
    const clone = field.clone();
    expect(clone).not.toBe(field);
    expect(clone.strength).toBe(field.strength);
    expect(clone.validations).not.toBe(field.validations);
    expect(clone.validations?.map((v) => v.id)).toEqual(field.validations?.map((v) => v.id));
  });

  it('drops the runtime value unless includeValue is passed', () => {
    const field = new PasswordField('password', 1).withValue('secret');
    expect(field.clone().value).toBeUndefined();
    expect(field.clone(true).value?.current).toBe('secret');
  });
});
