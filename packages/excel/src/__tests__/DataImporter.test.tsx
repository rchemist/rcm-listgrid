import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx-js-style';
import {
  BooleanField,
  EntityForm,
  FileField,
  SelectField,
  StringField,
} from '@listgrid/schema-core';
import { UIProvider } from '@listgrid/react';
import { defaultUIComponents } from '@listgrid/ui-default';
import { DataImporter } from '../DataImporter';

// DOM mocked (goal doc: "xlsx real and FileSaver/DOM mocked") — a
// synchronous FakeFileReader stands in for the browser's real
// `FileReader.readAsArrayBuffer`, which jsdom does not reliably implement
// end-to-end for File->ArrayBuffer. `xlsx-js-style` itself is exercised for
// real (the ArrayBuffer fixtures below are built via a genuine `XLSX.write`,
// same as `import-core.test.ts`).
class FakeFileReader {
  onload: ((event: { target: { result: ArrayBuffer } }) => void) | null = null;
  onerror: (() => void) | null = null;
  result: ArrayBuffer | null = null;

  readAsArrayBuffer(_file: unknown): void {
    queueMicrotask(() => {
      this.result = currentBuffer;
      this.onload?.({ target: { result: currentBuffer! } });
    });
  }
}

let currentBuffer: ArrayBuffer | null = null;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college')
    .addFields({
      items: [
        new StringField('name', 100).withLabel('Name'),
        new SelectField('status', 200, STATUS_OPTIONS).withLabel('Status'),
        new BooleanField('active', 300).withLabel('Active'),
        new FileField('attachments', 400).withLabel('Attachments'),
      ],
    })
    .withDataTransfer({ import: {} });
}

function bufferFromAoa(aoa: unknown[][]): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet(aoa as string[][]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

function renderImporter(onSubmit = vi.fn()) {
  render(
    <UIProvider components={defaultUIComponents}>
      <DataImporter entityForm={collegeForm()} onSubmit={onSubmit} />
    </UIProvider>,
  );
  return { onSubmit };
}

function selectFile(): void {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(fileInput, { target: { files: [{}] } });
}

describe('DataImporter', () => {
  const originalFileReader = globalThis.FileReader;

  beforeEach(() => {
    // @ts-expect-error test double, not a spec-complete FileReader
    globalThis.FileReader = FakeFileReader;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    currentBuffer = null;
  });

  it('parses an uploaded workbook, converts cells, and calls onSubmit with the built rows', async () => {
    currentBuffer = bufferFromAoa([
      ['Name\n[name]', 'Status\n[status]', 'Active\n[active]'],
      ['Acme College', 'Active', '예'],
      ['Beta College', 'Inactive', '아니오'],
    ]);
    const { onSubmit } = renderImporter();

    selectFile();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith([
      { name: 'Acme College', status: 'active', active: true },
      { name: 'Beta College', status: 'inactive', active: false },
    ]);
  });

  it('drops all-blank rows before calling onSubmit (gjcu #1478)', async () => {
    currentBuffer = bufferFromAoa([
      ['Name\n[name]', 'Status\n[status]'],
      ['Acme College', 'Active'],
      ['', ''],
    ]);
    const { onSubmit } = renderImporter();

    selectFile();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith([{ name: 'Acme College', status: 'active' }]);
  });

  it('shows an error and keeps Submit disabled when no header cell matches a declared field', async () => {
    currentBuffer = bufferFromAoa([['Unrelated\n[nope]'], ['x']]);
    const { onSubmit } = renderImporter();

    selectFile();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
