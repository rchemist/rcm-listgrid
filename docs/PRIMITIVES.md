# @rchemist/listgrid — Primitive Catalog

Reference for the CSS primitive classes + their `data-*` variants. This is the public contract for external consumers; host apps can build with these primitives alone (no Tailwind required) and theme via the token set in [`tokens.css`](../src/listgrid/styles/tokens.css).

- **File**: `src/listgrid/styles/primitives.css`
- **Import**: `import '@rchemist/listgrid/styles.css'` (or `./styles/primitives.css` alone)
- **Philosophy**: Each primitive is a *what* (class name) + *how* (data-attr variants). Base class describes the element; `data-variant` / `data-size` / `data-color` / `data-tone` / `data-state` describe modifications.
- **Cascade order**: `tokens → primitives → layouts → components → base`. Hosts override by writing CSS after `@rchemist/listgrid/styles.css`.

---

## Layout

### `.rcm-row`
Horizontal flex container.
- `data-justify="start|center|end|between|around"` — justify-content
- `data-align="start|center|end|baseline|stretch"` — align-items
- `data-gap="none|xs|sm|md|lg|xl"` — gap (default `sm`)
- `data-wrap="wrap|nowrap"` — flex-wrap

```html
<div class="rcm-row" data-justify="between" data-gap="md">
  <span>Left</span><span>Right</span>
</div>
```

### `.rcm-stack`
Vertical flex container.
- `data-gap="none|xs|sm|md|lg|xl"` (default `md`)
- `data-align="start|center|end|stretch"`

### `.rcm-grid`
CSS grid container.
- `data-cols="1|2|3|4"` — column count at default breakpoint
- `data-gap="none|xs|sm|md|lg|xl"`

### `.rcm-panel`
Surface card with border + radius.
- `data-elevation="none|sm|md|lg"` — box-shadow
- `data-padding="none|sm|md|lg"`

### `.rcm-divider`
Horizontal rule with consistent spacing.

---

## Buttons

### `.rcm-button`
- `data-variant="default|primary|outline|ghost|link"` (default: neutral surface)
- `data-color="error"` (pairs with `primary` / `outline` / `ghost` for danger actions)
- `data-size="sm|md|lg"` (default `md`)
- `:disabled` or `data-state="disabled"` — reduces opacity to 0.5, disables pointer events

```html
<button class="rcm-button" data-variant="primary">저장</button>
<button class="rcm-button" data-variant="outline" data-color="error" data-size="sm">삭제</button>
```

### `.rcm-icon-btn`
Square icon-only button (same data-attr API as `.rcm-button`, but auto-sizes for icon content).

### `.rcm-button-group`
Wraps multiple `.rcm-button` elements with shared border-radius (first/last button get rounded corners; inner borders collapse).

---

## Form inputs

### `.rcm-input`, `.rcm-textarea`, `.rcm-select`
- `data-size="sm|md|lg"`
- `data-state="error"` — red border + focus ring
- `:disabled` / `[readonly]` — muted surface

### `.rcm-checkbox`, `.rcm-radio`
Native input replacements with token-driven border/fill.

### `.rcm-label`
Form label with optional required/optional marker.
- `data-required` — shows red asterisk
- `data-optional` — shows muted "(optional)" hint

### `.rcm-input-group` + `.rcm-input-addon`
Compose input with left/right addon (e.g., currency prefix, search icon).

```html
<div class="rcm-input-group">
  <span class="rcm-input-addon">₩</span>
  <input class="rcm-input" />
  <span class="rcm-input-addon">KRW</span>
</div>
```

---

## Display

### `.rcm-text`
Generic text span/paragraph with semantic variants.
- `data-size="xs|sm|md|lg|xl"`
- `data-weight="normal|medium|semibold|bold"`
- `data-tone="muted|disabled|inherit"`
- `data-color="primary|error|success|warning|info|inherit"`

### `.rcm-heading`
Heading tag wrapper.
- `data-level="1|2|3|4|5|6"` — font-size ladder (independent of HTML tag)

### `.rcm-badge`
Pill-shaped small count / label.
- `data-color="primary|secondary|neutral|error|success|warning|info"`
- `data-size="sm|md"`

### `.rcm-tag`
Same visual family as badge but rectangular, usually for metadata.
- Same `data-color` / `data-size` as badge.

### `.rcm-chip`
Interactive chip (filter chip, selection).
- `data-interactive` — adds hover/cursor
- `data-state="selected"` — active state
- `data-color="primary|neutral"`

### `.rcm-icon`
Unified icon sizing / tone wrapper.
- `data-size="xs|sm|md|lg|xl"` — 12 / 14 / 16 / 20 / 24 px
- `data-tone="muted|disabled|inherit"`
- `data-color="primary|error|success|warning|info|secondary"`

### `.rcm-icon-frame`
Icon placed inside a colored surface chip.
- `data-shape="circle|square|rounded"` (default `rounded`)
- `data-size="xs|sm|md|lg"`
- `data-color="primary|secondary|neutral|error|success|warning|info"`

### `.rcm-skeleton`
Loading placeholder rect.
- `data-shape="line|circle|box"`
- `data-size="sm|md|lg"` (when shape is line)
- Legacy aliases: `.rcm-skeleton-accent` (primary tint), `.rcm-skeleton-danger` (error tint)

---

## Surface / messaging

### `.rcm-notice`
Info/warning/error callout box.
- `data-tone="info|success|warning|error"` (preferred)
- `data-variant="compact"` — smaller padding + xs font
- Legacy class aliases: `.rcm-notice-info` / `-success` / `-warning` / `-error` (identical to `data-tone`, for host themes that emit className strings)

### `.rcm-card`
Bordered surface for card layouts.
- `data-state="selected"` — primary-tinted border
- `data-interactive` — hover ring

### `.rcm-scroll-area`
Container with custom scrollbar styling (WebKit).

---

## Navigation

### `.rcm-tab-list`
Horizontal tab nav container.

### `.rcm-tab`
Individual tab.
- `data-state="selected"` — active tab (primary underline)
- `data-state="disabled"` — muted + no cursor

### `.rcm-menu` + `.rcm-menu-item` + `.rcm-menu-separator`
Vertical menu list used in dropdowns.

---

## Utilities

All utility classes are prefix `rcm-` and do exactly what their name says:

- `.rcm-cursor-pointer` / `-grab` / `-grabbing` / `-help` / `-not-allowed`
- `.rcm-bg-info-surface` / `-warning-surface` / `-error-surface` / `-success-surface`
- `.rcm-radius-full` (pill)
- `.rcm-flex-1`
- `.rcm-gap-{xs|sm|md|lg|xl}`
- `.rcm-ml-auto`
- `.rcm-truncate` (ellipsis)
- `.rcm-visually-hidden` (screen-reader-only)
- `.rcm-scroll-y`
- `.rcm-text-xs` / `-sm` / `-muted` / `-emphasis` / `-info` / `-warning` / `-error`
- `.rcm-heading-sm`

---

## Theming

### Token overrides
Override design tokens in your own CSS, loaded **after** `@rchemist/listgrid/styles.css`:

```css
@import "@rchemist/listgrid/styles.css";

:root {
    --rcm-color-primary: #7c3aed;        /* purple brand */
    --rcm-color-primary-hover: #6d28d9;
    --rcm-font-family: "Pretendard", sans-serif;
}
```

See [`tokens.css`](../src/listgrid/styles/tokens.css) for the full list (~50 tokens covering color, typography, spacing, sizing, radius, shadow, motion, z-index).

### Dark mode
Two activation paths:

1. **Automatic** — respects OS preference:
    ```html
    <!-- nothing to do -->
    ```
    `@media (prefers-color-scheme: dark)` block in `tokens.css` kicks in automatically.

2. **Explicit opt-in** — host controls via attribute:
    ```html
    <html data-theme="dark">   <!-- force dark -->
    <html data-theme="light">  <!-- force light, ignore system -->
    ```

Only **surface / text / border / shadow** tokens flip by default. Brand colors (primary, secondary, info/success/warning/error) keep their light values — override them in your own `:root` if you want a different dark accent.

### Runtime theming
For multi-tenant apps, scope tokens to a class or data-attr on a specific ancestor:

```css
.brand-acme { --rcm-color-primary: #dc2626; }
.brand-globex { --rcm-color-primary: #2563eb; }
```

```html
<div class="brand-acme">
  <ViewListGrid … />
</div>
```

### Per-instance override via `classNames` prop
Components accept a `classNames` prop with a slot map. See `ViewListGridClassNames` / `ViewEntityFormClassNames` types.

```tsx
<ViewListGrid
  classNames={{
    table: { container: 'my-custom-table' },
    header: { buttonGroup: 'my-header-buttons' },
  }}
/>
```

---

## Browser support

Requires a browser with:
- Container queries (Chrome 105+, Firefox 110+, Safari 16+)
- `color-mix()` (Chrome 111+, Firefox 113+, Safari 16.2+)
- CSS custom properties (all modern browsers)

Practical floor: **browsers from 2023 onward**.

---

## See also

- [`tokens.css`](../src/listgrid/styles/tokens.css) — all CSS custom properties
- [`primitives.css`](../src/listgrid/styles/primitives.css) — primitive rules
