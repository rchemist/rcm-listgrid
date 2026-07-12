import type { SearchForm } from '../search/search-form';

// BackendAdapter contract (ADR-0005 §Decision 1). React-free. The concrete rcm
// adapter (POST /{url}/search, GET/POST/PUT /{url}/{id}, bulk DELETE {url}) lives
// in @listgrid/backend-rcm; the store depends only on this interface (dependency
// inversion — @listgrid/state never imports a transport).

/** A page of list results (dual-envelope absorbed by the adapter — decision D2). */
export interface PageResult<T = Record<string, unknown>> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

/** Structured error codes (ADR-0005) — replaces 0.3.x string-matching. */
export type BackendErrorCode = 'TOKEN_EXPIRED' | 'FORBIDDEN' | 'VALIDATION' | 'UNKNOWN';

export interface BackendError {
  code: BackendErrorCode;
  message: string;
  /** per-field validation messages (charter C5 server errors → field channel). */
  fieldErrors?: Record<string, string[]>;
}

export interface BackendAdapter {
  /** POST {url}/search with SearchForm body → normalized page. */
  list<T = Record<string, unknown>>(url: string, search: SearchForm): Promise<PageResult<T>>;
  /** GET {url}/{id} → the entity. */
  getOne<T = Record<string, unknown>>(url: string, id: string): Promise<T>;
  /** POST {url} → the created entity. */
  create<T = Record<string, unknown>>(url: string, data: Record<string, unknown>): Promise<T>;
  /** PUT {url}/{id} → the updated entity. */
  update<T = Record<string, unknown>>(
    url: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T>;
  /**
   * DELETE {url} with body {ids} — bulk (0.3.x has no per-row delete).
   * `revision` (spec §3.1/§6.2, CAP-07; W4-4) is OPTIONAL — additive, every
   * existing 2-arg caller stays valid unchanged. Passed by
   * `createFormController.delete` (@listgrid/state) as
   * `entityForm.getRevisionEntityName()`, which is itself `undefined` unless
   * `withRevision` was declared — an implementation includes it in the
   * request only when defined (0.3.x `EntityForm.tsx:468-470` conditional-
   * truthy injection parity, see `createRcmAdapter`'s implementation).
   */
  remove(url: string, ids: string[], revision?: string): Promise<void>;
  /**
   * Optional per-adapter asset-server base (tier i) for resolving RELATIVE
   * asset paths (image/file/profile/multipleAsset). Absolute URLs pass
   * through untouched. Plain data — React-free. When undefined, resolution
   * falls through to a host-global <AssetBaseProvider> then
   * NEXT_PUBLIC_ASSET_SERVER. Read by @listgrid/react's AdapterProvider into
   * an AssetBase context; never a module global.
   */
  assetBaseUrl?: string;
}
