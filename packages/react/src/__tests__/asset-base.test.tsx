import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BackendAdapter, PageResult } from '@listgrid/schema-core';
import { AssetBaseProvider, useAssetUrl } from '../providers/asset-base';
import { AdapterProvider } from '../providers/adapter';

// Proves the context-scoped resolution (design §4): the asset base flows through
// React context, so side-by-side / nested providers each resolve their own
// subtree — NO module-global singleton (the GX-6 flaw this redesign replaces).

function Probe({ url = 'x.png', label }: { url?: string; label: string }) {
  const resolve = useAssetUrl();
  return <span data-testid={label}>{resolve(url)}</span>;
}

function mockAdapter(assetBaseUrl?: string): BackendAdapter {
  const a: BackendAdapter = {
    list: async () =>
      ({ content: [], totalElements: 0, totalPages: 0 }) as PageResult<Record<string, unknown>>,
    getOne: async () => ({}),
    create: async () => ({}),
    update: async () => ({}),
    remove: async () => {},
  };
  if (assetBaseUrl !== undefined) a.assetBaseUrl = assetBaseUrl;
  return a;
}

describe('asset base — context-scoped resolution', () => {
  it('AS-1: two <AssetBaseProvider>s side-by-side each resolve their own base', () => {
    render(
      <>
        <AssetBaseProvider serverUrl="https://a.cdn">
          <Probe label="a" />
        </AssetBaseProvider>
        <AssetBaseProvider serverUrl="https://b.cdn">
          <Probe label="b" />
        </AssetBaseProvider>
      </>,
    );
    expect(screen.getByTestId('a').textContent).toBe('https://a.cdn/static-resource/x.png');
    expect(screen.getByTestId('b').textContent).toBe('https://b.cdn/static-resource/x.png');
  });

  it('AS-8: adapter.assetBaseUrl (tier i) overrides inherited host base; undefined falls through', () => {
    render(
      <AssetBaseProvider serverUrl="https://host.default">
        <AdapterProvider adapter={mockAdapter('https://adapter.cdn')}>
          <Probe label="override" />
        </AdapterProvider>
        <AdapterProvider adapter={mockAdapter()}>
          <Probe label="fallthrough" />
        </AdapterProvider>
      </AssetBaseProvider>,
    );
    expect(screen.getByTestId('override').textContent).toBe(
      'https://adapter.cdn/static-resource/x.png',
    );
    expect(screen.getByTestId('fallthrough').textContent).toBe(
      'https://host.default/static-resource/x.png',
    );
  });

  it('absolute foreign URL passes through regardless of base', () => {
    render(
      <AssetBaseProvider serverUrl="https://a.cdn">
        <Probe url="https://other/z.png" label="abs" />
      </AssetBaseProvider>,
    );
    expect(screen.getByTestId('abs').textContent).toBe('https://other/z.png');
  });

  it('no provider → env default (empty base) → root-relative', () => {
    render(<Probe url="x.png" label="def" />);
    expect(screen.getByTestId('def').textContent).toBe('/static-resource/x.png');
  });
});
