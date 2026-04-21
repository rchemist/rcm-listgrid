// Barrel re-exporting the inlined utilities used across listgrid.
// Host-specific i18n is stubbed (see i18n.ts).

export * from './BooleanUtil';
export * from './CompareUtil';
export * from './PhoneUtil';
export * from './StringUtil';
export * from './jsonUtils';
export { getTranslation } from './i18n';
export { cn } from './cn';
export * as simpleCrypt from './simpleCrypt';

// API call helpers delegate to the host-configured ApiClient (Stage 5).
// See src/listgrid/api/ApiClient.ts.
export { callExternalHttpRequest, getExternalApiData, getExternalApiDataWithError } from '../api';

// String helpers absent from the inlined utils but used by original source.
export function endsWith(value: string | undefined | null, suffix: string): boolean {
  return typeof value === 'string' && value.endsWith(suffix);
}
