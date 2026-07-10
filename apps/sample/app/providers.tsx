'use client';

import type { ReactNode } from 'react';
import {
  AdapterProvider,
  AuthProvider,
  UIProvider,
  registerDefaultRenderers,
} from '@listgrid/react';
import { NextRouterProvider } from '@listgrid/next';
import { defaultUIComponents } from '@listgrid/ui-default';
import { rcmAdapter } from '../lib/adapter';

// Wire the new engine's host-injected seams once (charter C7): default UI
// primitives, a mock admin session, and the Next router adapter. Registering the
// built-in field renderers is a module-load side-effect (idempotent).
registerDefaultRenderers();

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
