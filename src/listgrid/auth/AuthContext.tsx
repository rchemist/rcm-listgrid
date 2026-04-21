'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Session } from './types';

export interface AuthContextValue {
  readonly session: Session | undefined;
}

// Sentinel for "no provider" so undefined can legitimately mean "no session".
const NO_PROVIDER = Symbol('rcm-listgrid-no-auth-provider');
const AuthContext = createContext<AuthContextValue | typeof NO_PROVIDER>(NO_PROVIDER);

export interface AuthProviderProps {
  session: Session | undefined;
  children: ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
}

export function useSession(): Session | undefined {
  const ctx = useContext(AuthContext);
  if (ctx === NO_PROVIDER) {
    throw new Error(
      '[@rchemist/listgrid] useSession must be called within an <AuthProvider>. ' +
        'Wrap your app with <AuthProvider session={...}> imported from @rchemist/listgrid.',
    );
  }
  return ctx.session;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === NO_PROVIDER) {
    throw new Error(
      '[@rchemist/listgrid] useAuth must be called within an <AuthProvider>. ' +
        'Wrap your app with <AuthProvider session={...}> imported from @rchemist/listgrid.',
    );
  }
  return ctx;
}
