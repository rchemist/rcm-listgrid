import { describe, expect, it } from 'vitest';
import { ProfileField } from '../field/profile-field';
import type { FieldEvalContext } from '../field/eval-context';

// ProfileField (EA-A fan-out — Profile). Transplant of 0.3.x ProfileField
// (src/listgrid/components/fields/ProfileField.tsx:7-29), minus the
// render/createInstance plumbing (moved to the react-layer renderer
// registry). What remains is a plain FormField<unknown> that unconditionally
// forces readonly+hideLabel in its constructor (ProfileField.tsx:10-11) and
// carries the dedicated 'profile' type discriminant. These tests lock that
// shape so a future change doesn't silently drop the always-readonly/
// always-hideLabel posture (conductor decision ②: "최소 placeholder").

function ctx(
  value: FieldEvalContext['value'],
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('ProfileField (builders)', () => {
  it('carries the dedicated profile type (not the 0.3.x-reused "custom")', () => {
    const f = new ProfileField('profile', 10);
    expect(f.type).toBe('profile');
    expect(f.getName()).toBe('profile');
    expect(f.getOrder()).toBe(10);
  });

  it('constructor unconditionally forces readonly=true and hideLabel=true (faithful transplant)', () => {
    const f = new ProfileField('profile', 10);
    expect(f.readonly).toBe(true);
    expect(f.hideLabel).toBe(true);
  });

  it('a caller can still un-set readonly/hideLabel afterward (ordinary last-write-wins builder semantics)', () => {
    const f = new ProfileField('profile', 10).withReadOnly(false).withHideLabel(false);
    expect(f.readonly).toBe(false);
    expect(f.hideLabel).toBe(false);
  });

  it('inherits base FormField builders (withLabel/withDefaultValue chain)', () => {
    const f = new ProfileField('profile', 10).withLabel('Profile').withDefaultValue({ id: 1 });
    expect(f.getLabel()).toBe('Profile');
    expect(f.value?.default).toEqual({ id: 1 });
  });

  it('has no builders beyond the inherited FormField ones (0.3.x had none either)', () => {
    const f = new ProfileField('profile', 10) as unknown as Record<string, unknown>;
    expect(typeof (f as { withOptions?: unknown }).withOptions).toBe('undefined');
    expect(typeof (f as { withLimit?: unknown }).withLimit).toBe('undefined');
  });
});

describe('ProfileField.validate (always readonly by default — base FormField skip branch)', () => {
  it('default construction skips validation entirely (readonly=true short-circuits, even with required declared)', async () => {
    const f = new ProfileField('profile', 10).withRequired(true);
    expect(await f.validate(ctx({ current: undefined }))).toEqual([]);
  });

  it('once readonly is explicitly un-set, required-blank validation runs like any other field', async () => {
    const f = new ProfileField('profile', 10).withReadOnly(false).withRequired(true);
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('hidden fields still skip validation regardless of readonly state', async () => {
    const f = new ProfileField('profile', 10)
      .withReadOnly(false)
      .withRequired(true)
      .withHidden(true);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('ProfileField.clone', () => {
  it('preserves type/readonly/hideLabel across a structural clone', () => {
    const original = new ProfileField('profile', 10).withLabel('Profile');
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('profile');
    expect(copy.readonly).toBe(true);
    expect(copy.hideLabel).toBe(true);
    expect(copy.getLabel()).toBe('Profile');
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new ProfileField('profile', 10).withDefaultValue({ id: 42 });
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toEqual({ id: 42 });
  });
});
