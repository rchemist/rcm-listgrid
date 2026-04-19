# v0.2.0 Major Bump — Breaking Change 통합 마일스톤 설계

**세션**: 1 of 2+ (설계만. 구현은 후속 세션, 2~3 session 분할 유력)
**작성일**: 2026-04-19
**기준 commit**: `4854afa` (Task E 마감) + Task F (`b0d63b7`, alpha.48 대기) + Task G (`65cf8ba`, alpha.49 대기)
**DECISIONS**: #21 / #61 / #65 / #69 / #70 / #71 / #72 / #73 / #74 (맥락) + **#75 (이 설계 — v0.2.0 세션 1 예정)**

참고 문서:
- `docs/GENERIC_DESIGN.md` (Task E 설계 — 11 섹션 템플릿)
- `docs/FIELD_RENDERER_GENERIC_DESIGN.md` (Task F 설계 — 11 섹션 템플릿)
- `docs/TASK_G_DESIGN.md` (Task G 설계 — semi-breaking 패턴 참고)

---

## 0. TL;DR

1. **v0.2.0 major bump** — alpha.4x 라인을 마감하고, 누적된 `@deprecated` / `TODO: remove in v0.2` 항목을 **한 번에** 정리하는 메이저 릴리즈.
2. **Task F (alpha.48) + Task G (alpha.49) 을 v0.2.0 에 통합 배포** 권고. alpha.48/49 는 "설계 완료 & 구현 완료 & gjcu 실측 peer 회귀 0" 상태로 이미 배포 대기 중. 독립 alpha 배포 후 곧바로 v0.2.0 으로 묶어서 소비자의 marketing migration 횟수를 1 회로 최소화.
3. **최종 포함 scope** — A(필수) 3 + B(재량) 3 = **6 항목**:
   - A-1: `attributes: Map<string, any>` → `Map<string, unknown>` (15+ 위치 + gjcu 20+ 소비자)
   - A-2: `ViewListGridTheme.headerButtons` slot 제거 (DECISIONS #61 유예 사항 실행)
   - A-3: `InlineSubCollectionField` 의 `inlineRowActions` / `inlineRowActionsConfig` / `withRowActions` / `withRowActionsConfig` 및 container 옵션 `rowActions/rowActionsConfig` 전면 제거 (gjcu 소비 0 확인)
   - B-4: `ViewEntityFormTheme` 의 deprecated slot 4 개 (`container`/`emptyMessage`/`headerWrapper`/`collapseIcon` + `icons` 별칭) 제거
   - B-5: `AlertStyles.bg` 필드 + `getAlertStyles` 반환 객체의 `bg`/`hoverBg`/`text` legacy 필드 정리 (`className`/`dataTone` only)
   - B-6: `useAlertManager` 의 deprecated `getColorIndicator` 제거 (`getIndicatorTone` only)
4. **Task F/G 통합 권고** — **O**. v0.2.0 = Task E (alpha.46/47 배포 완료) + Task F (alpha.48 대기) + Task G (alpha.49 대기) + 이 문서의 6 breaking = "의도된 any 중 공개 API 청소 완료" 마일스톤. 단일 major 로 소비자 migration 1 회.
5. **gjcu 실측 영향** — A-1 (`attributes`) 이 거의 전부: `.getAttributes()` 18+ 개소 + `.withAttributes(new Map([[...]]))` 2 개소 = **약 20 개소 migration 필요** (value 접근 시 `as` cast 추가). A-3 은 gjcu 소비 **0**. B-4/B-5/B-6 은 gjcu 소비 **0** (grep 통과). 총 gjcu breaking 영향 = A-1 단독, 난이도는 "mid-low" (기존 `as` cast 패턴이 있어 추가 소비자 교육 필요 최소).
6. **마이그레이션 문서** — `CHANGELOG.md` (릴리즈 노트 공식) + 선택적 `UPGRADE.md` (코드 변환 레시피 집중). 섹션 7 에 초안.
7. **구현 세션 프롬프트 포인터** — 섹션 9 에 단일 "구현 세션 1" 프롬프트 초안. 1~2 에이전트 (6 항목 독립 → 병렬 가능), 각 항목이 commit 단위.
8. **스코프 외 (Task H+ 또는 v0.3.0 후보)** — 섹션 8: ViewListProps / ViewListResult 제네릭화, FieldRenderer React 컴포넌트 제네릭화, Playwright 시각 회귀 suite, misc cleanup (JSON.parse 직접 호출 3 개소 통일 등).

---

## 1. 배경 (Why)

### alpha.4x 누적의 실상

v0.1.0 이 "inert copy" 였다면, alpha.4x 라인 (alpha.40 framework-free → alpha.47 Task E 마감) 은 **의도적 리팩터의 누적**. 각 alpha 가 세 부류의 잔여를 남김:

1. **의도된 any 승격** (Task E/F/G 로 진행) — 의미적 any 를 제네릭 파라미터로 승격. 런타임 무변경, 타입 레벨만.
2. **공개 API deprecated 누적** — alpha.33~36 CSS 리팩터 과정에서 "JSX 가 primitive 로 전환되어 slot 이 쓰이지 않지만 소비자 호환 위해 slot 은 남김" 패턴. 본문에서 "TODO: remove in v0.2" / `@deprecated` JSDoc 으로 표기.
3. **구현 중복 / 호환 변환 로직** — alpha.40 전후의 InlineSubCollectionField 가 `rowActions` → `rowActionColumns` 로 이전했지만 구 API 를 optional 로 유지 + 내부에서 변환하는 로직이 남음.

v0.2.0 major bump 의 의미는 **세 부류 중 2/3 을 청소** (런타임 제거 가능한 것). Task E/F/G 가 1/3 을 처리.

### 현재 상태 (Task G 세션 2 완료 시점)

- alpha.47 배포 완료. alpha.48 (Task F) / alpha.49 (Task G) 배포 대기.
- 600+ `@deprecated` 또는 "TODO: remove in v0.2" 주석은 없음. **실제 grep 결과는 소수** (섹션 2 인벤토리). 대부분은 이미 #61 / #73 / #74 에서 유예 처리된 항목이 그대로 살아있는 상태.
- `any` 표면 grep: 280 건 (Task G 후). v0.2.0 에서 `attributes: Map<string, any>` → `Map<string, unknown>` 승격 시 추가 -15 건 예상. **최종 265 전후**.
- gjcu 호스트 baseline: alpha.47 overlay 기준 0 errors (Task E 실측 #72 + Task F/G 실측 유지).

### v0.2.0 이 해결하는 것

- `@deprecated` / "TODO: remove in v0.2" 주석 **0** 으로 수렴 (Task F/G 통합 포함).
- 공개 API 의 `: any` 중 "열린 확장 포인트" 성격 → `: unknown` 으로 전환해 **타입 안전 책임 반환** (소비자가 명시적으로 cast 필요 — 의도 명확화).
- 호환 변환 로직 (rowActions ↔ rowActionColumns 런타임 변환 등) 제거로 **코드 경량화**.
- 한 번의 소비자 migration 으로 Task F+G+6 breaking 전부 적용. 소비자는 "alpha.48/49 skip → 0.2.0 go" 경로.

### v0.2.0 이 해결 못하는 것

- **ViewListProps / ViewListResult / CardItem 의 `item: any`** — row 렌더링 쪽 다형성. Task H 후보. 스코프 외.
- **UIProvider `ComponentType<any>` wrapper** — DECISIONS #21 의 의도된 any. 소비자 임의 prop. 유지.
- **dynamic field registry (`registerSmsHistoryField` 등)** — 열린 집합. 유지.
- **FieldRenderer React 컴포넌트 자체의 제네릭화** — Task F § 2.7 에서 명시적으로 제외. 유지.
- **런타임 스키마 검증 (zod 등)** — parse 의 한계. 별도 방향 (라이브러리가 검증 도구를 번들링하는 것은 의도 외).
- **Playwright 시각 회귀 suite** — DECISIONS #63 권고. 독립 task.

### 왜 v0.2.0 에 지금 하나

- Task E/F/G 로 타입 엄격성이 안정 착지 (exactOpt + TSelf/TForm/TValue + parse unknown + ViewRenderProps<TForm>). 이 위에서 공개 API breaking 을 한 번에 정리하면 소비자 입장에서 "v0.2.0 재설치 + 20 cast 추가 + 1~2 import 변경" 으로 끝남.
- 만약 v0.3.0 까지 미루면: alpha.50 → alpha.60 → v0.2.0 → ... 소비자가 alpha 의 interim state 를 계속 넣다 빼야 함. 한 major 로 묶는 것이 소비자 친화.
- DECISIONS #61 의 유예 문구 "v0.2 major bump 전까지 공개 API breaking 을 피하고자 slot 자체는 유지" 가 **약속 이행** 시점.

---

## 2. 포함 항목 결정 (A 필수 + B 재량)

### 2.1 인벤토리 (현 소스 grep 실측)

| # | 항목 | 위치 | 소비자 영향 (gjcu grep) |
|---|---|---|---|
| A-1 | `attributes: Map<string, any>` | EntityField.ts:31/105, EntityForm.tsx:102/868, Config.ts:534, EntityFormBase.tsx:181/778/788/815/825/832, FormField.tsx:149/195/693, ManyToOneField.tsx:138/144 (13 core + helper) | **20+** (.getAttributes 18+ + .withAttributes 2) |
| A-2 | `ViewListGridTheme.headerButtons?` slot | `components/list/types/ViewListGridTheme.types.ts:67` + 하위 11 sub-slot | **0** (gjcu `headerButtons` 매치는 전부 `ViewListGridWrapper` props) |
| A-3 | InlineSubCollectionField rowActions/rowActionsConfig | `config/InlineSubCollectionField.tsx:153/156/181/183/264/282` + container 로직 + `components/list/ui/InlineSubCollectionView.tsx:46/48` | **0** (gjcu `rowActions:` / `withRowActions(` 0) |
| B-4 | ViewEntityFormTheme deprecated slot | `components/form/types/ViewEntityFormTheme.types.ts:265-308` (container / emptyMessage / headerWrapper / icons / collapseIcon 5 곳) | **0** (deprecated 이름으로 grep 0) |
| B-5 | AlertStyles.bg + legacy getAlertStyles 필드 | `components/form/types/ViewEntityFormAlerts.types.ts:23` (bg) + hoverBg / text + `hooks/useAlertManager.ts:106` | **0** |
| B-6 | useAlertManager getColorIndicator (deprecated legacy mapping) | `hooks/useAlertManager.ts:141-152` | **0** |

### 2.2 A (필수) 판정 근거

**A-1. `attributes: Map<string, any>` → `Map<string, unknown>`**

- "의도된 any" 중 가장 자주 언급된 잔여 (DECISIONS #21, #70, #71, #73, #74 에서 반복 "v0.2.0 major bump 후보" 마킹).
- `attributes` 는 필드의 열린 확장 포인트 — 소비자 (gjcu) 가 `collaboMode`, `layoutMode`, `editable`, `bypassSyllabusFilter` 등 임의 key/value 를 주입. 라이브러리 쪽은 key/value 스키마를 모름 → `unknown` 이 정답. `any` 유지 시 소비자가 cast 없이 `.get('x')` dereference 가능 (타입 안전 구멍).
- gjcu 영향 20+ 개소지만 **대부분 이미 `as` cast 를 쓰고 있음**: `.get('targetSemesterId') as string | undefined`, `.get('layoutMode') as LayoutMode ?? 'student'`, `.get('bypassSyllabusFilter')` (boolean 으로 바로 쓰는 2 개소만 cast 추가 필요). migration 난이도 **mid-low**.

**A-2. `ViewListGridTheme.headerButtons` slot 제거**

- DECISIONS #61 유예 문구의 **정확한 대상**. "HeaderActionButtons 의 JSX 가 `rcm-button` + `data-variant`/`data-color` 를 직접 사용하므로 이 slot 은 소비되지 않습니다." — 이미 **런타임에서 무효**.
- gjcu grep 매치 0 (매치된 `headerButtons` 는 전부 `ViewListGridWrapper.headerButtons` — 완전히 다른 host API).
- 제거 시 JSX 영향 0, CSS 영향 0 (이미 primitive 로 전환 완료).

**A-3. `InlineSubCollectionField` deprecated API 전면 제거**

- 6 개소 `@deprecated` 주석 (InlineRowActionsConfig / inlineRowActions / inlineRowActionsConfig / rowActions / rowActionsConfig / withRowActions / withRowActionsConfig) + 내부 호환 변환 로직.
- gjcu 소비 **0**. 이미 `rowActionColumns` 로 전환되어 있음.
- 제거 시 코드 감축 추정 ~50~80 줄 (InlineSubCollectionField.tsx 중).

### 2.3 B (재량) 판정 근거

**B-4. ViewEntityFormTheme deprecated slot 제거 (권고 O)**

- 5 개소 명시 deprecated: `container` (line 266, use panel) / `emptyMessage` (270, use empty) / `headerWrapper` (298, use header) / `icons` (304, use actions) / `collapseIcon` (308, use collapseToggle).
- gjcu 소비 0.
- 유지 비용 — 소비자가 어느 것을 쓸지 혼동. 제거 이득 > 유지 이득.
- 위험 — 소비자가 deprecated 이름으로 theme 를 내려주고 있을 경우 TypeScript 에러. 하지만 gjcu grep 0 + 이름이 명확히 "deprecated" 라 사용 가능성 매우 낮음.

**B-5. AlertStyles.bg + getAlertStyles legacy 필드 정리 (권고 O)**

- `AlertStyles.bg` 는 `@deprecated Use className + dataTone` 명시. 반환값은 이미 `'rcm-notice'` (tone 수식어 없음).
- `AlertStyles` 에 `hoverBg: string; text: string` 도 남아있는데 반환값은 `hoverBg: '', text: ''` — **쓰지 않는 legacy**.
- `getAlertStyles` 의 `base = { bg: 'rcm-notice', className: 'rcm-notice', hoverBg: '', text: '' }` 에서 bg/hoverBg/text 제거하면 `{ className: 'rcm-notice' }` 만 남음 (단순).
- 소비자 (AlertItem.tsx 등) 는 `className` / `dataTone` 만 사용 — 확인됨.
- 위험: 소비자가 `style.bg` 로 직접 접근하는 경우. gjcu grep 0.

**B-6. useAlertManager getColorIndicator 제거 (권고 O)**

- `// Deprecated: legacy class-name mapping, kept for backward-compat of public API. JSX now prefers getIndicatorTone + data-tone.`
- `ViewEntityFormAlerts.tsx:12` 에서 아직 import 중 (`getColorIndicator, getIndicatorTone, useAlertManager`). 내부 사용처 grep 필요 (세션 2 에서 확정).
- gjcu 소비 0 (외부 export 여부 index.ts 에서 확인 필요 — 세션 2).
- 내부에서만 사용된다면 제거 simple. export 되어 있다면 major bump 정당화.

### 2.4 C (스코프 외) — 섹션 8 참조

---

## 3. 각 breaking 의 마이그레이션 경로

### 3.1 A-1 `attributes` Map 제네릭 강화

**라이브러리 변경**:

```ts
// 현재
export interface EntityField extends EntityItem {
  attributes?: Map<string, any>;
  withAttributes(attributes: Map<string, any>): this;
}

// v0.2.0 후
export interface EntityField extends EntityItem {
  attributes?: Map<string, unknown>;
  withAttributes(attributes: Map<string, unknown>): this;
}
```

**소비자 마이그레이션 (3 가지 선택지, 가장 간단한 것부터)**:

```ts
// BEFORE (v0.1)
const mode = entityForm.getAttributes().get('collaboMode');  // any — dereference 자유
if (mode === 'custom') { ... }

// OPTION A: inline cast (적은 수정)
const mode = entityForm.getAttributes().get('collaboMode') as string | undefined;
if (mode === 'custom') { ... }

// OPTION B: 지역 변수 narrow (더 엄격)
const raw = entityForm.getAttributes().get('collaboMode');
const mode = typeof raw === 'string' ? raw : undefined;
if (mode === 'custom') { ... }

// OPTION C: helper 함수 정의 (대규모 사용처)
function getStringAttr(ef: EntityForm, key: string): string | undefined {
  const v = ef.getAttributes().get(key);
  return typeof v === 'string' ? v : undefined;
}
```

**gjcu 실측 영향 분류 (20+ 개소)**:
- **이미 `as` 있음** (12+ 개소): `.get('targetSemesterId') as string | undefined`, `.get('layoutMode') as LayoutMode ?? 'student'`, `.get('duplicateDecision') as DuplicateDecision | undefined` — **무수정 호환**
- **cast 추가 필요** (5~8 개소): `.get('collaboMode')` + 비교 (`=== 'custom'`), `.get('editable') === true` — `=== ` 비교 시 `unknown === 'custom'` 은 TS 5.x 에서 컴파일 OK (다만 narrow 안 됨). **inline cast 추가 권고**
- **`.withAttributes(new Map([['rows', 4]]))`** (2 개소): `Map<string, unknown>` 은 `Map<string, number>` 과 호환 (공변). **무수정**

**예상 실측 수정 건수**: 5~8 개소 (cast 추가). 나머지는 기존 `as` 로 이미 커버됨.

### 3.2 A-2 `ViewListGridTheme.headerButtons` slot 제거

**라이브러리 변경**:

```ts
// 현재
export interface ViewListGridTheme {
  ...
  headerButtons?: {
    wrapper?: string;
    default?: string;
    primary?: string;
    outline?: string;
    danger?: string;
    icon?: string;
    delete?: string;
    refresh?: string;
    download?: string;
    upload?: string;
    create?: string;
  };
  ...
}

// v0.2.0 후
export interface ViewListGridTheme {
  ...
  // (headerButtons 삭제)
  ...
}
```

**소비자 마이그레이션**:

```ts
// BEFORE (theme 내려주던 코드, gjcu 에는 없음)
const myTheme: ViewListGridTheme = {
  headerButtons: { primary: 'my-btn my-btn-primary', ... },
  ...
};

// AFTER
// 삭제. JSX 가 rcm-button + data-variant 를 직접 사용하므로 theme override 불필요.
// 커스텀 필요 시: CSS 로 `.rcm-button[data-variant="primary"]` 재정의
const myTheme: ViewListGridTheme = {
  ...  // (headerButtons 제거)
};
```

### 3.3 A-3 InlineSubCollectionField deprecated API 제거

**라이브러리 변경**:

```ts
// 현재 (src/listgrid/config/InlineSubCollectionField.tsx)
export interface InlineRowActionsConfig {  // @deprecated
  ...
}

export class InlineSubCollectionField extends SubCollectionField {
  /** @deprecated Use rowActionColumns instead */
  inlineRowActions?: InlineRowAction[] | undefined;
  /** @deprecated Use rowActionColumns instead */
  inlineRowActionsConfig?: InlineRowActionsConfig | undefined;
  rowActionColumns?: InlineRowActionColumn[];

  withRowActions(...actions: InlineRowAction[]): this {  // @deprecated
    this.inlineRowActions = actions;
    // + 내부 호환 변환 로직 (rowActionColumns 로 매핑)
    return this;
  }
  withRowActionsConfig(config: InlineRowActionsConfig): this { ... }  // @deprecated
  withRowActionColumns(...cols: InlineRowActionColumn[]): this { ... }
  ...
}

// v0.2.0 후
export class InlineSubCollectionField extends SubCollectionField {
  rowActionColumns?: InlineRowActionColumn[];
  withRowActionColumns(...cols: InlineRowActionColumn[]): this { ... }
  // inlineRowActions / inlineRowActionsConfig / withRowActions / withRowActionsConfig 전부 제거
  // InlineRowActionsConfig interface 도 제거 (쓰이지 않음)
}
```

**소비자 마이그레이션** (gjcu 0 이라 형식적):

```ts
// BEFORE
field.withRowActions(action1, action2).withRowActionsConfig({ order: 1 });

// AFTER
field.withRowActionColumns(
  new InlineRowActionColumn({ order: 1, actions: [action1, action2] })
);
```

### 3.4 B-4 ViewEntityFormTheme deprecated slot 제거

**라이브러리 변경**:

```ts
// 현재
export interface ViewEntityFormTabPanelStyles {
  panel?: string;
  container?: string;  // deprecated, use panel
  empty?: string;
  emptyMessage?: string;  // deprecated, use empty
  ...
}
export interface ViewFieldGroupStyles {
  ...
  header?: string;
  headerWrapper?: string;  // deprecated, use header
  actions?: string;
  icons?: string;  // deprecated, use actions
  collapseToggle?: string;
  collapseIcon?: string;  // deprecated, use collapseToggle
}

// v0.2.0 후 — 5 deprecated 필드 제거
export interface ViewEntityFormTabPanelStyles {
  panel?: string;
  empty?: string;
  ...
}
export interface ViewFieldGroupStyles {
  ...
  header?: string;
  actions?: string;
  collapseToggle?: string;
}
```

**소비자 마이그레이션**:
- `container` → `panel`
- `emptyMessage` → `empty`
- `headerWrapper` → `header`
- `icons` → `actions`
- `collapseIcon` → `collapseToggle`

gjcu 0, 형식적.

### 3.5 B-5 AlertStyles.bg 정리

**라이브러리 변경**:

```ts
// 현재 (ViewEntityFormAlerts.types.ts)
export interface AlertStyles {
  bg: string;       // @deprecated
  hoverBg: string;
  text: string;
  icon: ComponentType<...>;
  className: string;
  dataTone?: 'info' | 'success' | 'warning' | 'error';
}

// v0.2.0 후
export interface AlertStyles {
  icon: ComponentType<...>;
  className: string;
  dataTone?: 'info' | 'success' | 'warning' | 'error';
}

// hooks/useAlertManager.ts
// 현재
const base = { bg: 'rcm-notice', className: 'rcm-notice', hoverBg: '', text: '' };
// v0.2.0 후
const base = { className: 'rcm-notice' };
```

**소비자 마이그레이션** (gjcu 0):
- `style.bg` 사용 → `style.className` 으로 전환. 값은 이미 동일 (`'rcm-notice'`).
- `style.hoverBg` / `style.text` 사용 → 제거. 이미 빈 문자열이라 실제 효과 없음.

### 3.6 B-6 useAlertManager getColorIndicator 제거

**라이브러리 변경**:

```ts
// 현재
export const getIndicatorTone = (color: string): 'info' | ... => { ... };
export const getColorIndicator = (color: string): string => {  // @deprecated
  switch (color) { case 'danger': return 'rcm-alerts-indicator-error'; ... }
};

// v0.2.0 후 — getColorIndicator 제거
export const getIndicatorTone = (color: string): 'info' | ... => { ... };
```

**소비자 마이그레이션** (gjcu 0):

```tsx
// BEFORE
<div className={getColorIndicator(color)} />

// AFTER
<div className="rcm-alerts-indicator" data-tone={getIndicatorTone(color)} />
```

---

## 4. Any 감축 예상

### 4.1 승격 가능 (표면 grep)

| 위치 | 현재 | v0.2.0 후 | 예상 감축 |
|---|---|---|---|
| `Map<string, any>` 13+ 개소 (attributes) | 15 | `Map<string, unknown>` | **15** |
| Config.ts:534 (ConditionalProps.attributes?) | 1 | `Map<string, unknown>` | **1** |
| **표면 합계** | | | **~16 건** |

### 4.2 논리적 narrowing 기회 (호출처)

- `getAttributes().get('x')` 반환 any → unknown 으로 narrowing 강화. 소비자가 cast 하도록 강제 → 타입 안전 복원.
- 측정: 현재 라이브러리 내부 `field.attributes?.get(...)` / `entityForm.getAttributes()` 사용처는 FieldRendererHelper 1 곳 (전달만). 내부 cast 추가 불필요.

### 4.3 유지 (의도된 any, 스코프 외)

- UIProvider `ComponentType<any>` — DECISIONS #21
- `SubCollectionField.attributes?: Record<string, any>` 등 **별개의 Record 타입** — FormField.attributes (Map) 와 다른 구조. 이번 스코프에서는 Map 만 승격. Record 쪽은 별도 Task (혼용 방지 — 동시 승격 검토 가능, 세션 2 에서 판단).
- ViewListProps / CardItem `item: any` — Task H
- dynamic field registry — 유지

### 4.4 예상 총 감축

- 표면 grep: 280 → **264 전후** (−16)
- 논리적 narrow: attributes cast 20 개소 (주로 소비자) + 라이브러리 0

---

## 5. 구현 전략 (Phase 1~N)

### 5.1 세션 분할

**옵션 A (권고) — 2 세션 분할**:
- 세션 1 (이 문서): 설계 전체.
- 세션 2: Phase 1~6 전체 구현. 1~2 에이전트 (A-1 은 단독 에이전트, B-4/B-5/B-6 + A-2 + A-3 를 다른 에이전트 병렬).
- 세션 3 (옵션): v0.2.0 태그 + 배포 + gjcu overlay 최종 실측.

**옵션 B — 1 세션 (비권고)**:
- 6 항목 동시 병렬 시 conflict 가능성 낮지만, 각 항목별 commit 경계가 섞이면 bisect 어려워짐. 권고 안 함.

### 5.2 구현 순서 권장

**Phase 1 — A-1 `attributes: Map<string, any>` → `Map<string, unknown>`** (가장 큰 범위, 독립 commit):
1. `config/EntityField.ts:31/105` — interface + withAttributes 시그니처
2. `config/Config.ts:534` — ConditionalProps.attributes
3. `config/form/EntityFormBase.tsx:181/778/788/815/825/832` — 저장 / get / set 로직
4. `components/fields/abstract/FormField.tsx:149/195/693` — FormFieldProps / FormField 시그니처
5. `config/EntityForm.tsx:102/868` — clone + dataMap 지역타입
6. `components/helper/FieldRendererHelper.tsx:20` — 전달만 (변경 무)
7. 테스트 (FormField.test.ts:396, InlineSubCollectionView.test.tsx:67) — `new Map<string, any>` → `new Map<string, unknown>`
8. type-check PASS / 900 tests PASS 확인
9. commit: `refactor(breaking)!: attributes: Map<string, any> → Map<string, unknown> (v0.2.0 A-1)`

**Phase 2 — A-2 ViewListGridTheme.headerButtons slot 제거**:
1. `components/list/types/ViewListGridTheme.types.ts:60~90` 블록 삭제 (headerButtons? 전체)
2. (theme 기본값에서 headerButtons 있으면 삭제 — `defaultListGridTheme.ts` / `mainTheme.ts` / `modalTheme.ts` / `subCollectionTheme.ts` 확인)
3. type-check PASS 확인
4. commit: `refactor(breaking)!: remove ViewListGridTheme.headerButtons slot (v0.2.0 A-2, DECISIONS #61)`

**Phase 3 — A-3 InlineSubCollectionField deprecated API 제거**:
1. `config/InlineSubCollectionField.tsx` — InlineRowActionsConfig interface + inlineRowActions + inlineRowActionsConfig 필드 + withRowActions + withRowActionsConfig 메소드 + 내부 호환 변환 로직 삭제
2. `components/list/ui/InlineSubCollectionView.tsx:46/48` — rowActions / rowActionsConfig prop 삭제 + 내부 변환 로직 삭제
3. container 옵션 `listFields` 블록 내 (line 181/183) rowActions / rowActionsConfig 삭제
4. 관련 테스트 / story 수정
5. type-check PASS 확인
6. commit: `refactor(breaking)!: remove InlineSubCollectionField.rowActions* deprecated API (v0.2.0 A-3)`

**Phase 4 — B-4 ViewEntityFormTheme deprecated slot 제거**:
1. `components/form/types/ViewEntityFormTheme.types.ts` 5 deprecated 필드 (container / emptyMessage / headerWrapper / icons / collapseIcon) 삭제
2. 테마 기본값 (`defaultTheme.ts`) 에서 위 키 쓰던 곳 제거
3. 소비 JSX 확인 — ViewEntityForm.tsx / ViewFieldGroup.tsx / ViewEntityFormButtons.tsx 의 classNames 사용 패턴. 이미 new 이름으로 전환되어 있을 것 (grep 으로 확인)
4. type-check PASS 확인
5. commit: `refactor(breaking)!: remove ViewEntityFormTheme deprecated slots (v0.2.0 B-4)`

**Phase 5 — B-5 AlertStyles.bg + legacy 필드 정리**:
1. `components/form/types/ViewEntityFormAlerts.types.ts:23~25` — bg / hoverBg / text 삭제
2. `hooks/useAlertManager.ts:106` — base object 의 bg / hoverBg / text 제거
3. 소비 JSX (`ui/AlertItem.tsx` 등) 에서 `style.bg` / `style.hoverBg` / `style.text` 사용처 grep → 없을 것이나 있으면 `style.className` 으로 치환
4. type-check PASS 확인
5. commit: `refactor(breaking)!: AlertStyles — remove bg/hoverBg/text legacy fields (v0.2.0 B-5)`

**Phase 6 — B-6 getColorIndicator 제거**:
1. `hooks/useAlertManager.ts:141~152` — getColorIndicator 함수 삭제
2. `ui/ViewEntityFormAlerts.tsx:12` import 라인에서 getColorIndicator 제거
3. 내부 소비처 (ViewEntityFormAlerts.tsx 본문) 에서 `getColorIndicator(...)` 사용 있으면 `getIndicatorTone` + data-tone 으로 전환 — 이 단계에서 JSX 리팩터 필요할 수 있음 (소규모)
4. 공개 API export (`src/listgrid/index.ts`) 에서 getColorIndicator 있으면 제거
5. type-check PASS / 900 tests PASS 확인
6. commit: `refactor(breaking)!: remove useAlertManager.getColorIndicator (v0.2.0 B-6)`

**Phase 7 — v0.2.0 배포 준비**:
1. `CHANGELOG.md` 작성 (섹션 7 템플릿). Task E/F/G 전체 요약 + 6 breaking + migration guide
2. `UPGRADE.md` 작성 (선택, 섹션 7)
3. `package.json` version → `0.2.0` (alpha 제거)
4. `deploy.sh` 실행 → release repo push + git tag `v0.2.0`
5. gjcu overlay 실측:
   - `npm install @rcm/listgrid@0.2.0`
   - type-check
   - 에러 발생 시 섹션 3 의 migration 가이드로 수정 (가이드 정확성 검증)
   - 예상: A-1 `attributes` 5~8 개소 수정, 나머지 0

**Phase 8 — 검증**:
- npm run type-check / test / lint / format / build 전 품질 게이트 PASS
- any count 측정: 280 → 264 예상
- gjcu overlay 0 errors (migration 후)
- 정식 배포: `v0.2.0` (alpha 라인 마감)

### 5.3 위험 / 완화

| 위험 | 완화 |
|---|---|
| Phase 1 attributes Map 승격이 gjcu 실측에서 예상보다 많은 수정 요구 (cast 없던 사용 패턴이 cast 필요하게 됨) | Phase 1 commit 후 **즉시 gjcu overlay 실측** — 수정 건수가 10+ 이상이면 helper 함수 (`getStringAttr` 등) 를 gjcu 쪽 유틸로 추가해 일괄 대응. 라이브러리 롤백은 하지 않음 (major 정당화 근거이므로) |
| Phase 2 headerButtons 제거 시 gjcu 에 쓰고 있는 패턴이 grep 에서 놓쳤을 가능성 | 구현 전 broader grep: `headerButtons\\?:` / `.headerButtons\\s*=` / `classNames.headerButtons` 검색으로 재확인 |
| Phase 3 InlineSubCollectionField 내부 변환 로직 제거 시 기존 테스트가 rowActions prop 을 쓰고 있을 가능성 | 테스트 grep 후 migration: `withRowActions` → `withRowActionColumns` |
| Phase 4 ViewEntityFormTheme 기본값 (defaultTheme.ts) 에서 deprecated 키를 아직 쓰고 있을 가능성 | 구현 시 defaultTheme.ts 전체 검토 + grep |
| Phase 6 getColorIndicator 가 외부 공개 API (index.ts) 에 export 된 상태 | index.ts 에서 제거 + CHANGELOG 에 명시 |
| v0.2.0 배포 후 gjcu migration 실측에서 예상 외 에러 | 섹션 7 CHANGELOG 의 마이그레이션 가이드에 migration recipe 추가 + "v0.2.1 patch release" 로 추가 호환성 보정 가능 (major 후의 minor/patch 는 정상 흐름) |
| 구현 중 Task F (alpha.48) / Task G (alpha.49) 가 아직 배포되지 않았는데 v0.2.0 만 배포 시 소비자가 alpha → 0.2.0 skip 경로 선택할지 불확실 | **전략 옵션 A**: alpha.48/49 를 먼저 배포하고 즉시 v0.2.0 도 배포 → 소비자는 양자택일. **전략 옵션 B** (권고): alpha.48/49 를 skip 하고 v0.2.0 으로 직행 — CHANGELOG 에 "alpha.48 = Task F, alpha.49 = Task G 를 포함" 명시. 버전 정책상 minor 마지막 = major 시작 이므로 B 가 깔끔 |

---

## 6. Breaking Change 판정 (v0.2.0 major 확정)

### 6.1 타입 레벨

- A-1 `Map<string, any>` → `Map<string, unknown>`: **Breaking**. 소비자 `.get(key)` dereference 시 `unknown` 반환 → cast 또는 narrow 필요.
- A-2 `ViewListGridTheme.headerButtons` 삭제: **Breaking**. theme 에 해당 키 쓰던 소비자 컴파일 에러 (gjcu 0).
- A-3 `InlineSubCollectionField` 5+ API 삭제: **Breaking**. `withRowActions()` 호출 컴파일 에러 (gjcu 0).
- B-4 ViewEntityFormTheme 5 slot 삭제: **Breaking**. deprecated 키 theme 컴파일 에러 (gjcu 0).
- B-5 `AlertStyles.bg` 등 삭제: **Breaking**. `style.bg` 접근 컴파일 에러 (gjcu 0).
- B-6 `getColorIndicator` 삭제: **Breaking** (export 된 경우). import / 호출 컴파일 에러 (gjcu 0).

### 6.2 런타임

- A-1: 변경 0 (Map 내부 값 저장/조회 동일)
- A-2: 변경 0 (slot 은 이미 소비되지 않음)
- A-3: **변경 있음** — rowActions → rowActionColumns 변환 로직 제거. 단 `withRowActions` 호출 자체가 gjcu 0 이므로 실측 영향 0
- B-4: 변경 0 (deprecated slot 은 JSX 에서 소비되지 않거나 new 이름으로 전환 완료)
- B-5/B-6: 변경 0

### 6.3 버전 판정

**v0.2.0 major bump 확정**. 근거:
- 6 항목 모두 타입 레벨 breaking. semver 상 major 필수.
- Task F (alpha.48) + Task G (alpha.49) 통합 시 "타입 엄격화 + 공개 API 청소 + deprecated 제거" 의 **단일 milestone** 으로 자연.
- 소비자 관점 — alpha → 0.2.0 단일 migration. 이후 v0.2.1 / v0.2.2 patch 는 순수 bug fix 로만 유지 가능 (다음 major 는 v0.3.0 예정).

### 6.4 포함 scope 확정

**포함 (7 항목)**:
1. Task F (alpha.48 대기분) — `FieldRenderParameters<T, TValue>` / `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` 제네릭화 (**non-breaking**, default = any)
2. Task G (alpha.49 대기분) — `parse<T = unknown>` + `ViewRenderProps<TForm>` / `ViewValueProps<TForm>` (**semi-breaking**: parse default unknown)
3. A-1 `attributes: Map<string, unknown>`
4. A-2 `ViewListGridTheme.headerButtons` slot 제거
5. A-3 `InlineSubCollectionField.rowActions*` deprecated API 제거
6. B-4 `ViewEntityFormTheme` deprecated slot 5 개 제거
7. B-5 `AlertStyles.bg/hoverBg/text` + getAlertStyles legacy 필드 정리
8. B-6 `useAlertManager.getColorIndicator` 제거

**제외 (Task H+ 또는 v0.3 후보)**: 섹션 8 참조

---

## 7. 소비자 마이그레이션 가이드

### 7.1 CHANGELOG.md 초안 (v0.2.0 section)

```markdown
# Changelog

## [0.2.0] - 2026-04-XX

### Summary

"의도된 any 중 공개 API 청소 완료" 마일스톤. v0.1.0-alpha.40~alpha.49 누적 리팩터 (framework-free + CSS primitive + exactOpt + TSelf/TForm/TValue 제네릭 + parse unknown) 를 공식화하고, alpha.4x 라인에서 누적된 `@deprecated` / "TODO: remove in v0.2" 항목을 정리.

### BREAKING CHANGES

#### 1. `attributes: Map<string, any>` → `Map<string, unknown>`

`EntityField.attributes`, `FormField.attributes`, `EntityForm.getAttributes()` 반환값, `ConditionalProps.attributes` 의 value type 이 `any` → `unknown`.

**Before:**
```ts
const mode = entityForm.getAttributes().get('collaboMode');
if (mode === 'custom') { ... }  // any — 통과
```

**After:**
```ts
const mode = entityForm.getAttributes().get('collaboMode') as string | undefined;
if (mode === 'custom') { ... }  // cast 필요
```

또는 narrow:
```ts
const raw = entityForm.getAttributes().get('collaboMode');
const mode = typeof raw === 'string' ? raw : undefined;
```

#### 2. `ViewListGridTheme.headerButtons` slot 제거

DECISIONS #61 유예 사항 실행. HeaderActionButtons 의 JSX 가 이미 `rcm-button` + `data-variant`/`data-color` primitive 를 사용하므로 slot 은 이미 비활성.

**Before:**
```ts
const theme: ViewListGridTheme = {
  headerButtons: { primary: 'my-primary', ... },
};
```

**After:**
```ts
// headerButtons 필드 삭제. 커스터마이즈 필요 시 CSS 로:
// .rcm-button[data-variant="primary"] { ... }
const theme: ViewListGridTheme = { /* headerButtons 제거 */ };
```

#### 3. `InlineSubCollectionField` deprecated API 제거

`inlineRowActions` / `inlineRowActionsConfig` 필드, `withRowActions()` / `withRowActionsConfig()` 메소드, 컨테이너 옵션 `rowActions` / `rowActionsConfig` 전부 제거. `InlineRowActionsConfig` interface 도 제거.

**Before:**
```ts
field.withRowActions(action1, action2).withRowActionsConfig({ order: 1 });
```

**After:**
```ts
field.withRowActionColumns(
  new InlineRowActionColumn({ order: 1, actions: [action1, action2] })
);
```

#### 4. `ViewEntityFormTheme` deprecated slot 제거

- `container` → `panel`
- `emptyMessage` → `empty`
- `headerWrapper` → `header`
- `icons` → `actions`
- `collapseIcon` → `collapseToggle`

#### 5. `AlertStyles` legacy 필드 제거

`bg` / `hoverBg` / `text` 필드 삭제. `className` + `dataTone` 만 사용.

**Before:**
```tsx
const style = getAlertStyles(color);
<div className={style.bg}>...</div>
```

**After:**
```tsx
const style = getAlertStyles(color);
<div className={style.className} data-tone={style.dataTone}>...</div>
```

#### 6. `getColorIndicator` 제거 (useAlertManager)

`getIndicatorTone` + data-tone 으로 전환.

**Before:**
```tsx
<div className={getColorIndicator(color)} />
```

**After:**
```tsx
<div className="rcm-alerts-indicator" data-tone={getIndicatorTone(color)} />
```

### NEW FEATURES (Task F/G 통합)

#### Task F — FieldRenderParameters 제네릭화 (non-breaking, default = any)

`FieldRenderParameters<T extends object = any, TValue = any>` — 필드 render 파라미터의 엔티티/필드값 narrowing.

```ts
class SlugField extends FormField<SlugField, string, Post> {
  protected renderInstance(
    params: FieldRenderParameters<Post, string>,  // ← opt-in narrow
  ): Promise<React.ReactNode | null> {
    params.onChange('new-slug');  // (value: string) => void
    const author = await params.entityForm.getValue('author');  // Promise<Post['author']>
    ...
  }
}
```

같은 패턴으로 `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` 도 제네릭화.

#### Task G — parse 제네릭화 + ViewRenderProps 제네릭화 (semi-breaking: parse default)

`parse<T = unknown>(str): T` — default `any` → `unknown`. 호출자는 `parse<User>(s)` 또는 `parse(s) as User` 로 narrow.

**Before:**
```ts
const data = parse(json);
console.log(data.message);  // any
```

**After:**
```ts
const data = parse<{ message: string }>(json);
console.log(data.message);  // ✅ narrow
```

`ViewRenderProps<TForm extends object = any>` / `ViewValueProps<TForm>` — `item: TForm`, `entityForm?: EntityForm<TForm>`. default `= any` 라 기존 코드 무수정.

### Migration Path

v0.1.0-alpha.47 → v0.2.0 업그레이드:

1. `npm install @rcm/listgrid@0.2.0`
2. `npm run type-check` 실행 — breaking 관련 에러 확인
3. 에러별 수정:
   - `Argument of type 'unknown' is not assignable to ...` → `attributes` 관련. 섹션 1 참조
   - `Property 'headerButtons' does not exist on type 'ViewListGridTheme'` → 섹션 2 참조
   - `Property 'withRowActions' does not exist` → 섹션 3 참조
   - `Property 'container' does not exist on type 'ViewEntityFormTabPanelStyles'` → 섹션 4 참조
   - `Property 'bg' does not exist on type 'AlertStyles'` → 섹션 5 참조
   - `getColorIndicator is not exported` → 섹션 6 참조
4. 전부 수정 후 `npm run build` 확인

예상 소비자 수정량 (gjcu 실측 기준):
- A-1 attributes cast 추가: 5~8 개소
- A-2/A-3/B-4/B-5/B-6: 0 개소

```

### 7.2 UPGRADE.md 초안 (코드 변환 레시피)

```markdown
# Upgrading from v0.1.x to v0.2.0

v0.2.0 은 공개 API 청소 + Task F/G 통합 마일스톤입니다. 대부분 소비자는 **`attributes` cast 추가** 만 필요합니다.

## 자동 변환 (sed/ripgrep 레시피)

### 1. `attributes` unknown cast 추가 (주로 gjcu 패턴)

아래 패턴들을 수동 검토:

```bash
# 1. 기존 as 없이 직접 사용하는 곳 찾기
rg "\.getAttributes\(\)\.get\('[^']+'\)" --type=tsx --type=ts

# 2. 비교 / 할당 시 cast 필요한 곳만 수정
# before: const mode = ef.getAttributes().get('collaboMode');
# after:  const mode = ef.getAttributes().get('collaboMode') as string | undefined;
```

### 2. `withRowActions` → `withRowActionColumns`

```bash
rg 'withRowActions\(|withRowActionsConfig\(' --type=tsx --type=ts
```

수동 변환 (InlineRowActionColumn 객체로 묶기).

### 3. theme deprecated 키

```bash
# ViewListGridTheme.headerButtons
rg 'headerButtons\s*:\s*\{' --type=tsx --type=ts

# ViewEntityFormTheme
rg '(container|emptyMessage|headerWrapper|icons|collapseIcon)\s*:\s*' \
   --type=tsx --type=ts
```

Rename (container→panel, emptyMessage→empty, headerWrapper→header, icons→actions, collapseIcon→collapseToggle) 또는 삭제.

## 검증

```bash
npm run type-check   # 모든 에러 해소 후 통과해야 함
npm run build        # 빌드 통과
```
```

---

## 8. 스코프 외 (Task H+ 또는 v0.3.0 후보)

### 8.1 v0.3.0 후보 (다음 major)

- **ViewListProps / ViewListResult 제네릭화** (Task H) — ListableFormField.renderListItemInstance 체인. FileField/TagField/DateField/DatetimeField 의 4~5 concrete renderListItemInstance 전파.
- **ViewListGrid / CardSubCollectionView / TableSubCollectionView 의 row `item: any` 제네릭화** — Task H 와 묶음.
- **FieldRenderer React 컴포넌트 자체 제네릭화** — Task F § 2.7 에서 설계 외. JSX 제네릭 컴포넌트 / 범용 컨테이너.

### 8.2 별도 micro-task (v0.2.x patch 또는 v0.3)

- **`parse()` 내부 `JSON.parse` 직접 호출 3 개소 통일** (RevisionField / ViewRows / useEntityFormAutoSave) — Task G 에서 미처 통일 안 한 것. 소규모.
- **`SubCollectionField.attributes?: Record<string, any>`** (별개 Record 타입) — Map 과 Record 혼용 자체가 설계 혼란. unify 또는 Record 도 unknown 으로 승격 검토. v0.2.0 에 묶을 수 있으나 **세션 2 에서 판단** (grep 확인 필요).

### 8.3 독립 task (의존성 없음)

- **Playwright 시각 회귀 suite** — DECISIONS #63 권고. v0.2.0 과 무관.
- **UIProvider `ComponentType<any>` wrapper** — DECISIONS #21. 의도된 any, 유지.
- **dynamic field registry (`registerSmsHistoryField` 등)** — 열린 집합. 유지.

### 8.4 Rename / Ergonomic (비의존, v0.3 후보)

- `ViewRenderProps` vs `ViewValueProps` 네이밍 통일 (rename) — breaking.
- `rcm-listgrid/next` subpath export 정리 (DECISIONS #?).

---

## 9. 세션 2 프롬프트 초안 (구현 세션)

```
@rcm/listgrid v0.2.0 major bump 구현 — Task F/G 통합 + 6 breaking 정리.

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**설계 문서**: docs/V020_BREAKING_DESIGN.md (먼저 끝까지 읽기. Phase 1~7 순서 엄수)
**기준 commit**: `65cf8ba` (Task G 세션 2 완료, alpha.49 배포 대기)
**참고**: docs/GENERIC_DESIGN.md (Task E) / docs/FIELD_RENDERER_GENERIC_DESIGN.md (Task F) / docs/TASK_G_DESIGN.md (Task G)

**작업 범위 (총 6 breaking + Task F/G 통합 + 배포)**:
- Phase 1: A-1 attributes Map<string, any> → Map<string, unknown> (13+ 위치 + 테스트)
- Phase 2: A-2 ViewListGridTheme.headerButtons slot 제거 (+ 기본 테마 정리)
- Phase 3: A-3 InlineSubCollectionField.rowActions* deprecated API 제거 (내부 변환 로직 삭제)
- Phase 4: B-4 ViewEntityFormTheme 5 deprecated slot (container/emptyMessage/headerWrapper/icons/collapseIcon) 제거
- Phase 5: B-5 AlertStyles.bg/hoverBg/text + getAlertStyles legacy 필드 정리
- Phase 6: B-6 useAlertManager.getColorIndicator 제거 + 소비 JSX 마이그레이션
- Phase 7: CHANGELOG.md + (선택) UPGRADE.md + package.json version 0.2.0 + deploy.sh + gjcu overlay 실측

**규칙**:
- 각 Phase 는 독립 commit (bisect 용). commit 메시지: `refactor(breaking)!: ... (v0.2.0 {A|B}-N)`
- Phase 1~6 구현 중 gjcu 실측 에러는 설계 § 3 의 migration 가이드에 따라 gjcu 쪽 수정 (양방향 루프, #72 패턴)
- gjcu 수정 많으면 (>10 개소) 설계 § 5.3 위험 완화 항목대로 helper 함수 gjcu 쪽에 추가
- Phase 7 에서 deploy.sh 는 v0.2.0 태그 + release repo push. alpha 라인 마감.
- 구현 중 설계 미스 발견 시 V020_BREAKING_DESIGN.md 해당 섹션 수정 + DECISIONS #75 (예정) 에 변경 이력 추가

**검증**:
- npm run type-check PASS
- npm test 900+ tests PASS (회귀 0)
- npm run lint 0 errors
- npm run format:check PASS
- npm run build PASS
- any 측정: 280 → 264 전후 (표면 grep, 최소 270 이하)
- gjcu overlay: v0.2.0 candidate 후 gjcu migration (섹션 3 가이드) → 0 errors 확인

**반환 포맷**:
## v0.2.0 구현 완료

### Phase 별 commit 목록
- Phase 1 (A-1 attributes unknown): {commit_sha}
- Phase 2 (A-2 headerButtons 제거): {commit_sha}
- Phase 3 (A-3 InlineSub rowActions* 제거): {commit_sha}
- Phase 4 (B-4 ViewEntityFormTheme deprecated 제거): {commit_sha}
- Phase 5 (B-5 AlertStyles legacy 정리): {commit_sha}
- Phase 6 (B-6 getColorIndicator 제거): {commit_sha}
- Phase 7 (CHANGELOG + bump + deploy): {commit_sha + tag v0.2.0}

### 수치
- any before / after: 280 → N
- 테스트: 900 → N passing
- 빌드: PASS/FAIL
- gjcu overlay: N errors after migration (목표 0)
- gjcu 수정 건수: A-1 {N 개소}, A-2 {N}, ..., 총 {N}

### 설계와 달라진 점
- (있으면)

### 배포 판단
- v0.2.0 tag 생성 + release repo push: 완료/대기
- alpha.48/49 배포 여부: skip (v0.2.0 통합) / 개별 배포 (선 배포 후 v0.2.0)
```

---

## 10. 체크리스트 (세션 2 착수 전)

- [ ] 이 문서 전체 읽기 (11 섹션)
- [ ] docs/GENERIC_DESIGN.md (Task E) / docs/FIELD_RENDERER_GENERIC_DESIGN.md (Task F) / docs/TASK_G_DESIGN.md (Task G) 11 섹션 템플릿 재참조 (동일 구조, 같은 패턴)
- [ ] STATUS.md 의 현재 상태 (Task G 세션 2 완료, alpha.49 배포 대기) 확인
- [ ] DECISIONS #61/#70/#71/#72/#73/#74 (유예 문구 + Task E/F/G 설계/구현/실측) 재확인
- [ ] gjcu 호스트 worktree 가 alpha.47 또는 alpha.48/49 (배포되었다면) 설치 상태 확인
- [ ] `npm test` / `npm run type-check` 현 상태 그린 사전 확인
- [ ] `/Users/kunner/IdeaProjects/gjcu-experiment/gjcu-academic-front` 의 uncommitted 변경 상태 확인 (Task E 세션 3 의 swap 브랜치 정리 상태)
- [ ] Phase 2 구현 전 broader grep 재확인: `headerButtons\\?:` / `.headerButtons\\s*=` / `classNames.headerButtons`
- [ ] Phase 3 구현 전 `withRowActions` / `withRowActionsConfig` / `InlineRowActionsConfig` 라이브러리 내부 + 테스트 grep 재확인
- [ ] Phase 4 구현 전 defaultTheme.ts 내 deprecated 키 사용 grep 재확인
- [ ] Phase 6 구현 전 `src/listgrid/index.ts` 에 getColorIndicator export 여부 확인
- [ ] 설계 변경 필요 시 이 문서 수정 → commit 분리 → 구현

---

## 11. 메모

- 이 문서는 **v0.2.0 major bump 세션 1 산출물**. 구현은 후속 세션 (Phase 1~7).
- 설계 변경은 이 문서를 직접 수정 + DECISIONS #75 (예정) 에 변경 이력 추가.
- Task E/F/G 와의 관계:
  - Task E (#70/#71/#72, alpha.46~47 배포 완료): config 층 제네릭화 (EntityForm<T> / FormField<TSelf, TValue, TForm> / FieldValue<TValue>)
  - Task F (#73, alpha.48 배포 대기): UI 파라미터 층 제네릭화 (FieldRenderParameters<T, TValue> / FilterRenderParameters<T, TValue> / FieldInfoParameters<T>)
  - Task G (#74, alpha.49 배포 대기): parse<T = unknown> + ViewRenderProps<TForm> / ViewValueProps<TForm>
  - **v0.2.0 (이 설계)**: Task F + Task G + 6 breaking 을 **통합 major bump** 마일스톤. alpha.4x 라인 마감.
- **alpha.48/49 skip 의 의미**: major bump 로 직접 가면 소비자는 중간 alpha 를 거치지 않음. 단, release repo 에는 alpha.48/49 tag 가 이미 존재할 수 있음 (deploy.sh 실행 시) — 이 경우 CHANGELOG 에서 "alpha.48/49 는 v0.2.0 의 구성 요소 (interim releases)" 로 명시.
- **gjcu 실측 양방향 루프** (#72 패턴): Phase 1 구현 → gjcu overlay → 에러 diff → gjcu 쪽 수정 → 0 errors 확인 → 다음 Phase. Phase 2~6 은 gjcu 영향 0 예상이라 단방향.
- **major bump 중 gjcu migration 난이도 "mid-low"** 판정 근거:
  - A-1 만 실질 영향 (5~8 개소 cast 추가)
  - A-2/A-3/B-4/B-5/B-6 은 grep 0
  - 기존 gjcu 패턴에 `as string | undefined` / `as LayoutMode` 같은 cast 가 **이미 자리잡음** → 추가 cast 는 기존 패턴 확장
- **v0.3.0 후보 (Task H+)**: ViewListProps / ViewListResult 제네릭화, FieldRenderer React 컴포넌트 제네릭화, misc cleanup. 섹션 8 참조.
- **v0.2.0 이 닫는 것**:
  - "TODO: remove in v0.2" 주석 0
  - InlineSubCollectionField 의 rowActions 중복 API 0
  - AlertStyles legacy 필드 0
  - getColorIndicator legacy export 0
  - `@deprecated` 주석 크게 감소 (SubCollectionField.attributes?: Record<string, any> 등 잔여 수 건은 v0.3 후보)
- **v0.2.0 이 열어둔 것** (의도된 any 중 유지):
  - UIProvider ComponentType<any> wrapper (DECISIONS #21)
  - ViewListProps / CardItem `item: any` (Task H)
  - dynamic field registry (열린 집합)
