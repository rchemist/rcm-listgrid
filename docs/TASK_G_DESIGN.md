# Task G — `parse<T = unknown>()` + `ViewRenderProps<TForm>` Generic/Unknown Refactor 설계

**세션**: 1 of 2 (설계만. 구현은 다음 세션)
**작성일**: 2026-04-19
**기준 commit**: `4854afa` (Task E alpha.47 배포 완료) + Task F 세션 2 구현 (`b0d63b7` Phase 4 — alpha.48 배포 대기)
**DECISIONS**: #21 / #65 (의도된 any 맥락), #62 (메인 context 보호), #70 (Task E 설계), #71 (Task E 구현), #72 (alpha.46~47 실측), #73 (Task F 세션 2 구현), #74 (이 설계 — Task G 세션 1 예정)

참고 문서:
- `docs/GENERIC_DESIGN.md` (Task E 설계 — 동일 구조/섹션 템플릿)
- `docs/FIELD_RENDERER_GENERIC_DESIGN.md` (Task F 설계 — 동일 구조/섹션 템플릿)

---

## 0. TL;DR

1. `parse<T = unknown>(str: string): T` — 2 곳 (`src/listgrid/misc/index.ts:298`, `src/listgrid/utils/jsonUtils.ts:88`) 동일 구현을 **제네릭화**. 기본값 `unknown` 으로 호출자가 `parse<User>(json)` opt-in narrow. **backward-compat 유지** (기본값이 `any` 가 아니라 `unknown` 인 것이 행동 차이 — 섹션 2.1 상세).
2. `ViewRenderProps<TForm extends object = any>` — `item: TForm`, `entityForm?: EntityForm<TForm>`. FormField 의 3 번째 타입 파라미터 (TForm) 와 동일 의미. default `any` 로 서브클래스 무수정 (7+ 파일 확인). `ViewValueProps` (EntityField 쪽 병렬 인터페이스) 도 동일 패턴 적용.
3. `ViewRenderResult` / `ViewValueResult` 는 제네릭화 **불필요** — React 출력 타입 (`{ result: ReactNode | null }`) 이라 의미 없음. 유지.
4. `misc/parse` 와 `jsonUtils/parse` **일원화 고려** — 동일 구현 중복. misc/parse 만 공개 API (index.ts:115 export), jsonUtils/parse 는 내부 전용이지만 3 파일 (`config/EntityFormMethod.ts`, `config/AdvancedSearchOpenCache.ts`, `config/ListGridViewFieldCache.ts`, `form/SearchForm.ts`, `components/list/hooks/useListGridLogic.ts`, `components/fields/rule/Type.ts`) 에서 import. misc/parse 로 일원화 후 jsonUtils/parse re-export 로 backward-compat 유지 제안.
5. Any 감축 예상: **표면 grep 기준 2~4 건** (parse 정의 2 + ViewRenderProps.item 1 + ViewValueProps.item 1). **논리적 감축은 호출처 narrowing 기회** 약 20+ 건 (parse 19 호출처 + renderViewInstance 9 오버라이드 중 TForm narrow 가능한 경우).
6. Breaking change 판정: **타입 레벨 soft-compat** (default `= unknown` / `= any` 로 bare 사용 호환. 단 `parse` 의 default 가 `any` → `unknown` 으로 바뀌므로 **반환값을 즉시 dereference 하는 패턴** 에서 컴파일 에러 가능 — 섹션 3.2 엣지 케이스). **alpha.49 minor bump** 권고, v0.2.0 major 불필요.

---

## 1. 배경 (Why)

### 현재 상태 (Task F 세션 2 완료 시점, alpha.48 배포 대기)

Task E (#70/#71, alpha.46~47) 로 `EntityForm<T>` / `FormField<TSelf, TValue, TForm>` / `FieldValue<TValue>` config 층 제네릭화 완료. Task F (#73, alpha.48 대기) 로 `FieldRenderParameters<T, TValue>` / `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` UI 파라미터 인터페이스 + FormField 체인 render/filter/info 시그니처 전파 완료.

그러나 Task E/F 설계 (#70 § 8, #73 § 8) 에서 **명시적으로 스코프 제외** 한 두 항목:

```ts
// (1) parse — 2 곳에 동일 구현이 any 반환
// src/listgrid/misc/index.ts:298
// intentional: JSON.parse returns arbitrary data and consumers dereference fields directly
export function parse(str: string): any {
  return JSON.parse(str, reviver);
}
// src/listgrid/utils/jsonUtils.ts:88  (동일 구현, 중복)
export function parse(str: string): any {
  return JSON.parse(str, reviver);
}

// (2) ViewRenderProps — item: any 로 전체 entity row 를 loose 하게 전달
// src/listgrid/components/fields/abstract/FormField.tsx:68
export interface ViewRenderProps {
  item: any;                  // "필드 값을 포함한 객체" — 전체 entity
  entityForm?: EntityForm;
  compact?: boolean;
}
// src/listgrid/config/EntityField.ts:132  (병렬)
export interface ViewValueProps {
  item: any;
  entityForm?: EntityForm;
}
```

### Task G 가 해결하는 것

**parse** — 호출자 opt-in narrow:

```ts
// v0.3 / Task F 스타일 (현재)
const parsed = parse(response.error);
// parsed: any → 타입 안전 없음. parsed.foo.bar 도 통과

// Task G 후
const parsed = parse(response.error);
// parsed: unknown → parsed.foo 접근 시 TS 에러. 명시적 narrow 필요
if (typeof parsed === 'object' && parsed !== null && 'foo' in parsed) { ... }

// 또는 호출자가 스키마 knowing 시
const parsed = parse<ApiError>(response.error);
// parsed: ApiError → 기존 호출 흐름 유지
```

**ViewRenderProps** — renderViewInstance 내부 item narrowing:

```ts
// v0.3 / Task F 스타일 (현재)
class UserField extends FormField<UserField, string, User> {
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];  // props.item: any → value: any
    ...
  }
}

// Task G 후 — opt-in narrow
class UserField extends FormField<UserField, string, User> {
  protected async renderViewInstance(props: ViewRenderProps<User>): Promise<ViewRenderResult> {
    const value = props.item[this.name];  // props.item: User → value: User[keyof User]
    ...
  }
}
```

### Task G 가 해결 못하는 것

- **런타임 스키마 검증 도구 (zod/yup) 없이 TSON/TypeScript 단독 정확 파싱** — `parse<User>(json)` 은 타입 캐스트일 뿐 런타임 검증 0. Task G 는 "호출자가 스키마를 knowing 하는 경우 타입 narrow 기회 제공" 에 국한.
- **`attributes: Map<string, any>`** — 필드의 확장 포인트. 소비자가 임의 key/value 주입. 제네릭화 가능하지만 breaking 영향. v0.2.0 major bump 후보 (Task G 스코프 외).
- **ViewListProps / ViewListResult** — `ListableFormField.tsx:50` 의 병렬 인터페이스. list row 렌더링 쪽. **Task G 스코프 외** — ViewRenderProps 와 설계상 유사하나 FileField/TagField/DateField/DatetimeField 의 renderListItemInstance 전파까지 동반되면 작업량 증가. 별도 Task H 후보.
- **UIProvider `ComponentType<any>` wrapper** — DECISIONS #21. 유지.
- **`parseNestedPath(item: any)` / `getFieldValue(item: any)` / TreeNodeData.convert((item: any)) 등 내부 any** — 런타임 다형성 유지 필요. Task G 스코프 외.

### 왜 v0.3 에 하나

- Task E + Task F 로 config 층 + UI 파라미터 층 제네릭화가 안정 착지. Task G 는 "**남은 2 개 잔여 항목** 을 정리해 v0.3 any 정리 사이클을 닫는" 성격.
- 두 항목 모두 **독립적** (parse 와 ViewRenderProps 는 서로 무관). 에이전트 1 개로 Phase 분리하여 진행 가능.
- v0.2.0 major bump 은 "Task E + F + G + attributes Map 승격" 묶음이 자연스러운 마일스톤. Task G 완료 전 major bump 는 시기상조.

---

## 2. 타입 파라미터 위치 결정 (핵심 섹션)

### 2.1 `parse<T = unknown>(str: string): T`

**선택**: 옵션 A (제네릭화 + default `unknown`).

#### 옵션 A — `parse<T = unknown>(str: string): T` (권고)

```ts
// src/listgrid/misc/index.ts (+ utils/jsonUtils.ts 동일 패턴)
export function parse<T = unknown>(str: string): T {
  return JSON.parse(str, reviver) as T;
}
```

**근거**:
- 기본값 `unknown` 은 `any` 보다 **엄격한 contract** — 호출자가 명시적으로 narrow 필요. TypeScript 의 공식 권장 (`unknown` > `any` for external/untrusted data).
- 호출자 opt-in narrow: `parse<User>(json)` → `User` 반환. 기존 `parse(json) as User` 패턴을 제네릭 인자로 대체 가능 (작성 시점 cleanup 기회).
- default `unknown` 이지만 **기본 `as T` 캐스트** 로 JSON.parse 의 런타임 동작 불변.

**Backward-compat 영향 매트릭스** (섹션 3.1 에 상세):

| 기존 호출 패턴 | default `any` 시 | default `unknown` 시 (옵션 A) |
|---|---|---|
| `const x = parse(s); x.foo;` | ✅ 통과 | ❌ 컴파일 에러 (`unknown` 에서 dereference 불가) |
| `const x = parse(s) as User; x.foo;` | ✅ 통과 | ✅ 통과 (explicit cast) |
| `const x: User = parse(s); x.foo;` | ✅ 통과 (any → User widening) | ❌ 컴파일 에러 (`unknown` 은 User 에 대입 불가) |
| `const x = parse<User>(s); x.foo;` | N/A | ✅ 통과 (신규 문법) |

**19 내부 호출처 분석** (섹션 4.1 에 개별 식별):

- **그룹 A (이미 narrowing 있음, 무수정)**: 6 개소 — `parse(...) as User` / `parse<T>(...)` 유사 패턴이 있거나, 곧바로 타입이 있는 변수에 대입 후 사용
- **그룹 B (dereference 직후, 손대야 함)**: 11 개소 — `const json = parse(message); json.foo` 형태. narrow 추가 필요 (`as` cast 또는 `parse<T>(...)` 제네릭 인자)
- **그룹 C (void / 구조분해만)**: 2 개소 — `{ ...parse(itemJson) }` / `new CachedStorageItem(obj.value, obj.expiry)` 같이 object spread 만 하는 경우 `unknown` 직접 dereference 는 X 이지만 spread 시 `unknown` 도 ok (`{...value: unknown}` 은 `{}` 로 widening — 섹션 2.5 엣지)

그룹 B 가 **구현 작업량** — 11 개소 narrow 추가.

#### 옵션 B — `parse(str: string): unknown` (하드 전환, 비권고)

모든 19 호출처에 `as T` cast 추가 필요. 소비자 (gjcu) 의 `parse(...)` 호출 (있다면) 도 breaking. **breaking change 범위가 커서 v0.2.0 major bump 정당화 필요** — Task G 스코프 오버.

#### 옵션 C — `parse<T = any>(str: string): T` (제네릭화만, default any 유지)

기존 호출 무수정. 타입 안전 개선 0 (호출자가 명시적으로 `parse<T>(...)` 로 쓰지 않으면 여전히 `any`). **제네릭 추가의 의미 약함** — 선언이 복잡해지기만 함.

**결정**: **옵션 A** (`<T = unknown>`). 내부 11 개소 narrow 추가 + 1 개소 일원화 (섹션 2.2) 는 이 Task 에서 처리. 외부 소비자 영향은 "**gjcu 실측 후 결정**" (섹션 3.3).

### 2.2 `misc/parse` 와 `jsonUtils/parse` 일원화

**현재 중복**:
- `src/listgrid/misc/index.ts:298` → `parse(str): any` + `import { reviver } from '../utils/jsonUtils'` (line 9 확인 필요)
- `src/listgrid/utils/jsonUtils.ts:88` → 동일 구현 (reviver 사용)
- misc/parse 가 `src/listgrid/index.ts:115` 의 공개 API export

**소비 import 경로**:
- misc 경로 import (3 개소): `components/form/ui/buttons/DeleteButton.tsx`, `misc/index.ts` 내부 4 회 (storage helpers), 그리고 `index.ts` re-export
- jsonUtils 경로 import (6 개소): `config/EntityFormMethod.ts`, `config/AdvancedSearchOpenCache.ts`, `config/ListGridViewFieldCache.ts`, `form/SearchForm.ts`, `components/list/hooks/useListGridLogic.ts`, `components/fields/rule/Type.ts`, `components/fields/SelectFieldRenderer.tsx` (via `../../utils`)

#### 옵션 A (권고) — 단일 구현 + re-export

1. `utils/jsonUtils.ts` 의 `parse` 를 **primary 구현** (이미 `reviver` 와 같은 파일). misc 가 jsonUtils 를 import 하는 방향 (현재 추정과 반대라면 반대로).
2. 다른 쪽은 `export { parse } from '...'` re-export 로 유지 — 기존 import 경로 불변.
3. 제네릭화는 한 곳에서만.

**작업량**: 1 파일 (primary) 수정 + 1 파일 (re-export 로 축소). backward-compat 100%.

#### 옵션 B — 중복 유지, 둘 다 제네릭화

소비자 import 경로는 동일. 단 유지보수 비용 (동일 함수 두 번 수정) 발생. **권고 안 함**.

**결정**: 옵션 A. primary 는 **misc/index.ts** (공개 API) — 이유: `misc` 는 소비자 대상 유틸 모음, `jsonUtils` 는 내부 low-level. jsonUtils/parse 는 misc/parse 재export 로 전환. reviver/stringify/replacer 는 jsonUtils 에 유지 (primary — misc 에서 import 해 옴).

### 2.3 `ViewRenderProps<TForm extends object = any>`

**선택**: `TForm` 한 개 파라미터. default `= any`.

**근거 (item 타입 의미 분석)**:
- `ViewRenderProps.item` 의 주석은 **"필드 값을 포함한 객체"** — 현재 사용처 (`CardSubCollectionField` 등) 에서 **entity row 전체** 를 전달받아 `props.item[this.name]` 으로 특정 필드 값만 추출.
- 즉 `item` 은 **entity** 성격 (TForm) 이지, 한 필드의 값 (TValue) 이 아님.
- FormField<TSelf, TValue, TForm> 의 TForm 과 **동일 의미**. `entityForm?: EntityForm<TForm>` 도 동일 scope.

```ts
// 승격
export interface ViewRenderProps<TForm extends object = any> {
  item: TForm;
  entityForm?: EntityForm<TForm>;
  compact?: boolean;
}
```

**FormField 내부 renderViewInstance 시그니처 전파**:

```ts
// FormField.tsx:238 (승격 후)
protected async renderViewInstance(
  props: ViewRenderProps<TForm>,    // ← TForm narrow 전파
): Promise<ViewRenderResult> {
  const value = props.item[this.name];  // props.item: TForm → value: TForm[this.name]
  ...
}

// FormField.tsx:309 (공개 메소드)
public async viewValue(props: ViewRenderProps<TForm>): Promise<ViewRenderResult> {
  return this.renderViewInstance(props);
}
```

**33+ concrete 서브클래스 무수정 호환 확인**:

현재 9 개 파일 (FormField 포함) 에서 `renderViewInstance(props: ViewRenderProps)` 오버라이드 — `ViewRenderProps<any>` 로 해석되어 무수정. TForm=any default 이므로 FormField<Self> (TForm=any default) 에서 TForm=any 가 ViewRenderProps<any> 로 전파. 일관.

옵트인 승격 예:
```ts
class UserField extends FormField<UserField, string, User> {
  protected async renderViewInstance(props: ViewRenderProps<User>): Promise<ViewRenderResult> {
    // props.item: User
    const name = props.item.name;  // ✅ narrow
    ...
  }
}
```

### 2.4 `ViewValueProps<TForm extends object = any>` — 병렬 인터페이스

`src/listgrid/config/EntityField.ts:132` 에 별도 정의된 병렬 인터페이스:

```ts
// 현재
export interface ViewValueProps {
  item: any;
  entityForm?: EntityForm;
}
export interface ViewValueResult {
  result: ReactNode | null;
}

// EntityField.ts:129 메소드 시그니처
viewValue(props: ViewValueProps): Promise<ViewValueResult>;
```

**관찰**: `EntityField.viewValue` 와 `FormField.viewValue` 의 props 타입이 서로 다름:
- `EntityField.viewValue(props: ViewValueProps)` (interface 계약)
- `FormField.viewValue(props: ViewRenderProps)` (FormField 구현 — FormField.tsx:309)

**이 두 타입이 구조적으로 동일** (`item` + `entityForm?`) 이지만 이름이 다르고 FormField.viewValue 가 compact 도 추가로 받음. 현재 **ViewRenderProps** 는 `{ item, entityForm?, compact? }`, **ViewValueProps** 는 `{ item, entityForm? }`. FormField.viewValue 는 compact 포함. CardFieldSection.tsx 와 CardFieldRenderer.tsx 에서 `field.viewValue({ item, entityForm, compact: true })` 로 compact 를 넘기는데 이게 EntityField interface 의 ViewValueProps 계약과 불일치 — **선행 버그** 가능성 (Task E 세션 2 의 viewValue 반환타입 불일치 #71 § 설계 보정과 유사).

**결정 (세션 2 에서 검증할 것)**:
- 옵션 1: `ViewValueProps` = `ViewRenderProps` 의 alias 로 통합 (ViewRenderProps 로 이름 단일화) — 구조 동일. 인터페이스 시그니처도 통일
- 옵션 2: 둘 다 제네릭화하되 별도 유지 (ViewRenderProps 는 compact 포함, ViewValueProps 는 안 포함). 현 구조 유지
- **권고**: 옵션 2 — 이름은 다르지만 각각 소비처 (ViewRenderProps 는 FormField 서브클래스, ViewValueProps 는 EntityField 계약) 가 명확. 단 **`compact?` 추가** 필요 — EntityField.viewValue 호출부 (CardFieldSection/CardFieldRenderer) 가 compact 를 넘기므로 ViewValueProps 에도 compact 를 선언해 계약 정합성 회복 (선행 버그 fix). 이 fix 는 Task G 부수 작업으로 포함 — **DECISIONS #74 에 명시**

```ts
// 승격 후 (권고)
export interface ViewValueProps<TForm extends object = any> {
  item: TForm;
  entityForm?: EntityForm<TForm>;
  compact?: boolean;  // ← ViewRenderProps 와 정합성 회복 (선행 버그 fix)
}
export interface ViewValueResult {
  result: ReactNode | null;
}

// EntityField.ts:129 (EntityField 인터페이스 메소드)
// 제네릭 파라미터 없이 bare 로 유지 (default any 자동 호환)
viewValue(props: ViewValueProps): Promise<ViewValueResult>;
```

### 2.5 `ViewRenderResult` / `ViewValueResult` — 제네릭화 불필요

```ts
export interface ViewRenderResult {
  result: ReactNode | null;
}
export interface ViewValueResult {
  result: ReactNode | null;
}
```

`result` 는 React 출력. 엔티티/필드값 연관 없음. **무수정 유지**.

### 2.6 EntityField 인터페이스 `viewValue` 메소드 시그니처

`EntityField` 자체는 제네릭 추가 안 함 (Task E #70 § 2.6 와 동일 원칙 — 런타임 다형 핸들). `viewValue(props: ViewValueProps): Promise<ViewValueResult>` 에서 `ViewValueProps` 가 제네릭이 되어도 default `any` 자동 호환. **EntityField 인터페이스 무수정**.

### 2.7 구조 분해 / spread 엣지 케이스

```ts
// src/listgrid/misc/index.ts:352
const item = CachedStorageItem.create({ ...parse(itemJson) });
```

`parse<unknown>(...)` 반환값을 spread 하면 `{...unknown}` 의 결과는 **`{}`** (TS 의 object spread semantics — empty object). `CachedStorageItem.create({ value: string; expiry?: number })` 의 기대 타입과 비일치 → **컴파일 에러 가능**.

**완화**:
- `{...parse(itemJson) as { value: string; expiry?: number }}` 로 명시 cast, 또는
- `parse<{ value: string; expiry?: number }>(itemJson)` 제네릭 인자로 narrow

11 그룹 B 호출처 중 spread 패턴 1 개소 (misc/index.ts:352). 세션 2 에서 개별 처리.

### 2.8 전파 범위 (파일 인벤토리)

```
# parse 제네릭화 (옵션 A)
src/listgrid/misc/index.ts              — parse<T = unknown> 승격 (primary 유지) + 내부 3 개소 narrow (352/368/390/407)
src/listgrid/utils/jsonUtils.ts         — parse 를 misc re-export 로 축소 (또는 primary 를 jsonUtils 로 옮기고 misc 가 re-export)
src/listgrid/utils/index.ts             — `export * from './jsonUtils'` 유지 (jsonUtils 가 re-export 되든 primary 든 동일)

# parse 소비자 narrow 추가 (그룹 B 11 개소)
src/listgrid/form/SearchForm.ts:311                           — obj = parse(data) → parse<SearchFormData>(data) 또는 as
src/listgrid/components/list/hooks/useListGridLogic.ts:162    — json = parse(message) → 호출 흐름 분석 후 narrow
src/listgrid/config/EntityForm.tsx:741                        — parsed = parse(response.error) → parse<ApiError>
src/listgrid/config/EntityFormMethod.ts:102                   — parsed = parse(response.error) → parse<ApiError>
src/listgrid/components/fields/SelectFieldRenderer.tsx:285    — parsed = parse(response.error) → parse<ApiError>
src/listgrid/components/fields/rule/Type.ts:38                — result = parse(data) as RuleConditionValue (이미 narrow, 옵션 A 로 `parse<RuleConditionValue>(data)` 로 간결화)
src/listgrid/components/form/ui/buttons/DeleteButton.tsx:131  — json = parse(error) → narrow
src/listgrid/components/revision/RevisionField.tsx:224/237    — JSON.parse 직접 호출 (parse 함수 아님 — 검토 후 필요시 parse 로 통일)
src/listgrid/components/list/ui/ViewRows.tsx:121              — JSON.parse 직접 호출 (parse 함수 아님)
src/listgrid/components/form/hooks/useEntityFormAutoSave.ts:112  — JSON.parse 직접 호출 (AutoSaveData 이미 타입 annotate — 무수정)
src/listgrid/config/AdvancedSearchOpenCache.ts:14             — data = parse(value) → narrow (캐시 스키마 타입)
src/listgrid/config/ListGridViewFieldCache.ts:16              — data = parse(value) → narrow (캐시 스키마 타입)
src/listgrid/misc/index.ts:352/368/390/407                    — storage helpers (섹션 2.7 엣지)

# ViewRenderProps 제네릭화
src/listgrid/components/fields/abstract/FormField.tsx         — ViewRenderProps<TForm = any>, renderViewInstance/viewValue/wrapWithCardIcon 시그니처 (TForm 전파)
src/listgrid/components/fields/abstract/ListableFormField.tsx — renderViewInstance 오버라이드 (FormField.tsx:254) 시그니처 전파
src/listgrid/components/fields/StringField.tsx                — renderViewInstance (default 경로 무수정)
src/listgrid/components/fields/NumberField.tsx                — renderViewInstance (무수정)
src/listgrid/components/fields/SelectField.tsx                — renderViewInstance (무수정)
src/listgrid/components/fields/BooleanField.tsx               — renderViewInstance (무수정)
src/listgrid/components/fields/DateField.tsx                  — renderViewInstance (무수정)
src/listgrid/components/fields/HtmlField.tsx                  — renderViewInstance (무수정)
src/listgrid/components/fields/ManyToOneField.tsx             — renderViewInstance (무수정)
src/listgrid/components/fields/abstract/index.ts              — type ViewRenderProps/ViewRenderResult export (무수정)

# ViewValueProps 제네릭화 (EntityField 쪽)
src/listgrid/config/EntityField.ts                            — ViewValueProps<TForm = any>, compact? 추가 (선행 버그 fix), EntityField.viewValue 무수정

# ViewValueProps 호출처 검증
src/listgrid/components/list/ui/CardFieldSection.tsx:76       — field.viewValue({ item, entityForm, compact: true }) — compact 인정 (선행 버그 fix 반영)
src/listgrid/components/list/ui/CardFieldRenderer.tsx:73      — field.viewValue({ item, entityForm, compact: true }) — compact 인정
```

**예상 수정 파일 수**:
- 메인 수정 (제네릭 전파 필요): misc/index.ts + jsonUtils.ts + FormField.tsx + EntityField.ts = **4 파일**
- narrow 추가 (호출처): 약 8~11 파일 (parse 그룹 B)
- 검증만 (무수정 확인): concrete 필드 8 + ListableFormField = **9 파일**

### 2.9 설계 edge case

1. **`parse<T>(...) as T` 중복** — 이미 `as T` cast 하는 호출은 `parse<T>(json)` 로 간결화 가능. Rule Type.ts:38 (`parse(data) as RuleConditionValue`) → `parse<RuleConditionValue>(data)`. 선택 사항 (스타일).

2. **`parse` 반환이 `T | undefined` 를 암시하는 경우** — 없음. JSON.parse 는 성공 시 값, 실패 시 throw. Caller try/catch 로 감싸서 사용하는 패턴 관찰됨 (`misc/index.ts:355`). 반환타입은 그대로 `T`.

3. **`JSON.parse` 직접 호출 3 개소** (RevisionField, ViewRows, useEntityFormAutoSave):
   - `useEntityFormAutoSave.ts:112` — `JSON.parse(saved)` + `data: AutoSaveData` 명시 annotation 이 있어 narrow 됨. 무수정 OK. `parse` 와는 무관 (reviver 불필요한 플레인 JSON).
   - `ViewRows.tsx:121` — `JSON.parse(saved)` → parse 함수로 교체 검토 (reviver 이점 — Map 복원). 로직 무변경 확인 필요.
   - `RevisionField.tsx:224/237` — revision JSON 데이터. parse 함수로 교체 가능. 로직 무변경.
   - **결정**: 3 개소는 `parse` 로 통일하지 않음. 기존 호출 유지 (이미 기대 타입이 명확한 경우). 필요 시 별도 cleanup task.

4. **ViewRenderProps vs ViewValueProps 네이밍** — 혼동 가능성. Task G 에서 통일 (rename) 은 **breaking** 이므로 유보. 구조적 정합성만 확보 (compact? 추가).

5. **`ViewListProps / ViewListResult`** (`ListableFormField.tsx:50`) 제네릭화 — 유사 패턴이지만 **Task G 스코프 외**. 별도 Task H 후보.

---

## 3. 기본값 `= any` / `= unknown` 의미 (Backward-compat 계약)

### 3.1 소비자 무수정 호환 매트릭스

| 소비자 패턴 | 컴파일 가능? | 추천 조치 |
|---|---|---|
| `const x = parse(s); x.foo` | ❌ (default = unknown) | `parse<T>(s)` 또는 `as T` 캐스트 |
| `const x = parse(s) as User; x.foo` | ✅ | `parse<User>(s)` 로 간결화 가능 |
| `const x: User = parse(s)` | ❌ (unknown → User 비호환) | `parse<User>(s)` |
| `const x = parse<User>(s); x.foo` | ✅ (신규 문법) | 권장 |
| `const { ...rest } = parse(s)` | ⚠️ (`{...unknown}` → `{}`) | 구조분해 이전에 narrow |
| `class F extends FormField<F>` + `renderViewInstance(props: ViewRenderProps)` | ✅ (TForm=any default) | 유지 OK |
| `class F extends FormField<F, V, User>` + `renderViewInstance(props: ViewRenderProps<User>)` | ✅ + narrow | 권장 (item narrow) |
| `field.viewValue({ item, entityForm })` bare | ✅ (TForm=any default) | 유지 OK |
| `field.viewValue({ item, entityForm, compact: true })` | ✅ (compact? 추가됨 — 선행 버그 fix) | 현재 컴파일 통과 중이나 선행 버그 fix 로 타입 레벨 정당화 |

### 3.2 잠재 Breaking 포인트

1. **parse 반환값 `any` → `unknown` 전환 (default 변경)** — **가장 큰 위험**. 소비자 코드 중 `parse(json).foo` 직접 dereference 패턴은 컴파일 에러. 완화:
   - 라이브러리 내부 11 호출처는 이 Task 에서 narrow 추가 (소스 cleanup)
   - 소비자 (gjcu) 는 **실측** 으로 확인. 에러 발생 시 마이그레이션 가이드 (§ 7) 로 `parse<T>(...)` 전환
   - 극단적 회피: opt-out 플래그 없음. default 유지하려면 옵션 C (default any) 선택 — 하지만 의미 약함 (§ 2.1)

2. **ViewRenderProps<TForm = any>** — default `any` 로 bare 사용 호환. Task E/F 와 동일 패턴.

3. **ViewValueProps 에 `compact?: boolean` 추가** — optional 이므로 기존 코드 (compact 넘기지 않음) 호환. 새로 선언된 필드이므로 exactOptionalPropertyTypes 호환 (`compact` 누락 시 `ViewValueProps` 는 compact 속성 자체가 없는 것으로 해석). ✅ backward-compat.

4. **타입 레벨 추론 경로 변화** — `Map<string, ViewRenderProps>` 는 `Map<string, ViewRenderProps<any>>` 로 해석. 호환.

5. **parse 일원화 (misc → jsonUtils re-export 또는 반대)** — import 경로 불변. re-export 가 존재하면 기존 import 100% 호환. ✅.

### 3.3 gjcu 호스트 영향 측정 (이 세션 수집 + 세션 2 실측 대기)

**실측 전 예상** (grep 불가 — gjcu 는 별도 repo, 이 세션에서 직접 수집 안 함):
- `parse(` 호출: gjcu 내부에 0~수 개 예상. 대부분 storage helper / API error parsing 용.
- `ViewRenderProps` 직접 import: gjcu 는 custom FormField 서브클래스가 제한적 (1 개소 — RelatedMemoField). renderViewInstance 오버라이드 있으면 default 경로 무수정 호환.
- `ViewValueProps` 직접 import: 0 예상 (EntityField 내부 interface, 소비자가 직접 참조할 이유 희박).

**실측 계획** (세션 2):
- 1. 라이브러리 수정 후 dist overlay → `apps/admin` type-check
- 2. 에러 diff (baseline alpha.48 candidate vs alpha.49 candidate, 고유 위치 기준)
- 3. 에러 발생 시 마이그레이션 가이드 대응 (§ 7)
- 4. gjcu 0 errors 확인 → alpha.49 배포

**참고**: Task E (alpha.46/47) 실측에서 "설계 단계 예측 vs 실측" 차이는 760 errors 의 baseline 상태가 드러난 것. Task F (alpha.48) 는 baseline 이후 peer 회귀 0. Task G 는 **parse default 변경** 이 새 변수 — 실측 첫 번째로 관찰할 것.

---

## 4. Any 감축 예상

### 4.1 승격 가능 (generic 으로 치환)

| 위치 | 현재 | 승격 후 | 예상 감축 (표면 grep) |
|---|---|---|---|
| `parse(str): any` (misc/index.ts:298) | 1 | `parse<T = unknown>(str): T` | 1 |
| `parse(str): any` (jsonUtils.ts:88) | 1 | misc re-export 로 축소 (또는 동일 제네릭화) | 1 |
| `ViewRenderProps.item: any` (FormField.tsx:70) | 1 | `item: TForm` | 1 |
| `ViewValueProps.item: any` (EntityField.ts:134) | 1 | `item: TForm` | 1 |
| **표면 합계** | | | **4 건** |

### 4.2 논리적 narrowing 기회 (호출처에서 의미 있는 타입 narrow — grep 은 안 잡히지만 실질 any 감소)

| 위치 | 건수 | 설명 |
|---|---|---|
| parse 호출처 그룹 B (narrow 추가) | 11 | `const x = parse(s); x.foo` → `parse<T>(s)` 또는 narrow. x 의 타입이 `any` → `T` |
| renderViewInstance 내부 `props.item[this.name]` 접근 | 7~9 | concrete 필드 서브클래스 중 TForm 을 명시한 경우 (현재 0 이지만 소비자가 옵트인 시 narrow) |
| `{...parse(itemJson)}` storage spread | 3 | 현재 any, narrow 시 구조적 타입 |
| **논리적 합계** | | **~20 건** |

### 4.3 유지 (의도된 any)

- **`attributes: Map<string, any>`** — 필드 확장 포인트. Task G 스코프 외. v0.2.0 major bump 시 `Map<string, unknown>` 승격 후보.
- **`item: any` (ListView / CardView 계열, ~30 개소)** — row 렌더러 측의 다형 item. 각 ViewListGrid / CardItem / TableSubCollectionView / InlineSubCollectionView 등. Task G 에서는 제외 — ViewListProps 제네릭화와 동반되어야 의미 (별도 Task H 후보).
- **UIProvider `ComponentType<any>`** — DECISIONS #21. 유지.
- **`TreeNodeData.convert((item: any) => ...)` / `CardItem.item: any` / `ViewRows.item: any` 등 render 전달 객체** — 런타임 다형성. 유지.
- **`parseNestedPath(item: any)` / `getFieldValue(item: any)` / `CardSubCollectionField.titleField((item: any) => string)`** — 내부 유틸 / 소비자 콜백 계약. 유지.

### 4.4 측정 방법

구현 후:
- `grep -rE ': any\b' --include='*.ts' --include='*.tsx' src | grep -v test | wc -l` (표면 any)
- 현재 base (Task F 마감, alpha.48 대기 기준): **284 any** → **280~282** 예상 (표면 기준 2~4 감축)
- 실질 narrow 는 호출처 재작성 분량에 따라 다름 (20+ 건 논리적 감축)

---

## 5. 구현 전략 (세션 2 용)

### 5.1 1 개 에이전트로 충분한 이유

- 변경 파일 ~15 개. 논리적 단일 리팩터 (parse 제네릭화 + 소비자 narrow + ViewRenderProps 제네릭화 — 병렬 에이전트화 시 동기 비용이 분할 이익보다 큼).
- Task E/F 와 동일 복잡도 프로파일.

### 5.2 구현 순서 권장

**Phase 1 — parse 제네릭화 + 일원화** (foundation):
1. `src/listgrid/misc/index.ts:298` — `parse<T = unknown>(str: string): T` 로 승격 (primary). `as T` 캐스트 추가.
2. `src/listgrid/utils/jsonUtils.ts:88` — `parse` 함수 삭제 후 `export { parse } from '../misc'` re-export (또는 반대 방향: misc 가 jsonUtils 를 re-export). 최종 결정은 구현 중 import 순환 확인. replacer/reviver/stringify 는 jsonUtils 에 유지.
3. `src/listgrid/misc/index.ts` 내부 4 호출처 (352/368/390/407) — `parse<CachedStorageItemLike>(...)` narrow 추가:
   - 352 `parse(itemJson)` → `parse<{ value: string; expiry?: number }>(itemJson)` (섹션 2.7 엣지)
   - 368/407 `parse(value!) as T` → `parse<T>(value!)` 로 간결화 (이미 generic 전파됨)
   - 390 `const obj = parse(itemJson); new CachedStorageItem(obj.value, obj.expiry)` → `parse<{ value: string; expiry?: number }>(itemJson)` narrow
4. `src/listgrid/index.ts` 공개 API `parse` export 확인 (무변경).

**Phase 2 — parse 소비자 narrow 추가 (그룹 B 11 개소)**:
5. `config/EntityForm.tsx:741` / `config/EntityFormMethod.ts:102` / `components/fields/SelectFieldRenderer.tsx:285` — `parse<ApiError>(response.error)` (ApiError 타입 이미 있으면 재사용, 없으면 `{ message?: string }` 같은 ad-hoc)
6. `components/fields/rule/Type.ts:38` — `parse<RuleConditionValue>(data)` (`as` 캐스트 제거)
7. `form/SearchForm.ts:311` — obj 의 후속 사용 분석 후 narrow. 타입이 이미 있으면 `parse<SearchFormData>(data)`
8. `components/list/hooks/useListGridLogic.ts:162` — json 의 후속 사용 분석 후 narrow
9. `components/form/ui/buttons/DeleteButton.tsx:131` — json 후속 사용 분석
10. `config/AdvancedSearchOpenCache.ts:14` / `config/ListGridViewFieldCache.ts:16` — 캐시 스키마 타입 narrow (이미 타입이 있으면 재사용)

**Phase 3 — ViewRenderProps / ViewValueProps 제네릭화**:
11. `src/listgrid/components/fields/abstract/FormField.tsx`:
    - `ViewRenderProps<TForm extends object = any>` 승격 (item: TForm, entityForm?: EntityForm<TForm>)
    - `FormField.renderViewInstance(props: ViewRenderProps<TForm>)` 시그니처 전파
    - `FormField.viewValue(props: ViewRenderProps<TForm>)` 시그니처 전파
    - wrapWithCardIcon 은 ViewRenderResult 반환 — 무수정
12. `src/listgrid/config/EntityField.ts`:
    - `ViewValueProps<TForm extends object = any>` 승격 + `compact?: boolean` 추가 (선행 버그 fix)
    - EntityField.viewValue 시그니처 무수정 (default any 자동 호환)
13. `src/listgrid/components/fields/abstract/ListableFormField.tsx:254` — renderViewInstance 오버라이드 시그니처 (default 경로 무수정 또는 `ViewRenderProps<TForm>` 승격 통일)

**Phase 4 — concrete 필드 서브클래스 검증 (무수정 기대, 8 파일)**:
14. StringField / NumberField / SelectField / BooleanField / DateField / HtmlField / ManyToOneField — `renderViewInstance(props: ViewRenderProps)` 선언 무수정. `ViewRenderProps<any>` 해석으로 호환 확인.

**Phase 5 — 검증**:
15. `npm run type-check` — 라이브러리 PASS.
16. `npm test` — 900+ tests 유지 (회귀 0).
17. `npm run lint`, `format:check`, `build` PASS.
18. gjcu overlay → `apps/admin` type-check. baseline alpha.48 vs alpha.49 candidate 고유 위치 diff 측정. parse default 변경으로 새 에러 발생 가능성 — 실측 기반 판단 후 마이그레이션 (§ 7) 가이드로 대응 또는 라이브러리 옵션 C 로 fallback.
19. any 측정: 284 → 280~282 (표면 grep).
20. 정식 배포 alpha.49.

### 5.3 위험 / 완화

| 위험 | 완화 |
|---|---|
| `parse` default `unknown` 으로 gjcu 소비자 breaking (직접 dereference 패턴) | 실측 후 판단. 피해 크면 **옵션 C** (default `any`) 로 fallback — 이 경우 내부 cleanup 은 유지 (opt-in narrow 기회 제공) |
| `{...parse(itemJson)}` spread 가 `{}` 로 widening 되어 CachedStorageItem.create 시그니처 불일치 | § 2.7 — 명시 cast 또는 제네릭 인자로 narrow |
| jsonUtils/parse 제거 시 jsonUtils.test.ts 가 직접 import 하는 테스트 깨짐 | re-export 유지로 호환. 삭제하지 말고 `export { parse } from '../misc'` |
| `ViewValueProps.compact?` 추가가 소비자 계약 확장 → 타입 caller 가 compact 를 넘기지 않던 곳 영향 | compact? (optional) 이므로 exactOpt 호환. 넘기지 않음 = default undefined 처리. 무영향 |
| `ViewRenderProps<TForm>` 전파 시 FormField.viewValue 와 EntityField.viewValue 인터페이스 불일치 재발 (Task E #71 § 설계 보정 #1 패턴) | `FormField.viewValue(props: ViewRenderProps<TForm>)` 가 `EntityField.viewValue(props: ViewValueProps)` 구현으로 인정되려면 **구조적 호환**. ViewRenderProps / ViewValueProps 의 item/entityForm/compact 가 모두 동일 → 구조적 호환 OK. 실측 확인 |
| 소비자가 `parse(json)` 을 let 으로 받아 rebind 하는 패턴 | default unknown 이므로 rebind 시에도 unknown — 기존 흐름 변경. narrow 필요. § 7 가이드로 안내 |
| 내부 11 호출처 narrow 타입 결정 (ApiError 등 ad-hoc) | 이미 타입이 있으면 재사용. 없으면 `{ message?: string; ... }` minimum-schema 로 한정. 엄격한 스키마 검증은 Task G 스코프 외 (zod 같은 도구 결합은 별도) |

---

## 6. Breaking Change 판정

### 6.1 타입 레벨

- **parse**: default `any` → `unknown` **변경**. bare 사용 `const x = parse(s); x.foo` 는 **컴파일 에러 가능**. **타입 레벨 semi-breaking** — 런타임 무변경이지만 타입 계약 엄격화.
  - 제네릭 옵트인 (`parse<T>(s)`) 또는 명시 cast (`parse(s) as T`) 로 호환 회복
  - default 유지 원하면 옵션 C (`<T = any>`) 선택 가능 — 하지만 의미 약함
- **ViewRenderProps / ViewValueProps**: default `= any` 로 bare 사용 호환. **Soft-compat**.
- **ViewValueProps 에 `compact?` 추가**: optional 이므로 exactOpt 호환. **Soft-compat**.
- **misc/parse 와 jsonUtils/parse 일원화**: re-export 로 import 경로 호환. **무변경**.

### 6.2 런타임

- parse: `JSON.parse(str, reviver)` 동일. 반환 값 동일. **변경 0**.
- ViewRenderProps / ViewValueProps: 타입 annotation only. **변경 0**.

### 6.3 배포 권고

**주된 고민**: parse default 변경이 소비자에게 미치는 영향.

- **옵션 A 로 진행 + alpha.49 minor bump**: 타입 레벨 semi-breaking 이지만 런타임 무변경. 소비자 마이그레이션 경로는 `parse<T>(...)` 또는 `as T` 로 명확. 실측 후 최종 판정.
- **옵션 A 로 진행 + v0.2.0 major bump**: default 변경은 breaking 이므로 major 정당화 가능. 하지만 v0.2.0 은 attributes Map + 기타 cleanup 까지 묶는 마일스톤 — Task G 단독 major 는 비효율.
- **옵션 C 로 진행 (default any) + alpha.49 minor bump**: 완전 backward-compat. parse 제네릭화의 의미는 약하나 opt-in narrow 기회만 제공. 내부 cleanup 은 유지.

**권고**: **옵션 A + alpha.49**. gjcu 실측에서 breaking 영향이 크면 옵션 C fallback. 최종 결정은 **세션 2 구현 후 gjcu 빌드 결과 관찰 후**.

---

## 7. 소비자 마이그레이션 가이드 초안 (README 추가용)

### 7.1 parse 제네릭 전환 (Breaking: default `unknown`)

```ts
// v0.3 / Task F 스타일 (현재, parse 반환 any)
const parsed = parse(response.error);
console.log(parsed.message);  // ✅ 통과 (any 덕에)

// Task G 후 (parse 반환 unknown — default)
const parsed = parse(response.error);
console.log(parsed.message);  // ❌ 컴파일 에러 — 'unknown' has no property 'message'

// 마이그레이션 옵션 1: 제네릭 인자
const parsed = parse<{ message: string }>(response.error);
console.log(parsed.message);  // ✅

// 마이그레이션 옵션 2: 명시 cast
const parsed = parse(response.error) as { message: string };
console.log(parsed.message);  // ✅

// 마이그레이션 옵션 3: 런타임 narrow (엄격)
const parsed = parse(response.error);
if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
  console.log(parsed.message);  // ✅
}
```

### 7.2 ViewRenderProps / ViewValueProps opt-in narrow

```ts
// v0.3 / Task F 스타일 — 그대로 동작
class UserField extends FormField<UserField, string, User> {
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];  // props.item: any → value: any
    return { result: String(value) };
  }
}

// Task G 후 — opt-in narrow
class UserField extends FormField<UserField, string, User> {
  protected async renderViewInstance(
    props: ViewRenderProps<User>,  // ← TForm 명시
  ): Promise<ViewRenderResult> {
    const value = props.item[this.name];  // props.item: User → value: User[keyof User]
    const name = props.item.name;  // ✅ narrow
    return { result: name };
  }
}
```

### 7.3 ViewValueProps compact 필드 (선행 버그 fix)

```ts
// 이전에도 CardFieldSection / CardFieldRenderer 가 compact: true 를 넘기고 있었음
// (ViewValueProps 에 compact 선언이 없어 구조적 타입으로 통과하던 상태)
// Task G 에서 ViewValueProps 에 compact?: boolean 추가 — 타입 계약 정합성 확보

// 소비자 커스텀 ViewValueProps 사용처 있다면 (흔치 않음):
// 기존 { item, entityForm? } 은 그대로 호환 (compact 는 optional)
```

---

## 8. 스코프 외 (v0.2.0 major 또는 그 이후)

- **`attributes: Map<string, any>` → `Map<string, unknown>`** — breaking. v0.2.0 major bump 시 후보. 필드 확장 포인트.
- **`ViewListProps / ViewListResult` 제네릭화** — ListableFormField.renderListItemInstance 체인. FileField/TagField/DateField/DatetimeField 의 4~5 concrete 필드 renderListItemInstance 전파. **Task H 후보**.
- **ViewListGrid / CardSubCollectionView / TableSubCollectionView 의 row `item: any` 제네릭화** — ViewListProps 와 묶어야 의미. 별도 Task.
- **`parseNestedPath(item: any)` / 내부 item any** — 런타임 다형성 유지. 제네릭화 어려움.
- **UIProvider `ComponentType<any>`** — 유지 (DECISIONS #21).
- **dynamic field registry** — 유지 (열린 집합).
- **`JSON.parse` 직접 호출 3 개소를 `parse` 로 통일** — cleanup 수준. 별도 micro-task.
- **ViewRenderProps vs ViewValueProps 이름 통일 (rename)** — breaking. 보류.

---

## 9. 세션 2 프롬프트 초안 (에이전트 1 개)

```
@rcm/listgrid v0.3 Task G 구현 — parse<T = unknown> + ViewRenderProps<TForm> / ViewValueProps<TForm>.

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**설계 문서**: docs/TASK_G_DESIGN.md (먼저 끝까지 읽기. Phase 1~5 순서 엄수)
**기준 commit**: Task F 세션 2 완료 시점 (`b0d63b7` 또는 alpha.48 release)
**참고**: docs/GENERIC_DESIGN.md (Task E), docs/FIELD_RENDERER_GENERIC_DESIGN.md (Task F) — 동일 구조 템플릿

**작업 범위 (파일 ~15 개)**:
- Phase 1: misc/index.ts (parse<T = unknown> primary 승격) + utils/jsonUtils.ts (re-export 로 축소) + misc storage helpers 4 호출처 narrow
- Phase 2: parse 소비자 그룹 B 11 개소 narrow 추가 (config / form / components/fields / components/list/hooks / components/form/ui/buttons / config/*Cache.ts)
- Phase 3: components/fields/abstract/FormField.tsx (ViewRenderProps<TForm = any> + renderViewInstance/viewValue 시그니처 전파) + config/EntityField.ts (ViewValueProps<TForm = any> + compact? 추가)
- Phase 4: concrete 8 필드 (StringField/NumberField/SelectField/BooleanField/DateField/HtmlField/ManyToOneField/ListableFormField) 무수정 호환 확인
- Phase 5: 검증 (type-check + test + lint + format + build) + gjcu overlay 실측

**규칙**:
- parse default 변경 `any` → `unknown` 은 타입 레벨 semi-breaking. 실측 breaking 심각 시 옵션 C (default any) fallback (§ 6.3)
- ViewRenderProps / ViewValueProps 는 default `= any` 로 소비자 무수정. 33+ concrete 필드 무수정 필수
- misc/parse 와 jsonUtils/parse 일원화 — primary 는 misc (공개 API), jsonUtils 는 re-export 로 축소. replacer/reviver/stringify 는 jsonUtils 에 유지
- ViewValueProps 에 compact? 추가는 선행 버그 fix — 호출부 (CardFieldSection/CardFieldRenderer) 가 이미 compact: true 를 넘기고 있음 (구조적 타입으로 통과 중)
- ViewRenderProps vs ViewValueProps 이름 통일 (rename) 은 하지 않음 — breaking 방지
- JSON.parse 직접 호출 3 개소 (RevisionField/ViewRows/useEntityFormAutoSave) 는 parse 로 통일하지 않음 — 기존 유지
- UIProvider ComponentType<any> 유지 (의도된 any, DECISIONS #21)
- 구현 중 설계 미스 발견 시 TASK_G_DESIGN.md 해당 섹션 수정 + 이유 기록 후 진행

**검증**:
- npm run type-check PASS (라이브러리)
- npm test 900+ tests PASS (회귀 0)
- npm run lint 0 errors
- npm run format:check PASS
- npm run build PASS
- any 측정: 284 → 목표 280~282 (표면 grep, 최소 282 이하)
- gjcu overlay: alpha.48 baseline vs alpha.49 candidate 고유 위치 diff 측정. parse default 변경으로 새 에러 발생 가능 — 실측 기반 판단

**반환 포맷**:
## Task G 구현 완료

### 수정 파일 목록 (카테고리별)
- Phase 1 parse foundation (misc/jsonUtils + storage helpers): ...
- Phase 2 parse 소비자 narrow (11 개소): ...
- Phase 3 ViewRenderProps / ViewValueProps 제네릭화 (FormField/EntityField): ...
- Phase 4 concrete 필드 무수정 확인: ...

### 수치
- any before / after: 284 → N
- 테스트: 900 → N passing
- 빌드: PASS/FAIL
- gjcu overlay 고유 위치 diff: N (parse breaking 영향 포함)

### API 변경 (소비자 영향)
- breaking: parse default `any` → `unknown` (타입 레벨 semi-breaking. 런타임 무변경)
  - 마이그레이션: `parse<T>(...)` 또는 `as T` 캐스트 (§ 7.1)
- non-breaking: ViewRenderProps<TForm = any>, ViewValueProps<TForm = any> + compact? (default 경로 호환)

### 설계와 달라진 점
- (있으면)

### 배포 판단
- alpha.49 minor bump (권고) vs 옵션 C fallback (default any 유지) 결정 근거
- v0.2.0 major bump 시기 (권고 아님 — Task G 단독 major 비효율)
```

---

## 10. 체크리스트 (세션 2 착수 전)

- [ ] 이 문서 전체 읽기
- [ ] `docs/GENERIC_DESIGN.md` (Task E) + `docs/FIELD_RENDERER_GENERIC_DESIGN.md` (Task F) 11 섹션 재참조 (동일 템플릿)
- [ ] `STATUS.md` 의 현재 상태 (Task F 세션 2 완료, alpha.48 배포 대기) 확인
- [ ] DECISIONS #70/#71/#72/#73 (Task E/F 설계/구현/실측) 루프 재사용
- [ ] gjcu 호스트 worktree 가 alpha.47 (또는 alpha.48 배포 시 그것) 설치 상태인지 확인
- [ ] `npm test` / `npm run type-check` 현 상태 그린 사전 확인
- [ ] 설계 변경 필요 시 이 문서 수정 → commit 분리 → 구현
- [ ] parse 소비자 그룹 B 11 개소 narrow 타입 결정 (ApiError / SearchFormData / 캐시 스키마 등) — 기존 타입 재사용 우선

---

## 11. 메모

- 이 문서는 **v0.3 Task G 세션 1 산출물**. 구현은 후속 세션.
- 설계 변경은 이 문서를 직접 수정 + DECISIONS #74 (예정) 에 변경 이력 추가.
- Task E/F/G 관계:
  - Task E (#70/#71, alpha.46~47): `EntityForm<T>` + `FormField<TSelf, TValue, TForm>` + `FieldValue<TValue>` — config 층 제네릭화
  - Task F (#73, alpha.48 대기): `FieldRenderParameters<T, TValue>` + `FilterRenderParameters<T, TValue>` + `FieldInfoParameters<T>` + FormField render/filter/info 시그니처 — UI 파라미터 층 전파
  - Task G (이 설계): `parse<T = unknown>` + `ViewRenderProps<TForm>` / `ViewValueProps<TForm>` — 잔여 정리 (v0.3 any 사이클 마감)
- **v0.3 Task 사이클 마감** 의미:
  - v0.3 에서 착수한 "의도된 any 중 승격 가능한 것" 목록 (#70 § 4.2) 의 주요 후보 3 개 (FieldRenderParameters, parse, ViewRenderProps) 중 2 개가 Task F/G 에서 처리됨
  - 남은 "의도된 any 유지" (UIProvider ComponentType, attributes Map, dynamic registry) 는 **v0.2.0 major bump 마일스톤** 까지 유지
- **parse default 결정** (옵션 A `= unknown` vs 옵션 C `= any`) 은 **세션 2 gjcu 실측 결과 기반** — 라이브러리만 보면 A 가 정답, 소비자 영향 기반으로 C fallback 가능성 존재. 섹션 6.3 배포 권고 참조.
- **ViewListProps / ViewListResult 제네릭화** 는 **Task H 후보** 로 명시 분리. Task G 에서 묶으면 range 초과 (ListableFormField + 4~5 concrete 필드 renderListItemInstance + ListView/CardView 의 row 전파).
