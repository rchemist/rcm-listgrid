export type { Session, SessionUser } from './types';
export { AuthProvider, useSession, useAuth } from './AuthContext';
export type { AuthContextValue, AuthProviderProps } from './AuthContext';
export { registerSignOut, signOut } from './SessionProvider';

// Role check helper — matches the semantics of the original the legacy shared kit hasAnyRole.
// Reads roles from session.getUser().roles, session.roles, or session.authentication.roles.
import type { Session } from './types';
export function hasAnyRole(
  session: Session | undefined | null,
  ...allowedRoles: string[]
): boolean {
  if (!session) return false;
  const user = typeof session.getUser === 'function' ? session.getUser() : undefined;
  const roles: string[] | undefined =
    user?.roles ?? session.roles ?? (session.authentication?.roles as string[] | undefined);
  if (Array.isArray(roles)) {
    return roles.some((role: string) => allowedRoles.includes(role));
  }
  const userType: string | undefined =
    (user?.userType as string | undefined) ?? (session.userType as string | undefined);
  if (userType) {
    const normalized = userType.startsWith('ROLE_') ? userType : `ROLE_${userType}`;
    return allowedRoles.includes(normalized);
  }
  return false;
}
