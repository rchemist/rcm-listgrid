import { describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx-js-style';
import {
  applyFullAddressFields,
  BooleanField,
  EntityForm,
  FileField,
  ManyToOneField,
  MultiSelectField,
  SelectField,
  StringField,
} from '@listgrid/schema-core';
import {
  buildExportAoa,
  buildExportWorksheet,
  downloadExportWorkbook,
  resolveExportConfig,
} from '../export-core';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

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

describe('resolveExportConfig', () => {
  it('auto-derives fields (declaration order) and drops TIER-3 types with a warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const form = collegeForm().withDataTransfer({ export: {} });

    const resolved = resolveExportConfig(form);

    expect(resolved.fields.map((f) => f.name)).toEqual(['name', 'status', 'colors', 'active']);
    expect(resolved.fileName).toBe('CollegeEntityForm');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('attachments');
    warnSpy.mockRestore();
  });

  it('fileName precedence: prop override > declared export.fileName > entityForm.name', () => {
    const form = collegeForm().withDataTransfer({ export: { fileName: 'declared' } });

    expect(resolveExportConfig(form).fileName).toBe('declared');
    expect(resolveExportConfig(form, 'override').fileName).toBe('override');

    const undeclaredFileNameForm = collegeForm().withDataTransfer({ export: {} });
    expect(resolveExportConfig(undeclaredFileNameForm).fileName).toBe('CollegeEntityForm');
  });

  it('returns an empty field list when export was never declared', () => {
    const form = collegeForm();
    expect(resolveExportConfig(form).fields).toEqual([]);
  });
});

describe('buildExportAoa', () => {
  it('builds the header row as `${label}\\n[${name}]` and transforms each cell via exportValue', () => {
    const form = collegeForm();
    const fields = resolveExportConfig(form.withDataTransfer({ export: {} })).fields;
    const rows = [
      { name: 'Acme College', status: 'active', colors: ['red', 'blue'], active: true },
      { name: 'Beta College', status: 'inactive', colors: [], active: false },
    ];

    const aoa = buildExportAoa(form, fields, rows);

    expect(aoa[0]).toEqual([
      'Name\n[name]',
      'Status\n[status]',
      'Colors\n[colors]',
      'Active\n[active]',
    ]);
    expect(aoa[1]).toEqual(['Acme College', 'Active', 'Red|||Blue', '예']);
    expect(aoa[2]).toEqual(['Beta College', 'Inactive', '', '아니오']);
  });

  it('falls back to the bare field name in the header when no label was resolved', () => {
    const form = collegeForm();
    const aoa = buildExportAoa(form, [{ name: 'name' }], [{ name: 'x' }]);
    expect(aoa[0]).toEqual(['name\n[name]']);
  });
});

describe('buildExportAoa — manyToOne labelField (R7 / edustack shape)', () => {
  it('exports the nested object under its configured labelField, not the raw id', () => {
    const courseForm = new EntityForm('CourseForm', '/course').addFields({
      items: [new StringField('title', 100).withLabel('Title')],
    });
    const form = new EntityForm('IssuanceForm', '/issuance').addFields({
      items: [
        new StringField('name', 100).withLabel('Name'),
        new ManyToOneField('lmsCourse', 200, {
          entityForm: () => courseForm,
          labelField: 'title',
        }).withLabel('Course'),
      ],
    });
    const fields = [
      { name: 'name', label: 'Name', type: 'text' as const },
      { name: 'lmsCourse', label: 'Course', type: 'manyToOne' as const },
    ];
    const rows = [{ name: 'Cert #1', lmsCourse: { id: 482, title: 'Course A' } }];

    const aoa = buildExportAoa(form, fields, rows);

    expect(aoa[1]).toEqual(['Cert #1', 'Course A']);
  });
});

describe('buildExportAoa — composite AddressField (GA-L2 #W6-2b: faithful via flat siblings)', () => {
  // `applyFullAddressFields` declares a VIRTUAL composite `address` field
  // (exceptOnSave, address-field.ts:56) + 5 flat sibling StringFields that
  // actually carry the data (state/city/address1/address2/postalCode). Real
  // backend rows are flat-scalar (no nested `address` key — recon:40), so on
  // export the composite column comes out EMPTY (a redundant vestige) while the
  // sibling columns carry the real values FAITHFULLY. This locks that address
  // export is NOT lossy — the empty composite cell is not data-loss.
  it('emits an empty composite `address` column but carries the real data faithfully in the flat sibling columns', () => {
    const form = applyFullAddressFields(
      new EntityForm('StudentForm', '/student').addFields({
        items: [new StringField('name', 100).withLabel('Name')],
      }),
    ).withDataTransfer({ export: {} });

    const resolved = resolveExportConfig(form);
    // composite `address` + its 5 flat siblings all auto-derive (none is TIER-3,
    // so filterFlatFields drops nothing and no warn fires).
    expect(resolved.fields.map((f) => f.name)).toEqual([
      'name',
      'address',
      'state',
      'city',
      'address1',
      'address2',
      'postalCode',
    ]);

    // A real (flat-scalar) row — no nested `address` key.
    const aoa = buildExportAoa(form, resolved.fields, [
      {
        name: 'Kim',
        state: 'Seoul',
        city: 'Gangnam',
        address1: '123 Main',
        address2: 'Apt 5',
        postalCode: '06236',
      },
    ]);

    // composite `address` cell (index 1) is empty; every flat sibling is faithful.
    expect(aoa[1]).toEqual(['Kim', '', 'Seoul', 'Gangnam', '123 Main', 'Apt 5', '06236']);
  });
});

describe('buildExportWorksheet', () => {
  it('forces text format on text/select/multiselect/phone cells and leaves others alone', () => {
    const form = collegeForm().withDataTransfer({ export: {} });
    const fields = resolveExportConfig(form).fields; // name(text) status(select) colors(multiselect) active(boolean)
    const aoa = buildExportAoa(form, fields, [
      { name: 'Acme College', status: 'active', colors: ['red'], active: true },
    ]);

    const ws = buildExportWorksheet(fields, aoa);

    // data row is R=1 (header R=0)
    expect(ws['A2']?.t).toBe('s');
    expect(ws['A2']?.z).toBe('@');
    expect(ws['B2']?.t).toBe('s'); // select
    expect(ws['B2']?.z).toBe('@');
    expect(ws['C2']?.t).toBe('s'); // multiselect
    expect(ws['C2']?.z).toBe('@');
    // boolean (D) is not in the forced-text set — no forced z format
    expect(ws['D2']?.z).not.toBe('@');
  });

  it('styles the header row (bold + fill) and sets a fixed 20-char column width', () => {
    const fields = [{ name: 'name', label: 'Name', type: 'text' as const }];
    const aoa = buildExportAoa(collegeForm(), fields, [{ name: 'x' }]);

    const ws = buildExportWorksheet(fields, aoa);

    expect(ws['A1']?.s?.font?.bold).toBe(true);
    expect(ws['A1']?.s?.fill?.fgColor?.rgb).toBe('F1F5FE');
    expect(ws['!cols']).toEqual([{ wch: 20 }]);
  });
});

describe('downloadExportWorkbook', () => {
  it('writes the workbook to a Blob and calls file-saver.saveAs with an .xlsx filename', async () => {
    const { saveAs } = await import('file-saver');
    const ws = XLSX.utils.aoa_to_sheet([['a'], ['b']]);

    downloadExportWorkbook(ws, 'my-export');

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, fileName] = vi.mocked(saveAs).mock.calls[0]!;
    expect(blob).toBeInstanceOf(Blob);
    expect(fileName).toBe('my-export.xlsx');
  });

  it('does not double-append .xlsx when the file name already carries it', async () => {
    const { saveAs } = await import('file-saver');
    vi.mocked(saveAs).mockClear();
    const ws = XLSX.utils.aoa_to_sheet([['a']]);

    downloadExportWorkbook(ws, 'already-named.xlsx');

    const [, fileName] = vi.mocked(saveAs).mock.calls[0]!;
    expect(fileName).toBe('already-named.xlsx');
  });
});
