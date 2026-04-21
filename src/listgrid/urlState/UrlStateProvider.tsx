'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { QueryStatesSetter, UrlParser, UrlStateServices, UrlStateSetOptions } from './types';

const UrlStateContext = createContext<UrlStateServices | null>(null);

export interface UrlStateProviderProps {
  value: UrlStateServices;
  children: ReactNode;
}

export function UrlStateProvider({ value, children }: UrlStateProviderProps) {
  return <UrlStateContext.Provider value={value}>{children}</UrlStateContext.Provider>;
}

function mustUrlState(): UrlStateServices {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- assertion helper always invoked from within hooks/components below
  const ctx = useContext(UrlStateContext);
  if (!ctx) {
    throw new Error(
      '[@rchemist/listgrid] useQueryStates must be called within a <UrlStateProvider>. ' +
        'Wrap your app with <UrlStateProvider value={...}> imported from @rchemist/listgrid. ' +
        'See @rchemist/listgrid-next for a Next.js (nuqs) adapter.',
    );
  }
  return ctx;
}

export function useQueryStates(
  parsers: Record<string, UrlParser<any>>,
  options?: UrlStateSetOptions,
): [Record<string, any>, QueryStatesSetter] {
  return mustUrlState().useQueryStates(parsers, options);
}
