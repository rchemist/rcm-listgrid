import { describe, expect, it } from 'vitest';
import { LinkField } from '../field/link-field';
import type { FieldEvalContext } from '../field/eval-context';

// LinkField (EA-A fan-out — Link). Transplant of 0.3.x LinkField
// (src/listgrid/components/fields/LinkField.tsx:18-104), minus
// CheckButtonValidationField (conductor decision ⑧, descoped — see
// link-field.ts header comment). What remains is a plain FormField<string>
// carrying the dedicated 'link' type discriminant + the inherited
// required/validations machinery; these tests lock that shape so a future
// change doesn't silently re-grow check-button state onto the class.

function ctx(
  value: FieldEvalContext['value'],
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('LinkField (builders)', () => {
  it('carries the dedicated link type (not the 0.3.x-reused "text")', () => {
    const f = new LinkField('homepage', 10);
    expect(f.type).toBe('link');
    expect(f.getName()).toBe('homepage');
    expect(f.getOrder()).toBe(10);
  });

  it('inherits base FormField builders (withLabel/withRequired/withDefaultValue chain)', () => {
    const f = new LinkField('homepage', 10)
      .withLabel('Homepage')
      .withRequired(true)
      .withDefaultValue('https://example.com');
    expect(f.getLabel()).toBe('Homepage');
    expect(f.required).toBe(true);
    expect(f.value?.default).toBe('https://example.com');
  });

  it('does not carry any CheckButtonValidationField members (descope, decision ⑧)', () => {
    const f = new LinkField('homepage', 10) as unknown as Record<string, unknown>;
    expect('checkButtonValidation' in f).toBe(false);
    expect('checkButtonLabel' in f).toBe(false);
    expect(typeof (f as { withCheckButtonValidation?: unknown }).withCheckButtonValidation).toBe(
      'undefined',
    );
  });
});

describe('LinkField.validate (base FormField required-blank + declared validations)', () => {
  it('required + blank → one failure', async () => {
    const f = new LinkField('homepage', 10).withRequired(true).withLabel('홈페이지');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('홈페이지');
  });

  it('required + filled → valid', async () => {
    const f = new LinkField('homepage', 10).withRequired(true);
    expect(await f.validate(ctx({ current: 'https://example.com' }))).toEqual([]);
  });

  it('not required + blank → valid (Link has no built-in URL-format validation)', async () => {
    const f = new LinkField('homepage', 10);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const hidden = new LinkField('a', 1).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({ current: '' }))).toEqual([]);
    const readonly = new LinkField('b', 1).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('LinkField.clone', () => {
  it('preserves type/label/required across a structural clone', () => {
    const original = new LinkField('homepage', 10).withLabel('Homepage').withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('link');
    expect(copy.getLabel()).toBe('Homepage');
    expect(copy.required).toBe(true);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new LinkField('homepage', 10).withDefaultValue('https://example.com');
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toBe('https://example.com');
  });
});
