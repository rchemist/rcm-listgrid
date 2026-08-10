import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type {
  Direction,
  EntityField,
  EntityForm,
  FilterItem,
  QueryConditionType,
  SearchForm,
} from '@listgrid/schema-core';
import type { ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { getListCellRenderer } from '../registry/list-cell-renderer-registry';
import { getFilterRenderer } from '../registry/filter-renderer-registry';
import { getLabels } from '../labels';
import { LIKE_FIELD_TYPES, searchConditionFor } from '../search-condition';
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
 * 29-consumer surface — the briefing's decision ① minimal shape). `enabled`
 * gates the checkbox COLUMN's existence (see `toolbar` doc below for the
 * strict contract); `onConfirm` receives the current checked-id list;
 * `showConfirm` can suppress the built-in action; `onCheckedChange` observes
 * every checked-id change; `confirmLabel` overrides the default button text. */
export interface ViewListGridSelection {
  enabled: boolean;
  onConfirm: (checkedIds: string[]) => void;
  /** Render the built-in confirm action when at least one row is checked. @default true */
  showConfirm?: boolean;
  /** Called after the checked-id list changes, including a rows-change reset to `[]`. */
  onCheckedChange?: (checkedIds: string[]) => void;
  confirmLabel?: string;
}

export interface ViewListGridOpenInNewWindow {
  enabled: boolean;
  getUrl: (row: Record<string, unknown>) => string;
  tooltip?: string;
  showFilter?: (row: Record<string, unknown>) => boolean;
  windowFeatures?: { width?: number; height?: number };
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
  /** When false, the grid does not fetch on mount/store change; the host owns
   * the initial fetch. @default true */
  autoFetch?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  columns?: ViewListGridColumn[];
  /** Opt-in instant-apply column-visibility popover. Visibility is component-local unless
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
   * Rendered in the top searchbar actions row; receives the LIVE checked-id list so a host can
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
  /** Optional row action that opens a host-provided URL in a centered popup. */
  openInNewWindow?: ViewListGridOpenInNewWindow;
}

function isEmptyFilterValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'number' && Number.isNaN(value))
  );
}

function openWindowFeatures(width: number, height: number): string {
  const left = Math.max(0, (window.screen.availWidth - width) / 2);
  const top = Math.max(0, (window.screen.availHeight - height) / 2);
  return `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
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
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'none' ? (
          <>
            <path d="M4 6l9 0" />
            <path d="M4 12l7 0" />
            <path d="M4 18l7 0" />
            <path d="M15 15l3 3l3 -3" />
            <path d="M18 6l0 12" />
          </>
        ) : direction === 'ascending' ? (
          <>
            <path d="M15 21v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" />
            <path d="M19 10h-4l4 -7h-4" />
            <path d="M4 15l3 3l3 -3" />
            <path d="M7 6v12" />
          </>
        ) : (
          <>
            <path d="M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" />
            <path d="M19 21h-4l4 -7h-4" />
            <path d="M4 15l3 3l3 -3" />
            <path d="M7 6v12" />
          </>
        )}
      </svg>
    </span>
  );
}

/*! gjcu 0.2.29 advanced-search count format: {n}개 필드 */
function advancedFilterFieldLabel({ field, config }: DerivedFilterField): string {
  const label = config.label ?? field.getLabel();
  return typeof label === 'string' ? label : field.getName();
}

interface AdvancedFieldSelectorProps {
  availableFields: DerivedFilterField[];
  selectedFieldNames: Set<string>;
  onToggleField: (fieldName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

/** Port of the gjcu 0.2.x advanced-search FieldSelector markup. */
function AdvancedFieldSelector({
  availableFields,
  selectedFieldNames,
  onToggleField,
  onSelectAll,
  onDeselectAll,
}: AdvancedFieldSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const filteredFields = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return availableFields;
    return availableFields.filter(({ field, config }) => {
      const label = config.label ?? field.getLabel();
      return (
        (typeof label === 'string' && label.toLowerCase().includes(query)) ||
        field.getName().toLowerCase().includes(query)
      );
    });
  }, [availableFields, searchQuery]);
  const selectedCount = availableFields.filter(({ field }) =>
    selectedFieldNames.has(field.getName()),
  ).length;

  return (
    <div className="rcm-field-selector">
      <div
        className="rcm-field-selector-header"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <div className="rcm-field-selector-header-left">
          <span className="rcm-text" data-weight="medium">
            검색 필드 선택
          </span>
          <span className="rcm-badge" data-color="primary" data-size="sm">
            {selectedCount}/{availableFields.length}
          </span>
        </div>
        <div className="rcm-field-selector-header-right">
          {!isExpanded && selectedCount > 0 && (
            <span className="rcm-text" data-size="xs" data-tone="muted">
              {selectedCount}개 선택됨
            </span>
          )}
          <button
            type="button"
            className="rcm-icon-btn"
            data-size="sm"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            <svg
              className={`rcm-icon ${isExpanded ? 'rcm-rotate-180' : ''}`}
              data-size="sm"
              data-tone="muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="rcm-field-selector-body">
          <div className="rcm-field-selector-search-row">
            <div className="rcm-field-selector-search-input-wrap">
              <svg
                className="rcm-icon rcm-field-selector-search-icon"
                data-size="sm"
                data-tone="muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M21 21l-6 -6" />
              </svg>
              <input
                type="text"
                placeholder="필드 검색..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="rcm-input"
                data-size="sm"
              />
            </div>
            <button
              type="button"
              onClick={onSelectAll}
              className="rcm-button"
              data-variant="ghost"
              data-size="sm"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              className="rcm-button"
              data-variant="ghost"
              data-size="sm"
            >
              전체 해제
            </button>
          </div>

          <div className="rcm-field-selector-list">
            <div className="rcm-field-selector-grid">
              {filteredFields.map((derivedField) => {
                const fieldName = derivedField.field.getName();
                const isSelected = selectedFieldNames.has(fieldName);
                return (
                  <button
                    key={fieldName}
                    type="button"
                    onClick={() => onToggleField(fieldName)}
                    className="rcm-chip"
                    data-interactive
                    data-state={isSelected ? 'selected' : undefined}
                  >
                    <span
                      className={`rcm-field-selector-chip-check ${isSelected ? 'rcm-field-selector-chip-check-selected' : ''}`}
                    >
                      {isSelected && (
                        <svg
                          className="rcm-icon rcm-field-selector-chip-check-icon"
                          data-size="xs"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      )}
                    </span>
                    <span className="rcm-truncate">{advancedFilterFieldLabel(derivedField)}</span>
                  </button>
                );
              })}
            </div>

            {filteredFields.length === 0 && (
              <span className="rcm-text rcm-field-selector-empty" data-tone="muted">
                검색 결과가 없습니다
              </span>
            )}
          </div>
        </div>
      )}
    </div>
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
  autoFetch = true,
  onRowClick,
  columns,
  columnSettings = false,
  hiddenColumns,
  onHiddenColumnsChange,
  selection,
  toolbar,
  showRowNumbers = false,
  openInNewWindow,
}: ViewListGridProps) {
  const { Table, Pagination, LoadingOverlay, TextInput, CheckBox, Button } = useUI();
  const labels = getLabels();

  const rows = useStore(store, (s) => s.rows);
  const totalElements = useStore(store, (s) => s.totalElements);
  const totalPages = useStore(store, (s) => s.totalPages);
  const loading = useStore(store, (s) => s.loading);
  const error = useStore(store, (s) => s.error);
  const searchForm = useStore(store, (s) => s.searchForm);

  useEffect(() => {
    if (autoFetch === false) return;
    // Run once per store (mount) — the store owns refetching on
    // page/sort/quickSearch changes via its own actions.
    void store.getState().fetch();
  }, [store, autoFetch]);

  useEffect(() => {
    function refreshAfterEntityChange(event: MessageEvent): void {
      const { type } = event.data ?? {};
      if (type === 'ENTITY_DELETED' || type === 'ENTITY_SAVED') {
        void store.getState().fetch();
      }
    }

    window.addEventListener('message', refreshAfterEntityChange);
    return () => window.removeEventListener('message', refreshAfterEntityChange);
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

  const [quickSearchValue, setQuickSearchValue] = useState('');

  // EA-D2-0 selection: local checked-ids state, reset whenever `rows`'
  // identity changes (a fresh fetch/page — the previous page's checks don't
  // carry over). The checkbox COLUMN only exists when `selection.enabled` —
  // see the `toolbar` prop doc for the strict contract.
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const onCheckedChangeRef = useRef(selection?.onCheckedChange);
  onCheckedChangeRef.current = selection?.onCheckedChange;
  const checkedIdsInitializedRef = useRef(false);
  useEffect(() => {
    setCheckedIds((previous) => (previous.length === 0 ? previous : []));
  }, [rows]);
  useEffect(() => {
    if (!checkedIdsInitializedRef.current) {
      checkedIdsInitializedRef.current = true;
      return;
    }
    onCheckedChangeRef.current?.(checkedIds);
  }, [checkedIds]);

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
  // Reuse: the existing withList()/withFilter() declarations are the source
  // of truth. schema-core has no quickSearch opt-in/out flag, so the 0.2.x
  // fallback is restored: every filterable text-family list field participates.
  const quickSearchFields = useMemo(
    () =>
      resolvedColumns
        .map((column) => ({ column, field: entityForm.getField(column.name) }))
        .filter(
          (entry): entry is { column: ResolvedColumn; field: EntityField } =>
            entry.field !== undefined &&
            LIKE_FIELD_TYPES.has(entry.field.type) &&
            filterFieldByName.has(entry.column.name),
        )
        .map(({ column }) => ({ name: column.name, label: column.header })),
    [entityForm, filterFieldByName, resolvedColumns],
  );
  const quickSearchFieldNames = useMemo(
    () => quickSearchFields.map((field) => field.name),
    [quickSearchFields],
  );
  const quickSearchFieldLabels = useMemo(
    () => quickSearchFields.map((field) => field.label),
    [quickSearchFields],
  );
  const quickSearchPlaceholder =
    quickSearchFields.length > 0
      ? labels.quickSearchPlaceholderFor(quickSearchFieldLabels)
      : labels.quickSearchPlaceholder;
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [useUnifiedSearch, setUseUnifiedSearch] = useState(true);
  const [unifiedSearchValue, setUnifiedSearchValue] = useState('');
  const [advancedSearchGridView, setAdvancedSearchGridView] = useState(true);
  const [selectedAdvancedFilterFieldNames, setSelectedAdvancedFilterFieldNames] = useState<
    Set<string>
  >(() => new Set(filterFields.map(({ field }) => field.getName())));
  const visibleAdvancedFilterFields = useMemo(
    () =>
      filterFields.filter(
        ({ field }) =>
          !useUnifiedSearch ||
          quickSearchFields.length < 2 ||
          !quickSearchFieldNames.includes(field.getName()),
      ),
    [filterFields, quickSearchFieldNames, quickSearchFields.length, useUnifiedSearch],
  );
  const displayedAdvancedFilterFields = useMemo(
    () =>
      visibleAdvancedFilterFields.filter(({ field }) =>
        selectedAdvancedFilterFieldNames.has(field.getName()),
      ),
    [selectedAdvancedFilterFieldNames, visibleAdvancedFilterFields],
  );
  const [openColumnFilter, setOpenColumnFilter] = useState<string | undefined>(undefined);
  const openColumnFilterHeaderRef = useRef<HTMLTableCellElement | null>(null);
  const columnSettingsRef = useRef<HTMLDivElement | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [filterOperators, setFilterOperators] = useState<
    Record<string, QueryConditionType | undefined>
  >({});

  useEffect(() => {
    setSelectedAdvancedFilterFieldNames(new Set(filterFields.map(({ field }) => field.getName())));
  }, [filterFields]);

  function toggleAdvancedFilterField(fieldName: string): void {
    setSelectedAdvancedFilterFieldNames((previous) => {
      const next = new Set(previous);
      if (next.has(fieldName)) next.delete(fieldName);
      else next.add(fieldName);
      return next;
    });
  }

  function selectAllAdvancedFilterFields(): void {
    setSelectedAdvancedFilterFieldNames(
      new Set(visibleAdvancedFilterFields.map(({ field }) => field.getName())),
    );
  }

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

  useEffect(() => {
    if (!columnSettingsOpen) return;
    function closeColumnSettings(event: MouseEvent): void {
      if (!columnSettingsRef.current?.contains(event.target as Node)) {
        setColumnSettingsOpen(false);
      }
    }
    function closeColumnSettingsOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') setColumnSettingsOpen(false);
    }
    document.addEventListener('mousedown', closeColumnSettings);
    document.addEventListener('keydown', closeColumnSettingsOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeColumnSettings);
      document.removeEventListener('keydown', closeColumnSettingsOnEscape);
    };
  }, [columnSettingsOpen]);

  function setFilterValue(name: string, value: unknown, operator?: QueryConditionType): void {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
    setFilterOperators((previous) => {
      if (isEmptyFilterValue(value)) {
        const next = { ...previous };
        delete next[name];
        return next;
      }
      return operator === undefined ? previous : { ...previous, [name]: operator };
    });
  }

  function appliedQuickSearchValue(current: SearchForm): string {
    const currentQuickNames = new Set(current.quickSearchFields);
    const appliedQuickItem = current.filters.OR.find(
      (item) =>
        quickSearchFieldNames.includes(item.name) &&
        currentQuickNames.has(item.name) &&
        typeof item.value === 'string' &&
        !isEmptyFilterValue(item.value),
    );
    return typeof appliedQuickItem?.value === 'string' ? appliedQuickItem.value : '';
  }

  function openAdvancedSearch(): void {
    const current = store.getState().searchForm;
    const panelNames = new Set(filterFields.map(({ field }) => field.getName()));
    const values: Record<string, unknown> = {};
    for (const name of panelNames) values[name] = '';
    for (const item of current.filters.AND) {
      if (!panelNames.has(item.name)) continue;
      values[item.name] = item.value;
    }

    const appliedQuickValue = appliedQuickSearchValue(current);
    const hasAppliedQuickSearch = appliedQuickValue !== '';
    const hasQuickFieldAndClause = current.filters.AND.some((item) =>
      quickSearchFieldNames.includes(item.name),
    );
    const defaultToUnifiedSearch =
      hasAppliedQuickSearch || (quickSearchFieldNames.length >= 2 && !hasQuickFieldAndClause);

    setFilterValues(values);
    setFilterOperators((previous) => {
      const next: Record<string, QueryConditionType | undefined> = {};
      for (const [name, operator] of Object.entries(previous)) {
        if (!isEmptyFilterValue(values[name])) next[name] = operator;
      }
      return next;
    });
    setUseUnifiedSearch(defaultToUnifiedSearch);
    setUnifiedSearchValue(appliedQuickValue);
    setAdvancedSearchOpen(true);
  }

  function closeAdvancedSearch(): void {
    setQuickSearchValue(appliedQuickSearchValue(store.getState().searchForm));
    setAdvancedSearchOpen(false);
  }

  function resetColumnFilter(name: string): void {
    setFilterValues((prev) => ({ ...prev, [name]: '' }));
    setFilterOperators((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
    const next = store.getState().searchForm.clone();
    next.filters.AND = next.filters.AND.filter((item) => item.name !== name);
    next.page = 0;
    void store.getState().setSearchForm(next);
  }

  function applyFilterValues(
    fields: DerivedFilterField[] = filterFields,
    includeUnifiedSearch = false,
  ): void {
    const items: FilterItem[] = [];
    for (const { field } of fields) {
      if (
        includeUnifiedSearch &&
        useUnifiedSearch &&
        quickSearchFieldNames.length >= 2 &&
        quickSearchFieldNames.includes(field.getName())
      ) {
        continue;
      }
      const value = filterValues[field.getName()];
      if (isEmptyFilterValue(value)) continue;
      items.push({
        name: field.getName(),
        value,
        queryConditionType: searchConditionFor(field, value, filterOperators[field.getName()]),
      });
    }
    const fieldNames = new Set(fields.map(({ field }) => field.getName()));
    const next = store.getState().searchForm.clone();
    next.filters.AND = next.filters.AND.filter((item) => !fieldNames.has(item.name));
    const withAndFilters = next.withFilter('AND', ...items);
    const finalSearch = includeUnifiedSearch
      ? withAndFilters.quickSearch(
          quickSearchFieldNames,
          useUnifiedSearch ? unifiedSearchValue : '',
        )
      : withAndFilters;
    if (includeUnifiedSearch) {
      setQuickSearchValue(useUnifiedSearch ? unifiedSearchValue : '');
    }
    void store.getState().setSearchForm(finalSearch);
  }

  function resetAdvancedSearch(): void {
    setFilterValues((previous) => {
      const next = { ...previous };
      for (const { field } of visibleAdvancedFilterFields) next[field.getName()] = '';
      return next;
    });
    setFilterOperators((previous) => {
      const next = { ...previous };
      for (const { field } of visibleAdvancedFilterFields) delete next[field.getName()];
      return next;
    });
    setUnifiedSearchValue('');
    setUseUnifiedSearch(false);
    setQuickSearchValue('');
    const fieldNames = new Set(visibleAdvancedFilterFields.map(({ field }) => field.getName()));
    const next = store.getState().searchForm.clone();
    next.filters.AND = next.filters.AND.filter((item) => !fieldNames.has(item.name));
    void store.getState().setSearchForm(next.quickSearch(quickSearchFieldNames, ''));
  }

  function runQuickSearch(value: string): void {
    void store.getState().quickSearch(quickSearchFieldNames, value);
  }

  function openRowInNewWindow(row: Record<string, unknown>, rowKey: string): void {
    if (!openInNewWindow?.enabled) return;
    const storageKey = `popup_size:${window.location.pathname}`;
    let width: number;
    let height: number;

    try {
      const savedSize = window.localStorage.getItem(storageKey);
      if (savedSize) {
        const parsed = JSON.parse(savedSize) as { width?: number; height?: number };
        width = Math.min(parsed.width || 1200, window.screen.availWidth);
        height = Math.min(parsed.height || 800, window.screen.availHeight);
      } else {
        width = Math.min(openInNewWindow.windowFeatures?.width || 1200, window.screen.availWidth);
        height = Math.min(openInNewWindow.windowFeatures?.height || 800, window.screen.availHeight);
      }
    } catch {
      width = Math.min(openInNewWindow.windowFeatures?.width || 1200, window.screen.availWidth);
      height = Math.min(openInNewWindow.windowFeatures?.height || 800, window.screen.availHeight);
    }

    const popup = window.open(
      openInNewWindow.getUrl(row),
      `entity_${rowKey}`,
      openWindowFeatures(width, height),
    );
    if (!popup) return;

    let lastWidth = width;
    let lastHeight = height;
    const sizeTracker = window.setInterval(() => {
      try {
        if (popup.closed) {
          window.clearInterval(sizeTracker);
          return;
        }
        const popupWidth = popup.outerWidth;
        const popupHeight = popup.outerHeight;
        if (
          popupWidth > 0 &&
          popupHeight > 0 &&
          (popupWidth !== lastWidth || popupHeight !== lastHeight)
        ) {
          lastWidth = popupWidth;
          lastHeight = popupHeight;
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ width: popupWidth, height: popupHeight }),
          );
        }
      } catch {
        window.clearInterval(sizeTracker);
      }
    }, 1000);
  }

  const showSearchbar =
    quickSearchFields.length > 0 ||
    filterFields.length > 0 ||
    toolbar !== undefined ||
    (columnSettings && resolvedColumns.length >= 2);

  return (
    <div
      className="rcm-listgrid-panel rcm-listgrid-panel-main"
      data-list-grid={entityForm.name}
      style={{ position: 'relative' }}
    >
      <LoadingOverlay visible={loading} />

      {showSearchbar && (
        <div className="rcm-listgrid-searchbar">
          <div className="rcm-listgrid-searchbar-inner">
            {quickSearchFields.length > 0 && !advancedSearchOpen && (
              <div
                className="rcm-quick-search-wrap"
                onKeyUp={(event) => {
                  if (event.key === 'Enter') runQuickSearch(quickSearchValue);
                }}
              >
                <TextInput
                  className="rcm-input rcm-quick-search-input"
                  ariaLabel={labels.quickSearchAria}
                  value={quickSearchValue}
                  placeholder={quickSearchPlaceholder}
                  disabled={loading}
                  onChange={setQuickSearchValue}
                />
                <span className="rcm-quick-search-addon rcm-quick-search-addon-search">
                  <button
                    type="button"
                    className="rcm-quick-search-btn"
                    aria-label={labels.quickSearchSubmitAria}
                    disabled={loading}
                    onClick={() => {
                      if (quickSearchValue !== '') runQuickSearch(quickSearchValue);
                    }}
                  >
                    <svg
                      className="rcm-quick-search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                      <path d="M21 21l-6 -6" />
                    </svg>
                  </button>
                </span>
                {quickSearchValue !== '' && (
                  <span className="rcm-quick-search-addon rcm-quick-search-addon-clear">
                    <button
                      type="button"
                      className="rcm-quick-search-btn"
                      aria-label={labels.quickSearchClearAria}
                      disabled={loading}
                      onClick={() => {
                        setQuickSearchValue('');
                        runQuickSearch('');
                      }}
                    >
                      <svg
                        className="rcm-quick-search-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                        <path d="M10 10l4 4m0 -4l-4 4" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="rcm-search-bar-actions" data-list-grid-toolbar>
              {toolbar?.({ checkedIds: effectiveCheckedIds })}
              {columnSettings && resolvedColumns.length >= 2 && (
                <div
                  className="rcm-column-settings-anchor"
                  data-column-settings-toggle
                  ref={columnSettingsRef}
                >
                  <Button type="button" onClick={() => setColumnSettingsOpen((open) => !open)}>
                    {labels.columnSettings}
                  </Button>
                  {columnSettingsOpen && (
                    <div className="rcm-column-settings" data-column-settings>
                      <div className="rcm-column-settings-grid">
                        {resolvedColumns.map((column) => {
                          const visible = !hiddenColumnNames.has(column.name);
                          return (
                            <label className="rcm-column-settings-item" key={column.name}>
                              <CheckBox
                                ariaLabel={column.header}
                                checked={visible}
                                disabled={visible && visibleColumns.length === 1}
                                onChange={(checked) => toggleColumnVisibility(column.name, checked)}
                              />
                              <span>{column.header}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {filterFields.length > 0 && (
                <Button type="button" onClick={openAdvancedSearch}>
                  {labels.advancedSearchToggle}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {filterFields.length > 0 && advancedSearchOpen && (
        <div className="rcm-adv-search-outer" data-advanced-search={entityForm.name}>
          <div
            className="rcm-adv-search-inner rcm-adv-search-inner-panel"
            data-advanced-search-panel
          >
            <div className="rcm-adv-search-header">
              <div className="rcm-adv-search-header-left">
                <svg
                  className="rcm-adv-search-header-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
                <span className="rcm-text" data-weight="semibold">
                  {labels.advancedSearchToggle}
                </span>
                <span className="rcm-adv-search-count">
                  {displayedAdvancedFilterFields.length}개 필드
                </span>
              </div>
              <div className="rcm-adv-search-header-right">
                <button
                  type="button"
                  className="rcm-adv-search-view-toggle"
                  title={advancedSearchGridView ? '리스트 뷰' : '그리드 뷰'}
                  onClick={() => setAdvancedSearchGridView((gridView) => !gridView)}
                >
                  <svg
                    className="rcm-adv-search-view-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {advancedSearchGridView ? (
                      <>
                        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                        <path d="M4 14m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                      </>
                    ) : (
                      <>
                        <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {quickSearchFields.length >= 2 && (
              <>
                <div className="rcm-adv-search-qs-toggle">
                  <label className="rcm-adv-search-qs-label">
                    <CheckBox
                      className="rcm-adv-search-qs-checkbox"
                      ariaLabel={labels.unifiedSearchToggle}
                      checked={useUnifiedSearch}
                      onChange={setUseUnifiedSearch}
                    />
                    <span className="rcm-adv-search-qs-title">{labels.unifiedSearchToggle}</span>
                  </label>
                  <span className="rcm-adv-search-qs-hint">
                    {labels.unifiedSearchHint(quickSearchFieldLabels)}
                  </span>
                </div>
                {useUnifiedSearch && (
                  <div className="rcm-adv-search-qs-input-panel">
                    <label className="rcm-adv-search-qs-input-label" htmlFor="unified-search">
                      {labels.unifiedSearchInputLabel(quickSearchFieldLabels)}
                    </label>
                    <TextInput
                      className="rcm-input"
                      id="unified-search"
                      value={unifiedSearchValue}
                      placeholder={labels.unifiedSearchPlaceholder(quickSearchFieldLabels)}
                      onChange={setUnifiedSearchValue}
                    />
                    <div className="rcm-adv-search-qs-description">
                      {labels.unifiedSearchDescription(quickSearchFieldLabels)}
                    </div>
                  </div>
                )}
              </>
            )}

            <AdvancedFieldSelector
              availableFields={visibleAdvancedFilterFields}
              selectedFieldNames={selectedAdvancedFilterFieldNames}
              onToggleField={toggleAdvancedFilterField}
              onSelectAll={selectAllAdvancedFilterFields}
              onDeselectAll={() => setSelectedAdvancedFilterFieldNames(new Set())}
            />

            {displayedAdvancedFilterFields.length > 0 ? (
              <div
                className={advancedSearchGridView ? 'rcm-adv-search-grid' : 'rcm-adv-search-list'}
              >
                {displayedAdvancedFilterFields.map(({ field, config }) => {
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
                          onChange={(v, operator) => setFilterValue(field.getName(), v, operator)}
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
            ) : (
              <div className="rcm-adv-search-empty">
                <p className="rcm-adv-search-empty-text">검색할 필드를 선택해주세요</p>
                <button
                  type="button"
                  onClick={selectAllAdvancedFilterFields}
                  className="rcm-adv-search-empty-action"
                >
                  전체 필드 선택
                </button>
              </div>
            )}
            <div className="rcm-adv-search-footer">
              <button
                type="button"
                className="rcm-button rcm-adv-search-btn"
                data-variant="outline"
                data-size="sm"
                data-advanced-search-close
                onClick={closeAdvancedSearch}
              >
                <svg
                  className="rcm-m2o-action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
                {labels.advancedSearchClose}
              </button>
              <button
                type="button"
                className="rcm-button rcm-adv-search-btn"
                data-variant="outline"
                data-color="error"
                data-size="sm"
                data-advanced-search-reset
                onClick={resetAdvancedSearch}
              >
                <svg
                  className="rcm-m2o-action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>
                {labels.advancedSearchReset}
              </button>
              <button
                type="button"
                className="rcm-button rcm-adv-search-btn rcm-adv-search-btn-submit"
                data-variant="primary"
                data-size="sm"
                data-advanced-search-apply
                onClick={() => applyFilterValues(visibleAdvancedFilterFields, true)}
              >
                <svg
                  className="rcm-m2o-action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
                {labels.advancedSearchApply}
              </button>
            </div>
          </div>
        </div>
      )}

      {error !== undefined && (
        <div data-list-error className="rcm-listgrid-error" role="alert">
          <span>{labels.searchError}</span>
          <button
            type="button"
            data-list-error-dismiss
            aria-label={labels.searchErrorDismiss}
            onClick={() => store.getState().clearError()}
          >
            ×
          </button>
        </div>
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
              {openInNewWindow?.enabled && (
                <Table.Th className="rcm-skeleton-td-newwin">{null}</Table.Th>
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
                const filterContent = (
                  <>
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
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
                                        onChange={(next, operator) =>
                                          setFilterValue(field.getName(), next, operator)
                                        }
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
                                        applyFilterValues([filterField]);
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
                      {c.header}
                      <SortIndicator direction={ariaSortFor(currentDirection)} />
                      {filterContent}
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
                      {c.header}
                      {filterContent}
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
                    visibleColumns.length +
                      (selection?.enabled || showRowNumbers ? 1 : 0) +
                      (openInNewWindow?.enabled ? 1 : 0),
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
                  {openInNewWindow?.enabled && (
                    <td className="rcm-skeleton-td-newwin">
                      {(openInNewWindow.showFilter?.(row) ?? true) && (
                        <button
                          type="button"
                          className="rcm-newwin-btn"
                          data-row-new-window
                          title={openInNewWindow.tooltip ?? labels.openInNewWindowTooltip}
                          aria-label={openInNewWindow.tooltip ?? labels.openInNewWindowTooltip}
                          onClick={(event) => {
                            event.stopPropagation();
                            openRowInNewWindow(row, selectionId);
                          }}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
                            <path d="M11 13l9 -9" />
                            <path d="M15 4h5v5" />
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
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

      {selection?.enabled && selection.showConfirm !== false && checkedIds.length > 0 && (
        <div data-selection-actions>
          <Button type="button" onClick={() => selection.onConfirm(checkedIds)}>
            {selection.confirmLabel ?? labels.selectionConfirm}
          </Button>
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
