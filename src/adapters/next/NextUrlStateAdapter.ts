// @rcm/listgrid-next — Next.js/nuqs adapter for UrlStateServices.
//
// Consumers import from '@rcm/listgrid/next' and wire into <UrlStateProvider>:
//   import { nextUrlStateServices } from '@rcm/listgrid/next';
//   <UrlStateProvider value={nextUrlStateServices}>
//
// Bridges the library's framework-agnostic `UrlParser` shape into nuqs's
// own parser factory so `useQueryStates` reads/writes Next's router state.

import {
    useQueryStates as nuqsUseQueryStates,
    createParser as nuqsCreateParser,
} from 'nuqs';
import type {
    QueryStatesSetter,
    UrlParser,
    UrlStateServices,
    UrlStateSetOptions,
} from '../../listgrid/urlState';

function toNuqsParsers(parsers: Record<string, UrlParser<any>>): any {
    const out: any = {};
    for (const key of Object.keys(parsers)) {
        const p = parsers[key];
        out[key] = nuqsCreateParser({
            parse: p.parse,
            serialize: p.serialize,
            eq: p.eq,
        } as any);
    }
    return out;
}

export const nextUrlStateServices: UrlStateServices = {
    useQueryStates(
        parsers: Record<string, UrlParser<any>>,
        options?: UrlStateSetOptions
    ): [Record<string, any>, QueryStatesSetter] {
        const nuqsParsers = toNuqsParsers(parsers);
        const [state, setState] = nuqsUseQueryStates(nuqsParsers, options as any);
        return [state as Record<string, any>, setState as unknown as QueryStatesSetter];
    },
};
