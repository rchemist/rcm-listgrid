import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * P0-7 (ADR-0006) — HTML sanitizer injection.
 *
 * htmlSanitizer is a module-scope registry with a one-shot "already warned"
 * latch (like MenuPermissionChecker's registration flag), so each test that
 * cares about the pristine/first-call state resets the module registry and
 * re-imports it fresh — otherwise the warn-once latch tripped by an earlier
 * test would leak into later ones.
 */

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.resetModules();
});

afterEach(() => {
  warnSpy.mockRestore();
});

async function freshModule() {
  return import('./htmlSanitizer');
}

describe('sanitizeHtmlOrWarn — no sanitizer configured (secure-by-default)', () => {
  const payload = '<img src=x onerror=alert(1)>';

  it('returns null instead of raw HTML, and warns once on first use', async () => {
    const { sanitizeHtmlOrWarn, getHtmlSanitizer } = await freshModule();
    expect(getHtmlSanitizer()).toBeUndefined();
    expect(sanitizeHtmlOrWarn(payload)).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('configureHtmlSanitizer');
  });

  it('does not warn again after the first call (warns at most once)', async () => {
    const { sanitizeHtmlOrWarn } = await freshModule();
    sanitizeHtmlOrWarn(payload); // first call: latches the warning
    warnSpy.mockClear();
    sanitizeHtmlOrWarn(payload);
    sanitizeHtmlOrWarn('<script>alert(2)</script>');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('configureHtmlSanitizer — sanitizer configured', () => {
  it('is invoked by sanitizeHtmlOrWarn and its return value is used', async () => {
    const { configureHtmlSanitizer, getHtmlSanitizer, sanitizeHtmlOrWarn } = await freshModule();
    const impl = vi.fn((html: string) => html.replace(/<script.*?>.*?<\/script>/gi, ''));
    configureHtmlSanitizer(impl);
    expect(getHtmlSanitizer()).toBe(impl);

    const result = sanitizeHtmlOrWarn('<b>ok</b><script>alert(1)</script>');
    expect(impl).toHaveBeenCalledWith('<b>ok</b><script>alert(1)</script>');
    expect(result).toBe('<b>ok</b>');
  });

  it('does not warn once a sanitizer is configured', async () => {
    const { configureHtmlSanitizer, sanitizeHtmlOrWarn } = await freshModule();
    configureHtmlSanitizer((html) => html);
    sanitizeHtmlOrWarn('<p>hi</p>');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
