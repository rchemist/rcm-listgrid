import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type {
  Direction,
  EntityField,
  EntityForm,
  FilterItem,
  QueryConditionType,
} from '@listgrid/schema-core';
import type { ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { getListCellRenderer } from '../registry/list-cell-renderer-registry';
import { getFilterRenderer } from '../registry/filter-renderer-registry';
import { getLabels } from '../labels';
import {
  deriveFilterFields,
  deriveListFields,
  getFieldDisplayValue,
  type DerivedFilterField,
} from './list-columns';

// ViewListGrid — the list screen (charter C9): fetches on mount, subscribes to
// the injected ListStoreState, and renders rows/pagination/loading through the
// host's UIComponents registry (useUI). Deliberately minimal beyond that —
// selection/toolbar/sub-collection are EA-D2-0 additions (that's the 0.3.x
// src/listgrid/components/list/ViewListGrid.tsx surface this replaces, not
// this V0.4 slice). Row-selection navigation is the page's job (`onRowClick`);
// a "New" button is NOT part of this component (the page owns create nav).
//
// The advanced-search panel (spec §7 CAP-20; W5-3) is EMBEDDED here (no
// separate exported component — W5-3 wave-entry decision 3-내장): it derives
// its inputs from `withFilter()`-declared fields (`deriveFilterFields`,
// list-columns.ts) and, on apply, folds non-empty values into the store's
// `SearchForm` via the EXISTING `addAndFilter`/`setSearchForm` pipe — no
// change to the list-fetch contract.
//
// NOTE (body-row interactivity vs. registry Table.Tr): @listgrid/ui-default's
// TableRowProps supports `children`/`className`, but it does not type or
// forward onClick/role/data-row-id. Routing the E2E-required click/`data-row-id`
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
  /** Opt-in column-visibility dialog. Visibility is component-local unless
   * `hiddenColumns` is controlled by the host; omitted/false preserves the
   * existing list chrome. */
  columnSettings?: boolean;
  /** Controlled hidden column names. When provided, these column `name`
   * values are the source of truth; persistence remains the host's concern. */
  hiddenColumns?: readonly string[];
  /** Receives the next controlled array of hidden column names. */
  onHiddenColumnsChange?: (names: string[]) => void;
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
  /** Show a leading descending row number after the optional selection column. */
  showRowNumbers?: boolean;
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
  /** Present only for declarations derived from `withList()`. */
  field?: EntityField | undefined;
}

/** Cell resolution order for a DERIVED column (spec §5.1/§5.2): the optional
 * React-free `FieldListConfig.format`, then a registered list-cell renderer,
 * `field.getDisplayValue`, and finally the raw string fallback. */
function renderDerivedCell(
  field: EntityField,
  format: ((value: unknown, row: Record<string, unknown>) => string) | undefined,
  row: Record<string, unknown>,
): ReactNode {
  const value = row[field.getName()];
  if (format) return format(value, row);
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
      field,
      cell: (row: Record<string, unknown>) => renderDerivedCell(field, config.format, row),
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

function SortIndicator({ direction }: { direction: 'none' | 'ascending' | 'descending' }) {
  return (
    <span
      className="rcm-sort-indicator"
      data-sort-indicator
      data-direction={direction}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {direction === 'none' ? (
          <>
            <path d="m8 10 4-4 4 4" />
            <path d="m8 14 4 4 4-4" />
          </>
        ) : direction === 'ascending' ? (
          <path d="m7 15 5-5 5 5" />
        ) : (
          <path d="m7 9 5 5 5-5" />
        )}
      </svg>
    </span>
  );
}

function normalizeHiddenColumnNames(
  names: Iterable<string>,
  resolvedColumns: readonly ResolvedColumn[],
): Set<string> {
  const resolvedNames = new Set(resolvedColumns.map((column) => column.name));
  const next = new Set([...names].filter((name) => resolvedNames.has(name)));
  if (resolvedColumns.length > 0 && next.size >= resolvedColumns.length) {
    next.delete(resolvedColumns[0]!.name);
  }
  return next;
}

export function ViewListGrid({
  entityForm,
  store,
  onRowClick,
  columns,
  columnSettings = false,
  hiddenColumns,
  onHiddenColumnsChange,
  selection,
  toolbar,
  showRowNumbers = false,
}: ViewListGridProps) {
  const { Table, Pagination, LoadingOverlay, TextInput, CheckBox, Button, Modal } = useUI();
  const labels = getLabels();

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
  const [localHiddenColumnNames, setLocalHiddenColumnNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const hiddenColumnNames = useMemo(
    () => normalizeHiddenColumnNames(hiddenColumns ?? localHiddenColumnNames, resolvedColumns),
    [hiddenColumns, localHiddenColumnNames, resolvedColumns],
  );
  const visibleColumns = useMemo(
    () => resolvedColumns.filter((column) => !hiddenColumnNames.has(column.name)),
    [resolvedColumns, hiddenColumnNames],
  );

  // A changing `columns`/`entityForm` prop cannot strand the grid with every
  // newly-resolved column hidden. Stale names are also discarded locally.
  useEffect(() => {
    if (hiddenColumns !== undefined) return;
    setLocalHiddenColumnNames((previous) => {
      const next = normalizeHiddenColumnNames(previous, resolvedColumns);
      if (next.size === previous.size && [...next].every((name) => previous.has(name))) {
        return previous;
      }
      return next;
    });
  }, [hiddenColumns, resolvedColumns]);

  function toggleColumnVisibility(name: string, visible: boolean): void {
    const next = new Set(hiddenColumnNames);
    if (visible) next.delete(name);
    else next.add(name);
    const clamped = normalizeHiddenColumnNames(next, resolvedColumns);

    if (hiddenColumns !== undefined) {
      onHiddenColumnsChange?.([...clamped]);
      return;
    }
    setLocalHiddenColumnNames(clamped);
  }

  const quickSearchField = useMemo(() => {
    const firstText = visibleColumns.find((c) => entityForm.getField(c.name)?.type === 'text');
    return (firstText ?? visibleColumns[0])?.name;
  }, [visibleColumns, entityForm]);

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
  const visibleSelectionIds = rows.map((row, index) => {
    const rawId = row['id'];
    return rawId !== undefined && rawId !== null ? String(rawId) : String(index);
  });
  const allVisibleRowsChecked =
    visibleSelectionIds.length > 0 &&
    visibleSelectionIds.every((selectionId) => checkedIds.includes(selectionId));
  const someVisibleRowsChecked = visibleSelectionIds.some((selectionId) =>
    checkedIds.includes(selectionId),
  );
  const partiallyVisibleRowsChecked = someVisibleRowsChecked && !allVisibleRowsChecked;

  function toggleAllVisibleRows(): void {
    // Preserve the 0.2.x EntireChecker contract: any existing visible
    // selection (including a partial one) is cleared by the master checkbox.
    setCheckedIds(someVisibleRowsChecked ? [] : visibleSelectionIds);
  }

  // Advanced-search panel (spec §7 CAP-20; W5-3) — derived from `withFilter()`
  // declarations, same tri-state (truthy/false/undeclared) as the column
  // derivation above. Empty derivation => no toggle, no panel (nothing to
  // search on).
  const filterFields = useMemo(() => deriveFilterFields(entityForm), [entityForm]);
  const filterFieldByName = useMemo(
    () => new Map(filterFields.map((derived) => [derived.field.getName(), derived])),
    [filterFields],
  );
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [openColumnFilter, setOpenColumnFilter] = useState<string | undefined>(undefined);
  const openColumnFilterHeaderRef = useRef<HTMLTableCellElement | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (openColumnFilter === undefined) return;
    function closeOnOutsideMouseDown(event: MouseEvent): void {
      if (!openColumnFilterHeaderRef.current?.contains(event.target as Node)) {
        setOpenColumnFilter(undefined);
      }
    }
    document.addEventListener('mousedown', closeOnOutsideMouseDown);
    return () => document.removeEventListener('mousedown', closeOnOutsideMouseDown);
  }, [openColumnFilter]);

  function setFilterValue(name: string, value: unknown): void {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  }

  function resetColumnFilter(name: string): void {
    setFilterValues((prev) => ({ ...prev, [name]: '' }));
    const next = store.getState().searchForm.clone();
    next.filters.AND = next.filters.AND.filter((item) => item.name !== name);
    next.page = 0;
    void store.getState().setSearchForm(next);
  }

  // Apply: collect every NON-EMPTY filter value into a FilterItem[] and fold
  // them into the store's current SearchForm via the existing `withFilter`
  // (no schema-core API change), then hand the result to `setSearchForm`
  // (page-reset + refetch, same pipe quickSearch/setSort already use).
  // `config.operator` (spec §5.1's open `string`) is cast to
  // `QueryConditionType` ONLY when present — omitted entirely otherwise
  // (exactOptionalPropertyTypes forbids `queryConditionType: undefined`; no
  // default operator is invented).
  //
  // R2 fix (advanced-search re-apply): `withFilter('AND', ...)` REPLACES an
  // existing same-`name` AND clause in place (0.3.x replace-by-name semantics,
  // search-form.ts:229-245) instead of the previous `addAndFilter` STACKING —
  // so editing a field and re-applying yields a single `{name: current}`
  // clause, not the unsatisfiable `AND(name=old, name=new)` that returned 0
  // rows. Non-panel AND clauses (host/hook-seeded) are preserved: `withFilter`
  // only touches the names it is handed. A clause for a field the user CLEARS
  // between applies is not removed (withFilter has no remove path) — out of
  // R2's scope; a `removeAndFilter*` primitive would be a separate
  // public-surface decision.
  function applyFilterValues(fields: DerivedFilterField[] = filterFields): void {
    const items: FilterItem[] = [];
    for (const { field, config } of fields) {
      const value = filterValues[field.getName()];
      if (value === undefined || value === null || value === '') continue;
      items.push({
        name: field.getName(),
        value,
        ...(config.operator ? { queryConditionType: config.operator as QueryConditionType } : {}),
      });
    }
    const next = store.getState().searchForm.withFilter('AND', ...items);
    void store.getState().setSearchForm(next);
  }

  return (
    <div
      className="rcm-listgrid-panel rcm-listgrid-panel-main"
      data-list-grid={entityForm.name}
      style={{ position: 'relative' }}
    >
      <LoadingOverlay visible={loading} />

      {quickSearchField !== undefined && (
        <div className="rcm-quick-search-wrap">
          <TextInput
            className="rcm-input rcm-quick-search-input"
            ariaLabel={labels.quickSearchAria}
            value={quickSearchValue}
            placeholder={labels.quickSearchPlaceholder}
            onChange={(value) => {
              setQuickSearchValue(value);
              void store.getState().quickSearch([quickSearchField], value);
            }}
          />
          <span className="rcm-quick-search-addon rcm-quick-search-addon-search">
            <svg
              className="rcm-quick-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </span>
          {quickSearchValue !== '' && (
            <span className="rcm-quick-search-addon rcm-quick-search-addon-clear">
              <button
                type="button"
                className="rcm-quick-search-btn"
                aria-label="Clear quick search"
                onClick={() => {
                  setQuickSearchValue('');
                  void store.getState().quickSearch([quickSearchField], '');
                }}
              >
                <svg
                  className="rcm-quick-search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6M15 9l-6 6" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      {filterFields.length > 0 && (
        <div className="rcm-adv-search-outer" data-advanced-search={entityForm.name}>
          <Button type="button" onClick={() => setAdvancedSearchOpen((open) => !open)}>
            {labels.advancedSearchToggle}
          </Button>
          {columnSettings && (
            <div data-column-settings-toggle>
              <Button type="button" onClick={() => setColumnSettingsOpen(true)}>
                {labels.columnSettings}
              </Button>
            </div>
          )}
          {advancedSearchOpen && (
            <div className="rcm-adv-search-inner">
              <div className="rcm-adv-search-inner-panel" data-advanced-search-panel>
                <div className="rcm-adv-search-header">
                  <div className="rcm-adv-search-header-left">
                    <span className="rcm-adv-search-header-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                      </svg>
                    </span>
                    <span className="rcm-text" data-weight="semibold">
                      {labels.advancedSearchToggle}
                    </span>
                    <span className="rcm-adv-search-count">
                      <span className="rcm-badge" data-color="primary" data-size="sm">
                        {filterFields.length}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="rcm-adv-search-grid">
                  {filterFields.map(({ field, config }) => {
                    const label = config.label ?? field.getLabel();
                    const headerText = typeof label === 'string' ? label : field.getName();
                    const filterId = `filter-${field.getName()}`;
                    const value = filterValues[field.getName()];
                    const FilterInput = getFilterRenderer(field.type);
                    return (
                      <div
                        key={field.getName()}
                        data-filter-field={field.getName()}
                        data-advanced-search-field
                      >
                        <label htmlFor={filterId}>{headerText}</label>
                        {FilterInput ? (
                          <FilterInput
                            field={field}
                            value={value}
                            onChange={(v) => setFilterValue(field.getName(), v)}
                          />
                        ) : (
                          <TextInput
                            className="rcm-input"
                            id={filterId}
                            value={typeof value === 'string' ? value : ''}
                            onChange={(v) => setFilterValue(field.getName(), v)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="rcm-adv-search-footer">
                  <button
                    type="button"
                    className="rcm-button rcm-adv-search-btn rcm-adv-search-btn-submit"
                    data-variant="primary"
                    data-size="sm"
                    data-advanced-search-apply
                    onClick={() => applyFilterValues()}
                  >
                    {labels.advancedSearchApply}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {columnSettings && filterFields.length === 0 && (
        <div data-column-settings-toggle>
          <Button type="button" onClick={() => setColumnSettingsOpen(true)}>
            {labels.columnSettings}
          </Button>
        </div>
      )}

      {columnSettings && (
        <Modal
          open={columnSettingsOpen}
          onClose={() => setColumnSettingsOpen(false)}
          title={labels.columnSettings}
        >
          <div data-column-settings>
            {resolvedColumns.map((column) => {
              const visible = !hiddenColumnNames.has(column.name);
              return (
                <label key={column.name}>
                  <CheckBox
                    ariaLabel={`${column.name} — ${column.header}`}
                    checked={visible}
                    disabled={visible && visibleColumns.length === 1}
                    onChange={(checked) => toggleColumnVisibility(column.name, checked)}
                  />
                  <span>
                    {column.name} — {column.header}
                  </span>
                </label>
              );
            })}
            <Button type="button" onClick={() => setColumnSettingsOpen(false)}>
              {labels.columnSettingsApply}
            </Button>
          </div>
        </Modal>
      )}

      <div className="rcm-skeleton-table-wrapper">
        <Table className="rcm-table">
          <Table.Thead className="rcm-listgrid-thead">
            <Table.Tr>
              {(selection?.enabled || showRowNumbers) && (
                <Table.Th className="rcm-skeleton-td-checkbox">
                  {selection?.enabled ? (
                    <CheckBox
                      className="rcm-checkbox"
                      ariaLabel={labels.selectAllAria}
                      checked={allVisibleRowsChecked}
                      indeterminate={partiallyVisibleRowsChecked}
                      disabled={rows.length === 0}
                      onChange={toggleAllVisibleRows}
                    />
                  ) : (
                    labels.rowNumberHeader
                  )}
                </Table.Th>
              )}
              {visibleColumns.map((c) => {
                const style = cellStyle(c);
                const filterField = c.field ? filterFieldByName.get(c.name) : undefined;
                const columnFilterOpen = openColumnFilter === c.name;
                const columnFilterActive = searchForm.filters.AND.some(
                  (item) =>
                    item.name === c.name &&
                    item.value !== undefined &&
                    item.value !== null &&
                    item.value !== '',
                );
                const headerStyle = filterField
                  ? { ...style, position: 'relative' as const }
                  : style;
                const headerContent = (
                  <>
                    {c.header}
                    {filterField && (
                      <>
                        <button
                          type="button"
                          className="rcm-filter-button"
                          data-column-filter-trigger
                          {...(columnFilterActive ? { 'data-active': '' } : {})}
                          aria-label={labels.columnFilterAria(c.header)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenColumnFilter((open) => (open === c.name ? undefined : c.name));
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            aria-hidden="true"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 5h16l-6 7v5l-4 2v-7L4 5z" />
                          </svg>
                        </button>
                        {columnFilterOpen && (
                          <div
                            className="rcm-filter-dropdown rcm-filter-dropdown-md"
                            data-column-filter={c.name}
                            onClick={(event) => event.stopPropagation()}
                            style={{ position: 'absolute' }}
                          >
                            {(() => {
                              const { field } = filterField;
                              const filterId = `column-filter-${field.getName()}`;
                              const value = filterValues[field.getName()];
                              const FilterInput = getFilterRenderer(field.type);
                              return (
                                <div className="rcm-filter-dropdown-inner">
                                  <div className="rcm-filter-dropdown-header">
                                    <label
                                      className="rcm-text"
                                      data-size="sm"
                                      data-weight="semibold"
                                      htmlFor={filterId}
                                      data-column-filter-label
                                    >
                                      {c.header}
                                    </label>
                                    <button
                                      type="button"
                                      className="rcm-icon-btn"
                                      aria-label={`${c.header} 필터 닫기`}
                                      onClick={() => setOpenColumnFilter(undefined)}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        aria-hidden="true"
                                      >
                                        <path d="m6 6 12 12M18 6 6 18" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="rcm-filter-dropdown-body">
                                    {FilterInput ? (
                                      <FilterInput
                                        field={field}
                                        value={value}
                                        onChange={(next) => setFilterValue(field.getName(), next)}
                                      />
                                    ) : (
                                      <TextInput
                                        className="rcm-input"
                                        id={filterId}
                                        value={typeof value === 'string' ? value : ''}
                                        onChange={(next) => setFilterValue(field.getName(), next)}
                                      />
                                    )}
                                  </div>
                                  <div className="rcm-filter-dropdown-footer">
                                    <button
                                      type="button"
                                      className="rcm-button"
                                      data-variant="outline"
                                      data-color="error"
                                      data-size="sm"
                                      onClick={() => resetColumnFilter(field.getName())}
                                    >
                                      {labels.filterReset}
                                    </button>
                                    <button
                                      type="button"
                                      className="rcm-button"
                                      data-variant="primary"
                                      data-size="sm"
                                      data-column-filter-apply
                                      onClick={() => {
                                        applyFilterValues();
                                        setOpenColumnFilter(undefined);
                                      }}
                                    >
                                      {labels.advancedSearchApply}
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
                // sortable headers need an onClick, and a styled (align/width)
                // header needs a `style` — `Table.Th` (ui-default) only
                // forwards `children`/`colSpan`/`className` (the prop-dropping
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
                      className="rcm-sortable"
                      role="columnheader"
                      aria-sort={ariaSortFor(currentDirection)}
                      ref={columnFilterOpen ? openColumnFilterHeaderRef : undefined}
                      onClick={() =>
                        void store.getState().setSort(c.name, nextSortDirection(currentDirection))
                      }
                      style={headerStyle}
                    >
                      {headerContent}
                      <SortIndicator direction={ariaSortFor(currentDirection)} />
                    </th>
                  );
                }
                if (filterField) {
                  return (
                    <th
                      key={c.name}
                      role="columnheader"
                      ref={columnFilterOpen ? openColumnFilterHeaderRef : undefined}
                      style={headerStyle}
                    >
                      {headerContent}
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
          <Table.Tbody className="rcm-listgrid-tbody">
            {!loading && rows.length === 0 && (
              <tr data-empty-row>
                <td
                  colSpan={Math.max(
                    1,
                    visibleColumns.length + (selection?.enabled || showRowNumbers ? 1 : 0),
                  )}
                >
                  <div className="rcm-listgrid-empty" data-empty-state>
                    {labels.emptyState}
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const rawId = row['id'];
              const rowId = rawId !== undefined && rawId !== null ? String(rawId) : undefined;
              const selectionId = rowId ?? String(i);
              return (
                <tr
                  className={[
                    'rcm-listgrid-row-hover',
                    checkedIds.includes(selectionId) ? 'rcm-listgrid-row-selected' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={rowId ?? i}
                  role="button"
                  tabIndex={0}
                  {...(rowId !== undefined ? { 'data-row-id': rowId } : {})}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onRowClick?.(row);
                  }}
                >
                  {selection?.enabled && showRowNumbers ? (
                    <td className="rcm-skeleton-td-checkbox" data-row-number>
                      <label
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <CheckBox
                          className="rcm-checkbox"
                          ariaLabel={`Select row ${selectionId}`}
                          checked={checkedIds.includes(selectionId)}
                          onChange={(checked) => toggleChecked(selectionId, checked)}
                        />
                        <span className="rcm-listgrid-rownum">
                          {totalElements > 0
                            ? totalElements - Math.max(searchForm.page, 0) * searchForm.pageSize - i
                            : ''}
                        </span>
                      </label>
                    </td>
                  ) : selection?.enabled ? (
                    <Table.Td className="rcm-skeleton-td-checkbox">
                      <span onClick={(event) => event.stopPropagation()}>
                        <CheckBox
                          className="rcm-checkbox"
                          ariaLabel={`Select row ${selectionId}`}
                          checked={checkedIds.includes(selectionId)}
                          onChange={(checked) => toggleChecked(selectionId, checked)}
                        />
                      </span>
                    </Table.Td>
                  ) : showRowNumbers ? (
                    <td data-row-number>
                      <span className="rcm-listgrid-rownum">
                        {totalElements > 0
                          ? totalElements - Math.max(searchForm.page, 0) * searchForm.pageSize - i
                          : ''}
                      </span>
                    </td>
                  ) : null}
                  {visibleColumns.map((c) => {
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
      </div>

      {selection?.enabled && (
        <div data-selection-actions>
          <Button
            type="button"
            onClick={() => selection.onConfirm(checkedIds)}
            disabled={checkedIds.length === 0}
          >
            {selection.confirmLabel ?? labels.selectionConfirm}
          </Button>
        </div>
      )}

      {toolbar && (
        <div className="rcm-search-bar-actions" data-list-grid-toolbar>
          {toolbar({ checkedIds: effectiveCheckedIds })}
        </div>
      )}

      <div className="rcm-listgrid-pagination" data-total-elements={totalElements}>
        <Pagination
          page={searchForm.page}
          totalPages={totalPages}
          onChange={(p) => void store.getState().setPage(p)}
          prevLabel={labels.paginationPrev}
          nextLabel={labels.paginationNext}
        />
      </div>
    </div>
  );
}
