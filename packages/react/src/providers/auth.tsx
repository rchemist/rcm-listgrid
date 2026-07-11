import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from '@listgrid/schema-core';

// AuthProvider — threads the host's Session through to field predicates
// (isHidden/isReadOnly/isRequired/validate all take a FieldEvalContext with an
// optional `session`) and to any UI that needs to know who's looking (charter
// C7). The provider itself is a required wiring seam (missing it is a host
// bug); the session VALUE it carries is legitimately optional (unauthenticated
// screens render fine with `session={undefined}`) — so the two failure modes
// are distinguished via a private sentinel rather than conflating "no
// provider" with "no session".

const NO_PROVIDER = Symbol('listgrid/react:no-auth-provider');
type AuthContextValue = Session | undefined | typeof NO_PROVIDER;

const AuthContext = createContext<AuthContextValue>(NO_PROVIDER);

export interface AuthProviderProps {
  session?: Session;
  children?: ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

/**
 * Returns the host-injected {@link Session}, or `undefined` when the provider
 * is present but no session was given (unauthenticated). Throws a clear error
 * if called outside an `<AuthProvider>` ancestor.
 */
export function useSession(): Session | undefined {
  const ctx = useContext(AuthContext);
  if (ctx === NO_PROVIDER) {
    throw new Error(
      '[@listgrid/react] useSession() was called without an <AuthProvider> ancestor. ' +
        'Wrap your app in <AuthProvider session={session}> (session may be undefined for ' +
        'unauthenticated screens, but the provider itself must be present).',
    );
  }
  return ctx;
}
