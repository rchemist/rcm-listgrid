import { createContext, useContext, type ReactNode } from 'react';
import type { BackendAdapter } from '@listgrid/schema-core';

// AdapterProvider — injects the BackendAdapter (ADR-0005) so renderer-layer
// components that must fetch on their own (the ManyToOne picker fetching the
// referenced entity's list, charter C3) get a transport without @listgrid/react
// importing one (dependency inversion). Throws if unwired, like the other
// required seams (charter C7).

const AdapterContext = createContext<BackendAdapter | undefined>(undefined);

export interface AdapterProviderProps {
  adapter: BackendAdapter;
  children?: ReactNode;
}

export function AdapterProvider({ adapter, children }: AdapterProviderProps) {
  return <AdapterContext.Provider value={adapter}>{children}</AdapterContext.Provider>;
}

/** Returns the injected BackendAdapter. Throws a clear error if unwired. */
export function useAdapter(): BackendAdapter {
  const ctx = useContext(AdapterContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useAdapter() was called without an <AdapterProvider>. ' +
        'Wrap your app in <AdapterProvider adapter={createRcmAdapter(...)}> to enable ' +
        'ManyToOne pickers and list fetching.',
    );
  }
  return ctx;
}
