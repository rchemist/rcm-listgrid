import { describe, expect, it } from 'vitest';
import { FileField } from '../field/file-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// FileField (EA-C fan-out — File). Transplant of 0.3.x
// `src/listgrid/components/fields/FileField.tsx:41-281`, re-verified against
// source 2026-07-11. schema-core is render-free (ADR-0003) so this suite only
// covers meta: builders/config, the single/multi value-shape switch
// (`getMaxCount`/`isMultiple`, decision ①), clone preservation, and
// required-blank validation with plain string/string[] values (the point of
// decision ① — no isBlank/isDirty override needed; the inherited generic
// logic in `./value.ts` is exercised here through `field.validate()`).

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('FileField construction', () => {
  it('carries type "file"', () => {
    const f = new FileField('resume', 10);
    expect(f.type).toBe('file');
    expect(f.getName()).toBe('resume');
    expect(f.getOrder()).toBe(10);
  });

  it('constructor accepts an optional config', () => {
    const f = new FileField('resume', 10, { maxSize: 5, maxCount: 3 });
    expect(f.config).toEqual({ maxSize: 5, maxCount: 3 });
  });

  it('constructor with no config leaves it unset', () => {
    const f = new FileField('resume', 10);
    expect(f.config).toBeUndefined();
  });
});

describe('FileField builders (transplant of FileField.tsx:49-92)', () => {
  it('withConfig replaces the whole config', () => {
    const f = new FileField('resume', 10).withConfig({ maxSize: 2, extensions: ['pdf'] });
    expect(f.config).toEqual({ maxSize: 2, extensions: ['pdf'] });
  });

  it('withMaxSize sets maxSize while preserving the rest of the config', () => {
    const f = new FileField('resume', 10)
      .withMaxCount(3)
      .withExtensions('pdf', 'doc')
      .withMaxSize(10);
    expect(f.config).toEqual({
      maxSize: 10,
      maxCount: 3,
      extensions: ['pdf', 'doc'],
      fileTypes: undefined,
    });
  });

  it('withMaxCount sets maxCount while preserving the rest of the config', () => {
    const f = new FileField('resume', 10).withMaxSize(5).withMaxCount(4);
    expect(f.config).toEqual({
      maxSize: 5,
      maxCount: 4,
      extensions: undefined,
      fileTypes: undefined,
    });
  });

  it('withExtensions sets extensions (rest-arg) while preserving the rest of the config', () => {
    const f = new FileField('resume', 10).withMaxSize(5).withExtensions('png', 'jpg');
    expect(f.config).toEqual({
      maxSize: 5,
      maxCount: undefined,
      extensions: ['png', 'jpg'],
      fileTypes: undefined,
    });
  });

  it('withFileTypes sets fileTypes (rest-arg) while preserving the rest of the config', () => {
    const f = new FileField('resume', 10).withMaxSize(5).withFileTypes('image/png', 'image/jpeg');
    expect(f.config).toEqual({
      maxSize: 5,
      maxCount: undefined,
      extensions: undefined,
      fileTypes: ['image/png', 'image/jpeg'],
    });
  });

  it('builders are chainable and return this', () => {
    const f = new FileField('resume', 10);
    expect(f.withMaxSize(1)).toBe(f);
    expect(f.withMaxCount(2)).toBe(f);
    expect(f.withExtensions('pdf')).toBe(f);
    expect(f.withFileTypes('application/pdf')).toBe(f);
    expect(f.withConfig(undefined)).toBe(f);
  });

  it('inherits base FormField builders (withLabel/withRequired/withDefaultValue chain)', () => {
    const f = new FileField('resume', 10)
      .withLabel('Resume')
      .withRequired(true)
      .withDefaultValue('a.pdf');
    expect(f.getLabel()).toBe('Resume');
    expect(f.required).toBe(true);
    expect(f.value?.default).toBe('a.pdf');
  });
});

describe('FileField.getMaxCount / isMultiple (single/multi value-shape switch, decision ①)', () => {
  it('unset maxCount defaults the effective count to 1 (single string value)', () => {
    const f = new FileField('resume', 10);
    expect(f.getMaxCount()).toBe(1);
    expect(f.isMultiple()).toBe(false);
  });

  it('maxCount === 1 stays single', () => {
    const f = new FileField('resume', 10).withMaxCount(1);
    expect(f.getMaxCount()).toBe(1);
    expect(f.isMultiple()).toBe(false);
  });

  it('maxCount > 1 switches to multi (string[] value)', () => {
    const f = new FileField('attachments', 10).withMaxCount(5);
    expect(f.getMaxCount()).toBe(5);
    expect(f.isMultiple()).toBe(true);
  });
});

describe('FileField.validate — required-blank over plain values (no isBlank/isDirty override needed)', () => {
  it('required + blank string → one failure', async () => {
    const f = new FileField('resume', 10).withRequired(true).withLabel('이력서');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('이력서');
  });

  it('required + undefined value → one failure', async () => {
    const f = new FileField('resume', 10).withRequired(true);
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
  });

  it('required + filled string URL → valid', async () => {
    const f = new FileField('resume', 10).withRequired(true);
    expect(await f.validate(ctx({ current: 'https://cdn.example.com/a.pdf' }))).toEqual([]);
  });

  it('multi mode: required + empty array → one failure (generic isBlank treats [] as blank)', async () => {
    const f = new FileField('attachments', 10).withMaxCount(3).withRequired(true);
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
  });

  it('multi mode: required + non-empty array → valid', async () => {
    const f = new FileField('attachments', 10).withMaxCount(3).withRequired(true);
    expect(await f.validate(ctx({ current: ['https://cdn.example.com/a.pdf'] }))).toEqual([]);
  });

  it('not required + blank → valid', async () => {
    const f = new FileField('resume', 10);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const hidden = new FileField('a', 1).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({ current: '' }))).toEqual([]);
    const readonly = new FileField('b', 1).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('FileField.clone', () => {
  it('preserves type/label/required/config across a structural clone', () => {
    const original = new FileField('resume', 10, { maxSize: 5, maxCount: 3, extensions: ['pdf'] })
      .withLabel('Resume')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy).toBeInstanceOf(FileField);
    expect(copy.type).toBe('file');
    expect(copy.getLabel()).toBe('Resume');
    expect(copy.required).toBe(true);
    expect(copy.config).toEqual({ maxSize: 5, maxCount: 3, extensions: ['pdf'] });
  });

  it('preserves isMultiple()/getMaxCount() derived state (config carried through)', () => {
    const original = new FileField('attachments', 10).withMaxCount(4);
    const copy = original.clone();
    expect(copy.getMaxCount()).toBe(4);
    expect(copy.isMultiple()).toBe(true);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new FileField('resume', 10).withDefaultValue('a.pdf');
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toBe('a.pdf');
  });
});
