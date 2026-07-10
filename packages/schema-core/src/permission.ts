import type { Session } from './auth';

// PermissionPolicy — the single, canonical permission-visibility rule.
//
// The 0.3.x engine duplicated this predicate byte-for-byte three times
// (EntityTab.isPermitted:42-50, EntityFieldGroup.isPermitted:54-62,
// FormField.isPermitted:853-861). It is pure copy-paste — no competing designs —
// so unification carries zero behavioral risk. Charter C2 adds ONE new rule the
// old engine lacked: SubCollections must be permission-gated too; that is
// realized by lifting `requiredPermissions`/`isPermitted` onto the shared base
// item (see ./field/entity-field EntityItem), so every item kind — field, tab,
// group, subcollection — inherits the same gate uniformly.

/**
 * ANY-OF match. Empty/undefined `requiredPermissions` ⇒ visible. Non-empty
 * required + empty/undefined user ⇒ hidden. Otherwise visible iff the user holds
 * at least one required permission. Transplanted verbatim from EntityTab.ts:42-50.
 */
export function isPermitted(
  requiredPermissions: string[] | undefined,
  userPermissions: string[] | undefined,
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Canonical session → permissions extraction (2-way: `roles ?? authentication.roles`).
 *
 * The 0.3.x engine extracted this ad hoc at every call site; three sites used
 * this 2-way chain and one (EntityFormBase.getViewableTabs:356-361) additionally
 * fell back to a class-instance `this.session`. That instance fallback is a
 * state-holding leak that ADR-0002 removes — the store passes `session`
 * explicitly — so the canonical extraction drops it. (Behavioral narrowing
 * flagged for review in §Needs Review.)
 */
export function extractPermissions(session: Session | undefined): string[] {
  return session?.roles ?? session?.authentication?.roles ?? [];
}

/**
 * Additive, idempotent (Set-dedup) merge for the `withRequiredPermissions(...)`
 * builder. Transplanted verbatim from EntityTab.ts:28-35.
 */
export function mergeRequiredPermissions(
  existing: string[] | undefined,
  added: string[],
): string[] {
  return Array.from(new Set([...(existing ?? []), ...added]));
}

/** Namespaced accessor for ergonomic call sites: `PermissionPolicy.isPermitted(...)`. */
export const PermissionPolicy = {
  isPermitted,
  extractPermissions,
  mergeRequiredPermissions,
} as const;
