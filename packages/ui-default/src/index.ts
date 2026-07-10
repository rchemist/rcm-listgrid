// @listgrid/ui-default — default UI primitives injected by the renderer
// (charter C7, ADR-0004).
//
// Minimal, UNSTYLED (plain semantic HTML, no CSS framework), accessible.
// A reference implementation a host can swap wholesale or override
// piecemeal via the `UIComponents` registry shape.
//
// Conventions:
// - Every input-like primitive normalizes its onChange to the VALUE the
//   field store expects (string/number/boolean) rather than the raw DOM
//   ChangeEvent — callers never touch `e.target.value`.
// - No inline visual styling (color, border, spacing) except where a
//   primitive is inherently a layout construct (Stack) or must be
//   positioned to function at all when rendered inline (Modal, LoadingOverlay).
export * from './primitives';
export * from './types';
