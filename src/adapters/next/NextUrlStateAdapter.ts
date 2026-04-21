// @rchemist/listgrid-next — Next.js/nuqs adapter for UrlStateServices.
//
// Consumers import from '@rchemist/listgrid/next' and wire into <UrlStateProvider>:
//   import { nextUrlStateServices } from '@rchemist/listgrid/next';
//   <UrlStateProvider value={nextUrlStateServices}>
//
// Bridges the library's framework-agnostic `UrlParser` shape into nuqs's
// own parser factory so `useQueryStates` reads/writes Next's router state.

import { useQueryStates as nuqsUseQueryStates, createParser as nuqsCreateParser } from 'nuqs';
import type {
  QueryStatesSetter,
  UrlParser,
  UrlStateServices,
  UrlStateSetOptions,
} from '../../listgrid/urlState';

// UrlParser<any> is intentional: the framework-agnostic contract accepts
// heterogeneous parser value types per key — narrowing here would require
// higher-kinded generics the host cannot supply.
function toNuqsParsers(
  parsers: Record<string, UrlParser<any>>,
): Record<string, ReturnType<typeof nuqsCreateParser>> {
  const out: Record<string, ReturnType<typeof nuqsCreateParser>> = {};
  for (const key of Object.keys(parsers)) {
    const p = parsers[key]!;
    out[key] = nuqsCreateParser({
      parse: p.parse,
      serialize: p.serialize,
      ...(p.eq !== undefined ? { eq: p.eq } : {}),
    });
  }
  return out;
}

export const nextUrlStateServices: UrlStateServices = {
  useQueryStates(
    parsers: Record<string, UrlParser<any>>,
    options?: UrlStateSetOptions,
  ): [Record<string, any>, QueryStatesSetter] {
    const nuqsParsers = toNuqsParsers(parsers);
    const [state, setState] = nuqsUseQueryStates(nuqsParsers, options);
    return [state as Record<string, any>, setState as unknown as QueryStatesSetter];
  },
};
