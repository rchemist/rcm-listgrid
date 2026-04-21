import React, { Suspense, ComponentType, lazy } from 'react';

// Drop-in replacement for `next/dynamic` for the library's needs.
//
// Next-agnostic: uses React.lazy + Suspense. SSR semantics differ — React.lazy
// requires client rendering on initial mount, whereas next/dynamic can opt
// into SSR. Host apps that need SSR lazy loading can override the wrapped
// component in their adapter, but most listgrid call sites either already
// set ssr: false or run in a client-only path.
//
// API parity with next/dynamic kept so that call sites don't need rewriting:
//   dynamic(() => import('...'), { loading: () => <Skeleton/>, ssr: false })

export interface LazyImportOptions {
  loading?: () => React.ReactNode;
  /** Ignored. Kept for next/dynamic API parity. */
  ssr?: boolean;
}

// intentional: generic component loading mirrors next/dynamic ComponentType<any> contract
export function lazyImport<P = any>(
  loader: () => Promise<{ default: ComponentType<any> }>,
  options: LazyImportOptions = {},
): ComponentType<P> {
  const Lazy = lazy(loader);
  const fallback = options.loading ? options.loading() : null;
  const Wrapped: ComponentType<P> = (props) => (
    <Suspense fallback={fallback}>
      <Lazy {...(props as Record<string, unknown>)} />
    </Suspense>
  );
  Wrapped.displayName = 'LazyImport';
  return Wrapped;
}

// Named as `dynamic` so call sites can `import { dynamic } from '.../utils/lazy'`
// and preserve the original `dynamic(...)` call shape.
export { lazyImport as dynamic };
