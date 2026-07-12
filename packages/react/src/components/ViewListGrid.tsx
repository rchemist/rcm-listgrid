import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type { Direction, EntityField, EntityForm } from '@listgrid/schema-core';
import type { ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { getListCellRenderer } from '../registry/list-cell-renderer-registry';
import { deriveListFields, getFieldDisplayValue } from './list-columns';

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

/** EA-D2-0: bulk-select surface (replaces the 0.3.x `SelectionOptions`
 * 29-consumer surface — the briefing's decision ① minimal-4 shape). `enabled`
 * gates the checkbox COLUMN's existence (see `toolbar` doc below for the
 * strict contract); `onConfirm` receives the current checked-id list;
 * `confirmLabel` overrides the default confirm button text. */
export interface ViewListGridSelection {
  enabled: boolean;
  onConfirm: (checkedIds: string[]) => void;
  confirmLabel?: string;
}

/** `columns` union member: a bare field name renders as it always has
 * (label from the field's own `getLabel()`, cell = `String(row[name])`); the
 * object form renders a SYNTHETIC column with no backing field — `label` is
 * the header, `render(row)` is the cell (EA-D2-0 decision ③ — absorbs the
 * 0.3.x `fields: ListableFormField[]` composite-column need, e.g.
 * XrefPreferMappingView's `preferred` boolean column). */
export type ViewListGridColumn =
  | string
  | { name: string; label: string; render: (row: Record<string, unknown>) => ReactNode };

export interface ViewListGridProps {
  entityForm: EntityForm;
  store: StoreApi<ListStoreState>;
  onRowClick?: (row: Record<string, unknown>) => void;
  columns?: ViewListGridColumn[];
  /** Row checkboxes + a confirm button. Checking a row's box does NOT
   * trigger `onRowClick` (the checkbox cell stops click propagation before
   * it reaches the row). */
  selection?: ViewListGridSelection;
  /**
   * Rendered below the grid; receives the LIVE checked-id list so a host can
   * assemble add/delete/custom buttons around it (0.3.x `subCollection`
   * absorbed here — decision ③).
   *
   * CONTRACT (strict, do not loosen): the checkbox COLUMN's existence is
   * driven ONLY by `selection?.enabled` — `toolbar` never grows a checkbox
   * column by itself. When `selection` is absent, or present with
   * `enabled: false`, `toolbar` still renders but always receives
   * `checkedIds: []` (there is no checkbox UI for anything to be checked
   * through). A host that wants `toolbar` to see checked ids MUST also pass
   * `selection.enabled: true` (it may supply a no-op `onConfirm` if it does
   * not want the separate confirm button's behavior).
   */
  toolbar?: (ctx: { checkedIds: string[] }) => ReactNode;
}

function resolveHeader(entityForm: EntityForm, name: string): string {
  const field = entityForm.getField(name);
  if (!field) return name;
  const label = field.getLabel();
  return typeof label === 'string' ? label : name;
}

interface ResolvedColumn {
  name: string;
  header: string;
  cell: (row: Record<string, unknown>) => ReactNode;
  /** Derived-column-only (spec §5.1 `FieldListConfig`) — never set for the
   *  explicit `columns` prop escape hatch, whose cells/headers keep their
   *  pre-W5-2 behavior unchanged (directive: "leave escape-hatch cells
   *  as-is"). */
  align?: 'left' | 'center' | 'right' | undefined;
  width?: number | string | undefined;
  sortable?: boolean | undefined;
}

/** Cell resolution order for a DERIVED column (spec §5.2): a registered
 * `getListCellRenderer(field.type)` component, else `field.getDisplayValue`
 * if the field defines one (no field does yet — a later wave's seam;
 * `getFieldDisplayValue` degrades gracefully), else the pre-W5-2 bare
 * `String(value ?? '')`. */
function renderDerivedCell(field: EntityField, row: Record<string, unknown>): ReactNode {
  const value = row[field.getName()];
  const CellRenderer = getListCellRenderer(field.type);
  if (CellRenderer) return <CellRenderer value={value} row={row} field={field} />;
  const displayValue = getFieldDisplayValue(field, value);
  if (displayValue !== undefined) return displayValue;
  return String(value ?? '');
}

/** The no-explicit-`columns` derivation (spec §5.1/§7, CAP-19; W5-2):
 * fields declared via `withList()` (list-columns.ts's shared
 * `deriveListFields` — ALSO used by `XrefPreferMappingRenderer`, single
 * source of truth replacing the two independently duck-typed
 * `'showInList' in field` consumers this task consolidates). Magic fallback
 * ABOLISHED (spec §5.1): 0 truthy declarations renders an EMPTY column set
 * + a dev warning — the old "first ~4 non-hidden fields" auto-adoption is
 * gone, not a silent behavior. */
function deriveColumns(entityForm: EntityForm): ResolvedColumn[] {
  const derived = deriveListFields(entityForm);
  if (derived.length === 0) {
    console.warn(
      `[@listgrid/react] ViewListGrid: entityForm "${entityForm.name}" has no fields declared via withList() — rendering an empty column set (spec §5.1: the "first non-hidden fields" magic fallback is abolished).`,
    );
    return [];
  }
  return derived.map(({ field, config }) => {
    const name = field.getName();
    const label = config.label ?? field.getLabel();
    return {
      name,
      header: typeof label === 'string' ? label : name,
      align: config.align,
      width: config.width,
      sortable: config.sortable === true,
      cell: (row: Record<string, unknown>) => renderDerivedCell(field, row),
    };
  });
}

/** Resolve the `columns` union prop (or the `deriveColumns` derivation)
 * into a uniform render shape — string members keep today's behavior
 * (header via `resolveHeader`, cell = `String(row[name])`); object members
 * render their own `label`/`render(row)` (EA-D2-0 decision ③). The explicit
 * `columns` prop is an escape hatch: when given (non-empty) it WINS —
 * derivation never runs (spec §7 `columns?`). */
function resolveColumns(entityForm: EntityForm, explicit?: ViewListGridColumn[]): ResolvedColumn[] {
  if (explicit && explicit.length > 0) {
    return explicit.map((col) =>
      typeof col === 'string'
        ? {
            name: col,
            header: resolveHeader(entityForm, col),
            cell: (row: Record<string, unknown>) => String(row[col] ?? ''),
          }
        : { name: col.name, header: col.label, cell: col.render },
    );
  }
  return deriveColumns(entityForm);
}

/** Inline style for a derived column's align/width (spec §5.1
 * `FieldListConfig`) — `undefined` when neither is set, so callers keep
 * using the unstyled `Table.Th`/`Table.Td` primitives (byte-identical
 * markup) for every column that doesn't declare either. */
function cellStyle(column: ResolvedColumn): CSSProperties | undefined {
  if (column.align === undefined && column.width === undefined) return undefined;
  const style: CSSProperties = {};
  if (column.align !== undefined) style.textAlign = column.align;
  if (column.width !== undefined) style.width = column.width;
  return style;
}

function ariaSortFor(direction: Direction | undefined): 'ascending' | 'descending' | 'none' {
  if (direction === 'ASC') return 'ascending';
  if (direction === 'DESC') return 'descending';
  return 'none';
}

function nextSortDirection(current: Direction | undefined): Direction {
  return current === 'ASC' ? 'DESC' : 'ASC';
}

export function ViewListGrid({
  entityForm,
  store,
  onRowClick,
  columns,
  selection,
  toolbar,
}: ViewListGridProps) {
  const { Table, Pagination, LoadingOverlay, TextInput, CheckBox, Button } = useUI();

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

  const resolvedColumns = useMemo(() => resolveColumns(entityForm, columns), [entityForm, columns]);

  const quickSearchField = useMemo(() => {
    const firstText = resolvedColumns.find((c) => entityForm.getField(c.name)?.type === 'text');
    return (firstText ?? resolvedColumns[0])?.name;
  }, [resolvedColumns, entityForm]);

  const [quickSearchValue, setQuickSearchValue] = useState('');

  // EA-D2-0 selection: local checked-ids state, reset whenever `rows`'
  // identity changes (a fresh fetch/page — the previous page's checks don't
  // carry over). The checkbox COLUMN only exists when `selection.enabled` —
  // see the `toolbar` prop doc for the strict contract.
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  useEffect(() => {
    setCheckedIds([]);
  }, [rows]);

  function toggleChecked(id: string, checked: boolean): void {
    setCheckedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((existing) => existing !== id);
    });
  }

  const effectiveCheckedIds = selection?.enabled ? checkedIds : [];

  return (
    <div data-list-grid={entityForm.name} style={{ position: 'relative' }}>
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
            {selection?.enabled && <Table.Th />}
            {resolvedColumns.map((c) => {
              const style = cellStyle(c);
              // sortable headers need an onClick, and a styled (align/width)
              // header needs a `style` — `Table.Th` (ui-default) only
              // forwards `children`/`colSpan` (the identical prop-dropping
              // trap the file-header comment documents for `Table.Tr`), so
              // either case renders a raw `<th>` (byte-identical markup to
              // what `Table.Th` itself emits) to actually reach the DOM.
              if (c.sortable) {
                const currentDirection = searchForm.sorts.find(
                  (s) => s.field === c.name,
                )?.direction;
                return (
                  <th
                    key={c.name}
                    role="columnheader"
                    aria-sort={ariaSortFor(currentDirection)}
                    onClick={() =>
                      void store.getState().setSort(c.name, nextSortDirection(currentDirection))
                    }
                    style={style}
                  >
                    {c.header}
                  </th>
                );
              }
              if (style !== undefined) {
                return (
                  <th key={c.name} style={style}>
                    {c.header}
                  </th>
                );
              }
              return <Table.Th key={c.name}>{c.header}</Table.Th>;
            })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, i) => {
            const rawId = row['id'];
            const rowId = rawId !== undefined && rawId !== null ? String(rawId) : undefined;
            const selectionId = rowId ?? String(i);
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
                {selection?.enabled && (
                  <Table.Td>
                    {/* The wrapping <span> intercepts the click during bubble
                        (stopPropagation) before it reaches the <tr>'s
                        onClick — CheckBoxProps.onChange carries no DOM
                        event, so this is the only place to stop it. */}
                    <span onClick={(e) => e.stopPropagation()}>
                      <CheckBox
                        ariaLabel={`Select row ${selectionId}`}
                        checked={checkedIds.includes(selectionId)}
                        onChange={(checked) => toggleChecked(selectionId, checked)}
                      />
                    </span>
                  </Table.Td>
                )}
                {resolvedColumns.map((c) => {
                  const style = cellStyle(c);
                  return style !== undefined ? (
                    <td key={c.name} style={style}>
                      {c.cell(row)}
                    </td>
                  ) : (
                    <Table.Td key={c.name}>{c.cell(row)}</Table.Td>
                  );
                })}
              </tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {selection?.enabled && (
        <div data-selection-actions>
          <Button
            type="button"
            onClick={() => selection.onConfirm(checkedIds)}
            disabled={checkedIds.length === 0}
          >
            {selection.confirmLabel ?? '확인'}
          </Button>
        </div>
      )}

      {toolbar && <div data-list-grid-toolbar>{toolbar({ checkedIds: effectiveCheckedIds })}</div>}

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
