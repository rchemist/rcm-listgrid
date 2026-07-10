// P0-7 (ADR-0006) — HTML sanitizer injection.
//
// HtmlField, ShowNotifications, and ViewHelpIcon render host-supplied HTML via
// `dangerouslySetInnerHTML`. The library ships no sanitizer of its own (to
// avoid a hard bundle dependency); host apps must opt in at bootstrap via
// `configureHtmlSanitizer((html) => sanitizedHtml)` — e.g.
// `configureHtmlSanitizer(DOMPurify.sanitize)`.
//
// Secure-by-default: until a sanitizer is configured, sinks must NOT render
// raw HTML. They call `sanitizeHtmlOrWarn()` and fall back to rendering the
// value as plain (auto-escaped) text when it returns null.

export type HtmlSanitizer = (html: string) => string;

let _sanitizer: HtmlSanitizer | undefined;
let _warned = false;

export function configureHtmlSanitizer(sanitizer: HtmlSanitizer): void {
  _sanitizer = sanitizer;
}

export function getHtmlSanitizer(): HtmlSanitizer | undefined {
  return _sanitizer;
}

/**
 * Internal accessor used by the raw-HTML sinks (HtmlField, ShowNotifications,
 * ViewHelpIcon). Returns the sanitized HTML string when a sanitizer is
 * configured, or `null` when none is configured — callers must render the
 * value as plain text in that case instead of using `dangerouslySetInnerHTML`.
 */
export function sanitizeHtmlOrWarn(html: string): string | null {
  if (!_sanitizer) {
    if (!_warned) {
      _warned = true;
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.warn(
          '[@rchemist/listgrid] No HTML sanitizer configured. Rendering raw HTML as escaped text instead. Call configureHtmlSanitizer((html) => sanitizedHtml) at bootstrap (e.g. configureHtmlSanitizer(DOMPurify.sanitize)) to enable HTML rendering.',
        );
      }
    }
    return null;
  }
  return _sanitizer(html);
}
