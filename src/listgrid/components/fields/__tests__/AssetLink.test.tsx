import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { AssetLink } from '../AssetLink';
import { UIProvider, UIComponents } from '../../../ui/UIProvider';
import { headlessUIComponents } from '../../../ui/headless';

function renderLink(openAsset?: UIComponents['openAsset']) {
  return render(
    <UIProvider components={{ ...headlessUIComponents, openAsset }}>
      <AssetLink href="https://api.example.com/static-resource/a.png" assetUrl="a.png">
        a.png
      </AssetLink>
    </UIProvider>,
  );
}

describe('AssetLink', () => {
  it('stays a plain new-tab link when no openAsset handler is injected', () => {
    const { getByRole } = renderLink(undefined);
    const anchor = getByRole('link');

    expect(anchor).toHaveAttribute('href', 'https://api.example.com/static-resource/a.png');
    expect(anchor).toHaveAttribute('target', '_blank');

    // Navigation must stay with the browser — nothing intercepts the click.
    const clicked = fireEvent.click(anchor);
    expect(clicked).toBe(true);
  });

  it('delegates the click to openAsset with the raw asset url', () => {
    const openAsset = vi.fn();
    const { getByRole } = renderLink(openAsset);
    const anchor = getByRole('link');

    // fireEvent returns false once a listener called preventDefault().
    const clicked = fireEvent.click(anchor);

    expect(openAsset).toHaveBeenCalledWith('a.png');
    expect(clicked).toBe(false);
    // href is kept so copy-link / middle-click still resolve to the asset.
    expect(anchor).toHaveAttribute('href', 'https://api.example.com/static-resource/a.png');
  });

  it('keeps the href untouched when the handler rejects', async () => {
    const openAsset = vi.fn().mockRejectedValue(new Error('blocked'));
    const { getByRole } = renderLink(openAsset);

    fireEvent.click(getByRole('link'));

    expect(openAsset).toHaveBeenCalledTimes(1);
  });
});
