import React from 'react';

import { useUI } from '../../ui';

export interface AssetLinkProps {
  /** Resolved download URL — kept on `href` so middle-click / copy-link still work. */
  href: string;
  /** Raw asset URL as stored, handed to the host `openAsset` handler untouched. */
  assetUrl: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Asset download link.
 *
 * When the host injects `openAsset` through `UIProvider`, the click is delegated to
 * that handler — for deployments where direct asset URLs are gated and reading goes
 * through an authenticated path. Without it (the default) this stays a plain new-tab
 * link, so existing consumers are unaffected.
 */
export function AssetLink({ href, assetUrl, className, children }: AssetLinkProps) {
  const { openAsset } = useUI();

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={
        openAsset
          ? (event) => {
              event.preventDefault();
              void openAsset(assetUrl);
            }
          : undefined
      }
    >
      {children}
    </a>
  );
}
