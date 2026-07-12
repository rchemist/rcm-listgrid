import { describe, expect, it } from 'vitest';
import { createRcmAdapter } from '../adapter';

// tier-i asset base forwarding (design §3) — conditional spread so an omitted
// option leaves the key ABSENT (not `undefined`), honoring exactOptionalPropertyTypes.
describe('createRcmAdapter — assetBaseUrl forwarding', () => {
  it('carries assetBaseUrl onto the adapter when provided', () => {
    const a = createRcmAdapter({ assetBaseUrl: 'https://cdn.example' });
    expect(a.assetBaseUrl).toBe('https://cdn.example');
  });

  it('leaves assetBaseUrl absent when not provided', () => {
    const a = createRcmAdapter({});
    expect(a.assetBaseUrl).toBeUndefined();
    expect('assetBaseUrl' in a).toBe(false);
  });
});
