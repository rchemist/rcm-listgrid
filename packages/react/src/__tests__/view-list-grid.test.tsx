// ViewListGrid — JSDOM render test. "Mini-College" list: three rows through a
// MOCK BackendAdapter, proving fetch-on-mount, row rendering (charter C9),
// and the row-click affordance end to end with @listgrid/ui-default's
// unstyled primitives — no host app.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, FieldType, PageResult } from '@listgrid/schema-core';
import {
  BooleanField,
  DateField,
  EmailField,
  EntityForm,
  MultiSelectField,
  NumberField,
  SearchForm,
  SelectField,
  StringField,
} from '@listgrid/schema-core';
import { createListStore } from '@listgrid/state';
import { defaultUIComponents, type CheckBoxProps, type UIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { ViewListGrid } from '../components/ViewListGrid';
import { registerListCellRenderer } from '../registry/list-cell-renderer-registry';
import { registerFilterRenderer } from '../registry/filter-renderer-registry';
import { configureLabels } from '../labels';

afterEach(() => {
  configureLabels({
    quickSearchPlaceholder: '검색',
    quickSearchPlaceholderFor: (labels) => `Search ${labels.join(', ')}...`,
    paginationPrev: 'Prev',
    paginationNext: 'Next',
    emptyState: '데이터가 없습니다.',
    rowNumberHeader: 'No.',
  });
});

// withList() (spec §5.1; W5-2) — the magic "first ~4 non-hidden fields"
// fallback this test file exercised pre-W5-2 is abolished; `name` needs an
// explicit opt-in for every existing assertion below (row-text/click/
// selection/toolbar) to keep rendering it as a column.
function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('Name').withList(),
      new StringField('englishName', 110).withLabel('English Name'),
    ],
  });
}

function searchableCollegeForm(): EntityForm {
  return new EntityForm('SearchableCollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withLabel('Name').withList().withFilter(),
      new StringField('englishName', 110).withLabel('English Name').withList().withFilter(),
    ],
  });
}

const COLLEGES: Record<string, unknown>[] = [
  { id: '1', name: 'Engineering', englishName: 'College of Engineering' },
  { id: '2', name: 'Medicine', englishName: 'College of Medicine' },
  { id: '3', name: 'Law', englishName: 'College of Law' },
];

function mockAdapter(): BackendAdapter {
  return rowsAdapter(COLLEGES);
}

/** A BackendAdapter double serving the given fixed row set (mockAdapter()'s
 * shape, parameterized — the column-derivation tests below each need their
 * own row shape). */
function rowsAdapter(rows: Record<string, unknown>[]): BackendAdapter {
  return {
    list: vi.fn(
      async (): Promise<PageResult<Record<string, unknown>>> => ({
        content: rows,
        totalElements: rows.length,
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

/** Same shape as `rowsAdapter`, but ALSO records every `SearchForm` passed to
 * `adapter.list` — the advanced-search suite below asserts on the filters a
 * "검색" apply actually sends, not just the resulting rows. Server-side
 * filtering is out of scope for this double (it always returns ALL `rows`
 * regardless of `search` — ViewListGrid itself only builds/dispatches the
 * SearchForm; a real backend applying it is the mock-backend's job, covered
 * by e2e/college.spec.ts). */
function rowsAdapterWithCalls(rows: Record<string, unknown>[]): {
  adapter: BackendAdapter;
  listCalls: SearchForm[];
} {
  const listCalls: SearchForm[] = [];
  const adapter: BackendAdapter = {
    list: vi.fn(async (_url: string, search: SearchForm): Promise<PageResult> => {
      listCalls.push(search);
      return { content: rows, totalElements: rows.length, totalPages: 1 };
    }),
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
  return { adapter, listCalls };
}

/** `name` opts into BOTH the list column AND the advanced-search panel, with
 * a filter label override + a LIKE operator (exercises
 * FieldFilterConfig.operator passthrough); `code` opts into the panel only,
 * plain (`withFilter()`, no config — its text mapping emits LIKE). The panel
 * derivation (`deriveFilterFields`) is independent of
 * the column derivation (`deriveListFields`) — `code` proves a filter-only
 * field never becomes a column. */
function filterForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 100)
        .withLabel('Name')
        .withList()
        .withFilter({ label: 'Name Filter', operator: 'LIKE' }),
      new StringField('code', 200).withLabel('Code').withFilter(),
    ],
  });
}

/** `late` declares BOTH an order override (config.order 1, well ahead of its
 * own declared order 500) and label/align/width/sortable — proves the
 * override, not a coincidence of the field's own order. `early` opts in
 * plain (`withList()`, no config) — sorts by ITS OWN declared order (100)
 * since it has no override. `excluded` (`withList(false)`) and `undeclared`
 * (never called) must never appear. */
function derivationForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('late', 500)
        .withLabel('Late Field')
        .withList({ order: 1, label: 'Late Header', align: 'right', width: 80, sortable: true }),
      new StringField('early', 100).withLabel('Early Field').withList(),
      new StringField('excluded', 200).withLabel('Excluded Field').withList(false),
      new StringField('undeclared', 300).withLabel('Undeclared Field'),
    ],
  });
}

describe('ViewListGrid (JSDOM render)', () => {
  it('reads the configured quick-search placeholder at render time', async () => {
    configureLabels({ quickSearchPlaceholderFor: () => '찾기' });
    const entityForm = searchableCollegeForm();
    const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByPlaceholderText('찾기')).toBeInTheDocument();
  });

  it('passes configured pagination labels to the default Pagination component', async () => {
    configureLabels({ paginationPrev: '이전', paginationNext: '다음' });
    const entityForm = collegeForm();
    const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByRole('button', { name: '이전' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
  });

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

  it('attaches the stock panel, quick-search, table, row, empty, and pagination classes', async () => {
    const entityForm = searchableCollegeForm();
    const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} toolbar={() => <span>Actions</span>} />
      </UIProvider>,
    );

    await screen.findByText('Engineering');
    const root = document.querySelector('[data-list-grid="SearchableCollegeEntityForm"]');
    expect(root).toHaveClass('rcm-listgrid-panel', 'rcm-listgrid-panel-main');
    expect(screen.getByLabelText('Quick search')).toHaveClass(
      'rcm-input',
      'rcm-quick-search-input',
    );
    expect(document.querySelector('.rcm-quick-search-wrap')).toContainElement(
      document.querySelector('.rcm-quick-search-addon-search'),
    );
    const searchSvg = screen.getByRole('button', { name: '빠른 검색' }).querySelector('svg')!;
    expect(searchSvg).toHaveAttribute('stroke-width', '1');
    expect([...searchSvg.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual([
      'M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0',
      'M21 21l-6 -6',
    ]);
    expect(document.querySelector('table')).toHaveClass('rcm-table');
    expect(document.querySelector('thead')).toHaveClass('rcm-listgrid-thead');
    expect(document.querySelector('tbody')).toHaveClass('rcm-listgrid-tbody');
    expect(screen.getByText('Engineering').closest('tr')).toHaveClass('rcm-listgrid-row-hover');
    expect(document.querySelector('[data-list-grid-toolbar]')).toHaveClass(
      'rcm-search-bar-actions',
    );
    expect(document.querySelector('[data-total-elements]')).toHaveClass('rcm-listgrid-pagination');

    fireEvent.change(screen.getByLabelText('Quick search'), { target: { value: 'Eng' } });
    const clearButton = screen.getByRole('button', { name: 'Clear quick search' });
    const clearSvg = clearButton.querySelector('svg')!;
    expect(clearSvg).toHaveAttribute('stroke-width', '1');
    expect([...clearSvg.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual([
      'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
      'M10 10l4 4m0 -4l-4 4',
    ]);
    fireEvent.click(clearButton);
    expect(screen.getByLabelText('Quick search')).toHaveValue('');
  });

  it('quick-searches all filterable text list fields only on Enter/icon/clear, never per keystroke', async () => {
    const entityForm = searchableCollegeForm();
    const { adapter, listCalls } = rowsAdapterWithCalls(COLLEGES);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    const input = screen.getByLabelText('Quick search');
    expect(input).toHaveAttribute('placeholder', 'Search Name, English Name...');

    fireEvent.change(input, { target: { value: 'Eng' } });
    expect(adapter.list).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(input, { key: 'Enter' });
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON()).toMatchObject({
      quickSearchFields: ['name', 'englishName'],
      filters: {
        OR: [
          { name: 'name', value: 'Eng', queryConditionType: 'LIKE' },
          { name: 'englishName', value: 'Eng', queryConditionType: 'LIKE' },
        ],
      },
    });

    fireEvent.change(input, { target: { value: 'Law' } });
    fireEvent.click(screen.getByRole('button', { name: '빠른 검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.OR).toEqual([
      { name: 'name', value: 'Law', queryConditionType: 'LIKE' },
      { name: 'englishName', value: 'Law', queryConditionType: 'LIKE' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Clear quick search' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(4));
    expect(input).toHaveValue('');
    expect(listCalls[3]?.toJSON().filters.OR).toEqual([]);

    fireEvent.keyUp(input, { key: 'Enter' });
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(5));
    expect(listCalls[4]?.toJSON().filters.OR).toEqual([]);
  });

  it('includes filterable email fields in quick search and enables unified search', async () => {
    const entityForm = new EntityForm(
      'EmailQuickSearchEntityForm',
      '/email-quick-search',
    ).addFields({
      items: [
        new StringField('name', 100).withLabel('Name').withList().withFilter(),
        new EmailField('email', 110).withLabel('Email').withList().withFilter(),
      ],
    });
    const adapter = rowsAdapter([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Quick search')).toHaveAttribute(
      'placeholder',
      'Search Name, Email...',
    );

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).toBeInTheDocument();
  });

  it('shows a dismissible fetch error and clears it after the next successful fetch', async () => {
    const entityForm = collegeForm();
    const adapter = rowsAdapter(COLLEGES);
    adapter.list = vi
      .fn()
      .mockRejectedValueOnce(new Error('SEARCH.UNSUPPORTED_CONDITION'))
      .mockRejectedValueOnce(new Error('SEARCH.UNSUPPORTED_CONDITION'))
      .mockResolvedValue({ content: COLLEGES, totalElements: 3, totalPages: 1 });
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveAttribute('data-list-error');
    fireEvent.click(screen.getByRole('button', { name: '검색 오류 닫기' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => store.getState().fetch());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await act(async () => store.getState().fetch());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows the error banner and clears loading when postFetch throws', async () => {
    const entityForm = collegeForm();
    const store = createListStore({
      url: entityForm.url,
      adapter: mockAdapter(),
      postFetch: () => {
        throw new Error('postFetch boom');
      },
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveAttribute('data-list-error');
    expect(store.getState().error).toBe('postFetch boom');
    expect(store.getState().loading).toBe(false);
  });

  it('orders searchbar, advanced panel, error, table, and pagination in the stock flow', async () => {
    const entityForm = filterForm();
    const adapter = rowsAdapter([]);
    adapter.list = vi.fn(async () => {
      throw new Error('bad condition');
    });
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    const root = document.querySelector('[data-list-grid]')!;
    const children = [...root.children];
    expect(
      children.findIndex((element) => element.classList.contains('rcm-listgrid-searchbar')),
    ).toBeLessThan(children.findIndex((element) => element.hasAttribute('data-advanced-search')));
    expect(
      children.findIndex((element) => element.hasAttribute('data-advanced-search')),
    ).toBeLessThan(children.findIndex((element) => element.hasAttribute('data-list-error')));
    expect(children.findIndex((element) => element.hasAttribute('data-list-error'))).toBeLessThan(
      children.findIndex((element) => element.classList.contains('rcm-skeleton-table-wrapper')),
    );
    expect(
      children.findIndex((element) => element.classList.contains('rcm-skeleton-table-wrapper')),
    ).toBeLessThan(
      children.findIndex((element) => element.classList.contains('rcm-listgrid-pagination')),
    );
  });

  it('opens the row URL in a centered named popup without firing the row click', async () => {
    const entityForm = collegeForm();
    const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });
    const onRowClick = vi.fn();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          onRowClick={onRowClick}
          openInNewWindow={{
            enabled: true,
            getUrl: (row) => `/college/${String(row['id'])}?popup=true`,
          }}
        />
      </UIProvider>,
    );

    await screen.findByText('Engineering');
    expect(document.querySelector('thead .rcm-skeleton-td-newwin')).toBeInTheDocument();
    const newWindowButton = screen.getAllByRole('button', { name: '새 창에서 보기' })[0]!;
    expect(
      [...newWindowButton.querySelectorAll('path')].map((path) => path.getAttribute('d')),
    ).toEqual([
      'M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6',
      'M11 13l9 -9',
      'M15 4h5v5',
    ]);
    fireEvent.click(newWindowButton);
    expect(open).toHaveBeenCalledWith(
      '/college/1?popup=true',
      'entity_1',
      expect.stringMatching(
        /^width=1280,height=860,left=\d+,top=\d+,scrollbars=yes,resizable=yes$/,
      ),
    );
    expect(onRowClick).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('counts the new-window action column in the empty-row colSpan', async () => {
    const entityForm = collegeForm();
    const store = createListStore({ url: entityForm.url, adapter: rowsAdapter([]) });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          openInNewWindow={{ enabled: true, getUrl: () => '/popup' }}
        />
      </UIProvider>,
    );

    const emptyState = await screen.findByText('데이터가 없습니다.');
    expect(emptyState.closest('td')).toHaveAttribute('colspan', '2');
  });

  it('renders a configured empty-state row with a colSpan for data, selection, and row-number columns', async () => {
    configureLabels({ emptyState: '표시할 항목이 없습니다.' });
    const entityForm = collegeForm();
    const adapter = rowsAdapter([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          selection={{ enabled: true, onConfirm: vi.fn() }}
          showRowNumbers
        />
      </UIProvider>,
    );

    await waitFor(() => expect(store.getState().loading).toBe(false));
    const emptyState = screen.getByText('표시할 항목이 없습니다.');
    expect(emptyState).toHaveAttribute('data-empty-state');
    expect(emptyState.closest('tr')).toHaveAttribute('data-empty-row');
    expect(emptyState).toHaveClass('rcm-listgrid-empty');
    expect(emptyState.closest('td')).toHaveAttribute('colspan', '2');
    expect(emptyState.closest('tbody')?.querySelector(':scope > tr > td')).toBe(
      emptyState.closest('td'),
    );
  });

  it('clamps the empty-state colSpan to 1 when no columns are visible', async () => {
    const entityForm = new EntityForm('BareEntityForm', '/bare').addFields({
      items: [new StringField('name', 100).withLabel('Name')],
    });
    const adapter = rowsAdapter([]);
    const store = createListStore({ url: entityForm.url, adapter });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid entityForm={entityForm} store={store} />
        </UIProvider>,
      );

      await waitFor(() => expect(store.getState().loading).toBe(false));
      const emptyState = screen.getByText('데이터가 없습니다.');
      expect(screen.queryAllByRole('columnheader')).toHaveLength(0);
      expect(emptyState.closest('td')).toHaveAttribute('colspan', '1');
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('renders descending row numbers when enabled', async () => {
    const entityForm = collegeForm();
    const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} showRowNumbers />
      </UIProvider>,
    );

    await screen.findByText('Engineering');
    expect(screen.getByRole('columnheader', { name: 'No.' })).toBeInTheDocument();
    expect(
      [...document.querySelectorAll('[data-row-number]')].map((cell) => cell.textContent),
    ).toEqual(['3', '2', '1']);
  });

  it('renders descending row numbers for a zero-based later page', async () => {
    const entityForm = collegeForm();
    const pageRows = COLLEGES.concat([
      { id: '4', name: 'Nursing', englishName: 'College of Nursing' },
      { id: '5', name: 'Pharmacy', englishName: 'College of Pharmacy' },
    ]);
    const adapter = rowsAdapter(pageRows);
    adapter.list = vi.fn(async () => ({
      content: pageRows,
      totalElements: 25,
      totalPages: 3,
    }));
    const store = createListStore({
      url: entityForm.url,
      adapter,
      initialSearch: SearchForm.create({ page: 2, pageSize: 10 }),
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} showRowNumbers />
      </UIProvider>,
    );

    await screen.findByText('Engineering');
    expect(
      [...document.querySelectorAll('[data-row-number]')].map((cell) => cell.textContent),
    ).toEqual(['5', '4', '3', '2', '1']);
  });

  it('does not render the empty-state row while the initial fetch is loading', async () => {
    const entityForm = collegeForm();
    let resolveList: ((page: PageResult<Record<string, unknown>>) => void) | undefined;
    const adapter = rowsAdapter([]);
    adapter.list = vi.fn(
      () =>
        new Promise<PageResult<Record<string, unknown>>>((resolve) => {
          resolveList = resolve;
        }),
    );
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    expect(store.getState().loading).toBe(true);
    expect(screen.queryByText('데이터가 없습니다.')).not.toBeInTheDocument();
    expect(document.querySelector('[data-empty-row]')).toBeNull();

    await act(async () => {
      resolveList?.({ content: [], totalElements: 0, totalPages: 0 });
    });

    await waitFor(() => expect(store.getState().loading).toBe(false));
    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument();
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
    it('shows partial selection and preserves 0.2.x master toggle semantics', async () => {
      const entityForm = collegeForm();
      const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            selection={{ enabled: true, onConfirm: vi.fn() }}
          />
        </UIProvider>,
      );

      await screen.findByText('Engineering');
      const master = screen.getByRole('checkbox', { name: '전체 선택' }) as HTMLInputElement;

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      expect(master).not.toBeChecked();
      expect(master.indeterminate).toBe(true);
      expect(master).toHaveAttribute('aria-checked', 'mixed');

      // EntireChecker in 0.2.x clears an existing partial selection.
      fireEvent.click(master);
      expect(screen.getByRole('checkbox', { name: 'Select row 1' })).not.toBeChecked();
      expect(master.indeterminate).toBe(false);

      fireEvent.click(master);
      expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Select row 2' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Select row 3' })).toBeChecked();
      expect(master).toBeChecked();
      expect(master.indeterminate).toBe(false);
      expect(screen.getByText('Engineering').closest('tr')).toHaveClass(
        'rcm-listgrid-row-selected',
      );

      fireEvent.click(master);
      expect(screen.getByRole('checkbox', { name: 'Select row 1' })).not.toBeChecked();
      expect(screen.getByText('Engineering').closest('tr')).not.toHaveClass(
        'rcm-listgrid-row-selected',
      );
    });

    it('merges selection and row number into one labeled cell without firing row click', async () => {
      const entityForm = collegeForm();
      const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });
      const onRowClick = vi.fn();

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            onRowClick={onRowClick}
            selection={{ enabled: true, onConfirm: vi.fn() }}
            showRowNumbers
          />
        </UIProvider>,
      );

      const row = (await screen.findByText('Engineering')).closest('tr') as HTMLElement;
      const mergedCell = row.querySelector('[data-row-number]') as HTMLElement;
      expect(mergedCell).toHaveClass('rcm-skeleton-td-checkbox');
      expect(mergedCell.querySelectorAll('td')).toHaveLength(0);
      expect(mergedCell.querySelector('label > input.rcm-checkbox')).toBeInTheDocument();
      expect(mergedCell.querySelector('label > span.rcm-listgrid-rownum')).toHaveTextContent('3');

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      expect(onRowClick).not.toHaveBeenCalled();
    });

    it('hides confirm with no checks, then shows it and confirms the checked ids', async () => {
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
      expect(screen.queryByRole('button', { name: '선택 완료' })).toBeNull();

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 3' }));

      const confirmButton = screen.getByRole('button', { name: '선택 완료' });
      expect(confirmButton).not.toBeDisabled();
      // the checkbox click must NOT also fire the row's onRowClick.
      expect(onRowClick).not.toHaveBeenCalled();

      fireEvent.click(confirmButton);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(['1', '3']);
    });

    it('never renders the built-in confirm when showConfirm is false', async () => {
      const entityForm = collegeForm();
      const store = createListStore({ url: entityForm.url, adapter: mockAdapter() });

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            selection={{
              enabled: true,
              onConfirm: vi.fn(),
              showConfirm: false,
              confirmLabel: '외부 확인',
            }}
          />
        </UIProvider>,
      );

      await screen.findByText('Engineering');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));

      expect(screen.queryByRole('button', { name: '외부 확인' })).toBeNull();
    });

    it('reports row, master, and rows-change reset updates through onCheckedChange', async () => {
      const entityForm = collegeForm();
      const adapter = mockAdapter();
      vi.mocked(adapter.list)
        .mockResolvedValueOnce({ content: COLLEGES, totalElements: 3, totalPages: 2 })
        .mockResolvedValueOnce({ content: [COLLEGES[1]!], totalElements: 3, totalPages: 2 });
      const store = createListStore({ url: entityForm.url, adapter });
      const onCheckedChange = vi.fn();

      render(
        <UIProvider components={defaultUIComponents}>
          <ViewListGrid
            entityForm={entityForm}
            store={store}
            selection={{ enabled: true, onConfirm: vi.fn(), onCheckedChange }}
          />
        </UIProvider>,
      );

      await screen.findByText('Engineering');
      expect(onCheckedChange).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      expect(onCheckedChange).toHaveBeenLastCalledWith(['1']);

      fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
      expect(onCheckedChange).toHaveBeenLastCalledWith([]);

      fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
      expect(onCheckedChange).toHaveBeenLastCalledWith(['1', '2', '3']);

      await act(async () => {
        await store.getState().setPage(1);
      });
      await waitFor(() => expect(onCheckedChange).toHaveBeenLastCalledWith([]));
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

// Column derivation (spec §5.1/§7, CAP-19; W5-2) — getListConfig()-driven,
// magic "first ~4 non-hidden fields" fallback ABOLISHED.
describe('ViewListGrid column derivation (spec §5.1/§7; W5-2)', () => {
  it("collects only withList()-truthy fields, sorted by config.order over the field's own declared order, applying label/align/width overrides — excludes withList(false) and undeclared fields", async () => {
    const entityForm = derivationForm();
    const adapter = rowsAdapter([
      { id: '1', late: 'L1', early: 'E1', excluded: 'X1', undeclared: 'U1' },
    ]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await screen.findByText('L1');

    // 'late' (config.order 1) sorts BEFORE 'early' (its own declared order
    // 100, no override) despite 'late' declaring order 500 on the field
    // itself — proves config.order actually overrides, not coincides.
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual(['Late Header', 'Early Field']);
    expect(headers[0]).toHaveStyle({ textAlign: 'right', width: '80px' });

    expect(screen.queryByText('X1')).not.toBeInTheDocument(); // withList(false)
    expect(screen.queryByText('U1')).not.toBeInTheDocument(); // never declared
  });

  it('0 withList()-truthy fields (and no explicit columns prop) renders an EMPTY column set + a dev console.warn naming the entityForm', async () => {
    const entityForm = new EntityForm('BareEntityForm', '/bare').addFields({
      items: [new StringField('name', 100).withLabel('Name')],
    });
    const adapter = rowsAdapter([{ id: '1', name: 'Row1' }]);
    const store = createListStore({ url: entityForm.url, adapter });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));

    expect(screen.queryAllByRole('columnheader')).toHaveLength(0);
    expect(screen.queryByText('Row1')).not.toBeInTheDocument(); // no columns => no cells
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('BareEntityForm'));

    warnSpy.mockRestore();
  });

  it('the explicit columns prop bypasses derivation entirely, even for a field with no withList() declared', async () => {
    const entityForm = derivationForm(); // 'late'/'early' are withList()-truthy
    const adapter = rowsAdapter([{ id: '1', late: 'L1', early: 'E1', undeclared: 'U1' }]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} columns={['undeclared']} />
      </UIProvider>,
    );

    await screen.findByText('U1');
    expect(screen.queryByText('L1')).not.toBeInTheDocument();
    expect(screen.queryByText('E1')).not.toBeInTheDocument();
  });

  it("a sortable derived column's header click calls store.setSort, toggling ASC then DESC", async () => {
    const entityForm = derivationForm(); // 'late' declares sortable: true
    const adapter = rowsAdapter([{ id: '1', late: 'L1', early: 'E1' }]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await screen.findByText('L1');
    const header = screen.getByRole('columnheader', { name: 'Late Header' });
    expect(header).toHaveClass('rcm-sortable');
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(header.querySelector('[data-sort-indicator]')).toHaveClass('rcm-sort-indicator');
    expect(header.querySelector('[data-sort-indicator]')).toHaveAttribute('data-direction', 'none');
    expect(
      [...header.querySelectorAll('[data-sort-indicator] path')].map((path) =>
        path.getAttribute('d'),
      ),
    ).toEqual(['M4 6l9 0', 'M4 12l7 0', 'M4 18l7 0', 'M15 15l3 3l3 -3', 'M18 6l0 12']);
    // 'early' has no sortable override — plain header, no click affordance.
    expect(screen.getByRole('columnheader', { name: 'Early Field' })).not.toHaveAttribute(
      'aria-sort',
    );

    fireEvent.click(header);
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(store.getState().searchForm.sorts).toEqual([{ field: 'late', direction: 'ASC' }]);
    expect(screen.getByRole('columnheader', { name: 'Late Header' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(
      screen
        .getByRole('columnheader', { name: 'Late Header' })
        .querySelector('[data-sort-indicator]'),
    ).toHaveAttribute('data-direction', 'ascending');
    expect(
      [
        ...screen
          .getByRole('columnheader', { name: 'Late Header' })
          .querySelectorAll('[data-sort-indicator] path'),
      ].map((path) => path.getAttribute('d')),
    ).toEqual([
      'M15 21v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4',
      'M19 10h-4l4 -7h-4',
      'M4 15l3 3l3 -3',
      'M7 6v12',
    ]);

    fireEvent.click(screen.getByRole('columnheader', { name: 'Late Header' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(store.getState().searchForm.sorts).toEqual([{ field: 'late', direction: 'DESC' }]);
    expect(
      screen
        .getByRole('columnheader', { name: 'Late Header' })
        .querySelector('[data-sort-indicator]'),
    ).toHaveAttribute('data-direction', 'descending');
    expect(
      [
        ...screen
          .getByRole('columnheader', { name: 'Late Header' })
          .querySelectorAll('[data-sort-indicator] path'),
      ].map((path) => path.getAttribute('d')),
    ).toEqual([
      'M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4',
      'M19 21h-4l4 -7h-4',
      'M4 15l3 3l3 -3',
      'M7 6v12',
    ]);
  });

  it('a registered getListCellRenderer(field.type) component takes priority over the raw-value fallback', async () => {
    // a fictional field.type (mutated post-construction — FormField.type is a
    // plain public property) keeps this registration from ever colliding
    // with a REAL type (e.g. 'text') other tests in this file/run depend on
    // rendering as plain text — the registry has no unregister API (spec §7
    // "string 키" — module-scope Map, same shape as field-renderer-registry).
    const fictionalType = 'w52-test-marker-field';
    registerListCellRenderer(fictionalType, ({ value }) => (
      <strong data-testid="marker-cell">{String(value).toUpperCase()}!</strong>
    ));

    const field = new StringField('marker', 100).withLabel('Marker').withList();
    field.type = fictionalType as FieldType;
    const entityForm = new EntityForm('MarkerEntityForm', '/marker').addFields({ items: [field] });
    const adapter = rowsAdapter([{ id: '1', marker: 'shout' }]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByTestId('marker-cell')).toHaveTextContent('SHOUT!');
  });

  it('FieldListConfig.format takes priority over a registered list-cell renderer', async () => {
    const fictionalType = 'v053-format-priority-field';
    registerListCellRenderer(fictionalType, () => <strong>renderer lost</strong>);
    const field = new StringField('marker', 100).withLabel('Marker').withList({
      format: (value, row) => `${String(value).toUpperCase()}-${String(row['suffix'])}`,
    });
    field.type = fictionalType as FieldType;
    const entityForm = new EntityForm('FormatEntityForm', '/format').addFields({ items: [field] });
    const store = createListStore({
      url: entityForm.url,
      adapter: rowsAdapter([{ id: '1', marker: 'formatted', suffix: 'row' }]),
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    expect(await screen.findByText('FORMATTED-row')).toBeInTheDocument();
    expect(screen.queryByText('renderer lost')).not.toBeInTheDocument();
  });
});

// Advanced-search panel (spec §7 CAP-20; W5-3) — embedded in ViewListGrid (no
// separate exported component), derived from withFilter()-truthy fields.
describe('ViewListGrid advanced-search panel (spec §7 CAP-20; W5-3)', () => {
  it('adds header filters only to filter-declared derived columns and applies without sorting', async () => {
    const entityForm = new EntityForm('HeaderFilterEntityForm', '/header-filter').addFields({
      items: [
        new StringField('name', 100)
          .withLabel('Name')
          .withList({ sortable: true })
          .withFilter({ operator: 'LIKE' }),
        new StringField('code', 200).withLabel('Code').withList(),
      ],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([{ id: '1', name: 'Alpha', code: 'A' }]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    const filterTrigger = screen.getByRole('button', { name: 'Name 필터' });
    expect(filterTrigger).toHaveClass('rcm-filter-button');
    expect(filterTrigger).toHaveAttribute('data-column-filter-trigger');
    expect(filterTrigger.querySelector('svg')).toBeInTheDocument();
    expect(filterTrigger.querySelector('path')).toHaveAttribute(
      'd',
      'M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z',
    );
    expect(filterTrigger).not.toHaveAttribute('data-active');
    expect(screen.queryByRole('button', { name: 'Code 필터' })).not.toBeInTheDocument();
    const nameHeader = filterTrigger.closest('th')!;
    expect([
      ...nameHeader.querySelectorAll('[data-sort-indicator], [data-column-filter-trigger]'),
    ]).toEqual([nameHeader.querySelector('[data-sort-indicator]'), filterTrigger]);

    fireEvent.change(screen.getByLabelText('Quick search'), { target: { value: 'Alpha' } });
    expect(adapter.list).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(screen.getByLabelText('Quick search'), { key: 'Enter' });
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.OR).toEqual([
      { name: 'name', value: 'Alpha', queryConditionType: 'LIKE' },
    ]);
    expect(screen.getByRole('button', { name: 'Name 필터' })).not.toHaveAttribute('data-active');

    fireEvent.click(screen.getByRole('button', { name: 'Name 필터' }));
    expect(store.getState().searchForm.sorts).toEqual([]);
    const popover = document.querySelector('[data-column-filter="name"]');
    expect(popover).not.toBeNull();
    expect(popover).toHaveClass('rcm-filter-dropdown', 'rcm-filter-dropdown-md');
    expect(popover?.querySelector('.rcm-filter-dropdown-inner')).toBeInTheDocument();
    expect(popover?.querySelector('.rcm-filter-dropdown-header .rcm-text')).toHaveTextContent(
      'Name',
    );
    expect(popover?.querySelector('.rcm-filter-dropdown-body')).toBeInTheDocument();
    expect(popover?.querySelector('.rcm-filter-dropdown-footer')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Al' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'Al', queryConditionType: 'LIKE' },
    ]);
    expect(store.getState().searchForm.sorts).toEqual([]);
    expect(screen.getByRole('button', { name: 'Name 필터' })).toHaveAttribute('data-active', '');
    expect(document.querySelector('[data-column-filter="name"]')).toBeNull();
  });

  it('resets this column draft and applied filter from the dropdown footer', async () => {
    const entityForm = filterForm();
    const { adapter, listCalls } = rowsAdapterWithCalls([{ id: '1', name: 'Alpha', code: 'A' }]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Name 필터' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: 'Name 필터' }));
    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.AND).toEqual([]);
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('0 withFilter()-truthy fields renders no toggle and no panel', async () => {
    const entityForm = collegeForm(); // no field declares withFilter()
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await screen.findByText('Engineering');
    expect(screen.queryByRole('button', { name: '고급검색' })).not.toBeInTheDocument();
  });

  it('toggling the "고급검색" button reveals a labeled input per withFilter() field', async () => {
    const entityForm = filterForm();
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));

    expect(screen.queryByLabelText('Name Filter')).not.toBeInTheDocument(); // panel closed
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    expect(screen.queryByLabelText('Quick search')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name Filter')).toBeInTheDocument(); // config.label override
    expect(screen.getByLabelText('Code')).toBeInTheDocument(); // falls back to field.getLabel()
    const panel = document.querySelector('[data-advanced-search-panel]');
    expect(document.querySelector('[data-advanced-search]')).toHaveClass('rcm-adv-search-outer');
    expect(panel).toHaveClass('rcm-adv-search-inner', 'rcm-adv-search-inner-panel');
    expect(panel?.querySelector('.rcm-adv-search-count')).toHaveTextContent('2개 필드');
    expect(panel?.querySelector('.rcm-adv-search-header-left .rcm-badge')).not.toBeInTheDocument();
    expect(panel?.querySelector('.rcm-adv-search-grid')).toBeInTheDocument();
    expect(screen.getByTitle('리스트 뷰')).toHaveClass('rcm-adv-search-view-toggle');
    expect(screen.getByText('검색 필드 선택')).toBeInTheDocument();
    expect(screen.getByText('2/2')).toHaveClass('rcm-badge');
    expect(screen.getByText('2개 선택됨')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('리스트 뷰'));
    expect(panel?.querySelector('.rcm-adv-search-list')).toBeInTheDocument();
    expect(screen.getByTitle('그리드 뷰')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '펼치기' }));
    expect(screen.getByPlaceholderText('필드 검색...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 선택' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 해제' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Code' }));
    expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
    expect(panel?.querySelector('.rcm-adv-search-count')).toHaveTextContent('1개 필드');
    expect(panel?.querySelector('[data-advanced-search-apply]')).toHaveClass(
      'rcm-button',
      'rcm-adv-search-btn-submit',
    );
    expect(panel?.querySelector('[data-advanced-search-close] svg')).toHaveClass(
      'rcm-m2o-action-icon',
    );
    expect(panel?.querySelector('[data-advanced-search-reset] svg')).toHaveClass(
      'rcm-m2o-action-icon',
    );
    expect(panel?.querySelector('[data-advanced-search-apply] svg')).toHaveClass(
      'rcm-m2o-action-icon',
    );
  });

  it.each([
    {
      label: 'zero',
      form: () =>
        new EntityForm('NoQuickFieldEntityForm', '/no-quick-field').addFields({
          items: [new SelectField('status', 100).withLabel('Status').withList().withFilter()],
        }),
    },
    {
      label: 'one',
      form: () =>
        new EntityForm('OneQuickFieldEntityForm', '/one-quick-field').addFields({
          items: [new StringField('name', 100).withLabel('Name').withList().withFilter()],
        }),
    },
  ])('opens safely with $label quick-search fields and no unified toggle', async ({ form }) => {
    const entityForm = form();
    const adapter = rowsAdapter([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    expect(document.querySelector('[data-advanced-search-panel]')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: '통합검색 사용' })).not.toBeInTheDocument();
  });

  it('applying a non-empty value AND-filters via addAndFilter with the configured operator, and refetches', async () => {
    const entityForm = filterForm();
    const { adapter, listCalls } = rowsAdapterWithCalls([
      { id: '1', name: 'Engineering', code: 'ENG' },
    ]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'Eng' } });
    // 'code' is left EMPTY — must NOT contribute an AND filter.
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'Eng', queryConditionType: 'LIKE' },
    ]);
    // page-reset precedent (same as quickSearch/withPageSize).
    expect(listCalls[1]?.page).toBe(0);
  });

  it('emits a field-derived queryConditionType for text and exact type families', async () => {
    const entityForm = new EntityForm('ConditionEntityForm', '/condition').addFields({
      items: [
        new StringField('title', 100).withLabel('Title').withFilter(),
        new NumberField('count', 200).withLabel('Count').withFilter({ operator: 'GREATER_THAN' }),
        new NumberField('limit', 250).withLabel('Limit').withFilter(),
        new SelectField('status', 300).withLabel('Status').withFilter(),
        new BooleanField('active', 400).withLabel('Active').withFilter(),
        new DateField('createdAt', 500).withLabel('Created At').withFilter(),
      ],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    for (const [label, value] of [
      ['Title', 'alpha'],
      ['Count', '3'],
      ['Limit', '10'],
      ['Status', 'OPEN'],
      ['Active', 'true'],
      ['Created At', '2026-08-06'],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'title', value: 'alpha', queryConditionType: 'LIKE' },
      { name: 'count', value: '3', queryConditionType: 'GREATER_THAN' },
      { name: 'limit', value: '10', queryConditionType: 'EQUAL' },
      { name: 'status', value: 'OPEN', queryConditionType: 'EQUAL' },
      { name: 'active', value: 'true', queryConditionType: 'EQUAL' },
      { name: 'createdAt', value: '2026-08-06', queryConditionType: 'EQUAL' },
    ]);
  });

  it('uses IN for a multi-select array and falls back from an invalid explicit operator', async () => {
    registerFilterRenderer('multiselect', ({ value, onChange }) => (
      <button type="button" onClick={() => onChange(['OPEN', 'CLOSED'])}>
        {Array.isArray(value) ? value.join(',') : 'Choose statuses'}
      </button>
    ));
    const entityForm = new EntityForm('OperatorFallbackEntityForm', '/operator-fallback').addFields(
      {
        items: [
          new MultiSelectField('statuses', 100).withLabel('Statuses').withFilter(),
          new StringField('title', 200)
            .withLabel('Title')
            .withFilter({ operator: 'NOT_A_REAL_OPERATOR' }),
        ],
      },
    );
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose statuses' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'alpha' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'statuses', value: ['OPEN', 'CLOSED'], queryConditionType: 'IN' },
      { name: 'title', value: 'alpha', queryConditionType: 'LIKE' },
    ]);
  });

  it('prefers a renderer-supplied operator over the field mapping in both filter apply paths', async () => {
    const fictionalType = 'operator-spi-filter-field';
    registerFilterRenderer(fictionalType, ({ value, onChange }) => (
      <input
        aria-label="Operator SPI"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value, 'NOT_EQUAL')}
      />
    ));
    const field = new StringField('marker', 100)
      .withLabel('Marker')
      .withList()
      .withFilter({ operator: 'LIKE' });
    field.type = fictionalType as FieldType;
    const entityForm = new EntityForm('OperatorSpiEntityForm', '/operator-spi').addFields({
      items: [field],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.change(screen.getByLabelText('Operator SPI'), { target: { value: 'advanced' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'marker', value: 'advanced', queryConditionType: 'NOT_EQUAL' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    fireEvent.click(screen.getByRole('button', { name: 'Marker 필터' }));
    fireEvent.change(screen.getByLabelText('Operator SPI'), { target: { value: 'column' } });
    fireEvent.click(document.querySelector('[data-column-filter-apply]')!);
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.AND).toEqual([
      { name: 'marker', value: 'column', queryConditionType: 'NOT_EQUAL' },
    ]);
  });

  it('drops a renderer operator when its value is cleared before a new operator-less value', async () => {
    const fictionalType = 'cleared-operator-spi-filter-field';
    registerFilterRenderer(fictionalType, ({ value, onChange }) => (
      <input
        aria-label="Clearable Operator SPI"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next, next === '5' ? 'GREATER_THAN' : undefined);
        }}
      />
    ));
    const field = new StringField('marker', 100)
      .withLabel('Marker')
      .withFilter({ operator: 'LIKE' });
    field.type = fictionalType as FieldType;
    const entityForm = new EntityForm('ClearedOperatorEntityForm', '/cleared-operator').addFields({
      items: [field],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    const input = screen.getByLabelText('Clearable Operator SPI');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'marker', value: '7', queryConditionType: 'LIKE' },
    ]);
  });

  it('hydrates applied panel values and preserves host-seeded AND clauses outside the panel', async () => {
    const entityForm = filterForm();
    const initialSearch = SearchForm.create().withFilter(
      'AND',
      { name: 'tenantId', value: 'tenant-7', queryConditionType: 'EQUAL' },
      { name: 'name', value: 'Applied', queryConditionType: 'LIKE' },
    );
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter, initialSearch });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.getByLabelText('Name Filter')).toHaveValue('Applied');
    fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'Edited' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'tenantId', value: 'tenant-7', queryConditionType: 'EQUAL' },
      { name: 'name', value: 'Edited', queryConditionType: 'LIKE' },
    ]);
  });

  it('hydrates only a seeded value and re-applies the field-declared operator', async () => {
    const entityForm = new EntityForm('HydratedOperatorEntityForm', '/hydrated-operator').addFields(
      {
        items: [
          new NumberField('count', 100).withLabel('Count').withFilter({ operator: 'GREATER_THAN' }),
        ],
      },
    );
    const initialSearch = SearchForm.create().withFilter('AND', {
      name: 'count',
      value: '5',
      queryConditionType: 'EQUAL',
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter, initialSearch });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.getByLabelText('Count')).toHaveValue('5');
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'count', value: '5', queryConditionType: 'GREATER_THAN' },
    ]);
  });

  it('removes a stale AND clause when a panel draft is cleared and applied', async () => {
    const entityForm = filterForm();
    const sourceRows = [
      { id: '1', name: 'Alpha', code: 'A' },
      { id: '2', name: 'Beta', code: 'B' },
    ];
    const listCalls: SearchForm[] = [];
    const adapter = rowsAdapter(sourceRows);
    adapter.list = vi.fn(async (_url: string, search: SearchForm) => {
      listCalls.push(search);
      const nameFilter = search.filters.AND.find((item) => item.name === 'name');
      const content = nameFilter
        ? sourceRows.filter((row) => row.name.includes(String(nameFilter.value)))
        : sourceRows;
      return { content, totalElements: content.length, totalPages: 1 };
    });
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    const input = screen.getByLabelText('Name Filter');
    fireEvent.change(input, { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.AND).toEqual([]);
    expect(await screen.findByText('Beta')).toBeInTheDocument();
  });

  it('merges unified OR search with AND filters, resets both, and closes from the footer', async () => {
    const entityForm = new EntityForm('UnifiedEntityForm', '/unified').addFields({
      items: [
        new StringField('name', 100).withLabel('이름').withList().withFilter(),
        new StringField('code', 200).withLabel('코드').withList().withFilter(),
        new SelectField('status', 300).withLabel('상태').withList().withFilter(),
      ],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.queryByLabelText('Quick search')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).toBeChecked();
    fireEvent.change(screen.getByLabelText('이름, 코드 검색'), {
      target: { value: 'kim' },
    });
    fireEvent.change(screen.getByLabelText('상태'), { target: { value: 'ACTIVE' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON()).toMatchObject({
      quickSearchFields: ['name', 'code'],
      filters: {
        AND: [{ name: 'status', value: 'ACTIVE', queryConditionType: 'EQUAL' }],
        OR: [
          { name: 'name', value: 'kim', queryConditionType: 'LIKE' },
          { name: 'code', value: 'kim', queryConditionType: 'LIKE' },
        ],
      },
    });

    expect(screen.queryByLabelText('Quick search')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByLabelText('Quick search')).toHaveValue('kim');

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters).toMatchObject({ AND: [], OR: [] });
    expect(listCalls[2]?.toJSON().quickSearchFields).toEqual(['name', 'code']);
    expect(screen.queryByLabelText('Quick search')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(document.querySelector('[data-advanced-search-panel]')).toBeNull();
    expect(screen.getByLabelText('Quick search')).toHaveValue('');
  });

  it('reopens unified search unchecked after the panel adds an individual quick-field AND clause', async () => {
    const entityForm = searchableCollegeForm();
    const { adapter } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '통합검색 사용' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'exact-name' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).not.toBeChecked();
    expect(screen.getByLabelText('Name')).toHaveValue('exact-name');
  });

  it('syncs the toolbar quick-search value when advanced apply and reset rewrite quick OR clauses', async () => {
    const entityForm = new EntityForm('SingleQuickEntityForm', '/single-quick').addFields({
      items: [new StringField('name', 100).withLabel('Name').withList().withFilter()],
    });
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    const quickInput = screen.getByLabelText('Quick search');
    fireEvent.change(quickInput, { target: { value: 'stale-term' } });
    fireEvent.keyUp(quickInput, { key: 'Enter' });
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.queryByRole('checkbox', { name: '통합검색 사용' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Quick search')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters.OR).toEqual([
      { name: 'name', value: 'stale-term', queryConditionType: 'LIKE' },
    ]);
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByLabelText('Quick search')).toHaveValue('stale-term');

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(4));
    expect(listCalls[3]?.toJSON().filters.OR).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByLabelText('Quick search')).toHaveValue('');
  });

  it('clears the toolbar quick-search value after unified-off applies two quick fields', async () => {
    const entityForm = searchableCollegeForm();
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    const quickInput = screen.getByLabelText('Quick search');
    fireEvent.change(quickInput, { target: { value: 'old quick value' } });
    fireEvent.keyUp(quickInput, { key: 'Enter' });
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '통합검색 사용' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alpha' } });
    fireEvent.change(screen.getByLabelText('English Name'), { target: { value: 'Beta' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters).toMatchObject({
      AND: [
        { name: 'name', value: 'Alpha', queryConditionType: 'LIKE' },
        { name: 'englishName', value: 'Beta', queryConditionType: 'LIKE' },
      ],
      OR: [],
    });

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByLabelText('Quick search')).toHaveValue('');
  });

  it('preserves quick-field AND clauses while unified search manages only OR clauses', async () => {
    const entityForm = new EntityForm('UnifiedAndEntityForm', '/unified-and').addFields({
      items: [
        new StringField('name', 100).withLabel('이름').withList().withFilter(),
        new StringField('code', 200).withLabel('코드').withList().withFilter(),
        new SelectField('status', 300).withLabel('상태').withList().withFilter(),
      ],
    });
    const initialSearch = SearchForm.create()
      .withFilter('AND', {
        name: 'name',
        value: 'exact-name',
        queryConditionType: 'EQUAL',
      })
      .quickSearch(['name', 'code'], 'kim');
    const { adapter, listCalls } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter, initialSearch });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).toBeChecked();
    expect(screen.getByLabelText('이름, 코드 검색')).toHaveValue('kim');
    fireEvent.change(screen.getByLabelText('상태'), { target: { value: 'ACTIVE' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'exact-name', queryConditionType: 'EQUAL' },
      { name: 'status', value: 'ACTIVE', queryConditionType: 'EQUAL' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(listCalls[2]?.toJSON().filters).toMatchObject({
      AND: [{ name: 'name', value: 'exact-name', queryConditionType: 'EQUAL' }],
      OR: [],
    });
  });

  it('re-derives unified mode and value from the current SearchForm whenever the panel reopens', async () => {
    const entityForm = searchableCollegeForm();
    const { adapter } = rowsAdapterWithCalls([]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    await act(async () => {
      await store
        .getState()
        .setSearchForm(SearchForm.create().quickSearch(['name', 'englishName'], 'current-value'));
    });
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    expect(screen.getByRole('checkbox', { name: '통합검색 사용' })).toBeChecked();
    expect(screen.getByLabelText('Name, English Name 검색')).toHaveValue('current-value');
  });

  it('re-applying with an edited value REPLACES the prior same-field AND clause instead of stacking (R2)', async () => {
    const entityForm = filterForm();
    const { adapter, listCalls } = rowsAdapterWithCalls([
      { id: '1', name: 'Engineering', code: 'ENG' },
    ]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    // apply #1: name = ABC
    fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'ABC', queryConditionType: 'LIKE' },
    ]);

    // apply #2: edit the SAME field to name = XYZ and re-apply
    fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'XYZ' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));

    // R2: a SINGLE {name: XYZ} clause, NOT the stacked AND(name=ABC, name=XYZ)
    expect(listCalls[2]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'XYZ', queryConditionType: 'LIKE' },
    ]);
    // and the live store's searchForm agrees
    expect(store.getState().searchForm.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'XYZ', queryConditionType: 'LIKE' },
    ]);
  });

  it('derives LIKE for a text field with no configured operator', async () => {
    const entityForm = filterForm();
    const { adapter, listCalls } = rowsAdapterWithCalls([
      { id: '1', name: 'Engineering', code: 'ENG' },
    ]);
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'ENG' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    const sentFilter = listCalls[1]?.toJSON().filters.AND[0];
    expect(sentFilter).toEqual({ name: 'code', value: 'ENG', queryConditionType: 'LIKE' });
  });

  it('a registered getFilterRenderer(field.type) component takes priority over the TextInput fallback', async () => {
    const fictionalType = 'w53-test-filter-marker-field';
    registerFilterRenderer(fictionalType, ({ value, onChange }) => (
      <input
        aria-label="Marker Filter"
        data-testid="marker-filter-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    ));

    const field = new StringField('marker', 100).withLabel('Marker').withFilter();
    field.type = fictionalType as FieldType;
    const entityForm = new EntityForm('MarkerEntityForm', '/marker').addFields({ items: [field] });
    const adapter = mockAdapter();
    const store = createListStore({ url: entityForm.url, adapter });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} />
      </UIProvider>,
    );

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

    expect(screen.getByTestId('marker-filter-input')).toBeInTheDocument();
  });
});

describe('ViewListGrid column settings (v0.5.3)', () => {
  it('hides resolved columns and disables hiding the final visible column', async () => {
    const entityForm = derivationForm();
    const store = createListStore({
      url: entityForm.url,
      adapter: rowsAdapter([{ id: '1', late: 'L1', early: 'E1' }]),
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid entityForm={entityForm} store={store} columnSettings />
      </UIProvider>,
    );

    await screen.findByText('L1');
    fireEvent.click(screen.getByRole('button', { name: '목록 설정' }));
    const early = screen.getByRole('checkbox', { name: 'Early Field' });
    fireEvent.click(early);
    expect(screen.queryByRole('columnheader', { name: 'Early Field' })).not.toBeInTheDocument();

    const lastVisible = screen.getByRole('checkbox', { name: 'Late Header' });
    expect(lastVisible).toBeDisabled();
    fireEvent.click(lastVisible);
    expect(screen.getByRole('columnheader', { name: 'Late Header' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(document.querySelector('[data-column-settings]')).not.toBeInTheDocument();
  });
});

describe('ViewListGrid controlled column settings (v0.5.4)', () => {
  it('emits changes without diverging from hiddenColumns and follows the next prop value', async () => {
    const entityForm = derivationForm();
    const store = createListStore({
      url: entityForm.url,
      adapter: rowsAdapter([{ id: '1', late: 'L1', early: 'E1' }]),
    });
    const onHiddenColumnsChange = vi.fn();

    const { rerender } = render(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          columnSettings
          hiddenColumns={['early', 'stale-column']}
          onHiddenColumnsChange={onHiddenColumnsChange}
        />
      </UIProvider>,
    );

    await screen.findByText('L1');
    expect(screen.queryByRole('columnheader', { name: 'Early Field' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '목록 설정' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Early Field' }));
    expect(onHiddenColumnsChange).toHaveBeenCalledWith([]);
    expect(screen.queryByRole('columnheader', { name: 'Early Field' })).not.toBeInTheDocument();

    rerender(
      <UIProvider components={defaultUIComponents}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          columnSettings
          hiddenColumns={[]}
          onHiddenColumnsChange={onHiddenColumnsChange}
        />
      </UIProvider>,
    );
    expect(screen.getByRole('columnheader', { name: 'Early Field' })).toBeInTheDocument();
  });

  it('clamps a controlled attempt to hide every resolved column before emitting', async () => {
    function DisabledIgnoringCheckBox({ checked, onChange, ariaLabel }: CheckBoxProps) {
      return (
        <input
          type="checkbox"
          aria-label={ariaLabel}
          checked={checked ?? false}
          onChange={(event) => onChange?.(event.target.checked)}
        />
      );
    }

    const components: UIComponents = {
      ...defaultUIComponents,
      CheckBox: DisabledIgnoringCheckBox,
    };
    const entityForm = derivationForm();
    const store = createListStore({
      url: entityForm.url,
      adapter: rowsAdapter([{ id: '1', late: 'L1', early: 'E1' }]),
    });
    const onHiddenColumnsChange = vi.fn();

    render(
      <UIProvider components={components}>
        <ViewListGrid
          entityForm={entityForm}
          store={store}
          columnSettings
          hiddenColumns={['early']}
          onHiddenColumnsChange={onHiddenColumnsChange}
        />
      </UIProvider>,
    );

    await screen.findByText('L1');
    fireEvent.click(screen.getByRole('button', { name: '목록 설정' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Late Header' }));

    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['early']);
    expect(onHiddenColumnsChange).not.toHaveBeenCalledWith(['late', 'early']);
  });
});
