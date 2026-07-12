import { describe, expect, it, vi } from 'vitest';
import type { DataFieldSpec } from '@listgrid/schema-core';
import { EntityForm, FileField, SelectField } from '@listgrid/schema-core';
import { filterFlatFields, getFieldSelectOptions } from '../field-resolution';

describe('filterFlatFields', () => {
  it('keeps TIER 1/2 fields untouched', () => {
    const fields: DataFieldSpec[] = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'status', label: 'Status', type: 'select' },
    ];
    expect(filterFlatFields(fields)).toEqual(fields);
  });

  it('drops TIER-3 fields (no flat xlsx-cell representation) and warns once per field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fields: DataFieldSpec[] = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'attachments', label: 'Attachments', type: 'file' },
      { name: 'children', label: 'Children', type: 'subCollection' },
    ];

    const result = filterFlatFields(fields);

    expect(result).toEqual([{ name: 'name', label: 'Name', type: 'text' }]);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('attachments');
    expect(warnSpy.mock.calls[1]?.[0]).toContain('children');
    warnSpy.mockRestore();
  });

  it('keeps a field with no declared type (defensive — nothing to exclude on)', () => {
    const fields: DataFieldSpec[] = [{ name: 'freeform' }];
    expect(filterFlatFields(fields)).toEqual(fields);
  });
});

describe('getFieldSelectOptions', () => {
  const options = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  function formWith(field: SelectField | FileField): EntityForm {
    return new EntityForm('TestEntityForm', '/test').addFields({ items: [field] });
  }

  it('returns the declared SelectOption[] for a select field', () => {
    const form = formWith(new SelectField('status', 100, options));
    expect(getFieldSelectOptions(form, 'status')).toEqual(options);
  });

  it('returns undefined for a field with no options (e.g. file)', () => {
    const form = formWith(new FileField('attachments', 100));
    expect(getFieldSelectOptions(form, 'attachments')).toBeUndefined();
  });

  it('returns undefined for a field name not declared on the form', () => {
    const form = formWith(new SelectField('status', 100, options));
    expect(getFieldSelectOptions(form, 'missing')).toBeUndefined();
  });
});
