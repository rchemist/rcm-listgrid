import type {
  BackendAdapter,
  BackendError,
  BackendErrorCode,
  PageResult,
  SearchForm,
} from '@listgrid/schema-core';

export interface RcmAdapterOptions {
  /** Prefixed to every url (e.g. an API origin). Defaults to '' — same-origin. */
  baseUrl?: string;
  /** Injectable fetch (tests, non-global runtimes). Defaults to global fetch. */
  fetch?: typeof fetch;
  /** Extra headers merged into every request (e.g. Authorization). */
  headers?: Record<string, string>;
}

/** Row shape coming back over the wire before id-coercion (D2: ids are always strings). */
type WireRow = { id?: unknown; [key: string]: unknown };

/** Dual-envelope list payload — Spring Page (0.1.0) or legacy (0.0.5). See RCM wire contract. */
interface ListPayload {
  content?: WireRow[];
  list?: WireRow[];
  totalElements?: number;
  totalCount?: number;
  totalPages?: number;
  totalPage?: number;
}

async function parseBackendError(response: Response): Promise<BackendError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  const bodyObj = (body ?? {}) as Record<string, unknown>;
  const message =
    (typeof bodyObj.message === 'string' ? bodyObj.message : undefined) ??
    `Request failed with status ${response.status}`;

  let code: BackendErrorCode;
  if (response.status === 401 || isTokenExpired(bodyObj)) {
    code = 'TOKEN_EXPIRED';
  } else if (response.status === 403) {
    code = 'FORBIDDEN';
  } else if (response.status === 400 || response.status === 422) {
    code = 'VALIDATION';
  } else {
    code = 'UNKNOWN';
  }

  const fieldErrors = extractFieldErrors(bodyObj);

  const error: BackendError = { code, message };
  if (fieldErrors !== undefined) error.fieldErrors = fieldErrors;
  return error;
}

function isTokenExpired(body: Record<string, unknown>): boolean {
  const code = body.code ?? body.errorCode;
  return code === 'TOKEN_EXPIRED' || code === 'EXPIRED_TOKEN';
}

function extractFieldErrors(body: Record<string, unknown>): Record<string, string[]> | undefined {
  const raw = body.fieldErrors ?? body.fieldError;
  if (raw === undefined || raw === null || typeof raw !== 'object') return undefined;

  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) return undefined;

  const result: Record<string, string[]> = {};
  for (const [field, value] of entries) {
    result[field] = Array.isArray(value) ? value.map(String) : [String(value)];
  }
  return result;
}

class BackendAdapterError extends Error implements BackendError {
  code: BackendErrorCode;
  fieldErrors?: Record<string, string[]>;

  constructor(err: BackendError) {
    super(err.message);
    this.name = 'BackendAdapterError';
    this.code = err.code;
    if (err.fieldErrors !== undefined) this.fieldErrors = err.fieldErrors;
  }
}

function coerceRow<T>(row: WireRow): T {
  return { ...row, id: String(row.id) } as unknown as T;
}

/**
 * Default BackendAdapter implementation for rcm-framework 0.1.0 (ADR-0005).
 *
 * Wire contract (decision D2 — src/listgrid/form/Type.ts + EntityForm.tsx):
 *   list:   POST {baseUrl}{url}/search   body = search.toJSON()
 *   getOne: GET  {baseUrl}{url}/{id}
 *   create: POST {baseUrl}{url}
 *   update: PUT  {baseUrl}{url}/{id}
 *   remove: DELETE {baseUrl}{url}        body = { ids }  (bulk only, no per-row delete)
 */
export function createRcmAdapter(opts: RcmAdapterOptions = {}): BackendAdapter {
  const baseUrl = opts.baseUrl ?? '';
  const doFetch = opts.fetch ?? fetch;
  const extraHeaders = opts.headers ?? {};

  async function request(path: string, init: RequestInit): Promise<Response> {
    const response = await doFetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new BackendAdapterError(await parseBackendError(response));
    }

    return response;
  }

  return {
    async list<T = Record<string, unknown>>(
      url: string,
      search: SearchForm,
    ): Promise<PageResult<T>> {
      const response = await request(`${url}/search`, {
        method: 'POST',
        body: JSON.stringify(search.toJSON()),
      });

      const payload = (await response.json()) as ListPayload;
      const rows = payload.content ?? payload.list ?? [];

      return {
        content: rows.map((row) => coerceRow<T>(row)),
        totalElements: payload.totalElements ?? payload.totalCount ?? 0,
        totalPages: payload.totalPages ?? payload.totalPage ?? 0,
      };
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

    async remove(url: string, ids: string[], revision?: string): Promise<void> {
      // spec §3.1/§6.2, CAP-07; W4-4 — bulk delete body: {ids, revisionEntityName?}.
      // Ports the 0.3.x rcm-framework 0.1.0 bulk-delete wire contract
      // (src/listgrid/config/EntityForm.tsx:462-470, "Decision #31":
      // `formData = {ids}`, then `if (revisionEntityName) formData['revisionEntityName'] = revisionEntityName`)
      // — key/value semantics, conditional-only-when-set.
      const body: Record<string, unknown> = { ids };
      if (revision !== undefined) body['revisionEntityName'] = revision;
      await request(url, {
        method: 'DELETE',
        body: JSON.stringify(body),
      });
    },
  };
}
