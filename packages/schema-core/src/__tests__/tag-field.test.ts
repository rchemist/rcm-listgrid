import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, SelectOption } from '../index';
// TagField is not yet re-exported from '../index' (schema-core barrel is a
// shared file — registration is the fan-out orchestrator's job, per this
// task's hard rules). Import the class directly from its own module so this
// suite is green standalone; behavior under the eventual barrel export is
// identical (same class, same module).
import { TagField } from '../field/tag-field';

// TagField (EA-A fan-out) — transplant of 0.3.x
// `src/listgrid/components/fields/TagField.tsx:22-130`. builders/validate
// come from the shared MultiOptionsField base (EA-A0 pre-stage, covered by
// options-field.test.ts) — this suite only exercises what TagField itself
// adds: type discriminant, options/limit wiring through the inherited
// builders, `withTagValidation`, and `clone()` preservation of
// `tagValidation`.

const options: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
];

function ctx(
  value: { current?: string[] },
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('TagField construction', () => {
  it('type is "tag"', () => {
    const f = new TagField('tags', 1);
    expect(f.type).toBe('tag');
  });

  it('withOptions/withLimit (inherited MultiOptionsField builders) chain onto TagField', () => {
    const f = new TagField('tags', 1).withOptions(options).withLimit({ min: 1, max: 3 });
    expect(f.options).toEqual(options);
    expect(f.limit).toEqual({ min: 1, max: 3 });
  });
});

describe('TagField.withTagValidation (transplant of TagField.tsx:35-40)', () => {
  it('sets tagValidation to the given function', () => {
    const validation = (value: string) => ({ valid: value.length > 2 });
    const f = new TagField('tags', 1).withTagValidation(validation);
    expect(f.tagValidation).toBe(validation);
  });

  it('is chainable and returns this', () => {
    const f = new TagField('tags', 1);
    const result = f.withTagValidation((v) => ({ valid: v !== 'bad' }));
    expect(result).toBe(f);
  });

  it('withTagValidation(undefined) clears a previously set validator', () => {
    const f = new TagField('tags', 1).withTagValidation((v) => ({ valid: v !== 'bad' }));
    f.withTagValidation(undefined);
    expect(f.tagValidation).toBeUndefined();
  });

  it('supports an async validator (renderer-level gate, not a Validation catalog entry)', async () => {
    const f = new TagField('tags', 1).withTagValidation(async (v) => ({
      valid: v !== 'blocked',
      message: v === 'blocked' ? 'blocked tag' : undefined,
    }));
    await expect(f.tagValidation!('ok')).resolves.toEqual({ valid: true, message: undefined });
    await expect(f.tagValidation!('blocked')).resolves.toEqual({
      valid: false,
      message: 'blocked tag',
    });
  });
});

describe('TagField.validate — inherited selected-count check (MultiOptionsField, tag count semantics)', () => {
  it('under min tag count fails', async () => {
    const f = new TagField('tags', 1).withLimit({ min: 2 });
    const res = await f.validate(ctx({ current: ['react'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최소 2개');
  });

  it('over max tag count fails', async () => {
    const f = new TagField('tags', 1).withLimit({ max: 1 });
    const res = await f.validate(ctx({ current: ['react', 'vue'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최대 1개');
  });

  it('within limit passes; tagValidation is NOT consulted by field.validate() (renderer-only gate)', async () => {
    const f = new TagField('tags', 1)
      .withLimit({ min: 1, max: 3 })
      .withTagValidation(() => ({ valid: false, message: 'always rejects' }));
    expect(await f.validate(ctx({ current: ['react'] }))).toEqual([]);
  });

  it('required-blank short-circuits the count check (base validate() failure wins)', async () => {
    const f = new TagField('tags', 1).withRequired(true).withLabel('태그').withLimit({ min: 1 });
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });
});

describe('TagField.clone (FormField.clone shallow structural copy)', () => {
  it('preserves options, limit, and tagValidation on the clone', () => {
    const validation = (v: string) => ({ valid: v.length > 0 });
    const f = new TagField('tags', 1)
      .withOptions(options)
      .withLimit({ min: 1, max: 3 })
      .withTagValidation(validation);
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone).toBeInstanceOf(TagField);
    expect(clone.options).toEqual(options);
    expect(clone.limit).toEqual({ min: 1, max: 3 });
    expect(clone.tagValidation).toBe(validation);
  });
});
