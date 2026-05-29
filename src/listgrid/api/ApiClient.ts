// Stage 5 — Host-supplied API client contract.
//
// Listgrid needs to call the RCM-framework backend but cannot itself know
// about HTTP transport concerns (auth headers, CSRF, base URL, logging,
// retries). Host apps inject an ApiClient via `configureApiClient(client)`;
// library code uses the module-level `callExternalHttpRequest` /
// `getExternalApiData` / `getExternalApiDataWithError` wrappers that
// delegate to the configured client.
//
// This is a module-scope registry (not React Context) because the API is
// called from static class methods (PageResult.fetchListData, EntityForm
// initialize) where Context is unavailable.

import type { ResponseData } from './types';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  url: string;
  method?: ApiMethod;
  // intentional: arbitrary form payload (FormData / object / primitive)
  formData?: unknown;
  entityFormName?: string;
  extensionPoint?: string;
  serverProxy?: boolean;
  [key: string]: unknown;
}

export interface ApiClient {
  /**
   * Perform a backend HTTP call and return the result as a {@link ResponseData} envelope.
   *
   * **IMPORTANT — envelope contract.** The host adapter MUST wrap the raw HTTP body into a
   * `ResponseData<T>` whose `.data` holds the backend payload. Listgrid dereferences
   * `response.data.list` / `response.data.content` / `response.data.searchForm` and calls
   * `response.isError()` — returning a bare `fetch(...).then(r => r.json())` (raw JSON) breaks
   * this: `response.data` is absent → the grid renders "데이터가 없습니다" with no error.
   *
   * Minimal correct adapter:
   * ```ts
   * callExternalHttpRequest: async (options) => {
   *   const res = await fetch(options.url, options);
   *   const body = await res.json();          // backend { list, totalCount, ... }
   *   return new ResponseData({ data: body, status: res.status });
   * }
   * ```
   * @see ResponseData
   * @see createResponseData
   */
  // T defaults to `any` — legacy callers dereference response.data.field directly
  callExternalHttpRequest<T = any>(options: ApiRequestOptions): Promise<ResponseData<T>>;
  /**
   * Like {@link callExternalHttpRequest} but accepts either a bare URL string or a full
   * options object (matching the legacy UI-kit API). Implementations should normalize
   * internally. The same {@link ResponseData} envelope contract applies — `.data` must hold
   * the backend payload.
   */
  getExternalApiData<T = any>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
  /**
   * Error-aware variant of {@link getExternalApiData}. Same {@link ResponseData} envelope
   * contract — wrap the payload into `.data` (and surface failures via `error` / `entityError`
   * or a `status >= 400`).
   */
  getExternalApiDataWithError<T = any>(
    urlOrOptions: string | ApiRequestOptions,
  ): Promise<ResponseData<T>>;
}

let _client: ApiClient | undefined;

export function configureApiClient(client: ApiClient): void {
  _client = client;
}

function mustClient(caller: string): ApiClient {
  if (!_client) {
    throw new Error(
      `[@rchemist/listgrid] ${caller} called but no ApiClient has been configured. ` +
        'Call configureApiClient(yourClient) at app bootstrap.',
    );
  }
  return _client;
}

export function callExternalHttpRequest<T = any>(
  options: ApiRequestOptions,
): Promise<ResponseData<T>> {
  return mustClient('callExternalHttpRequest').callExternalHttpRequest<T>(options);
}

export function getExternalApiData<T = any>(
  urlOrOptions: string | ApiRequestOptions,
): Promise<ResponseData<T>> {
  return mustClient('getExternalApiData').getExternalApiData<T>(urlOrOptions);
}

export function getExternalApiDataWithError<T = any>(
  urlOrOptions: string | ApiRequestOptions,
): Promise<ResponseData<T>> {
  return mustClient('getExternalApiDataWithError').getExternalApiDataWithError<T>(urlOrOptions);
}
