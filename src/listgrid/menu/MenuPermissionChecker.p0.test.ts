import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * P0-7 (ADR-0006) — MenuPermissionChecker default warns once when no host
 * checker has been registered (previously silent fail-open to 'ALL'). The
 * "already warned" latch is module-scope, so each test resets the module
 * registry and re-imports fresh to observe the true first-call state.
 */

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.resetModules();
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('checkAdminMenuPermission default warning', () => {
  it('warns once on the first call when no checker has been registered', async () => {
    const { checkAdminMenuPermission } = await import('./MenuPermissionChecker');
    const result = checkAdminMenuPermission({ url: '/admin' });
    expect(result).toBe('ALL');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('does not warn again on subsequent unregistered calls', async () => {
    const { checkAdminMenuPermission } = await import('./MenuPermissionChecker');
    checkAdminMenuPermission({ url: '/admin' });
    warnSpy.mockClear();
    checkAdminMenuPermission({ url: '/admin' });
    checkAdminMenuPermission({ url: '/other' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when a real checker has been registered before the first call', async () => {
    const { checkAdminMenuPermission, registerMenuPermissionChecker } = await import(
      './MenuPermissionChecker'
    );
    registerMenuPermissionChecker(() => 'READ');
    const result = checkAdminMenuPermission({ url: '/admin' });
    expect(result).toBe('READ');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
