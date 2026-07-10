import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

/**
 * P0-7 (ADR-0006) — HTML sanitizer injection, ShowNotifications sink.
 *
 * htmlSanitizer's "already warned" latch is module-scope, so each test
 * resets the module registry and re-imports both ShowNotifications and
 * htmlSanitizer fresh — otherwise state from an earlier test (e.g. a
 * configured sanitizer, or a tripped warn latch) would leak across tests.
 */

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.resetModules();
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('ShowNotifications — P0-7 HTML sanitizer sink', () => {
  const payload = '<img src=x onerror=alert(1)>';

  it('renders an XSS payload as escaped text (not live HTML) when no sanitizer is configured, and warns once', async () => {
    const { ShowNotifications } = await import('./ShowNotifications');
    const { container } = render(<ShowNotifications messages={[payload]} />);

    // No live <img> element was mounted from the payload — it did not execute as HTML.
    expect(container.querySelector('img')).toBeNull();
    // The raw markup is visible as literal (escaped) text content instead.
    expect(container.textContent).toContain(payload);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('configureHtmlSanitizer');
  });

  it('uses the configured sanitizer output when one is registered (no warning)', async () => {
    const { configureHtmlSanitizer } = await import('../../config/htmlSanitizer');
    const { ShowNotifications } = await import('./ShowNotifications');

    configureHtmlSanitizer((html) => html.replace(/<img[^>]*>/gi, '[stripped]'));

    const { container } = render(<ShowNotifications messages={[payload]} />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('[stripped]');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
