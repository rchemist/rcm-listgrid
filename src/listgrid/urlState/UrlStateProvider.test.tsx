import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { UrlStateProvider, useQueryStates } from './UrlStateProvider';
import { parseAsString, type UrlStateServices, type QueryStatesSetter } from './types';

/**
 * UrlStateProvider is a React Context wrapper. Contract:
 *   - useQueryStates throws a descriptive error when used outside the Provider
 *   - useQueryStates delegates to services.useQueryStates, forwarding parsers/options
 */

const makeServices = (useQueryStates: UrlStateServices['useQueryStates']): UrlStateServices => ({
  useQueryStates,
});

describe('useQueryStates — without provider', () => {
  it('throws a helpful error when unwrapped', () => {
    expect(() => renderHook(() => useQueryStates({}))).toThrow(/UrlStateProvider/);
  });
});

describe('useQueryStates — with provider', () => {
  const wrapper =
    (services: UrlStateServices) =>
    ({ children }: { children: React.ReactNode }) => (
      <UrlStateProvider value={services}>{children}</UrlStateProvider>
    );

  it('delegates to services.useQueryStates and returns its tuple', () => {
    const setter: QueryStatesSetter = vi.fn();
    const state = { q: 'foo' };
    const impl = vi.fn(() => [state, setter] as [Record<string, unknown>, QueryStatesSetter]);
    const services = makeServices(impl);
    const parsers = { q: parseAsString };

    const { result } = renderHook(() => useQueryStates(parsers), { wrapper: wrapper(services) });
    expect(result.current[0]).toBe(state);
    expect(result.current[1]).toBe(setter);
    expect(impl).toHaveBeenCalledWith(parsers, undefined);
  });

  it('forwards the options argument to the underlying hook', () => {
    const impl = vi.fn(() => [{}, vi.fn()] as [Record<string, unknown>, QueryStatesSetter]);
    const services = makeServices(impl);
    const options = { history: 'replace' as const, shallow: true };
    renderHook(() => useQueryStates({}, options), { wrapper: wrapper(services) });
    expect(impl).toHaveBeenCalledWith({}, options);
  });
});
