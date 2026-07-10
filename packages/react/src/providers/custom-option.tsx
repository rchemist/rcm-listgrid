import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { SelectOption } from '@listgrid/schema-core';

// CustomOptionProvider — host-injected fetch for CustomOptionField's
// alias-keyed option lists (EA-B0 PART D item 4). This is the SECOND
// instantiation of the H1 useReferenceResolver pattern
// (./adapter.tsx:15-91) — cloned deliberately rather than generalized into a
// shared factory (conductor decision ⑤): a provider-scoped Promise-cache
// keyed by the NORMALIZED alias (trim + uppercase — 0.3.x
// CustomOptionField.tsx aliasCacheKey, "백엔드 OptionService.normalizeAlias"
// parity), with TRUE in-flight dedup (concurrent resolves of the same alias
// across renderer instances collapse to one host fetchOptions call — an
// improvement over the 0.3.x module-scope cache, which only cached settled
// VALUES, not in-flight promises) and evict-on-fail (a rejected fetch is
// removed from the cache so a later attempt retries instead of being stuck
// rejected forever). Unlike AdapterProvider, this does NOT extend
// BackendAdapter — the host supplies a bare fetch function (conductor
// decision ⑤).

/** Host-supplied fetch for one alias's option list. */
export type FetchCustomOptions = (alias: string) => Promise<SelectOption[]>;

/** Resolves a custom-option alias to its option list, deduped/cached. */
export type CustomOptionResolver = (alias: string) => Promise<SelectOption[]>;

const CustomOptionResolverContext = createContext<CustomOptionResolver | undefined>(undefined);

export interface CustomOptionProviderProps {
  fetchOptions: FetchCustomOptions;
  children?: ReactNode;
}

export function CustomOptionProvider({ fetchOptions, children }: CustomOptionProviderProps) {
  // Scoped to `fetchOptions` — a new fetch fn (host reconfigure) gets a fresh
  // cache so stale option lists from a previous fetch fn are never served.
  // The factory itself doesn't read `fetchOptions`; the dependency exists
  // purely to key cache identity to fetch-fn identity, which
  // exhaustive-deps can't see (mirrors AdapterProvider's `cache`).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, Promise<SelectOption[]>>(), [fetchOptions]);

  const resolveOptions = useCallback<CustomOptionResolver>(
    (alias) => {
      const key = alias.trim().toUpperCase();
      const hit = cache.get(key);
      if (hit) return hit;
      // 0.3.x parity: the wire request uses the TRIMMED alias (not
      // uppercased) — only the cache key is normalized to uppercase
      // (CustomOptionField.tsx getCustomOptionValues:212-233 vs
      // aliasCacheKey:27).
      const p = fetchOptions(alias.trim());
      // On failure, evict so a later attempt can retry. The caller attaches
      // its own .then/.catch to the original `p` — this cleanup's returned
      // promise is discarded, so it never changes what callers receive.
      p.catch(() => {
        cache.delete(key);
      });
      cache.set(key, p);
      return p;
    },
    [fetchOptions, cache],
  );

  return (
    <CustomOptionResolverContext.Provider value={resolveOptions}>
      {children}
    </CustomOptionResolverContext.Provider>
  );
}

/**
 * Returns a shared, provider-scoped resolver for custom-option aliases —
 * dedupes concurrent/repeated fetchOptions(alias) calls across renderer
 * instances (e.g. the same alias used by multiple CustomOptionField
 * instances on one form, or the same field remounted via `key={cacheKey}`
 * 0.3.x parity). Throws a clear error if unwired, like the other required
 * seams (charter C7).
 */
export function useCustomOptions(): CustomOptionResolver {
  const ctx = useContext(CustomOptionResolverContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useCustomOptions() was called without a <CustomOptionProvider>. ' +
        'Wrap your app in <CustomOptionProvider fetchOptions={...}> to enable CustomOption fields.',
    );
  }
  return ctx;
}
