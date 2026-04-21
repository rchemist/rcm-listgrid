// @rchemist/listgrid-next — Next.js adapter for RouterServices.
//
// Consumers import from '@rchemist/listgrid/next' and wire into <RouterProvider>:
//   import { nextRouterServices } from '@rchemist/listgrid/next';
//   <RouterProvider value={nextRouterServices}>

import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import type { RouterServices, RouterApi, RouterLinkProps } from '../../listgrid/router';
import type { ComponentProps } from 'react';

const NextLinkComponent: React.ComponentType<RouterLinkProps> = (props) => {
  // Bridge the framework-agnostic RouterLinkProps (href: string, loose onClick)
  // into next/link's stricter prop shape via a single localized cast.
  return <NextLink {...(props as unknown as ComponentProps<typeof NextLink>)} />;
};

export const nextRouterServices: RouterServices = {
  useRouter(): RouterApi {
    const r = useRouter();
    return {
      push: (url: string) => r.push(url),
      replace: (url: string) => r.replace(url),
      refresh: () => r.refresh(),
      back: () => r.back(),
      forward: () => r.forward(),
      prefetch: (url: string) => r.prefetch(url),
    };
  },
  usePathname() {
    return usePathname() ?? '';
  },
  useParams() {
    return (useParams() ?? {}) as Record<string, string | string[] | undefined>;
  },
  useSearchParams() {
    const sp = useSearchParams();
    // next/navigation returns ReadonlyURLSearchParams — copy to mutable
    // URLSearchParams so call sites that expect to iterate/clone it work.
    return new URLSearchParams(sp?.toString() ?? '');
  },
  Link: NextLinkComponent,
};
