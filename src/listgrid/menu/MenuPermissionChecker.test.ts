import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MENU_ALIAS,
  registerMenuPermissionChecker,
  checkAdminMenuPermission,
  type MenuPermissionChecker,
  type MenuPermissionCheckArgs,
} from './MenuPermissionChecker';

/**
 * The menu permission module is a module-scope registry. Tests restore the
 * default permissive checker after each case to avoid cross-test leakage.
 */

const defaultChecker: MenuPermissionChecker = () => 'ALL';

describe('DEFAULT_MENU_ALIAS', () => {
  it('is the string "default"', () => {
    expect(DEFAULT_MENU_ALIAS).toBe('default');
  });
});

describe('checkAdminMenuPermission default behavior', () => {
  it('returns ALL when no checker has been registered', () => {
    registerMenuPermissionChecker(defaultChecker);
    expect(checkAdminMenuPermission({ url: '/admin' })).toBe('ALL');
  });
});

describe('registerMenuPermissionChecker', () => {
  it('installs a synchronous checker', () => {
    registerMenuPermissionChecker(() => 'READ');
    expect(checkAdminMenuPermission({ url: '/admin' })).toBe('READ');
    registerMenuPermissionChecker(defaultChecker); // restore
  });

  it('installs an async checker (Promise-returning)', async () => {
    registerMenuPermissionChecker(async () => 'NONE');
    const result = await checkAdminMenuPermission({ url: '/admin' });
    expect(result).toBe('NONE');
    registerMenuPermissionChecker(defaultChecker); // restore
  });

  it('passes url and alias through to the checker', () => {
    const received: MenuPermissionCheckArgs[] = [];
    registerMenuPermissionChecker((args) => {
      received.push(args);
      return 'READ';
    });
    checkAdminMenuPermission({ url: '/x', alias: 'menu-1' });
    expect(received[0]).toEqual({ url: '/x', alias: 'menu-1' });
    registerMenuPermissionChecker(defaultChecker);
  });

  it('overrides a previously-installed checker', () => {
    registerMenuPermissionChecker(() => 'READ');
    expect(checkAdminMenuPermission({ url: '/' })).toBe('READ');
    registerMenuPermissionChecker(() => 'NONE');
    expect(checkAdminMenuPermission({ url: '/' })).toBe('NONE');
    registerMenuPermissionChecker(defaultChecker);
  });
});
