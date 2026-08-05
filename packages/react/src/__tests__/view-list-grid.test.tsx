// ViewListGrid — JSDOM render test. "Mini-College" list: three rows through a
// MOCK BackendAdapter, proving fetch-on-mount, row rendering (charter C9),
// and the row-click affordance end to end with @listgrid/ui-default's
// unstyled primitives — no host app.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, FieldType, PageResult, SearchForm } from '@listgrid/schema-core';
import { EntityForm, StringField } from '@listgrid/schema-core';
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
    paginationPrev: 'Prev',
    paginationNext: 'Next',
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
 * plain (`withFilter()`, no config — no queryConditionType should ever be
 * sent for it). The panel derivation (`deriveFilterFields`) is independent of
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
    configureLabels({ quickSearchPlaceholder: '찾기' });
    const entityForm = collegeForm();
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
    expect(header).toHaveAttribute('aria-sort', 'none');
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

    fireEvent.click(screen.getByRole('columnheader', { name: 'Late Header' }));
    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));
    expect(store.getState().searchForm.sorts).toEqual([{ field: 'late', direction: 'DESC' }]);
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
    expect(screen.getByRole('button', { name: 'Name 필터' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Code 필터' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Name 필터' }));
    expect(store.getState().searchForm.sorts).toEqual([]);
    const popover = document.querySelector('[data-column-filter="name"]');
    expect(popover).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Al' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
    expect(listCalls[1]?.toJSON().filters.AND).toEqual([
      { name: 'name', value: 'Al', queryConditionType: 'LIKE' },
    ]);
    expect(store.getState().searchForm.sorts).toEqual([]);
    expect(document.querySelector('[data-column-filter="name"]')).toBeNull();
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

    expect(screen.getByLabelText('Name Filter')).toBeInTheDocument(); // config.label override
    expect(screen.getByLabelText('Code')).toBeInTheDocument(); // falls back to field.getLabel()
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

  it("omits queryConditionType entirely for a withFilter() field with no configured operator (never 'queryConditionType: undefined')", async () => {
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
    expect(sentFilter).toEqual({ name: 'code', value: 'ENG' });
    expect(sentFilter && 'queryConditionType' in sentFilter).toBe(false);
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
    const early = screen.getByRole('checkbox', { name: 'early — Early Field' });
    fireEvent.click(early);
    expect(screen.queryByRole('columnheader', { name: 'Early Field' })).not.toBeInTheDocument();

    const lastVisible = screen.getByRole('checkbox', { name: 'late — Late Header' });
    expect(lastVisible).toBeDisabled();
    fireEvent.click(lastVisible);
    expect(screen.getByRole('columnheader', { name: 'Late Header' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '적용' }));
    expect(screen.queryByRole('dialog', { name: '목록 설정' })).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('checkbox', { name: 'early — Early Field' }));
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
    fireEvent.click(screen.getByRole('checkbox', { name: 'late — Late Header' }));

    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['early']);
    expect(onHiddenColumnsChange).not.toHaveBeenCalledWith(['late', 'early']);
  });
});
