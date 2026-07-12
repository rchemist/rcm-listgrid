import { describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx-js-style';
import type { DataFieldSpec } from '@listgrid/schema-core';
import {
  BooleanField,
  EntityForm,
  FileField,
  MultiSelectField,
  SelectField,
  StringField,
} from '@listgrid/schema-core';
import {
  buildImportRows,
  matchImportColumns,
  parseWorkbookArrayBuffer,
  resolveImportFields,
} from '../import-core';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
];

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withLabel('Name'),
      new SelectField('status', 200, STATUS_OPTIONS).withLabel('Status'),
      new MultiSelectField('colors', 300, COLOR_OPTIONS).withLabel('Colors'),
      new BooleanField('active', 400).withLabel('Active'),
      new FileField('attachments', 500).withLabel('Attachments'),
    ],
  });
}

function bufferFromAoa(aoa: unknown[][]): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet(aoa as string[][]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

describe('parseWorkbookArrayBuffer', () => {
  it('splits the first sheet into a header row + body AOA (real xlsx round-trip)', () => {
    const buffer = bufferFromAoa([
      ['Name\n[name]', 'Status\n[status]'],
      ['Acme College', 'Active'],
      ['Beta College', 'Inactive'],
    ]);

    const { header, bodyRows } = parseWorkbookArrayBuffer(buffer);

    expect(header).toEqual(['Name\n[name]', 'Status\n[status]']);
    expect(bodyRows).toEqual([
      ['Acme College', 'Active'],
      ['Beta College', 'Inactive'],
    ]);
  });

  it('returns an empty header/body for a workbook with no sheets worth of data', () => {
    const buffer = bufferFromAoa([]);
    const { header, bodyRows } = parseWorkbookArrayBuffer(buffer);
    expect(header).toEqual([]);
    expect(bodyRows).toEqual([]);
  });
});

describe('resolveImportFields', () => {
  it('auto-derives fields and drops TIER-3 types with a warn (symmetric to export-core)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const form = collegeForm().withDataTransfer({ import: {} });

    const fields = resolveImportFields(form);

    expect(fields.map((f) => f.name)).toEqual(['name', 'status', 'colors', 'active']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('attachments');
    warnSpy.mockRestore();
  });

  it(':448-symmetry — import never falls back to a declared export.fields list', () => {
    const form = collegeForm().withDataTransfer({
      export: { fields: [{ name: 'name', label: 'Name', type: 'text' }] },
      import: {},
    });

    // import has no fields of its own declared -> auto-derives from ITS OWN
    // side, never falls back to export's declared fields (schema-core W6-1
    // :448 fix) — the full field set appears here, not just `name`.
    expect(resolveImportFields(form).map((f) => f.name)).toEqual([
      'name',
      'status',
      'colors',
      'active',
    ]);
  });
});

describe('matchImportColumns', () => {
  const fields: DataFieldSpec[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select' },
  ];

  it('matches header cells embedding `[fieldName]`', () => {
    const header = ['Name\n[name]', 'Status\n[status]', 'Extra\n[unknown]'];
    const matched = matchImportColumns(header, fields);
    expect(matched).toEqual([
      { excelColIndex: 0, field: fields[0] },
      { excelColIndex: 1, field: fields[1] },
    ]);
  });

  it('falls back to matching the bare cell text when there is no [bracket] token', () => {
    const header = ['name', 'status'];
    const matched = matchImportColumns(header, fields);
    expect(matched.map((m) => m.field.name)).toEqual(['name', 'status']);
  });

  it('returns an empty match list when nothing lines up', () => {
    expect(matchImportColumns(['Nope\n[nope]'], fields)).toEqual([]);
  });
});

describe('buildImportRows', () => {
  const fields: DataFieldSpec[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select' },
    { name: 'colors', label: 'Colors', type: 'multiselect' },
    { name: 'active', label: 'Active', type: 'boolean' },
  ];

  it('converts cells via importValue (select label->value, boolean, multiselect array bridge)', () => {
    const form = collegeForm();
    const matched = matchImportColumns(
      ['Name\n[name]', 'Status\n[status]', 'Colors\n[colors]', 'Active\n[active]'],
      fields,
    );

    const rows = buildImportRows(form, matched, [['Acme College', 'Active', 'Red|||Blue', '예']]);

    expect(rows).toEqual([
      { name: 'Acme College', status: 'active', colors: ['red', 'blue'], active: true },
    ]);
  });

  it('drops rows whose matched cells are ALL blank (gjcu #1478)', () => {
    const form = collegeForm();
    const matched = matchImportColumns(['Name\n[name]', 'Status\n[status]'], fields);

    const rows = buildImportRows(form, matched, [
      ['Acme College', 'Active'],
      ['', undefined as unknown as string],
      ['   ', null as unknown as string],
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe('Acme College');
  });

  it('bridges an empty multiselect cell to an empty array, not [""]', () => {
    const form = collegeForm();
    const matched = matchImportColumns(
      ['Name\n[name]', 'Colors\n[colors]'],
      [fields[0]!, fields[2]!],
    );

    const rows = buildImportRows(form, matched, [['Acme College', '']]);

    expect(rows[0]?.colors).toEqual([]);
  });
});
