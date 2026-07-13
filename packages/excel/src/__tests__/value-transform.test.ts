import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FieldType } from '@listgrid/schema-core';
import { exportValue, importValue, isAutoDeriveExcluded } from '../value-transform';

// `fDate`'s bare `'yyyy-MM-dd'` inputs are parsed as UTC midnight
// (`new Date('2026-01-01')` — ECMA-262 date-only form) then re-read through
// LOCAL `getFullYear`/`getMonth`/`getDate` getters (ported behavior, matches
// the 0.3.x original's date-fns `format` — see value-transform.ts's `fDate`
// doc comment). That parse-UTC/read-local asymmetry can shift the resulting
// calendar day in a negative-UTC-offset runner. Pinning TZ=UTC here collapses
// the offset to 0 so this file's literal expected strings are deterministic
// regardless of the machine/CI running it. The `datetime` tests below use
// full (non-offset) date-TIME strings, which parse-as-local + read-as-local
// and are therefore already TZ-independent on their own — the pin doesn't
// change their expected values, just removes the `date` tests' dependency.
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'UTC';
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

describe('TIER 1 — select (value<->label)', () => {
  it('export: value -> label', () => {
    expect(exportValue('select', 'active', { options: STATUS_OPTIONS })).toBe('Active');
  });

  it('import: label -> value', () => {
    expect(importValue('select', 'Active', { options: STATUS_OPTIONS })).toBe('active');
  });

  it('round-trip: export then import returns the original value', () => {
    const exported = exportValue('select', 'inactive', { options: STATUS_OPTIONS });
    expect(importValue('select', exported, { options: STATUS_OPTIONS })).toBe('inactive');
  });

  it('export: value with no matching option falls back to String(value)', () => {
    expect(exportValue('select', 'unknown', { options: STATUS_OPTIONS })).toBe('unknown');
  });

  it('import: label with no matching option passes the raw value through', () => {
    expect(importValue('select', 'Nope', { options: STATUS_OPTIONS })).toBe('Nope');
  });
});

describe('TIER 1 — multiselect (|||-delimited, per-token label<->value)', () => {
  it('export: joins mapped labels with |||', () => {
    expect(exportValue('multiselect', 'active|||inactive', { options: STATUS_OPTIONS })).toBe(
      'Active|||Inactive',
    );
  });

  it('import: splits on ||| and maps labels back to values', () => {
    expect(importValue('multiselect', 'Active|||Inactive', { options: STATUS_OPTIONS })).toBe(
      'active|||inactive',
    );
  });

  it('round-trip: export then import returns the original ||| value', () => {
    const original = 'active|||inactive';
    const exported = exportValue('multiselect', original, { options: STATUS_OPTIONS });
    expect(importValue('multiselect', exported, { options: STATUS_OPTIONS })).toBe(original);
  });

  it('export: empty string short-circuits to empty string', () => {
    expect(exportValue('multiselect', '', { options: STATUS_OPTIONS })).toBe('');
  });

  it('export: a single (non-delimited) value round-trips too', () => {
    const exported = exportValue('multiselect', 'active', { options: STATUS_OPTIONS });
    expect(exported).toBe('Active');
    expect(importValue('multiselect', exported, { options: STATUS_OPTIONS })).toBe('active');
  });
});

describe('TIER 1 — date (range formatting, "~"-joined)', () => {
  it('export: a 2-element range formats as "yyyy-MM-dd ~ yyyy-MM-dd"', () => {
    expect(exportValue('date', ['2026-01-01', '2026-01-31'])).toBe('2026-01-01 ~ 2026-01-31');
  });

  it('import: splits a " ~ "-joined range back into a 2-element array', () => {
    expect(importValue('date', '2026-01-01 ~ 2026-01-31')).toEqual(['2026-01-01', '2026-01-31']);
  });

  it('round-trip: export then import recovers the same two calendar dates', () => {
    const exported = exportValue('date', ['2026-01-01', '2026-01-31']);
    expect(importValue('date', exported)).toEqual(['2026-01-01', '2026-01-31']);
  });

  it('export: a single scalar date formats without a range separator', () => {
    expect(exportValue('date', '2026-03-15')).toBe('2026-03-15');
  });
});

describe('TIER 1 — datetime (range formatting, "~"-joined, 12h AM/PM)', () => {
  it('export: a 2-element range formats each side with a 12h AM/PM clock', () => {
    const result = exportValue('datetime', ['2026-01-01T15:04:00', '2026-01-01T09:00:00']);
    expect(result).toBe('2026-01-01 3:04 PM ~ 2026-01-01 9:00 AM');
  });

  it('import: splits a " ~ "-joined range back into a 2-element array', () => {
    const imported = importValue('datetime', '2026-01-01 3:04 PM ~ 2026-01-01 9:00 AM');
    expect(imported).toEqual(['2026-01-01 3:04 PM', '2026-01-01 9:00 AM']);
  });

  it('round-trip: export then import is stable (re-formatting an already-formatted string is a fixed point)', () => {
    const exported = exportValue('datetime', ['2026-01-01T15:04:00', '2026-01-01T09:00:00']);
    const imported = importValue('datetime', exported);
    expect(imported).toEqual(exported.split(' ~ '));
  });
});

describe('TIER 1 — boolean (예/아니오)', () => {
  it('export: true -> 예', () => {
    expect(exportValue('boolean', true)).toBe('예');
  });

  it('export: false -> 아니오', () => {
    expect(exportValue('boolean', false)).toBe('아니오');
  });

  it('import: 예 -> true', () => {
    expect(importValue('boolean', '예')).toBe(true);
  });

  it('import: everything else -> false', () => {
    expect(importValue('boolean', '아니오')).toBe(false);
  });

  it('round-trip: export then import recovers the original boolean', () => {
    expect(importValue('boolean', exportValue('boolean', true))).toBe(true);
    expect(importValue('boolean', exportValue('boolean', false))).toBe(false);
  });
});

describe('TIER 1 — html/markdown (plain-text strip on export, passthrough on import)', () => {
  it('export: html strips tags to plain text', () => {
    expect(exportValue('html', '<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('export: markdown strips tags to plain text (same helper as html)', () => {
    expect(exportValue('markdown', '<em>Hi</em>')).toBe('Hi');
  });

  it('import: html passes the raw cell value through unchanged', () => {
    expect(importValue('html', '<p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('import: markdown passes the raw cell value through unchanged', () => {
    expect(importValue('markdown', '# Title')).toBe('# Title');
  });
});

describe('TIER 2 — scalar passthrough (every FieldType not in TIER 1/TIER 3)', () => {
  it('export: text -> String(value)', () => {
    expect(exportValue('text', 'hello')).toBe('hello');
  });

  it('export: number -> String(value)', () => {
    expect(exportValue('number', 42)).toBe('42');
  });

  it('export: null/undefined -> empty string regardless of type', () => {
    expect(exportValue('text', null)).toBe('');
    expect(exportValue('number', undefined)).toBe('');
  });

  it('import: text passes the value through unchanged', () => {
    expect(importValue('text', 'hello')).toBe('hello');
  });

  it('import: number passes the value through unchanged', () => {
    expect(importValue('number', 42)).toBe(42);
  });

  it('export: manyToOne row value {id,name} exports the label, not "[object Object]"', () => {
    expect(exportValue('manyToOne', { id: 7, name: 'Acme Inc' })).toBe('Acme Inc');
  });

  it('export: manyToOne row value with no name falls back to label then id', () => {
    expect(exportValue('manyToOne', { id: 7, label: 'Acme Label' })).toBe('Acme Label');
    expect(exportValue('manyToOne', { id: 7 })).toBe('7');
  });

  it('export: manyToOne row value already flattened to a scalar id passes through unchanged (regression guard)', () => {
    expect(exportValue('manyToOne', 7)).toBe('7');
  });

  it('export: manyToOne with a custom labelField probes that key first (edustack {id,title} shape)', () => {
    expect(exportValue('manyToOne', { id: 482, title: 'Course A' }, { labelField: 'title' })).toBe(
      'Course A',
    );
  });

  it('export: manyToOne {id,title} WITHOUT a labelField mis-falls to id (documents the pre-fix defect)', () => {
    expect(exportValue('manyToOne', { id: 482, title: 'Course A' })).toBe('482');
  });

  it('export: labelField key absent/nullish falls back to name->label->id', () => {
    expect(exportValue('manyToOne', { id: 7, name: 'Acme' }, { labelField: 'title' })).toBe('Acme');
    expect(exportValue('manyToOne', { id: 7, title: null }, { labelField: 'title' })).toBe('7');
  });

  it('export: xref {mapped,deleted} envelope has no name/label/id -> empty cell (documented data-loss, not corruption)', () => {
    expect(exportValue('xrefMapping', { mapped: [1, 2], deleted: [] })).toBe('');
  });

  // GA-L2 closure (#W6-2b) — address is NOT a fidelity limitation (unlike xref
  // above). The composite AddressField is `exceptOnSave`/virtual
  // (schema-core address-field.ts:56): its own store slot is never saved and
  // real backend rows carry no nested `address` key, so `row['address']` is
  // undefined -> empty cell. The actual address data is carried FAITHFULLY by
  // 5 flat sibling text columns (state/city/address1/address2/postalCode) —
  // observed in export-core.test.ts ("applyFullAddressFields ... faithful
  // siblings"). This defensive case only guards the never-in-practice
  // nested-object shape: its real members (state/city/address1/address2/
  // postalCode — NOT the Daum widget keys zonecode/roadAddress) lack
  // name/label/id, so it yields '' (a redundant vestige), never "[object
  // Object]". So the empty cell here is redundancy, not data-loss.
  it('export: address composite object (defensive) -> empty cell; the real data rides the flat sibling columns, so this is NOT data-loss', () => {
    expect(
      exportValue('address', {
        state: 'Seoul',
        city: 'Gangnam',
        address1: '123 Main',
        address2: 'Apt 5',
        postalCode: '06236',
      }),
    ).toBe('');
  });
});

describe('isAutoDeriveExcluded — TIER 3', () => {
  const excluded: readonly FieldType[] = [
    'subCollection',
    'contentAsset',
    'multipleAsset',
    'file',
    'image',
    'inlineMap',
    'mappedJoin',
  ];

  it.each(excluded)('%s is excluded from auto-derive', (type) => {
    expect(isAutoDeriveExcluded(type)).toBe(true);
  });

  it('a TIER 1 type (select) is not excluded', () => {
    expect(isAutoDeriveExcluded('select')).toBe(false);
  });

  it('a TIER 2 type (text) is not excluded', () => {
    expect(isAutoDeriveExcluded('text')).toBe(false);
  });
});

describe('TIER 3 types fall through to TIER 2 passthrough when transformed explicitly', () => {
  it('export: subCollection is not auto-derived, but an explicit call still scalar-passes-through', () => {
    expect(exportValue('subCollection', 'raw-value')).toBe('raw-value');
  });

  it('import: file is not auto-derived, but an explicit call still passes through', () => {
    expect(importValue('file', 'raw-value')).toBe('raw-value');
  });
});
