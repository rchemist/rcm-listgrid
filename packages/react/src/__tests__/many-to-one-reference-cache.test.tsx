// Reference-resolution cache (task H1) — JSDOM test. The ManyToOne renderer's
// bare-id resolution effect used to call `adapter.getOne(url, id)` directly,
// so every renderer instance (e.g. many list rows referencing the same
// entity) re-fetched independently, and any dependency churn re-fetched too.
// AdapterProvider now also hands out a `useReferenceResolver()` — a shared,
// adapter-scoped cache of in-flight/settled getOne(url, id) calls. This test
// exercises that cache directly (not through the full ManyToOneRenderer) via
// a minimal consumer component, proving: (1) concurrent resolves of the same
// reference across renderer instances collapse to one getOne call, (2) a
// different id still triggers its own call, and (3) a failed resolve evicts
// its cache entry so a later attempt retries instead of being stuck rejected
// forever.

import { useEffect, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, PageResult } from '@listgrid/schema-core';
import { AdapterProvider, useReferenceResolver } from '../providers/adapter';

function mockAdapter(): BackendAdapter {
  return {
    list: vi.fn(
      async (): Promise<PageResult<Record<string, unknown>>> => ({
        content: [],
        totalElements: 0,
        totalPages: 0,
      }),
    ),
    getOne: vi.fn(async (_url: string, id: string) => ({ id, name: `E${id}` })),
    create: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    update: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    remove: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
  };
}

/** Minimal consumer: resolves (url, id) on mount, renders the resolved name. */
function Consumer({ url, id, testId }: { url: string; id: string; testId: string }) {
  const resolveReference = useReferenceResolver();
  const [label, setLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    resolveReference(url, id)
      .then((entity) => {
        if (!cancelled) setLabel(String((entity as Record<string, unknown>).name));
      })
      .catch(() => {
        if (!cancelled) setLabel('ERROR');
      });
    return () => {
      cancelled = true;
    };
  }, [resolveReference, url, id]);

  return <span data-testid={testId}>{label ?? 'loading'}</span>;
}

describe('reference-resolution cache (AdapterProvider / useReferenceResolver)', () => {
  it('dedupes concurrent resolves of the same (url, id) across renderer instances', async () => {
    const adapter = mockAdapter();

    render(
      <AdapterProvider adapter={adapter}>
        <Consumer url="/professor" id="7" testId="a" />
        <Consumer url="/professor" id="7" testId="b" />
      </AdapterProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('E7'));
    await waitFor(() => expect(screen.getByTestId('b')).toHaveTextContent('E7'));

    expect(adapter.getOne).toHaveBeenCalledTimes(1);
    expect(adapter.getOne).toHaveBeenCalledWith('/professor', '7');
  });

  it('resolves a different id with its own getOne call (no over-eager dedup)', async () => {
    const adapter = mockAdapter();

    render(
      <AdapterProvider adapter={adapter}>
        <Consumer url="/professor" id="7" testId="a" />
        <Consumer url="/professor" id="8" testId="b" />
      </AdapterProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('a')).toHaveTextContent('E7'));
    await waitFor(() => expect(screen.getByTestId('b')).toHaveTextContent('E8'));

    expect(adapter.getOne).toHaveBeenCalledTimes(2);
    expect(adapter.getOne).toHaveBeenCalledWith('/professor', '7');
    expect(adapter.getOne).toHaveBeenCalledWith('/professor', '8');
  });

  it('evicts the key on a failed resolve so a later attempt retries and can succeed', async () => {
    const adapter: BackendAdapter = {
      list: vi.fn(
        async (): Promise<PageResult<Record<string, unknown>>> => ({
          content: [],
          totalElements: 0,
          totalPages: 0,
        }),
      ),
      getOne: vi
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockImplementation(async (url: string, id: string) => ({ id, name: `E${id}` })),
      create: vi.fn(async () => {
        throw new Error('not used in this test');
      }),
      update: vi.fn(async () => {
        throw new Error('not used in this test');
      }),
      remove: vi.fn(async () => {
        throw new Error('not used in this test');
      }),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AdapterProvider adapter={adapter}>{children}</AdapterProvider>
    );
    const { result } = renderHook(() => useReferenceResolver(), { wrapper });

    // first resolve of the key rejects — the resolver must evict it, not
    // cache the rejection forever.
    await expect(result.current('/professor', '9')).rejects.toThrow('boom');
    expect(adapter.getOne).toHaveBeenCalledTimes(1);

    // a later resolve of the SAME key retries (call count increments) and
    // succeeds this time.
    const entity = await result.current('/professor', '9');
    expect(entity).toEqual({ id: '9', name: 'E9' });
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });
});
