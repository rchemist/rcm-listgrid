# CSS Architecture — Target Design

> 2026-04-18 초안. 이 문서는 리팩터 **최종 형태의 사양**.
> `REFACTOR_CURRENT_STATE.md` → 여기 → `REFACTOR_PLAN.md` 순으로 읽을 것.

---

## 1. 핵심 철학

1. **Primitive + variant** — Mantine / Radix / shadcn 공통 패턴. 재사용 가능한 primitive (~20개) 에 `data-*` attribute 로 variant/size/state 표현.
2. **클래스 이름은 **무엇인지 (what)**, data-attr 는 **어떤 상태/변형인지 (how)**
3. **호스트 override contract**: primitive 셀렉터 + data-attr 만 공개 API. component-internal 클래스는 private.
4. **컴포넌트 JSX 는 primitive 조합** — 전용 클래스는 "진짜 그 컴포넌트만의 구조" 일 때만 (예: `rcm-tab-list`, `rcm-field-grid`, `rcm-subcollection-pagination` 등 구조적 레이아웃).
5. **`!important` 금지**, `dark:` 관련 규칙 현재는 모두 제거 (추후 다시 도입할 때 명시적으로).

## 2. 레이어 구조

```
styles/
├── tokens.css          — Layer 1: design tokens (색/간격/radius/shadow/z-index/font)
├── primitives.css      — Layer 2: primitive components (~20개)
├── layouts.css         — Layer 3: 구조적 레이아웃 (grid/flex 헬퍼, 컴포넌트 고유 구조)
└── components.css      — Layer 4: 진짜 component-specific (최소화. 비워질수록 좋음)
```

`index.ts` 에서 4개 파일을 순서대로 `import` → 번들에 하나로 concat.

### Layer 1 — tokens.css (변경 최소)

현재 tokens.css 구조 거의 유지. 다만:
- `--rcm-color-surface-hover`, `--rcm-color-surface-muted` 같은 semantic surface 토큰 정비
- `--rcm-color-success-text`, `--rcm-color-warning-text` 등 contrast 토큰 추가 (notice 컴포넌트용)
- 현재 tokens.css 110줄 → 약 150줄 예상

### Layer 2 — primitives.css (신규)

아래 primitive 만 존재. 각 primitive 는 **base 스타일 + data-attr 기반 variant/size/state**.

```
primitives.css 목차
├── Layout primitives
│   ├── .rcm-row           — flex row, gap, align-items:center
│   ├── .rcm-stack         — flex col, gap
│   ├── .rcm-grid          — grid container
│   ├── .rcm-divider       — horizontal/vertical divider
│   ├── .rcm-surface       — bg + border + radius + padding (카드/패널 공통)
│   └── .rcm-scroll-area   — overflow + scrollbar styling
├── Text primitives
│   ├── .rcm-heading       — [data-level="1"|"2"|"3"|"4"]
│   ├── .rcm-text          — [data-size="xs"|"sm"|"md"|"lg"] [data-tone="default"|"muted"|"disabled"|"emphasis"]
│   └── .rcm-label         — 폼 라벨 전용 (size/tone 포함)
├── Button primitives
│   ├── .rcm-button        — [data-variant="primary"|"outline"|"ghost"|"danger"] [data-size="sm"|"md"|"lg"] [data-state="loading"|"disabled"]
│   ├── .rcm-icon-btn      — 아이콘 전용 square 버튼. variant/size 공유
│   └── .rcm-button-group  — 버튼 그룹 addon (input-group 우측 등)
├── Input primitives
│   ├── .rcm-input         — text/password/email/number/date 공통. [data-size] [data-state="error"|"disabled"]
│   ├── .rcm-textarea      — input 과 동일 variant
│   ├── .rcm-select        — native select
│   ├── .rcm-checkbox / .rcm-radio
│   └── .rcm-input-group   — input + addon 컨테이너
├── Display primitives
│   ├── .rcm-badge         — inline 뱃지 [data-color="primary"|"success"|"warning"|"error"|"neutral"] [data-size]
│   ├── .rcm-chip          — 선택/제거 가능한 chip (badge 보다 강한 visual)
│   ├── .rcm-tag           — 태그 (chip 의 간소화 버전)
│   ├── .rcm-icon          — [data-size="xs"|"sm"|"md"|"lg"] [data-tone]
│   └── .rcm-skeleton      — [data-shape="line"|"circle"|"rect"] pulse animation
├── Surface variants
│   ├── .rcm-panel         — surface + padding
│   ├── .rcm-card          — surface + shadow + hover state
│   └── .rcm-notice        — [data-tone="info"|"success"|"warning"|"error"] + 좌측 아이콘 슬롯
├── Navigation primitives
│   ├── .rcm-tab-list      — 탭 리스트 컨테이너
│   ├── .rcm-tab           — 탭 버튼. [data-state="selected"|"disabled"]
│   ├── .rcm-menu          — dropdown 메뉴 컨테이너
│   └── .rcm-menu-item     — dropdown 항목. [data-tone] [data-state="disabled"|"active"]
└── Utility
    ├── .rcm-visually-hidden
    ├── .rcm-truncate
    └── .rcm-cursor-{pointer,help,not-allowed}
```

총 **22 primitive**. 각 primitive 는 평균 10~30줄 CSS (base + variants + states) → primitives.css 예상 ~700줄.

### Layer 3 — layouts.css (신규)

컴포넌트 전용이 아닌 **재사용 가능한 구조 레이아웃**. 현재 `rcm-field-grid`, `rcm-col-span-full`, `rcm-col-start-1-lg`, `rcm-form-layout-wrapper`, `rcm-form-panel`, `rcm-form-panel-inner`, `rcm-tab-list`, `rcm-tab-scroll` 같은 것.

예상 ~30 클래스, ~400줄.

### Layer 4 — components.css

진짜 해당 컴포넌트에만 의미가 있는 구조. **최대한 비워질 것**. 예:
- `rcm-listgrid-panel` (ListGrid 외곽 wrapper — 추후 `rcm-panel` 로 흡수 가능)
- `rcm-subcollection-toolbar` (SubCollection 특유의 toolbar. pagination/count pill 조합)
- `rcm-card-grid` (CardSubCollection 의 responsive grid)
- `rcm-fieldgroup` (FormField group 의 특정 padding/margin 규칙)

현재 ~400 composite 클래스 → 목표 ~20 클래스.

## 3. Variant / State / Size 공통 규약

**모든 primitive 는 아래 data-attr 중 적용 가능한 것만 구현**:

| attr | 값 | 설명 |
|---|---|---|
| `data-variant` | `primary` / `outline` / `ghost` / `danger` / `link` | 시각 강도 |
| `data-size` | `xs` / `sm` / `md` / `lg` / `xl` | 크기. 기본 `md` |
| `data-color` | `primary` / `success` / `warning` / `error` / `info` / `neutral` | 의미 색상. notice/badge/chip 위주 |
| `data-tone` | `default` / `muted` / `disabled` / `emphasis` | 텍스트 톤 |
| `data-state` | `selected` / `disabled` / `loading` / `error` / `collapsed` / `expanded` / `active` / `hover` | 현재 상태 |

**CSS selector 패턴**:
```css
.rcm-button { /* base */ }
.rcm-button[data-variant="primary"] { ... }
.rcm-button[data-variant="outline"] { ... }
.rcm-button[data-size="sm"] { ... }
.rcm-button[data-state="loading"] { ... }
.rcm-button[data-state="disabled"],
.rcm-button:disabled { opacity: 0.5; cursor: not-allowed; }
```

기본값은 attr 없는 상태. `data-variant` 생략 시 `outline` 같은 중립 스타일.

## 4. JSX 사용 패턴 (Before vs After)

### Before (현재 alpha.27)
```tsx
<button
  onClick={handleDeleteClick}
  className="rcm-card-item-action-btn rcm-card-item-action-btn-danger"
  aria-label="Delete"
>
  <IconTrash className="rcm-card-item-action-icon" />
</button>
```

### After (target)
```tsx
<button
  onClick={handleDeleteClick}
  className="rcm-icon-btn"
  data-variant="ghost"
  data-color="error"
  data-size="sm"
  aria-label="Delete"
>
  <IconTrash className="rcm-icon" data-size="sm" />
</button>
```

### Before
```tsx
<div className="rcm-notice rcm-notice-success">
  <IconCheck className="rcm-alert-item-icon" />
  <span>저장되었습니다</span>
</div>
```

### After
```tsx
<div className="rcm-notice" data-tone="success">
  <IconCheck className="rcm-icon" data-size="md" />
  <span>저장되었습니다</span>
</div>
```

### Before
```tsx
<div className="rcm-bool-wrap">
  <span className="rcm-bool-icon-frame rcm-bool-icon-frame-true">
    <IconCheck className="rcm-bool-icon rcm-bool-icon-true" />
  </span>
  <span className="rcm-bool-label rcm-bool-label-true">예</span>
</div>
```

### After
```tsx
<span className="rcm-row">
  <span className="rcm-icon-frame" data-color="success" data-size="sm">
    <IconCheck className="rcm-icon" data-size="xs" />
  </span>
  <span className="rcm-text" data-tone="emphasis" data-color="success">예</span>
</span>
```

## 5. 호스트 Override 계약

호스트는 아래 방법만 사용 **권장**. 나머지는 private API.

### ✅ 공개 API

1. **CSS 변수 override** (최우선 권장)
   ```css
   :root {
     --rcm-color-primary: #4f46e5;
     --rcm-radius-lg: 0.75rem;
   }
   ```

2. **primitive + variant 단위 override**
   ```css
   .rcm-button[data-variant="primary"] {
     background: linear-gradient(...);  /* 호스트 고유 primary 버튼 */
   }
   ```

3. **theme classNames prop** — additive class 주입
   ```tsx
   <ViewEntityForm classNames={{
     panel: { container: "my-custom-wrapper" },
     buttons: { save: "my-primary-btn" },
   }} />
   ```

### ❌ Private (override 금지)

- Layer 3/4 의 구조적 클래스 (`rcm-field-grid`, `rcm-subcollection-toolbar` 등) 내부 구현에 의존
- 여러 primitive 를 조합한 복합 셀렉터 (`.rcm-card .rcm-button` 같은) 는 호스트가 덮어쓰지 말 것

## 6. "이번 세션엔 안 하는" 것 (명시적 out-of-scope)

1. **Dark mode** — alpha.19~27 에서 전부 제거된 상태. 이번 리팩터에서도 재도입 안 함.
2. **CSS-in-JS 전환** — 정적 CSS 유지. 호스트 번들러가 tree-shake 할 수 있게 class 기반 그대로.
3. **Tailwind plugin 화** — `@rcm/listgrid` 를 Tailwind plugin 으로 재배포하는 옵션은 고려 안 함. 이 방향은 alpha.16/17 에서 실패로 결론난 상태.
4. **호환 shim** — 과거 `rcm-card-m2o-*` 같은 클래스의 후방호환 별칭 제공 안 함. 호스트는 gjcu-experiment 하나뿐이라 같이 마이그레이션.

## 7. 성공 기준

1. `base.css` + `primitives.css` + `layouts.css` + `components.css` 합산 **1,500줄 이하** (현재 5,070 대비 −70%)
2. 고유 `.rcm-*` 클래스 **80개 이하** (현재 627개 대비 −87%)
3. gjcu-experiment 의 아래 화면 시각 parity 유지:
   - `/academic/admission/applicant` 목록 + 상세
   - `/academic/student` 목록 + 상세 (기본 정보, 수강 이력, 학적변동 이력, 계좌정보 탭)
   - `/academic/admission/homepage/notice` 목록 + 상세
4. `npm run type-check` 통과
5. 호스트(gjcu-experiment) 빌드/런타임 에러 0

## 8. 남겨둘 결정 (다음 세션 시작 시 확정)

1. **`rcm-button-group` 의 경계**: `<input> + <button>` 조합을 "input-group" 으로 부를지 "button-group" 으로 부를지
2. **아이콘 라이브러리 종속성**: 현재 `@tabler/icons-react` + `@iconify/react` 혼재. primitive `rcm-icon` 은 어느쪽에 맞춰 size 규약 할지
3. **Skeleton 시스템**: 현재 `rcm-skeleton-*` 26개 중 Table/Card SubCollection 용이 11개. primitive `rcm-skeleton` + `data-shape` 로 통합 가능한지 판단
4. **Responsive 브레이크포인트**: 현재 768px/1024px/1280px 혼재. 토큰화 여부 (`--rcm-bp-md` 등)
