// ViewListGrid — JSDOM render test. "Mini-College" list: three rows through a
// MOCK BackendAdapter, proving fetch-on-mount, row rendering (charter C9),
// and the row-click affordance end to end with @listgrid/ui-default's
// unstyled primitives — no host app.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, PageResult } from '@listgrid/schema-core';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createListStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { ViewListGrid } from '../components/ViewListGrid';

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('Name'),
      new StringField('englishName', 110).withLabel('English Name'),
    ],
  });
}

const COLLEGES: Record<string, unknown>[] = [
  { id: '1', name: 'Engineering', englishName: 'College of Engineering' },
  { id: '2', name: 'Medicine', englishName: 'College of Medicine' },
  { id: '3', name: 'Law', englishName: 'College of Law' },
];

function mockAdapter(): BackendAdapter {
  return {
    list: vi.fn(
      async (): Promise<PageResult<Record<string, unknown>>> => ({
        content: COLLEGES,
        totalElements: COLLEGES.length,
        totalPages: 1,
      }),
    ),
    getOne: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    create: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    update: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    remove: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
  };
}

describe('ViewListGrid (JSDOM render)', () => {
  it('fetches on mount and renders the 3 rows with their names', async () => {
    const entityForm = collegeForm();
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.getUrl(), adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Medicine')).toBeInTheDocument();
    expect(screen.getByText('Law')).toBeInTheDocument();
  });

  it('calls onRowClick with the clicked row', async () => {
    const entityForm = collegeForm();
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.getUrl(), adapter });
    const onRowClick = vi.fn();

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} onRowClick={onRowClick} />
      </UIProvider>,
    );

    const medicineCell = await screen.findByText('Medicine');
    const row = medicineCell.closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveAttribute('data-row-id', '2');

    fireEvent.click(row as HTMLElement);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: '2', name: 'Medicine' }));
  });
});
