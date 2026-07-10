import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { BackendAdapter } from '@listgrid/schema-core';

// AdapterProvider — injects the BackendAdapter (ADR-0005) so renderer-layer
// components that must fetch on their own (the ManyToOne picker fetching the
// referenced entity's list, charter C3) get a transport without @listgrid/react
// importing one (dependency inversion). Throws if unwired, like the other
// required seams (charter C7).

const AdapterContext = createContext<BackendAdapter | undefined>(undefined);

/** Resolves a bare reference (url, id) → the referenced entity, deduped/cached. */
export type ReferenceResolver = (url: string, id: string) => Promise<unknown>;

// ReferenceResolverContext — a shared, adapter-scoped cache of in-flight/settled
// getOne(url, id) calls (task H1). Without this, every ManyToOne renderer
// instance resolving the same reference (e.g. many list rows pointing at the
// same entity) re-fetches independently. Kept as a SEPARATE context from
// AdapterContext so useAdapter() keeps returning the raw adapter unchanged
// (back-compat for existing callers, e.g. the M2O picker's list store).
const ReferenceResolverContext = createContext<ReferenceResolver | undefined>(undefined);

export interface AdapterProviderProps {
  adapter: BackendAdapter;
  children?: ReactNode;
}

export function AdapterProvider({ adapter, children }: AdapterProviderProps) {
  // Scoped to `adapter` — a new adapter (transport/data swap) gets a fresh
  // cache so stale references from a previous adapter are never served. The
  // factory itself doesn't read `adapter`; the dependency exists purely to
  // key cache identity to adapter identity, which exhaustive-deps can't see.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, Promise<unknown>>(), [adapter]);

  const resolveReference = useCallback<ReferenceResolver>(
    (url, id) => {
      const key = `${url}::${id}`;
      const hit = cache.get(key);
      if (hit) return hit;
      const p = adapter.getOne(url, id);
      // On failure, evict so a later attempt can retry. The caller attaches
      // its own .then/.catch to the original `p` — this cleanup's returned
      // promise is discarded, so it never changes what callers receive.
      p.catch(() => {
        cache.delete(key);
      });
      cache.set(key, p);
      return p;
    },
    [adapter, cache],
  );

  return (
    <AdapterContext.Provider value={adapter}>
      <ReferenceResolverContext.Provider value={resolveReference}>
        {children}
      </ReferenceResolverContext.Provider>
    </AdapterContext.Provider>
  );
}

/** Returns the injected BackendAdapter. Throws a clear error if unwired. */
export function useAdapter(): BackendAdapter {
  const ctx = useContext(AdapterContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useAdapter() was called without an <AdapterProvider>. ' +
        'Wrap your app in <AdapterProvider adapter={createRcmAdapter(...)}> to enable ' +
        'ManyToOne pickers and list fetching.',
    );
  }
  return ctx;
}

/**
 * Returns a shared, adapter-scoped resolver for bare references — dedupes
 * concurrent/repeated getOne(url, id) calls across renderer instances.
 * Throws a clear error if unwired.
 */
export function useReferenceResolver(): ReferenceResolver {
  const ctx = useContext(ReferenceResolverContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useReferenceResolver() was called without an <AdapterProvider>. ' +
        'Wrap your app in <AdapterProvider adapter={createRcmAdapter(...)}> to enable ' +
        'ManyToOne pickers and list fetching.',
    );
  }
  return ctx;
}
