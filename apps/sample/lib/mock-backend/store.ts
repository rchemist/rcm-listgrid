// Generic in-memory fixture store for the mock rcm backend (apps/sample P1
// scaffold — documents/prd/sample-site-spec.md).
//
// Resets on every process restart (`npm run dev -w apps/sample` again) —
// persistence across restarts is explicitly out of scope for P1. Within a
// running dev server, CRUD must round-trip: a create/update/delete has to
// be visible to a subsequent search.
//
// The store is cached on `globalThis` (not just a module-level variable)
// because Next.js dev-mode Fast Refresh can re-evaluate route modules; a
// plain module-level singleton would silently reset fixture state on every
// edit-triggered recompile. This is the same pattern used for dev-mode
// Prisma-client singletons.

import type { FilterItem } from '@listgrid/schema-core';

export type WithId = { id: string; [key: string]: unknown };

/** The exact `filters` shape SearchForm.toJSON() puts on the wire. */
export interface SearchFilters {
  AND: FilterItem[];
  OR: FilterItem[];
}

// EC3 — real filter application (previously EVERY mock search handler
// ignored `body.filters` entirely and just paginated all rows; harmless for
// every entity ported so far since none of their e2e scenarios depended on
// server-side filtering, but Major's XrefMapping IN/NOT_IN display+picker
// queries and the staffs async domain filter (assistant=true) both NEED the
// backend to actually narrow rows — otherwise every professor/staff would
// show in both the display grid and the picker regardless of mapped state).
// Minimal condition-type coverage — only what an audited filter channel in
// this app actually emits (SearchForm.QueryConditionType has more; unused
// ones fall through the `default: true` no-op below, same as the old
// ignore-everything behavior).
function matchesFilter(row: WithId, filter: FilterItem): boolean {
  const rowValue = row[filter.name];
  let result: boolean;
  switch (filter.queryConditionType ?? 'EQUAL') {
    case 'EQUAL':
      result = String(rowValue) === String(filter.value);
      break;
    case 'NOT_EQUAL':
      result = String(rowValue) !== String(filter.value);
      break;
    case 'IN':
      result =
        Array.isArray(filter.values) && filter.values.some((v) => String(v) === String(rowValue));
      break;
    case 'NOT_IN':
      result = !(
        Array.isArray(filter.values) && filter.values.some((v) => String(v) === String(rowValue))
      );
      break;
    case 'LIKE':
      result =
        typeof rowValue === 'string' && typeof filter.value === 'string'
          ? rowValue.toLowerCase().includes(filter.value.toLowerCase())
          : false;
      break;
    default:
      result = true;
  }
  return filter.not ? !result : result;
}

function matchesFilterGroup(row: WithId, filters?: SearchFilters): boolean {
  if (!filters) return true;
  const andOk = filters.AND.every((f) => matchesFilter(row, f));
  const orOk = filters.OR.length === 0 || filters.OR.some((f) => matchesFilter(row, f));
  return andOk && orOk;
}

function nextId(rows: WithId[]): string {
  const max = rows.reduce((acc, row) => {
    const n = Number(row.id);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return String(max + 1);
}

export class EntityStore<T extends WithId> {
  private rows: T[];

  constructor(seed: T[]) {
    this.rows = [...seed];
  }

  search(
    page = 0,
    pageSize = 20,
    filters?: SearchFilters,
  ): { content: T[]; totalElements: number; totalPages: number } {
    const filtered = filters
      ? this.rows.filter((row) => matchesFilterGroup(row, filters))
      : this.rows;
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / Math.max(pageSize, 1)));
    const start = page * pageSize;
    const content = filtered.slice(start, start + pageSize);
    return { content, totalElements, totalPages };
  }

  findById(id: string): T | undefined {
    return this.rows.find((row) => row.id === id);
  }

  create(data: Partial<T>): T {
    const id = nextId(this.rows);
    const row = { ...data, id } as T;
    this.rows.push(row);
    return row;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const idx = this.rows.findIndex((row) => row.id === id);
    if (idx === -1) return undefined;
    const existing = this.rows[idx] as T;
    const updated = { ...existing, ...data, id } as T;
    this.rows[idx] = updated;
    return updated;
  }

  remove(id: string): T | undefined {
    const idx = this.rows.findIndex((row) => row.id === id);
    if (idx === -1) return undefined;
    const [removed] = this.rows.splice(idx, 1);
    return removed;
  }
}

type StoreRegistry = Map<string, EntityStore<WithId>>;

const globalForStores = globalThis as unknown as { __listgridMockStores?: StoreRegistry };

function registry(): StoreRegistry {
  if (!globalForStores.__listgridMockStores) {
    globalForStores.__listgridMockStores = new Map();
  }
  return globalForStores.__listgridMockStores;
}

/**
 * Get (or lazily create) the singleton in-memory store for `entityName`.
 * More entities can be wired up later by calling this with a different name
 * and seed — P1 only needs `employee`.
 */
export function getOrCreateStore<T extends WithId>(entityName: string, seed: T[]): EntityStore<T> {
  const reg = registry();
  if (!reg.has(entityName)) {
    reg.set(entityName, new EntityStore<WithId>(seed));
  }
  return reg.get(entityName) as unknown as EntityStore<T>;
}
