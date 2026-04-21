import React, { ReactNode } from 'react';
import { RouterProvider, UrlStateProvider } from '../../listgrid';
import { nextRouterServices } from './NextRouterAdapter';
import { nextUrlStateServices } from './NextUrlStateAdapter';

// Convenience one-stop wrapper for Next.js apps. Puts RouterProvider +
// UrlStateProvider with the Next.js adapters in the right nesting order.
// Host apps still need to supply AuthProvider + UIProvider separately
// (those are host-specific).
//
//   import { NextListGridProvider } from '@rchemist/listgrid/next';
//   <NextListGridProvider>
//     <AuthProvider session={...}>
//       <UIProvider components={...}>{children}</UIProvider>
//     </AuthProvider>
//   </NextListGridProvider>

export interface NextListGridProviderProps {
  children: ReactNode;
}

export function NextListGridProvider({ children }: NextListGridProviderProps) {
  return (
    <RouterProvider value={nextRouterServices}>
      <UrlStateProvider value={nextUrlStateServices}>{children}</UrlStateProvider>
    </RouterProvider>
  );
}
