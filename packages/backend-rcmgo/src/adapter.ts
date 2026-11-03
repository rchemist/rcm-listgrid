import type {
  BackendAdapter,
  BackendError,
  BackendErrorCode,
  FilterItem,
  PageResult,
  PageTotalRelation,
  SearchForm,
} from '@listgrid/schema-core';

/** Flat query params the list GET carries (`string[]` renders repeated keys). */
export type RcmgoParams = Record<string, string | string[]>;

export interface RcmgoAdapterOptions {
  /** Prefixed to every url (e.g. an API origin). Defaults to '' — same-origin. */
  baseUrl?: string;
  /** Injectable fetch (tests, non-global runtimes). Defaults to global fetch. */
  fetch?: typeof fetch;
  /**
   * Extra headers merged into every request (e.g. Authorization).
   * Accepts a plain object (static) or a thunk resolved per-request so a
   * header value can change between calls without recreating the adapter.
   */
  headers?: Record<string, string> | (() => Record<string, string>);
  /**
   * Optional per-adapter asset-server base — forwarded verbatim onto the
   * returned adapter's `BackendAdapter.assetBaseUrl` (tier i in the asset-URL
   * resolution design). Resolves RELATIVE asset paths; absolute URLs pass
   * through. Orthogonal to `baseUrl` (the CRUD transport origin).
   */
  assetBaseUrl?: string;
  /** Cursor query key. Defaults to `'cursor'`. */
  cursorParam?: string;
  /** Page-size query key. Defaults to `'page_size'` (`'limit'` on some endpoints). */
  sizeParam?: string;
  /**
   * Response keys holding the row array, first present array wins.
   * Defaults to `['items', 'rows', 'data']` (all shapes observed on Go
   * endpoints to date). A page matching none of these is a wire mismatch
   * and throws with the tried keys named.
   */
  dataKeys?: string[];
  /**
   * Response keys holding an exact total, first present finite number wins.
   * Defaults to `[]` — no Go list endpoint returns a total today, so pages
   * report `totalRelation: 'unknown'` unless an endpoint grows one.
   */
  totalKeys?: string[];
  /**
   * Map a SearchForm's sorts/filters to flat query params. Defaults to
   * {@link defaultRcmgoParams} (AND EQUAL/IN only — anything else throws,
   * naming this override). Per-endpoint mappers translate chips to the
   * endpoint's own flat params (`from`/`to`/`site_id`, …).
   */
  params?: (search: SearchForm) => RcmgoParams;
  /**
   * Cursor chains remembered (one per distinct list query). Defaults to
   * 50; the oldest chain is evicted past the cap. Chains are tiny
   * (one cursor string per fetched page) but unbounded growth across
   * ever-changing filters would leak.
   */
  maxChains?: number;
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

/** Go error envelope (`{error: {code, message, params, details, …}}`). */
interface GoErrorBody {
  code?: unknown;
  message?: unknown;
  params?: unknown;
}

/** Backend codes that mean "re-authenticate", whatever the status. */
const reauthCodes = new Set(['unauthenticated', 'session_expired', 'login_required']);

async function parseGoError(response: Response): Promise<BackendError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  const envelope = (body ?? {}) as { error?: unknown; message?: unknown };
  const err = (
    envelope.error !== null && typeof envelope.error === 'object' ? envelope.error : {}
  ) as GoErrorBody;
  const message =
    (typeof err.message === 'string' ? err.message : undefined) ??
    (typeof envelope.message === 'string' ? envelope.message : undefined) ??
    `Request failed with status ${response.status}`;

  let code: BackendErrorCode;
  if (response.status === 401 || (typeof err.code === 'string' && reauthCodes.has(err.code))) {
    code = 'TOKEN_EXPIRED';
  } else if (response.status === 403) {
    code = 'FORBIDDEN';
  } else if (response.status === 400 || response.status === 422) {
    code = 'VALIDATION';
  } else {
    code = 'UNKNOWN';
  }

  const error: BackendError = { code, message };
  const fieldErrors = extractFieldErrors(err);
  if (fieldErrors !== undefined) error.fieldErrors = fieldErrors;
  return error;
}

function extractFieldErrors(err: GoErrorBody): Record<string, string[]> | undefined {
  // `invalid_input` names its field in `params.field` — the one reliably
  // field-keyed shape. Anything else rides the message alone.
  if (err.params !== null && typeof err.params === 'object') {
    const field = (err.params as Record<string, unknown>).field;
    const message = typeof err.message === 'string' ? err.message : undefined;
    if (typeof field === 'string' && field !== '' && message !== undefined) {
      return { [field]: [message] };
    }
  }
  return undefined;
}

function isBlankName(name: string | undefined | null): boolean {
  return name === undefined || name === null || name.trim().length === 0;
}

function stringifyFilterValue(item: FilterItem): string {
  if (item.value === undefined || item.value === null) {
    throw new Error(
      `[@listgrid/backend-rcmgo] filter "${item.name}" has no value — ` +
        `null filters need a per-endpoint params mapper (see RcmgoAdapterOptions.params).`,
    );
  }
  return String(item.value);
}

/**
 * Default SearchForm → query mapping: AND EQUAL as flat `name=value`,
 * AND IN as repeated keys. Everything else the Go endpoints cannot
 * express — sorts, OR/NOT groups, nested groups, joins, negations, any
 * other operator — throws naming the `params` override. Never silently
 * drops a clause: an unhonored filter would return wrong (unfiltered)
 * rows.
 */
export function defaultRcmgoParams(search: SearchForm): RcmgoParams {
  if (search.sorts.length > 0) {
    throw new Error(
      '[@listgrid/backend-rcmgo] sorts are not supported by Go list endpoints — ' +
        'do not enable sort UI, or supply RcmgoAdapterOptions.params for an endpoint with sort params.',
    );
  }
  if (search.filters.OR.length > 0 || search.filters.NOT.length > 0) {
    throw new Error(
      '[@listgrid/backend-rcmgo] OR/NOT filter groups need a per-endpoint params mapper ' +
        '(see RcmgoAdapterOptions.params).',
    );
  }
  const params: RcmgoParams = {};
  for (const item of search.filters.AND) {
    if (isBlankName(item.name)) {
      throw new Error(
        '[@listgrid/backend-rcmgo] blank filter name — filters need a name to map to query params.',
      );
    }
    if (item.subFilters !== undefined || item.joinType !== undefined || item.not === true) {
      throw new Error(
        `[@listgrid/backend-rcmgo] filter "${item.name}" uses a nested group, join, or negation — ` +
          `supply RcmgoAdapterOptions.params to translate it.`,
      );
    }
    const op = item.queryConditionType;
    if (op === undefined || op === 'EQUAL') {
      params[item.name] = stringifyFilterValue(item);
    } else if (op === 'IN') {
      const values = item.values ?? (Array.isArray(item.value) ? item.value : undefined);
      if (values === undefined) {
        throw new Error(
          `[@listgrid/backend-rcmgo] IN filter "${item.name}" needs values — ` +
            `supply RcmgoAdapterOptions.params to translate it.`,
        );
      }
      params[item.name] = values.map(String);
    } else {
      throw new Error(
        `[@listgrid/backend-rcmgo] filter "${item.name}" uses ${op} — ` +
          `supply RcmgoAdapterOptions.params to translate it.`,
      );
    }
  }
  return params;
}

/** Next-cursor readers for both observed envelopes (`page.next_cursor`, top-level `next_cursor`). */
function readNextCursor(payload: Record<string, unknown>): string | null {
  const page = payload.page;
  const candidates = [
    page !== null && typeof page === 'object'
      ? (page as Record<string, unknown>).next_cursor
      : undefined,
    payload.next_cursor,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate !== '') return candidate;
  }
  return null;
}

function readRows(payload: Record<string, unknown>, dataKeys: string[], url: string): WireRow[] {
  for (const key of dataKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value as WireRow[];
  }
  throw new Error(
    `[@listgrid/backend-rcmgo] ${url} returned no row array — ` +
      `tried dataKeys [${dataKeys.join(', ')}]; set RcmgoAdapterOptions.dataKeys for this endpoint.`,
  );
}

function readTotal(payload: Record<string, unknown>, totalKeys: string[]): number | undefined {
  for (const key of totalKeys) {
    const value = payload[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  }
  return undefined;
}

/** Fingerprint of everything identifying a cursor chain except the page itself. */
function chainKey(url: string, search: SearchForm): string {
  const json = search.toJSON();
  return JSON.stringify({
    u: url,
    s: search.pageSize,
    o: json.sorts,
    f: json.filters,
    q: json.quickSearchFields,
  });
}

/**
 * BackendAdapter for Go (rcm-go) backends (CB-05).
 *
 * Wire contract:
 *   list:   GET {baseUrl}{url}?{cursor}&{size}={pageSize}&…filters
 *           rows from the first present `dataKeys` array, next cursor from
 *           `page.next_cursor` or top-level `next_cursor`, exact total from
 *           the first present `totalKeys` number (none by default).
 *   getOne: GET  {baseUrl}{url}/{id}
 *   create: POST {baseUrl}{url}
 *   update/remove: unsupported — Go admin mutations are per-endpoint
 *           actions (`POST …:verb`), so hosts call the endpoint client
 *           directly instead of these two methods.
 *
 * Cursor chains are replayed inside the adapter: page N reuses the cached
 * cursor and a forward jump prefetches the missing links, so the
 * page-driven store and paginator work unchanged. Without a server total
 * the adapter reports `totalElements: 0` (row numbers hide),
 * `totalPages` growing one page ahead while `hasMore` is set, and
 * `totalRelation: 'unknown'`.
 */
export function createRcmgoAdapter(opts: RcmgoAdapterOptions = {}): BackendAdapter {
  const baseUrl = opts.baseUrl ?? '';
  const doFetch = opts.fetch ?? fetch;
  const cursorParam = opts.cursorParam ?? 'cursor';
  const sizeParam = opts.sizeParam ?? 'page_size';
  const dataKeys = opts.dataKeys ?? ['items', 'rows', 'data'];
  const totalKeys = opts.totalKeys ?? [];
  const buildParams = opts.params ?? defaultRcmgoParams;
  const maxChains = opts.maxChains ?? 50;
  // chainKey → next-cursor after each fetched page (cursor FOR page i+1).
  // Capped (oldest evicted): a fresh chain per distinct query would
  // otherwise grow without bound across ever-changing filters.
  const chains = new Map<string, (string | null)[]>();
  function chainFor(key: string): (string | null)[] {
    let chain = chains.get(key);
    if (chain === undefined) {
      chain = [];
      chains.set(key, chain);
      while (chains.size > maxChains) {
        const oldest = chains.keys().next();
        if (oldest.done === true) break;
        chains.delete(oldest.value);
      }
    }
    return chain;
  }
  // Resolved at each call site (not captured once) so a functional `headers`
  // option is re-evaluated per request — CAP-24 lazy header evaluation.
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
      throw new BackendAdapterError(await parseGoError(response));
    }

    return response;
  }

  function query(search: SearchForm, cursor: string | undefined): string {
    const params = new URLSearchParams();
    if (cursor !== undefined) params.set(cursorParam, cursor);
    params.set(sizeParam, String(search.pageSize));
    for (const [name, value] of Object.entries(buildParams(search))) {
      if (Array.isArray(value)) {
        for (const entry of value) params.append(name, entry);
      } else {
        params.set(name, value);
      }
    }
    return params.toString();
  }

  async function fetchPage(
    url: string,
    search: SearchForm,
    cursor: string | undefined,
  ): Promise<{ rows: WireRow[]; next: string | null; total: number | undefined }> {
    const response = await request(`${url}?${query(search, cursor)}`, { method: 'GET' });
    const payload = (await response.json()) as Record<string, unknown>;
    return {
      rows: readRows(payload, dataKeys, url),
      next: readNextCursor(payload),
      total: readTotal(payload, totalKeys),
    };
  }

  function result<T>(
    rows: WireRow[],
    page: number,
    size: number,
    next: string | null,
    total: number | undefined,
  ): PageResult<T> {
    const relation: PageTotalRelation = total === undefined ? 'unknown' : 'exact';
    return {
      content: rows.map((row) => coerceRow<T>(row)),
      totalElements: total ?? 0,
      totalPages:
        total === undefined
          ? page + 1 + (next !== null ? 1 : 0)
          : Math.max(1, Math.ceil(total / size)),
      totalRelation: relation,
      hasMore: next !== null,
    };
  }

  return {
    async list<T = Record<string, unknown>>(
      url: string,
      search: SearchForm,
    ): Promise<PageResult<T>> {
      const key = chainKey(url, search);
      const chain = chainFor(key);
      const target = Math.max(0, search.page);
      // Prefetch the missing links so a forward jump lands on its cursor.
      // Sequential by necessity — each link needs the previous cursor.
      // A chain that ends early answers the target as an empty last page.
      for (let page = chain.length; page < target; page += 1) {
        const cursor = page === 0 ? undefined : (chain[page - 1] ?? undefined);
        if (page > 0 && cursor === undefined) {
          return result<T>([], target, search.pageSize, null, undefined);
        }
        const prefetched = await fetchPage(url, search, cursor);
        chain.push(prefetched.next);
        if (prefetched.next === null && page + 1 <= target) {
          return result<T>([], target, search.pageSize, null, undefined);
        }
      }
      const cursor = target === 0 ? undefined : (chain[target - 1] ?? undefined);
      if (target > 0 && cursor === undefined) {
        return result<T>([], target, search.pageSize, null, undefined);
      }
      const fetched = await fetchPage(url, search, cursor);
      chain[target] = fetched.next;
      return result<T>(fetched.rows, target, search.pageSize, fetched.next, fetched.total);
    },

    async getOne<T = Record<string, unknown>>(url: string, id: string): Promise<T> {
      const response = await request(`${url}/${id}`, { method: 'GET' });
      return (await response.json()) as T;
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

    async update(): Promise<never> {
      throw new BackendAdapterError({
        code: 'UNKNOWN',
        message:
          '@rchemist/listgrid/backend-rcmgo does not implement update: Go admin mutations ' +
          'are per-endpoint actions (POST …:verb) — call the endpoint client directly.',
      });
    },

    async remove(): Promise<never> {
      throw new BackendAdapterError({
        code: 'UNKNOWN',
        message:
          '@rchemist/listgrid/backend-rcmgo does not implement remove: Go admin mutations ' +
          'are per-endpoint actions (POST …:verb) — call the endpoint client directly.',
      });
    },
    // tier i asset base — forwarded verbatim; conditional so an omitted option
    // doesn't set `assetBaseUrl: undefined` (exactOptionalPropertyTypes).
    ...(opts.assetBaseUrl !== undefined ? { assetBaseUrl: opts.assetBaseUrl } : {}),
  };
}
