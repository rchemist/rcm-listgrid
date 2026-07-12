import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { ASSET_PREFIX, ASSET_SERVER_URL, resolveAssetUrl } from '@listgrid/utils';

// AssetBaseProvider / useAssetUrl — the asset-URL resolution seam
// (documents/plans/asset-url-resolution-design.md §4). Mirrors AdapterProvider's
// per-adapter context discipline: the asset base flows through React context,
// NEVER a module-global singleton — so concurrent SSR requests, side-by-side
// tenants, and nested providers each resolve their own subtree. `useAssetUrl()`
// never throws (env default), so asset resolution is an optional capability
// (charter C7 host-injection).

/** The already-resolved asset base for a subtree. */
export interface AssetBase {
  serverUrl: string;
  prefix: string;
}

// Internal — exported for AdapterProvider's import only; NOT re-exported from
// the package barrel. Default = the build-time env constant (tier iii), so the
// value is identical on server and client (hydration-safe) and useAssetUrl()
// degrades gracefully instead of throwing.
export const AssetBaseContext = createContext<AssetBase>({
  serverUrl: ASSET_SERVER_URL,
  prefix: ASSET_PREFIX,
});

export interface AssetBaseProviderProps {
  /** Host-global asset-server base (tier ii); falls through to the inherited/env base when omitted. */
  serverUrl?: string;
  /** Override the `/static-resource/` path prefix. */
  prefix?: string;
  children?: ReactNode;
}

/**
 * Host-global asset base (tier ii) and the entry point for trees with no
 * BackendAdapter (static export, Storybook, read-only prop views). The
 * declarative replacement for 0.3.x's imperative `configureAssetServerUrl()`.
 * Composes with an outer provider / an inner AdapterProvider — nearest wins.
 */
export function AssetBaseProvider({ serverUrl, prefix, children }: AssetBaseProviderProps) {
  const inherited = useContext(AssetBaseContext);
  const value = useMemo<AssetBase>(
    () => ({
      serverUrl: serverUrl ?? inherited.serverUrl,
      prefix: prefix ?? inherited.prefix,
    }),
    [serverUrl, prefix, inherited.serverUrl, inherited.prefix],
  );
  return <AssetBaseContext.Provider value={value}>{children}</AssetBaseContext.Provider>;
}

/** Resolves a stored asset value → the URL to display. */
export type AssetUrlResolver = (url: string | null | undefined) => string;

/**
 * Returns a resolver that turns a stored asset value into a display URL using
 * the nearest asset base in context (adapter.assetBaseUrl → <AssetBaseProvider>
 * → NEXT_PUBLIC_ASSET_SERVER). Absolute URLs pass through untouched; relative
 * paths get base+prefix. Non-throwing. Returns a FUNCTION (not a string) so a
 * renderer can resolve many urls inside `.map` — mirrors useReferenceResolver.
 */
export function useAssetUrl(): AssetUrlResolver {
  const { serverUrl, prefix } = useContext(AssetBaseContext);
  const warned = useRef(false); // instance-scoped dedupe — request-safe, never module state
  return useCallback<AssetUrlResolver>(
    (url) => {
      if (process.env.NODE_ENV !== 'production' && !warned.current && !serverUrl && url) {
        const t = url.trim();
        const isRelative = !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(t);
        if (isRelative) {
          warned.current = true;
          // eslint-disable-next-line no-console
          console.warn(
            `[@listgrid/react] useAssetUrl(): resolving relative asset path "${t}" with no ` +
              `asset base configured (adapter.assetBaseUrl / <AssetBaseProvider> / ` +
              `NEXT_PUBLIC_ASSET_SERVER all empty). Falling back to "${prefix}${t}".`,
          );
        }
      }
      return resolveAssetUrl(url, serverUrl, prefix);
    },
    [serverUrl, prefix],
  );
}
