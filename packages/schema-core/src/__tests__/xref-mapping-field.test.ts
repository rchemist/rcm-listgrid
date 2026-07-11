import { describe, expect, it, vi } from 'vitest';
import { EntityForm } from '../entity-form';
import { XrefMappingField, type XrefMappingValue } from '../field/xref-mapping-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// XrefMappingField (EA-D2-1 — plain view only, ea-d2-xref-major-briefing.md
// §1/§2/§4). schema-core is render-free (ADR-0003) so this suite covers meta
// only: config/builders/clone, and the field's DOCUMENTED required
// mechanism — a CustomValidation on `mapped?.length`, since the generic
// isBlank required-blank check can never see `{mapped,deleted}` as blank
// (the InlineMap lesson, class header doc).

function target(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor');
}

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('XrefMappingField construction', () => {
  it('carries type "xrefMapping"', () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target });
    expect(f.type).toBe('xrefMapping');
    expect(f.getName()).toBe('professors');
    expect(f.getOrder()).toBe(10);
  });

  it('config.entityForm is a lazy thunk (resolved via getEntityForm)', () => {
    const thunk = vi.fn(target);
    const f = new XrefMappingField('professors', 10, { entityForm: thunk });
    expect(thunk).not.toHaveBeenCalled();
    const resolved = f.getEntityForm();
    expect(thunk).toHaveBeenCalledTimes(1);
    expect(resolved.name).toBe('ProfessorEntityForm');
  });

  it('excludeId/filters are carried on config, default undefined', () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target });
    expect(f.getExcludeId()).toBeUndefined();
    expect(f.config.filters).toBeUndefined();
  });

  it('excludeId is exposed via getExcludeId', () => {
    const f = new XrefMappingField('parentCategory', 10, {
      entityForm: target,
      excludeId: 'self-1',
    });
    expect(f.getExcludeId()).toBe('self-1');
  });

  it('filters is the SINGLE function form only (§1 decision ③ — no array union)', async () => {
    const filters = vi.fn(async () => [
      { name: 'assistant', value: true, queryConditionType: 'EQUAL' as const },
    ]);
    const f = new XrefMappingField('staffs', 10, { entityForm: target, filters });
    expect(typeof f.config.filters).toBe('function');
    await expect(f.config.filters!()).resolves.toEqual([
      { name: 'assistant', value: true, queryConditionType: 'EQUAL' },
    ]);
  });
});

describe('XrefMappingField required posture — CustomValidation on mapped?.length (not generic isBlank)', () => {
  it('required + {mapped:[],deleted:[]} → one failure (generic isBlank would say NOT blank here)', async () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target })
      .withLabel('전임교원')
      .withRequired(true);
    const value: XrefMappingValue = { mapped: [], deleted: [] };
    const res = await f.validate(ctx({ current: value }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('전임교원');
  });

  it('required + undefined value → one failure', async () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target }).withRequired(true);
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
  });

  it('required + non-empty mapped → valid, even with deleted present', async () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target }).withRequired(true);
    const value: XrefMappingValue = { mapped: ['1'], deleted: ['9'] };
    expect(await f.validate(ctx({ current: value }))).toEqual([]);
  });

  it('DECISION: an emptied mapped with a non-empty deleted still fails required — validate() never mutates the value (deleted is a save-wire concern, not a validate() one)', async () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target }).withRequired(true);
    const value: XrefMappingValue = { mapped: [], deleted: ['9'] };
    const slice: FieldValueSlice = { current: value };
    const res = await f.validate(ctx(slice));
    expect(res).toHaveLength(1); // required still fails (mapped is empty)...
    expect(slice.current).toBe(value); // ...and validate() left the slice's value untouched.
  });

  it('not required + empty mapped → valid (no validation attached without withRequired)', async () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target });
    const value: XrefMappingValue = { mapped: [], deleted: [] };
    expect(await f.validate(ctx({ current: value }))).toEqual([]);
  });

  it('withRequired is idempotent — calling it twice does not stack duplicate validations', () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target })
      .withRequired(true)
      .withRequired(true);
    expect(f.validations).toHaveLength(1);
  });

  it('hidden/readonly fields skip validation entirely', async () => {
    const hidden = new XrefMappingField('professors', 10, { entityForm: target })
      .withRequired(true)
      .withHidden(true);
    expect(await hidden.validate(ctx({}))).toEqual([]);
    const readonly = new XrefMappingField('professors', 10, { entityForm: target })
      .withRequired(true)
      .withReadOnly(true);
    expect(await readonly.validate(ctx({}))).toEqual([]);
  });
});

describe('XrefMappingField.clone', () => {
  it('preserves type/label/required/config across a structural clone', () => {
    const original = new XrefMappingField('professors', 10, { entityForm: target })
      .withLabel('전임교원')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy).toBeInstanceOf(XrefMappingField);
    expect(copy.type).toBe('xrefMapping');
    expect(copy.getLabel()).toBe('전임교원');
    expect(copy.required).toBe(true);
    expect(copy.config).toBe(original.config);
  });

  it('clone still enforces the required CustomValidation (validations array is copied)', async () => {
    const original = new XrefMappingField('professors', 10, { entityForm: target }).withRequired(
      true,
    );
    const copy = original.clone();
    const res = await copy.validate(ctx({ current: { mapped: [], deleted: [] } }));
    expect(res).toHaveLength(1);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new XrefMappingField('professors', 10, { entityForm: target }).withValue({
      mapped: ['1'],
    });
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.current).toEqual({ mapped: ['1'] });
  });
});
