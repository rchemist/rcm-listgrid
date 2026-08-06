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

### React list/form opt-ins

- `configureLabels(partial)` configures built-in form/list copy at app bootstrap. The default
  catalog preserves the existing Save/Delete, search, selection, settings, and pagination
  strings. `paginationPrev` (`Prev`) and `paginationNext` (`Next`) flow into the default
  `Pagination` component (**additive v0.5.4**).
- `FieldListConfig.format(value, row)` is an optional React-free string formatter for a derived
  list cell. It takes precedence over registered list-cell renderers and display fallbacks.
- Every derived list column whose field declares `withFilter()` exposes a `▽` header filter.
  Its input and values are shared with the advanced-search panel.
- `<ViewListGrid columnSettings />` adds an instant-apply column-visibility popover in the top
  searchbar. By default visibility is component-local and is not persisted; at least one
  resolved column always remains visible. The popover no longer consumes the `Modal` primitive.
  Pass `hiddenColumns?: readonly string[]` and
  `onHiddenColumnsChange?: (names: string[]) => void` to control it with column names and persist
  it in the host. Stale names are ignored for rendering and the last visible column cannot be
  hidden in either mode (**additive v0.5.4**).

---

## `UIComponents` contract (v0.5.7)

`UIProvider` requires the complete registry below. A host override must normalize change events
to the plain value shown here. `className` is forwarded only by slots whose prop list includes it;
do not assume every slot accepts arbitrary DOM props.

| Slot | Complete prop surface |
|---|---|
| `TextInput` | `value?`, `onChange?(string)`, `placeholder?`, `type?: text\|password\|month\|time\|datetime-local\|color`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?`, `className?` |
| `Textarea` | `value?`, `onChange?(string)`, `rows?`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?`, `className?` |
| `NumberInput` | `value?`, `onChange?(number)`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?` |
| `DateInput` | `value?`, `onChange?(string)`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?` |
| `CheckBox` | `checked?`, `indeterminate?`, `onChange?(boolean)`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?`, `className?`. The default primitive writes both the DOM `indeterminate` property and `aria-checked="mixed"`. |
| `SelectBox` | `value?`, `onChange?(string\|number\|boolean)`, `options?: {value,label}[]`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?`, `className?` |
| `TagsInput` | `value?: string[]`, `onChange?(string[])`, `data?`, `onValidateTag?`, `minTags?`, `maxTags?`, `placeholder?`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?` |
| `FileInput` | `id?`, `value?`, `onChange?(string\|undefined)`, `onUpload?(File) -> Promise<{url}>`, `accept?`, `readOnly?`, `disabled?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?` |
| `InlineMap` | `value?`, `onChange?(Record<string,string>)`, `keys?`, `minRows?`, `maxRows?`, `keyLabel?`, `valueLabel?`, `readOnly?`, `disabled?`, `id?`, `ariaLabel?`, `required?`, `invalid?`, `describedBy?` |
| `UserView` | `value?`, `id?`, `ariaLabel?`, `describedBy?` |
| `Button` | `onClick?()`, `children?`, `type?: button\|submit\|reset`, `disabled?`, `variant?: primary\|secondary\|danger\|ghost`, `className?` |
| `Modal` | `open?`, `onClose?()`, `title?`, `children?` |
| `Table` | Root: `children?`, `className?`; compound `Thead`/`Tbody`/`Tr`: `children?`, `className?`; `Th`/`Td`: `children?`, `colSpan?`, `className?` |
| `Pagination` | `page`, `totalPages`, `onChange?(page)`, `prevLabel?`, `nextLabel?`, `className?` |
| `Stack` | `children?`, `gap?: number\|string` |
| `LoadingOverlay` | `visible?` |

`Pagination.page` and `onChange(page)` are **0-based**. Upgrade note: hosts that implemented
this slot as 1-based before 0.5.6 must remove their `+1/-1` adapter. Only the visible page labels
are 1-based.

## Labels catalog

`configureLabels(partial)` is additive and preserves every omitted key.

| Key | Default |
|---|---|
| `save` / `delete` | `Save` / `Delete` |
| `deleteConfirm` | `정말 삭제하시겠습니까?` |
| `quickSearchPlaceholder` | `검색` (fallback when no derived field labels exist) |
| `quickSearchPlaceholderFor(labels)` | `Search ${labels.join(', ')}...` |
| `quickSearchAria` | `Quick search` |
| `quickSearchSubmitAria` / `quickSearchClearAria` | `빠른 검색` / `Clear quick search` |
| `advancedSearchToggle` / `advancedSearchApply` | `고급검색` / `검색` |
| `advancedSearchReset` / `advancedSearchClose` | `초기화` / `닫기` |
| `unifiedSearchToggle` | `통합검색 사용` |
| `unifiedSearchHint(labels)` | `${labels.join(', ')} 필드를 하나의 검색어로 검색합니다` |
| `unifiedSearchInputLabel(labels)` | `${labels.join(', ')} 검색` |
| `unifiedSearchPlaceholder(labels)` | `${labels.join(', ')} 중 아무거나 입력...` |
| `unifiedSearchDescription(labels)` | `입력한 검색어가 ${labels.join(', ')} 중 하나라도 포함되면 검색됩니다 (OR 조건)` |
| `selectionConfirm` | `확인` |
| `columnSettings` / `columnSettingsApply` | `목록 설정` / `적용` (`columnSettingsApply` is retained for compatibility; the v0.5.7 popover has no apply button) |
| `columnFilterAria(name)` | `${name} 필터` |
| `filterReset` / `selectAllAria` | `초기화` / `전체 선택` |
| `emptyState` | `데이터가 없습니다.` |
| `searchError` | `검색 중 오류가 발생했습니다. 검색 조건을 확인해 주세요.` |
| `searchErrorDismiss` | `검색 오류 닫기` |
| `openInNewWindowTooltip` | `새 창에서 보기` |
| `errorSummaryCollapsedTitle` | `작성하신 정보에 누락 또는 오류가 있습니다.` |
| `errorSummaryExpandedTitle` | `누락(오류) 정보 목록을 확인해 주세요.` |
| `errorSummaryCount(n)` | `${n}개 오류` |
| `rowNumberHeader` | `No.` |
| `paginationPrev` / `paginationNext` | `Prev` / `Next` |

## Filter and list-cell renderer contracts

`registerFilterRenderer(type, Component)` receives
`{ field: EntityField, value: unknown, onChange(value: unknown, operator?: QueryConditionType): void }`.
It is controlled: render `value` and send the plain next value, never a DOM/MUI event. The optional
operator is an additive SPI for renderers whose value shape determines the condition; old renderers
that call `onChange(value)` remain valid. The advanced panel and column-filter popover share value
and operator drafts. Apply removes a cleared rendered field's prior AND clause, preserves clauses
outside that rendered field set, and always emits `queryConditionType`.

| Field condition source | Wire condition |
|---|---|
| renderer `onChange(value, operator)` with a valid `QueryConditionType` | renderer operator (highest priority) |
| explicit `withFilter({ operator })` with a valid `QueryConditionType` | configured operator |
| array-valued `select`, `multiselect`, `checkbox`, `tag`, `customOption` | `IN` |
| `text`, `email`, `phone`, `textarea`, legacy/custom `string` | `LIKE` |
| scalar `select` and every other type | `EQUAL` |

An invalid open-string `withFilter({ operator })` value is never cast onto the wire; resolution
falls through to the value/type mapping above. `searchConditionFor(field, value?, rendererOperator?)`
is exported from the root entry for render-free inspection/reuse. This is the current engine's
mapping, not a claim of exact 0.2.x operator parity.
Quick search is narrower by design: because `FieldListConfig` has no quick-search flag, it derives
all fields that are simultaneously `withList()`, `withFilter()`, and built-in `type === 'text'`;
the first is main and the remainder are OR fields. It pre-expands those clauses directly into the
wire's top-level `filters.OR` bucket; unlike 0.2.x, it does not build a nested quick-search envelope.

`registerListCellRenderer(type, Component)` receives
`{ value: unknown, row: Record<string, unknown>, field?: EntityField }`. Derived-cell resolution
is: `FieldListConfig.format(value,row)` → registered renderer → optional
`field.getDisplayValue(value)` → `String(value ?? '')`. An explicit object column
`{name,label,render(row)}` bypasses that chain and owns its cell output.

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
