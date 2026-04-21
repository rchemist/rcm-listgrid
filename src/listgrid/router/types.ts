// Stage 7c — Framework-agnostic router contract.
//
// Host adapters (e.g. @rchemist/listgrid-next) implement these by delegating
// to their framework's navigation APIs (next/navigation, react-router,
// Remix, Tanstack Router, etc.).

import type { ComponentType, MouseEvent, ReactNode } from 'react';

export interface RouterApi {
  push(url: string): void;
  replace(url: string): void;
  refresh?(): void;
  back?(): void;
  forward?(): void;
  prefetch?(url: string): void;
}

export interface RouterLinkProps {
  href: string;
  children?: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  // Intentional: host adapters (next/link, react-router Link, etc.) accept
  // arbitrary extra props (rel, prefetch, scroll, data-*, …). Keeping
  // `any` here lets callers pass framework-specific attributes through.
  [key: string]: any;
}

/**
 * Router services consumed by listgrid. Host adapters supply this to
 * <RouterProvider value={...}>. The useXxx properties are React hooks
 * — they will be invoked during listgrid component renders.
 */
export interface RouterServices {
  /** Hook returning the imperative router API. Called inside listgrid components. */
  useRouter: () => RouterApi;
  /** Hook returning the current pathname (e.g. "/admin/users"). */
  usePathname: () => string;
  /** Hook returning current route params (dynamic segments). */
  useParams: () => Record<string, string | string[] | undefined>;
  /** Hook returning current URL search params. */
  useSearchParams: () => URLSearchParams;
  /** Link component that navigates client-side without full reload. */
  Link: ComponentType<RouterLinkProps>;
}
