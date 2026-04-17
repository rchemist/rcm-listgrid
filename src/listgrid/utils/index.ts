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

// Stage 3a stubs — API call helpers handled by host via Stage 5 ApiClientProvider.
// Placeholder `any` values keep callsites compiling until then.
export const callExternalHttpRequest: any = (..._args: any[]) => {
    throw new Error(
        '[@rcm/listgrid] callExternalHttpRequest is not implemented. ' +
            'Stage 5 ApiClientProvider will supply this.'
    );
};
export const getExternalApiDataWithError: any = (..._args: any[]) => {
    throw new Error(
        '[@rcm/listgrid] getExternalApiDataWithError is not implemented. ' +
            'Stage 5 ApiClientProvider will supply this.'
    );
};

// String helpers absent from the inlined utils but used by original source.
export function endsWith(value: string | undefined | null, suffix: string): boolean {
    return typeof value === 'string' && value.endsWith(suffix);
}
