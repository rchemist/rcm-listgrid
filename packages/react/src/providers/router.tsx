import { createContext, useContext, type ReactNode } from 'react';

// RouterProvider — the navigation seam (charter C7: manyToOne "detail" links,
// post-save redirects, etc. need to push/replace a URL without @listgrid/react
// depending on next/react-router/any specific router). UNLIKE UIProvider/
// AuthProvider/FormStoreProvider, this seam has a working NO-OP DEFAULT: a
// router-less host (or the V0.3 renderer surface, before a real router adapter
// exists) can render every listgrid screen without wiring one up. The context
// default is a real (inert) implementation rather than `undefined`, so
// useRouter() never throws — only the *behavior* is a no-op until a host
// supplies `<RouterProvider value={...}>`.

export interface Router {
  push(url: string): void;
  replace(url: string): void;
}

function warnNoRouter(method: keyof Router, url: string): void {
  console.warn(
    `[@listgrid/react] router.${method}("${url}") called with no <RouterProvider> configured — ` +
      'this is a no-op. Wrap your app in <RouterProvider value={...}> to enable navigation.',
  );
}

const noopRouter: Router = {
  push(url) {
    warnNoRouter('push', url);
  },
  replace(url) {
    warnNoRouter('replace', url);
  },
};

const RouterContext = createContext<Router>(noopRouter);

export interface RouterProviderProps {
  value: Router;
  children?: ReactNode;
}

export function RouterProvider({ value, children }: RouterProviderProps) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Returns the injected {@link Router}, or a console-warning no-op if unwired. */
export function useRouter(): Router {
  return useContext(RouterContext);
}
