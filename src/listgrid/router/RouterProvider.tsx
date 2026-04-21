'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { RouterApi, RouterLinkProps, RouterServices } from './types';

const RouterContext = createContext<RouterServices | null>(null);

export interface RouterProviderProps {
  value: RouterServices;
  children: ReactNode;
}

export function RouterProvider({ value, children }: RouterProviderProps) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function mustRouter(caller: string): RouterServices {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- assertion helper always invoked from within hooks/components below
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error(
      `[@rchemist/listgrid] ${caller} must be called within a <RouterProvider>. ` +
        'Wrap your app with <RouterProvider value={...}> imported from @rchemist/listgrid. ' +
        'See @rchemist/listgrid-next for a Next.js adapter.',
    );
  }
  return ctx;
}

export function useRouter(): RouterApi {
  return mustRouter('useRouter').useRouter();
}

export function usePathname(): string {
  return mustRouter('usePathname').usePathname();
}

export function useParams(): Record<string, string | string[] | undefined> {
  return mustRouter('useParams').useParams();
}

export function useSearchParams(): URLSearchParams {
  return mustRouter('useSearchParams').useSearchParams();
}

export function Link(props: RouterLinkProps) {
  const services = mustRouter('Link');
  const Impl = services.Link;
  return <Impl {...props} />;
}
