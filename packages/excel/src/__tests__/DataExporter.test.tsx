import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  BooleanField,
  EntityForm,
  FileField,
  SelectField,
  StringField,
} from '@listgrid/schema-core';
import { UIProvider } from '@listgrid/react';
import { defaultUIComponents } from '@listgrid/ui-default';
import { DataExporter } from '../DataExporter';

const mockedSaveAs = vi.hoisted(() => vi.fn());
vi.mock('file-saver', () => ({ saveAs: mockedSaveAs, default: { saveAs: mockedSaveAs } }));

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
    .withDataTransfer({ export: {} });
}

function renderExporter(rows: Record<string, unknown>[], onClose = vi.fn()) {
  render(
    <UIProvider components={defaultUIComponents}>
      <DataExporter entityForm={collegeForm()} rows={rows} onClose={onClose} />
    </UIProvider>,
  );
  return { onClose };
}

describe('DataExporter', () => {
  it('renders a checklist of the auto-derived fields, excluding TIER-3 (attachments)', () => {
    renderExporter([]);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Attachments')).not.toBeInTheDocument();
  });

  it('downloads a Blob via file-saver.saveAs when Download is clicked, with all fields checked by default', async () => {
    const { saveAs } = await import('file-saver');
    renderExporter([{ name: 'Acme College', status: 'active', active: true }]);

    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, fileName] = vi.mocked(saveAs).mock.calls[0]!;
    expect(blob).toBeInstanceOf(Blob);
    expect(fileName).toBe('CollegeEntityForm.xlsx');
  });

  it('unchecking a field excludes it from the exported columns (still downloads the rest)', async () => {
    const { saveAs } = await import('file-saver');
    vi.mocked(saveAs).mockClear();
    renderExporter([{ name: 'Acme College', status: 'active', active: true }]);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Status' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    expect(saveAs).toHaveBeenCalledTimes(1);
  });

  it('disables Download once every field is unchecked', () => {
    renderExporter([]);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Name' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Status' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));

    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  });
});
