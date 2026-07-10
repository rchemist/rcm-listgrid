// Custom-option resolution cache (EA-B0 PART D item 4) — JSDOM test. Second
// instantiation of the H1 useReferenceResolver pattern; modeled directly on
// many-to-one-reference-cache.test.tsx. Exercises: (1) a single resolve
// returns the host-fetched options, (2) concurrent resolves of the same
// alias across renderer instances collapse to one fetchOptions call, (3) a
// different alias still triggers its own call (no over-eager dedup), (4) a
// failed resolve evicts its cache entry so a later attempt retries instead
// of being stuck rejected forever, (5) useCustomOptions() throws a clear
// error when called outside a <CustomOptionProvider>.

import { useEffect, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import type { SelectOption } from '@listgrid/schema-core';
import {
  CustomOptionProvider,
  useCustomOptions,
  type FetchCustomOptions,
} from '../providers/custom-option';

function mockFetchOptions(): FetchCustomOptions {
  return vi.fn(
    async (alias: string): Promise<SelectOption[]> => [{ value: alias, label: `Label-${alias}` }],
  );
}

/** Minimal consumer: resolves `alias` on mount, renders the first option's label. */
function Consumer({ alias, testId }: { alias: string; testId: string }) {
  const resolveOptions = useCustomOptions();
  const [label, setLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    resolveOptions(alias)
      .then((options) => {
        if (!cancelled) setLabel(options[0]?.label);
      })
      .catch(() => {
        if (!cancelled) setLabel('ERROR');
      });
    return () => {
      cancelled = true;
    };
  }, [resolveOptions, alias]);

  return <span data-testid={testId}>{label ?? 'loading'}</span>;
}

describe('custom-option resolution cache (CustomOptionProvider / useCustomOptions)', () => {
  it('resolves options from the host fetchOptions fn', async () => {
    const fetchOptions = mockFetchOptions();

    render(
      <CustomOptionProvider fetchOptions={fetchOptions}>
        <Consumer alias="GRADE" testId="a" />
      </CustomOptionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('Label-GRADE'));
    expect(fetchOptions).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent resolves of the same alias across renderer instances', async () => {
    const fetchOptions = mockFetchOptions();

    render(
      <CustomOptionProvider fetchOptions={fetchOptions}>
        <Consumer alias="GRADE" testId="a" />
        <Consumer alias="GRADE" testId="b" />
      </CustomOptionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('Label-GRADE'));
    await waitFor(() => expect(screen.getByTestId('b')).toHaveTextContent('Label-GRADE'));

    expect(fetchOptions).toHaveBeenCalledTimes(1);
    expect(fetchOptions).toHaveBeenCalledWith('GRADE');
  });

  it('normalizes the cache key (trim + uppercase) but sends the trimmed alias over the wire', async () => {
    const fetchOptions = mockFetchOptions();

    render(
      <CustomOptionProvider fetchOptions={fetchOptions}>
        <Consumer alias="  grade  " testId="a" />
        <Consumer alias="GRADE" testId="b" />
      </CustomOptionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('Label-grade'));
    await waitFor(() => expect(screen.getByTestId('b')).toHaveTextContent('Label-grade'));

    // same normalized key (GRADE) -> one call, using the FIRST caller's
    // trimmed (not uppercased) alias, exactly like 0.3.x getCustomOptionValues.
    expect(fetchOptions).toHaveBeenCalledTimes(1);
    expect(fetchOptions).toHaveBeenCalledWith('grade');
  });

  it('resolves a different alias with its own fetchOptions call (no over-eager dedup)', async () => {
    const fetchOptions = mockFetchOptions();

    render(
      <CustomOptionProvider fetchOptions={fetchOptions}>
        <Consumer alias="GRADE" testId="a" />
        <Consumer alias="MAJOR" testId="b" />
      </CustomOptionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('Label-GRADE'));
    await waitFor(() => expect(screen.getByTestId('b')).toHaveTextContent('Label-MAJOR'));

    expect(fetchOptions).toHaveBeenCalledTimes(2);
  });

  it('evicts the key on a failed resolve so a later attempt retries and can succeed', async () => {
    const fetchOptions: FetchCustomOptions = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementation(async (alias: string) => [{ value: alias, label: `Label-${alias}` }]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CustomOptionProvider fetchOptions={fetchOptions}>{children}</CustomOptionProvider>
    );
    const { result } = renderHook(() => useCustomOptions(), { wrapper });

    // first resolve of the key rejects — the resolver must evict it, not
    // cache the rejection forever.
    await expect(result.current('GRADE')).rejects.toThrow('boom');
    expect(fetchOptions).toHaveBeenCalledTimes(1);

    // a later resolve of the SAME key retries (call count increments) and
    // succeeds this time.
    const options = await result.current('GRADE');
    expect(options).toEqual([{ value: 'GRADE', label: 'Label-GRADE' }]);
    expect(fetchOptions).toHaveBeenCalledTimes(2);
  });

  it('useCustomOptions() throws a clear error when called outside a <CustomOptionProvider>', () => {
    // suppress React's expected error-boundary console.error noise for this assertion
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCustomOptions())).toThrow(/CustomOptionProvider/);
    spy.mockRestore();
  });
});
