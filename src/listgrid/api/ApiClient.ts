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
  // T defaults to `any` — legacy callers dereference response.data.field directly
  callExternalHttpRequest<T = any>(options: ApiRequestOptions): Promise<ResponseData<T>>;
  // `getExternalApiData(urlOrOptions)` accepts either a bare URL string or a full
  // options object, matching the original the legacy UI kit API. Implementations should
  // normalize internally.
  getExternalApiData<T = any>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
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
