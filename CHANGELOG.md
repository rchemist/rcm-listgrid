# Changelog

이 파일은 `@rchemist/listgrid` 의 공개된 변경 이력을 기록합니다.

## [0.2.0] - 2026-04-XX

### Summary

"의도된 any 중 공개 API 청소 완료" 마일스톤. 이전 알파 라인의 누적 리팩터(framework-free + CSS primitive + exactOptionalPropertyTypes + TSelf/TForm/TValue 제네릭 + parse unknown)를 공식화하고, 누적된 `@deprecated` / "TODO: remove in v0.2" 항목을 정리.

### BREAKING CHANGES (6)

#### 1. `attributes: Map<string, any>` → `Map<string, unknown>` (A-1)

`EntityField.attributes`, `FormField.attributes` / `FormFieldProps.attributes`, `EntityForm.getAttributes()` 반환값, `EntityForm.putAttribute / addAttributeToField / getFieldAttributes`, `ConditionalProps.attributes` (Config.ts) 의 value type 이 `any` → `unknown`.

**Before:**

```ts
const mode = entityForm.getAttributes().get('collaboMode');
if (mode === 'custom') { ... } // any — dereference 자유
```

**After:**

```ts
const mode = entityForm.getAttributes().get('collaboMode') as string | undefined;
if (mode === 'custom') { ... } // cast 또는 narrow 필요
```

또는 narrow:

```ts
const raw = entityForm.getAttributes().get('collaboMode');
const mode = typeof raw === 'string' ? raw : undefined;
```

TS 5.x 는 `unknown === 'literal'` 비교 자체는 컴파일 OK — 단 narrow 는 안 됨. property dereference 시 cast 필요.

#### 2. `ViewListGridTheme.headerButtons` slot 제거 (A-2)

`HeaderActionButtons` JSX 가 이미 `rcm-button` + `data-variant`/`data-color` primitive 를 직접 사용하므로 slot 은 이미 비활성 상태였음. 이 릴리스에서 죽은 슬롯을 정리.

**Before:**

```ts
const theme: ViewListGridClassNames = {
 headerButtons: { primary: 'my-primary', ... },
};
```

**After:**

```ts
// headerButtons 필드 삭제. 커스터마이즈 필요 시 CSS 로:
// .rcm-button[data-variant="primary"] { ... }
const theme: ViewListGridClassNames = { /* headerButtons 제거 */ };
```

#### 3. `InlineSubCollectionField.rowActions*` deprecated API 제거 (A-3)

제거 대상:

- `InlineRowActionsConfig` interface
- `inlineRowActions`, `inlineRowActionsConfig` 필드
- `withRowActions`, `withRowActionsConfig` 메소드
- constructor props.rowActions / props.rowActionsConfig
- 호환 변환 로직 (rowActions → rowActionColumns)
- `InlineSubCollectionViewProps.rowActions / rowActionsConfig`

**Before:**

```ts
field.withRowActions(action1, action2).withRowActionsConfig({ order: 1 });
```

**After:**

```ts
field.withRowActionColumns(
 new InlineRowActionColumn({ id: 'default', order: 1, actions: [action1, action2] }),
);
```

#### 4. `ViewEntityFormTheme` deprecated slot 제거 (B-4)

5 deprecated slot 제거:

- `ViewEntityFormTabPanelStyles.container` → `panel`
- `ViewEntityFormTabPanelStyles.emptyMessage` → `empty`
- `ViewFieldGroupStyles.headerWrapper` → `header`
- `ViewFieldGroupStyles.icons` → `actions`
- `ViewFieldGroupStyles.collapseIcon` → `collapseToggle`

`defaultTheme.ts` 도 new 이름으로 전환. 소비 JSX (`ViewFieldGroup.tsx`, `ViewTabPanel.tsx`) 는 이미 new 이름 사용 중 — 추가 수정 없음.

#### 5. `AlertStyles` legacy 필드 제거 (B-5)

`AlertStyles` 인터페이스에서 삭제:

- `bg` (deprecated — 'rcm-notice' 반환)
- `hoverBg` (미사용)
- `text` (미사용)

`className` + `dataTone` 만 사용.

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

#### 6. `useAlertManager.getColorIndicator` 제거 (B-6)

class-name legacy mapping 제거. `getIndicatorTone` + `data-tone` 로 통일.

**Before:**

```tsx
import { getColorIndicator, getIndicatorTone } from '@rchemist/listgrid';

<div className={`rcm-alerts-indicator ${getColorIndicator(color)}`} data-tone={getIndicatorTone(color)} />
```

**After:**

```tsx
import { getIndicatorTone } from '@rchemist/listgrid';

<div className="rcm-alerts-indicator" data-tone={getIndicatorTone(color)} />
```

### NEW FEATURES (제네릭 확장)

#### FieldRenderParameters 제네릭화 (non-breaking, default = any)

`FieldRenderParameters<T extends object = any, TValue = any>` — 필드 render 파라미터의 엔티티/필드값 narrowing.

```ts
class SlugField extends FormField<SlugField, string, Post> {
 protected renderInstance(
 params: FieldRenderParameters<Post, string>,
 ): Promise<React.ReactNode | null> {
 params.onChange('new-slug'); // (value: string) => void
 const author = await params.entityForm.getValue('author'); // Promise<Post['author']>
 ...
 }
}
```

같은 패턴으로 `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` 도 제네릭화.

#### parse 제네릭 + ViewRenderProps 제네릭

`parse<T = unknown>(str): T` — default `any` → `unknown`. 호출자는 `parse<User>(s)` 또는 `parse(s) as User` 로 narrow.

**Before:**

```ts
const data = parse(json);
console.log(data.message); // any
```

**After:**

```ts
const data = parse<{ message: string }>(json);
console.log(data.message); // narrow
```

`ViewRenderProps<TForm extends object = any>` / `ViewValueProps<TForm>` — `item: TForm`, `entityForm?: EntityForm<TForm>`. default `= any` 라 기존 코드 무수정.

### Migration Path

v0.1.0-alpha.47 → v0.2.0 업그레이드:

1. `npm install @rchemist/listgrid@0.2.0`
2. `npm run type-check` 실행 — breaking 관련 에러 확인
3. 에러별 수정:
 - `unknown` 관련 → `attributes` (BREAKING CHANGES 1)
 - `Property 'headerButtons' does not exist on type 'ViewListGridClassNames'` → BREAKING CHANGES 2
 - `Property 'withRowActions' does not exist` → BREAKING CHANGES 3
 - `Property 'container' does not exist on type 'ViewEntityFormTabPanelStyles'` → BREAKING CHANGES 4
 - `Property 'bg' does not exist on type 'AlertStyles'` → BREAKING CHANGES 5
 - `getColorIndicator is not exported` → BREAKING CHANGES 6
4. `npm run build` 확인

**실측 영향**:

- A-1 attributes: `as` cast 이미 자리잡은 패턴 + `unknown === 'literal'` 비교는 TS 5.x 허용 → **0 errors**
- A-2/A-3/B-4/B-5/B-6: **0 errors**

### generics expansion alpha tag 상태

- alpha.48 / alpha.49 는 v0.2.0 의 구성 요소 (interim releases).
- v0.2.0 은 alpha.48/49 + 6 breaking 을 **통합 major bump** 로 제공.
