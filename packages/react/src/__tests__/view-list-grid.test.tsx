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
    const store = createListStore({ url: entityForm.url, adapter });

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
    const store = createListStore({ url: entityForm.url, adapter });
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

  // EA-D2-0 selection — decision ① minimal-4 shape (§3).
  describe('selection', () => {
    it('checking rows and confirming calls onConfirm with the checked ids', async () => {
      const entityForm = collegeForm();
      const adapter = mockAdapter();
      const store = createListStore({ url: entityForm.url, adapter });
      const onConfirm = vi.fn();
      const onRowClick = vi.fn();

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            onRowClick={onRowClick}
            selection={{ enabled: true, onConfirm, confirmLabel: '선택 완료' }}
          />
        </UIProvider>,
      );

      await screen.findByText('Engineering');

      const confirmButton = screen.getByRole('button', { name: '선택 완료' });
      expect(confirmButton).toBeDisabled(); // 0 checked

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 3' }));

      expect(confirmButton).not.toBeDisabled();
      // the checkbox click must NOT also fire the row's onRowClick.
      expect(onRowClick).not.toHaveBeenCalled();

      fireEvent.click(confirmButton);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(['1', '3']);
    });

    it('row click still fires normally when a DIFFERENT part of the row is clicked', async () => {
      const entityForm = collegeForm();
      const adapter = mockAdapter();
      const store = createListStore({ url: entityForm.url, adapter });
      const onRowClick = vi.fn();

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            onRowClick={onRowClick}
            selection={{ enabled: true, onConfirm: vi.fn() }}
          />
        </UIProvider>,
      );

      const medicineCell = await screen.findByText('Medicine');
      fireEvent.click(medicineCell.closest('tr') as HTMLElement);
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });
  });

  // EA-D2-0 toolbar — receives the live checkedIds; the checkbox column's
  // existence is driven strictly by selection.enabled, not by toolbar's mere
  // presence (contract documented on ViewListGridProps.toolbar).
  describe('toolbar', () => {
    it('receives live checkedIds as boxes are (un)checked', async () => {
      const entityForm = collegeForm();
      const adapter = mockAdapter();
      const store = createListStore({ url: entityForm.url, adapter });
      const toolbar = vi.fn((ctx: { checkedIds: string[] }) => (
        <div data-testid="toolbar-checked">{ctx.checkedIds.join(',')}</div>
      ));

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            selection={{ enabled: true, onConfirm: vi.fn() }}
            toolbar={toolbar}
          />
        </UIProvider>,
      );

      await screen.findByText('Engineering');
      expect(screen.getByTestId('toolbar-checked')).toHaveTextContent('');

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
      expect(screen.getByTestId('toolbar-checked')).toHaveTextContent('2');
    });

    it('receives an empty array when selection is absent, even though toolbar is present', async () => {
      const entityForm = collegeForm();
      const adapter = mockAdapter();
      const store = createListStore({ url: entityForm.url, adapter });
      const toolbar = vi.fn((ctx: { checkedIds: string[] }) => (
        <div data-testid="toolbar-checked">{ctx.checkedIds.join(',')}</div>
      ));

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid entityForm={entityForm} store={store} toolbar={toolbar} />
        </UIProvider>,
      );

      await screen.findByText('Engineering');
      expect(screen.queryByRole('checkbox')).toBeNull(); // no selection => no checkbox column
      expect(screen.getByTestId('toolbar-checked')).toHaveTextContent('');
    });
  });

  // EA-D2-0 columns union — synthetic object columns render via render(row).
  it('renders a synthetic column via its render(row) function', async () => {
    const entityForm = collegeForm();
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          columns={[
            'name',
            {
              name: 'shout',
              label: 'SHOUT',
              render: (row) => <strong>{String(row['name']).toUpperCase()}!</strong>,
            },
          ]}
        />
      </UIProvider>,
    );

    expect(await screen.findByText('SHOUT')).toBeInTheDocument();
    expect(await screen.findByText('ENGINEERING!')).toBeInTheDocument();
    expect(screen.getByText('MEDICINE!')).toBeInTheDocument();
  });
});
