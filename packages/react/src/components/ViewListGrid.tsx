import { useEffect, useMemo, useState } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type { EntityForm } from '@listgrid/schema-core';
import type { ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';

// ViewListGrid — the list screen (charter C9): fetches on mount, subscribes to
// the injected ListStoreState, and renders rows/pagination/loading through the
// host's UIComponents registry (useUI). Deliberately minimal — no header
// filters/advanced-search/selection/sub-collection (that's the 0.3.x
// src/listgrid/components/list/ViewListGrid.tsx surface this replaces, not
// this V0.4 slice). Row-selection navigation is the page's job (`onRowClick`);
// a "New" button is NOT part of this component (the page owns create nav).
//
// NOTE (body-row interactivity vs. registry Table.Tr): @listgrid/ui-default's
// TableRowProps is `{ children?: ReactNode }` only — it does not type or
// forward onClick/role/data-row-id, and its Tr implementation literally drops
// any prop but `children`. Routing the E2E-required click/`data-row-id`
// affordance through `Table.Tr` would therefore be a silent no-op at runtime
// (and an excess-property TS error at compile time) without editing
// ui-default, which is out of scope here. Header rows (no interactivity
// needed) still go through `Table.Tr`/`Table.Th`; body rows use a plain `<tr>`
// for the container (byte-identical DOM to what `Table.Tr` renders today) so
// the click/keyboard/`data-row-id` affordance actually reaches the DOM, while
// each cell still renders through `Table.Td`.

export interface ViewListGridProps {
  entityForm: EntityForm;
  store: StoreApi<ListStoreState>;
  onRowClick?: (row: Record<string, unknown>) => void;
  columns?: string[];
}

function hasShowInList(field: unknown): field is { showInList: boolean } {
  return (
    typeof field === 'object' &&
    field !== null &&
    'showInList' in field &&
    typeof (field as { showInList?: unknown }).showInList === 'boolean'
  );
}

/** Column names: explicit prop wins; else fields marked showInList; else the
 * first ~4 non-hidden fields (static `hidden === true` check only — the full
 * conditional/async predicate needs a FieldEvalContext this sync derivation
 * doesn't have). */
function deriveColumnNames(entityForm: EntityForm, explicit?: string[]): string[] {
  if (explicit && explicit.length > 0) return explicit;

  // sub-collections are never list columns (they're child grids, not scalars).
  const fields = entityForm.getFields().filter((f) => f.type !== 'subCollection');
  const marked = fields.filter((f) => hasShowInList(f) && f.showInList);
  if (marked.length > 0) return marked.map((f) => f.getName());

  return fields
    .filter((f) => f.hidden !== true)
    .slice(0, 4)
    .map((f) => f.getName());
}

function resolveHeader(entityForm: EntityForm, name: string): string {
  const field = entityForm.getField(name);
  if (!field) return name;
  const label = field.getLabel();
  return typeof label === 'string' ? label : name;
}

export function ViewListGrid({ entityForm, store, onRowClick, columns }: ViewListGridProps) {
  const { Table, Pagination, LoadingOverlay, TextInput } = useUI();

  const rows = useStore(store, (s) => s.rows);
  const totalElements = useStore(store, (s) => s.totalElements);
  const totalPages = useStore(store, (s) => s.totalPages);
  const loading = useStore(store, (s) => s.loading);
  const searchForm = useStore(store, (s) => s.searchForm);

  useEffect(() => {
    // Run once per store (mount) — the store owns refetching on
    // page/sort/quickSearch changes via its own actions.
    void store.getState().fetch();
  }, [store]);

  const columnNames = useMemo(() => deriveColumnNames(entityForm, columns), [entityForm, columns]);

  const quickSearchField = useMemo(() => {
    const firstText = columnNames.find((name) => entityForm.getField(name)?.type === 'text');
    return firstText ?? columnNames[0];
  }, [columnNames, entityForm]);

  const [quickSearchValue, setQuickSearchValue] = useState('');

  return (
    <div data-list-grid={entityForm.getName()} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />

      {quickSearchField !== undefined && (
        <TextInput
          ariaLabel="Quick search"
          value={quickSearchValue}
          placeholder="검색"
          onChange={(value) => {
            setQuickSearchValue(value);
            void store.getState().quickSearch([quickSearchField], value);
          }}
        />
      )}

      <Table>
        <Table.Thead>
          <Table.Tr>
            {columnNames.map((name) => (
              <Table.Th key={name}>{resolveHeader(entityForm, name)}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, i) => {
            const rawId = row['id'];
            const rowId = rawId !== undefined && rawId !== null ? String(rawId) : undefined;
            return (
              <tr
                key={rowId ?? i}
                role="button"
                tabIndex={0}
                {...(rowId !== undefined ? { 'data-row-id': rowId } : {})}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onRowClick?.(row);
                }}
              >
                {columnNames.map((name) => (
                  <Table.Td key={name}>{String(row[name] ?? '')}</Table.Td>
                ))}
              </tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <div data-total-elements={totalElements}>
        <Pagination
          page={searchForm.page}
          totalPages={totalPages}
          onChange={(p) => void store.getState().setPage(p)}
        />
      </div>
    </div>
  );
}
