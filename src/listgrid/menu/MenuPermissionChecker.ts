// Stage 6 — Host-supplied menu permission checker.
//
// Original host app used this to gate listgrid pages behind menu-level
// permissions. Generic library cannot assume host menu infrastructure;
// default implementation returns a permissive 'ALL' level. Host apps
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
let _registered = false;
let _warned = false;

export function registerMenuPermissionChecker(checker: MenuPermissionChecker): void {
  _checker = checker;
  _registered = true;
}

export function checkAdminMenuPermission(
  args: MenuPermissionCheckArgs,
): PermissionType | Promise<PermissionType> {
  if (!_registered && !_warned) {
    _warned = true;
    console.warn(
      "[@rchemist/listgrid] No MenuPermissionChecker registered — defaulting to permissive 'ALL'. Call registerMenuPermissionChecker() at bootstrap to enforce real menu permissions.",
    );
  }
  return _checker(args);
}
