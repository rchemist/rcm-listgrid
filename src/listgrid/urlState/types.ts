// Stage 7d — Framework-agnostic URL state contract.
//
// Host adapters (e.g. @rchemist/listgrid-next using nuqs) implement the
// `useQueryStates` hook. Listgrid code defines its parsers via
// `createParser` and consumes them through the adapter-provided hook.

export interface UrlParser<T> {
  parse: (value: string) => T | null;
  serialize: (value: T) => string;
  eq?: (a: T, b: T) => boolean;
}

export interface UrlStateSetOptions {
  history?: 'push' | 'replace';
  shallow?: boolean;
}

export type QueryStatesSetter = (
  values: Record<string, any> | null | ((prev: Record<string, any>) => Record<string, any>),
  options?: UrlStateSetOptions,
) => any;

export interface UrlStateServices {
  /**
   * Hook reading and writing URL query parameters via host-supplied parsers.
   * Intentionally typed loosely; the Next.js adapter bridges to `nuqs.useQueryStates`.
   */
  useQueryStates: (
    parsers: Record<string, UrlParser<any>>,
    options?: UrlStateSetOptions,
  ) => [Record<string, any>, QueryStatesSetter];
}

/** Framework-agnostic factory mirroring nuqs's `createParser`. */
export function createParser<T>(config: UrlParser<T>): UrlParser<T> {
  return { ...config };
}

/** Simple pass-through string parser matching nuqs's `parseAsString`. */
export const parseAsString: UrlParser<string> = {
  parse: (v: string) => v,
  serialize: (v: string) => v,
};
