import { describe, expect, it, vi } from 'vitest';
import { EntityForm } from '../entity-form';
import {
  XrefPreferMappingField,
  type XrefPreferMappingValue,
} from '../field/xref-prefer-mapping-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// XrefPreferMappingField (EA-D2-1, ea-d2-xref-major-briefing.md §1/§4/§5).
// Same required-posture mechanism as XrefMappingField (CustomValidation on
// mapped?.length — see that field's test suite for the fuller isBlank
// argument); this suite adds coverage for the type's own additions
// (`withPreferredLabel`, no `deleted` array in the value wire).

function target(): EntityForm {
  return new EntityForm('MajorEntityForm', '/major');
}

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('XrefPreferMappingField construction', () => {
  it('carries the NEW type "xrefPreferMapping"', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target });
    expect(f.type).toBe('xrefPreferMapping');
    expect(f.getName()).toBe('college');
  });

  it('config.entityForm is a lazy thunk (resolved via getEntityForm)', () => {
    const thunk = vi.fn(target);
    const f = new XrefPreferMappingField('college', 10, { entityForm: thunk });
    expect(thunk).not.toHaveBeenCalled();
    f.getEntityForm();
    expect(thunk).toHaveBeenCalledTimes(1);
  });

  it('getPreferredLabel defaults to 기본값', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target });
    expect(f.getPreferredLabel()).toBe('기본값');
  });

  it('withPreferredLabel (0.3.x parity builder) overrides the default and is chainable', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target }).withPreferredLabel(
      '주전공',
    );
    expect(f.getPreferredLabel()).toBe('주전공');
  });

  it('filters is the SINGLE function form only (§1 decision ③)', () => {
    const filters = vi.fn(async () => []);
    const f = new XrefPreferMappingField('college', 10, { entityForm: target, filters });
    expect(typeof f.config.filters).toBe('function');
  });
});

describe('XrefPreferMappingField required posture — CustomValidation on mapped?.length', () => {
  it('required + {mapped:[]} → one failure', async () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target })
      .withLabel('단과대학')
      .withRequired(true);
    const value: XrefPreferMappingValue = { mapped: [] };
    const res = await f.validate(ctx({ current: value }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + non-empty mapped → valid', async () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target }).withRequired(true);
    const value: XrefPreferMappingValue = { mapped: [{ id: '1', preferred: true }] };
    expect(await f.validate(ctx({ current: value }))).toEqual([]);
  });

  it('not required + empty mapped → valid', async () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target });
    expect(await f.validate(ctx({ current: { mapped: [] } }))).toEqual([]);
  });

  it('withRequired sets the required flag and attaches NO field validation (required is enforced by the generic isBlank path)', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target }).withRequired(true);
    expect(f.required).toBe(true);
    expect(f.validations).toBeUndefined();
  });
});

describe('XrefPreferMappingField.clone', () => {
  it('preserves type/preferredLabel/required across a structural clone', () => {
    const original = new XrefPreferMappingField('college', 10, { entityForm: target })
      .withPreferredLabel('주전공')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy).toBeInstanceOf(XrefPreferMappingField);
    expect(copy.type).toBe('xrefPreferMapping');
    expect(copy.getPreferredLabel()).toBe('주전공');
    expect(copy.required).toBe(true);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new XrefPreferMappingField('college', 10, { entityForm: target }).withValue({
      mapped: [{ id: '1' }],
    });
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.current).toEqual({ mapped: [{ id: '1' }] });
  });
});
