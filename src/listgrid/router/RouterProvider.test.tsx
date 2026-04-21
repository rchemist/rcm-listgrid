import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, render } from '@testing-library/react';
import {
  RouterProvider,
  useRouter,
  usePathname,
  useParams,
  useSearchParams,
  Link,
  type RouterServices,
  type RouterApi,
} from './RouterProvider';

/**
 * RouterProvider is a thin React Context wrapper; its contract is:
 *   - hooks throw a descriptive error when used outside the Provider
 *   - hooks return whatever the host-supplied services deliver
 *
 * We use renderHook + a wrapper to stay framework-agnostic.
 */

const makeServices = (overrides: Partial<RouterServices> = {}): RouterServices => ({
  useRouter: () =>
    ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }) as RouterApi,
  usePathname: () => '/admin/users',
  useParams: () => ({ id: '42' }),
  useSearchParams: () => new URLSearchParams('q=foo'),
  Link: ({ href, children }) => <a href={href}>{children}</a>,
  ...overrides,
});

describe('RouterProvider hooks — without provider', () => {
  it('useRouter throws a helpful error when unwrapped', () => {
    expect(() => renderHook(() => useRouter())).toThrow(/RouterProvider/);
  });

  it('usePathname throws when unwrapped', () => {
    expect(() => renderHook(() => usePathname())).toThrow(/RouterProvider/);
  });

  it('useParams throws when unwrapped', () => {
    expect(() => renderHook(() => useParams())).toThrow(/RouterProvider/);
  });

  it('useSearchParams throws when unwrapped', () => {
    expect(() => renderHook(() => useSearchParams())).toThrow(/RouterProvider/);
  });
});

describe('RouterProvider hooks — with provider', () => {
  const wrapper =
    (services: RouterServices) =>
    ({ children }: { children: React.ReactNode }) => (
      <RouterProvider value={services}>{children}</RouterProvider>
    );

  it('useRouter returns the RouterApi produced by services.useRouter', () => {
    const api: RouterApi = { push: vi.fn(), replace: vi.fn() };
    const services = makeServices({ useRouter: () => api });
    const { result } = renderHook(() => useRouter(), { wrapper: wrapper(services) });
    expect(result.current).toBe(api);
  });

  it('usePathname returns the string the service supplies', () => {
    const services = makeServices({ usePathname: () => '/x' });
    const { result } = renderHook(() => usePathname(), { wrapper: wrapper(services) });
    expect(result.current).toBe('/x');
  });

  it('useParams returns the map the service supplies', () => {
    const services = makeServices({ useParams: () => ({ a: 'b' }) });
    const { result } = renderHook(() => useParams(), { wrapper: wrapper(services) });
    expect(result.current).toEqual({ a: 'b' });
  });

  it('useSearchParams returns the URLSearchParams the service supplies', () => {
    const sp = new URLSearchParams('k=v');
    const services = makeServices({ useSearchParams: () => sp });
    const { result } = renderHook(() => useSearchParams(), { wrapper: wrapper(services) });
    expect(result.current).toBe(sp);
  });
});

describe('Link', () => {
  it('renders the host-supplied Link implementation with props forwarded', () => {
    const HostLink = vi.fn(({ href, children }) => (
      <a data-testid="host-link" href={href}>
        {children}
      </a>
    ));
    const services = makeServices({ Link: HostLink });
    const { getByTestId } = render(
      <RouterProvider value={services}>
        <Link href="/foo">hello</Link>
      </RouterProvider>,
    );
    expect(HostLink).toHaveBeenCalled();
    const anchor = getByTestId('host-link') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('/foo');
    expect(anchor.textContent).toBe('hello');
  });

  it('throws outside of a RouterProvider', () => {
    // Link calls mustRouter — rendering outside the provider should throw.
    expect(() => render(<Link href="/x">x</Link>)).toThrow(/RouterProvider/);
  });
});
