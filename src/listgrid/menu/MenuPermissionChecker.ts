// Stage 6 — Host-supplied menu permission checker.
//
// Original host app used this to gate listgrid pages behind menu-level
// permissions. Generic library cannot assume host menu infrastructure;
// default implementation returns a permissive 'WRITE' level. Host apps
// register a real checker via `registerMenuPermissionChecker()`.

export const DEFAULT_MENU_ALIAS = 'default';

/**
 * Permission level returned by menu permission checks. Matches the
 * `PermissionType` enum used by ViewListGridWrapper / ViewEntityFormWrapper
 * (config/Config.ts).
 */
import type { PermissionType } from '../config/Config';

export interface MenuPermissionCheckArgs {
  url: string;
  alias?: string;
  [key: string]: any;
}

export type MenuPermissionChecker = (
  args: MenuPermissionCheckArgs,
) => PermissionType | Promise<PermissionType>;

const DEFAULT_CHECKER: MenuPermissionChecker = () => 'ALL';

let _checker: MenuPermissionChecker = DEFAULT_CHECKER;

export function registerMenuPermissionChecker(checker: MenuPermissionChecker): void {
  _checker = checker;
}

export function checkAdminMenuPermission(
  args: MenuPermissionCheckArgs,
): PermissionType | Promise<PermissionType> {
  return _checker(args);
}
