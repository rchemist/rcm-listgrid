// @listgrid/backend-rest — generic REST reference adapter (ADR-0005 §5).
//
// A minimal, non-RCM-framework BackendAdapter implementation. It exists to
// prove ADR-0005 §Decision-5 — the BackendAdapter contract is pluggable by a
// plain REST backend, not only rcm-framework's dual-envelope/bulk-delete
// wire contract (see @listgrid/backend-rcm). This is a doc example /
// reference adapter: minimal, not feature-rich — see per-method comments
// below for the exact (small) scope this covers.
import type {
  BackendAdapter,
  BackendError,
  BackendErrorCode,
  PageResult,
  SearchForm,
} from '@listgrid/schema-core';

export interface RestAdapterOptions {
  /** Prefixed to every url (e.g. an API origin). Defaults to '' — same-origin. */
  baseUrl?: string;
  /** Injectable fetch (tests, non-global runtimes). Defaults to global fetch. */
  fetch?: typeof fetch;
  /**
   * Extra headers merged into every request (e.g. Authorization).
   * Accepts a plain object (static) or a thunk resolved per-request so a
   * header value (e.g. a rotating token) can change between calls without
   * recreating the adapter.
   */
  headers?: Record<string, string> | (() => Record<string, string>);
  /**
   * Optional per-adapter asset-server base — forwarded verbatim onto the
   * returned adapter's `BackendAdapter.assetBaseUrl` (tier i in the asset-URL
   * resolution design). Resolves RELATIVE asset paths; absolute URLs pass
   * through. Orthogonal to `baseUrl` (the CRUD transport origin).
   */
  assetBaseUrl?: string;
}

/** Row shape coming back over the wire before id-coercion (D2: ids are always strings). */
type WireRow = { id?: unknown; [key: string]: unknown };

function coerceRow<T>(row: WireRow): T {
  return { ...row, id: String(row.id) } as unknown as T;
}

class BackendAdapterError extends Error implements BackendError {
  code: BackendErrorCode;
  fieldErrors?: Record<string, string[]>;
  globalErrors?: string[];

  constructor(err: BackendError) {
    super(err.message);
    this.name = 'BackendAdapterError';
    this.code = err.code;
    if (err.fieldErrors !== undefined) this.fieldErrors = err.fieldErrors;
    if (err.globalErrors !== undefined) this.globalErrors = err.globalErrors;
  }
}

/**
 * Minimal status→code mapping (ADR-0005 §5). Unlike @listgrid/backend-rcm's
 * `parseBackendError`, this does NOT parse a ProblemDetail/RFC7807 response
 * body — that is rcm-backend-framework-specific, and inventing a REST
 * error-body convention here would exceed what ADR-0005 §5 specifies. The
 * message is always the generic status message.
 */
function parseError(response: Response): BackendError {
  let code: BackendErrorCode;
  if (response.status === 401) {
    code = 'TOKEN_EXPIRED';
  } else if (response.status === 403) {
    code = 'FORBIDDEN';
  } else if (response.status === 400 || response.status === 422) {
    code = 'VALIDATION';
  } else {
    code = 'UNKNOWN';
  }

  return { code, message: `Request failed with status ${response.status}` };
}

/**
 * Minimal BackendAdapter implementation for a generic (non-RCM) REST
 * backend — the ADR-0005 §5 reference contract:
 *
 *   list:   GET    {baseUrl}{url}?page={search.page}&size={search.pageSize}
 *                  body = JSON array of rows; total count = `totalCount`
 *                  response header (NOT the body).
 *   getOne: GET    {baseUrl}{url}/{id}
 *   create: POST   {baseUrl}{url}            body = JSON.stringify(data)
 *   update: PUT    {baseUrl}{url}/{id}       body = JSON.stringify(data)
 *   remove: DELETE {baseUrl}{url}/{id}       per-row (no bulk endpoint) — one
 *                  request per id via Promise.all.
 *
 * This is intentionally minimal (ADR-0005 §5 "최소"): no ProblemDetail body
 * parsing, no filter/sort/quickSearch query mapping, no optimistic-lock
 * (`revision`) semantics.
 */
export function createRestAdapter(opts: RestAdapterOptions = {}): BackendAdapter {
  const baseUrl = opts.baseUrl ?? '';
  const doFetch = opts.fetch ?? fetch;
  // Resolved at each call site (not captured once) so a functional `headers`
  // option is re-evaluated per request (parity with @listgrid/backend-rcm).
  const resolveHeaders = (): Record<string, string> =>
    typeof opts.headers === 'function' ? opts.headers() : (opts.headers ?? {});

  async function request(path: string, init: RequestInit): Promise<Response> {
    const response = await doFetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...resolveHeaders(),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new BackendAdapterError(parseError(response));
    }

    return response;
  }

  return {
    async list<T = Record<string, unknown>>(
      url: string,
      search: SearchForm,
    ): Promise<PageResult<T>> {
      // DECIDED (ADR-0005 §Decision-5, §5): mapping scope is page/size ONLY.
      // ADR-0005 §5 specifies only `GET /?page=&size=` for the generic REST
      // reference adapter — it does not define a query-param convention for
      // search's filters/sorts/quickSearch, so mapping those here would
      // invent a REST convention outside the ADR's scope.
      const response = await request(`${url}?page=${search.page}&size=${search.pageSize}`, {
        method: 'GET',
      });

      const rows = (await response.json()) as WireRow[];
      const totalElements = Number(response.headers.get('totalCount') ?? 0);
      const totalPages = search.pageSize > 0 ? Math.ceil(totalElements / search.pageSize) : 0;

      return {
        content: rows.map((row) => coerceRow<T>(row)),
        totalElements,
        totalPages,
      };
    },

    async getOne<T = Record<string, unknown>>(url: string, id: string): Promise<T> {
      const response = await request(`${url}/${id}`, { method: 'GET' });
      return coerceRow<T>((await response.json()) as WireRow);
    },

    async create<T = Record<string, unknown>>(
      url: string,
      data: Record<string, unknown>,
    ): Promise<T> {
      const response = await request(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return (await response.json()) as T;
    },

    async update<T = Record<string, unknown>>(
      url: string,
      id: string,
      data: Record<string, unknown>,
    ): Promise<T> {
      const response = await request(`${url}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return (await response.json()) as T;
    },

    // `revision` (optimistic-lock param) has no REST bulk-delete-body
    // equivalent — a minimal REST reference has no revision/optimistic-lock
    // semantics (ADR-0005 §5 "최소"), so it is accepted (contract parity)
    // but ignored.
    async remove(url: string, ids: string[]): Promise<void> {
      // REST has per-row delete (unlike rcm's bulk DELETE {url} with body
      // {ids}) — fire one DELETE {url}/{id} per id.
      await Promise.all(ids.map((id) => request(`${url}/${id}`, { method: 'DELETE' })));
    },
    // tier i asset base — forwarded verbatim; conditional so an omitted
    // option doesn't set `assetBaseUrl: undefined` (exactOptionalPropertyTypes).
    ...(opts.assetBaseUrl !== undefined ? { assetBaseUrl: opts.assetBaseUrl } : {}),
  };
}
