'use client';

import type { ReactNode } from 'react';
import {
  AdapterProvider,
  AuthProvider,
  UIProvider,
  configureMessages,
  registerDefaultRenderers,
} from '@listgrid/react';
import { NextRouterProvider } from '@listgrid/next';
import { defaultUIComponents } from '@listgrid/ui-default';
import { registerExcelDataTransfer } from '@listgrid/excel';
import { rcmAdapter } from '../lib/adapter';

// Wire the new engine's host-injected seams once (charter C7): default UI
// primitives, a mock admin session, and the Next router adapter. Registering the
// built-in field renderers is a module-load side-effect (idempotent).
registerDefaultRenderers();

// W6-3 — register the opt-in `@listgrid/excel` Exporter/Importer into the
// core list's data-transfer registry (packages/excel/src/registry.ts) once at
// bootstrap, same module-load-side-effect posture as `registerDefaultRenderers()`
// above (a plain module-scope call is inherently "run once" — the module only
// evaluates once per JS runtime instance). This module is statically imported
// by the root layout (`app/layout.tsx` -> `Providers`), so `getDataTransfer()`
// is populated before any route's `ViewListGrid` toolbar can call it.
registerExcelDataTransfer();

// W3-4 — messages registry (spec §7 ListGridProvider messages, messages.ts):
// without this, showConfirm falls back to console+false and the built-in
// Delete confirm gate never proceeds. window.confirm is only ever touched
// inside the showConfirm closure, at click time (client-only) — this module-
// scope call itself does not access `window`, so it's SSR-safe.
configureMessages({
  showConfirm: async (message) => window.confirm(message),
  showToast: (message) => {
    console.log('[toast]', message);
  },
  showError: (message) => {
    console.error('[error]', message);
  },
});

const session = { roles: ['ADMIN'] };

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={session}>
        <AdapterProvider adapter={rcmAdapter}>
          <NextRouterProvider>{children}</NextRouterProvider>
        </AdapterProvider>
      </AuthProvider>
    </UIProvider>
  );
}
