# Task E — `EntityForm<T>` / `FormField<TValue, TForm>` Generic Refactor 설계

**세션**: 1 of 2 (설계만. 구현은 다음 세션)
**작성일**: 2026-04-19
**기준 commit**: `45b77d7` (Task D 마감 / exactOpt 승격 완료)
**DECISIONS**: #21 / #65 / #69 (의도된 any 맥락), #62 (메인 context 보호), #70 (이 설계 — 세션 1)

---

## 0. TL;DR

1. `EntityForm<T extends object = any>` — **entity 스키마 T** 를 type param 으로 승격. 기본 `any` 로 backward-compat 보장.
2. `FormField` 의 기존 F-bounded 셀프 타입 (`T extends FormField<T>`) 은 **이름만 `TSelf` 로 리네임** 후 유지. 추가로 **`TValue = any`, `TForm extends object = any`** 두 파라미터를 뒤에 append. 기본값 `any` 로 모든 기존 서브클래스 무수정 동작.
3. `FieldValue<TValue = any>` 로 `current/fetched/default` 승격 — 가장 효과적인 any 감축 지점.
4. 소비자 (gjcu) 는 마이그레이션 **강제 없음**. `new EntityForm(...)` / `extends FormField<Self>` 그대로 컴파일. 점진 승격 (`new EntityForm<User>(...)`) 선택 가능.
5. 예상 any 감축: **~100 건** (현재 ~306 → 목표 ~200). 의도된 any 중 UIProvider `ComponentType<any>` wrapper 는 generic 으로 해결 안 됨 → 유지.
6. Breaking change 판정: **타입 레벨에서 호환** (모든 default `= any`). 런타임 동일. alpha.46 minor bump 가능, v0.2.0 major 는 불필요.

---

## 1. 배경 (Why)

### 현재 상태 (v0.3 Task D 완료 시점)
- `any` 잔여 306+ 건 (non-test). 대부분 "의도된 any" — DECISIONS #21 / #65:
  - **generic entity payload**: `FieldValue.current/fetched/default`, `displayFunc(entityForm, field) → any`, `getValue(name) → Promise<any>`, `getCurrentValue() → Promise<any>`
  - **UIProvider ComponentType wrapper**: `ComponentType<any>` (React 컴포넌트 다형성 지원 — 소비자가 임의 prop 전달)
  - **parse() 반환**: 외부 데이터 역직렬화
  - **FormField<T extends FormField<T>>**: F-bounded 셀프 타입 — T 는 서브클래스이므로 entity 와 무관
- tsconfig strict 옵션 5/5 true (strict / noImplicitAny / noImplicitReturns / noFallthroughCasesInSwitch / noUncheckedIndexedAccess / exactOptionalPropertyTypes)
- 타입 엄격성은 최대치지만 "내부 정확성" 에서 멈춰 있음. **호출자 관점** 에서 `entityForm.getValue('content')` 는 여전히 `any` 반환 → 소비자 IDE 자동완성 / 타입 에러 검출 없음

### Generic refactor 가 해결하는 것
`EntityForm<T extends User = User>` 로 쓰면:
- `entityForm.getValue('content')` → `Promise<User['content']>` — **키 narrowing**
- `entityForm.getValue('typo')` → **컴파일 에러** — 오타 방지
- `entityForm.setValue('content', 123)` → **컴파일 에러** — 타입 불일치
- `entityForm.getField('slug')` → `EntityField | undefined` (여전히 런타임 결정. 서브타입 narrowing 은 불가능 — 필드 타입 / 엔티티 키 관계가 런타임에만 알려짐)

### Generic refactor 가 해결 못하는 것
- `getField(name) as RelatedMemoField` 패턴 (host 에서 1 회 관측). 필드 **클래스** 는 엔티티 키와 1:1 매핑되지 않음 (StringField 가 여러 key 에 쓰임). 이 cast 는 필연적.
- UIProvider `ComponentType<any>` — 소비자 주입 React 컴포넌트의 prop 은 열린 집합. any 유지.
- 외부 직렬화/역직렬화 (`parse()`, `JSON.parse`) — 런타임 검증 도구가 아니면 unknown 이 최선. Task E 는 unknown 으로 점진 전환 가능한 것만 목록화.

### 왜 v0.3 에 하나?
- Task C (coverage 17%) + Task D (exactOpt) 로 foundation 안정. Task E 의 광범위 generic 전파가 깨져도 900 tests + type-check 로 회귀 감지 가능.
- 그 반대였다면 generic 타입 오류 + 런타임 회귀를 구분 불가 — 지금이 최적 타이밍.

---

## 2. 타입 파라미터 위치 결정

### 2.1 `EntityForm<T extends object = any>`

**선택: `T extends object`** (not `Record<string, unknown>`).

**근거**:
- `Record<string, unknown>` 은 `keyof T` 가 `string` (불분명). 키 narrowing 기대치 충족 못함.
- `T extends object` 는 `keyof T` 를 보존. `interface User { id: string; name: string }` 이면 `keyof T = 'id' | 'name'`.
- `T = any` 기본값: `keyof any = string | number | symbol` → `getValue(name: string)` 시그니처와 호환. 기존 소비자 무수정.

```ts
export class EntityForm<T extends object = any> extends EntityFormExtensions<T> {
  constructor(name: string, url: string) { super(name, url); }

  clone(includeValue?: boolean): EntityForm<T> { ... }
  merge(origin: EntityForm<T>): this { ... }

  // 키 narrowing 가능 API:
  getField<K extends keyof T & string>(name: K): EntityField | undefined;
  getField(name: string): EntityField | undefined;  // 기존 호환 overload

  async getValue<K extends keyof T & string>(name: K): Promise<T[K]>;
  async getValue(name: string): Promise<any>;

  setValue<K extends keyof T & string>(name: K, value: T[K]): this;
  setValue(name: string, value: any): this;
  ...
}
```

**`& string` intersection 이유**: `keyof T` 는 `number | symbol` 도 포함. fieldName 은 항상 string 이므로 narrowing 필요.

### 2.2 Inheritance chain 전파

현재 체인:
```
EntityFormBase → EntityFormValidation → EntityFormData → EntityFormActions → EntityFormExtensions → EntityForm
```

**모든 계층에 `<T extends object = any>` 파라미터 전파**. 각 `extends` 시 T 명시:

```ts
export abstract class EntityFormBase<T extends object = any> { ... }
export abstract class EntityFormValidation<T extends object = any> extends EntityFormBase<T> { ... }
export abstract class EntityFormData<T extends object = any> extends EntityFormValidation<T> { ... }
export abstract class EntityFormActions<T extends object = any> extends EntityFormData<T> { ... }
export abstract class EntityFormExtensions<T extends object = any> extends EntityFormActions<T> { ... }
export class EntityForm<T extends object = any> extends EntityFormExtensions<T> { ... }
```

**작업량**: 5 abstract + 1 concrete = 6 클래스에 `<T>` 추가. 각 ~10 줄 수정 수준. 내부 메소드의 `any` 중 T 로 교체 가능한 것만 승격.

### 2.3 `FormField<TSelf, TValue, TForm>`

**핵심 딜레마**: 기존 `FormField<T extends FormField<T>>` 는 T 가 **subclass 자체** (F-bounded polymorphism). 새 파라미터를 앞에 끼우면 **33+ 서브클래스 전부 깨짐**.

**해결**: 기존 T 를 **`TSelf` 로 리네임** (의미 명확화) + 뒤에 추가 파라미터:

```ts
export abstract class FormField<
  TSelf extends FormField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> implements EntityField {
  value?: FieldValue<TValue>;

  displayFunc?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;

  saveValue?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;

  protected abstract createInstance(name: string, order: number): TSelf;
  ...
}
```

**Backward-compat 검증**:
- 기존 `class StringField extends FormField<StringField>` — `TValue = any, TForm = any` 디폴트. 무수정 동작.
- 기존 host `class RelatedMemoField extends FormField<RelatedMemoField>` — 동일. 무수정.
- 점진 승격: `class NameField extends FormField<NameField, string, User>` 가능 (선택).

### 2.4 내부 abstract 클래스 전파

- `ListableFormField<TSelf extends ListableFormField<TSelf>>` → `<TSelf extends ListableFormField<TSelf, TValue, TForm>, TValue = any, TForm extends object = any>`
- `OptionalField`, `MultipleOptionalField`, `CheckButtonValidationField`, `AbstractManyToOneField`, `AbstractDateField` 동일 패턴

**작업량**: 6 abstract 클래스 + FormField 자체 = 7 추상 클래스. 33+ concrete 서브클래스는 무수정 (TSelf 디폴트로 내려감).

### 2.5 `FieldValue<TValue = any>`

현재 (Config.ts:87):
```ts
export interface FieldValue {
  current?: any;
  fetched?: any;
  default?: any;
}
```

승격:
```ts
export interface FieldValue<TValue = any> {
  current?: TValue;
  fetched?: TValue;
  default?: TValue;
}
```

**효과**: `FormField<TSelf, TValue, TForm>` 의 `value?: FieldValue<TValue>` 로 필드값 전체 타입 전파. 호출처에서 `field.value?.current` 타입이 `TValue | undefined`.

### 2.6 `EntityField` 인터페이스

`EntityField` 는 런타임 다형 핸들 (entityForm.getField(name) 반환). 엔티티 타입과 분리되어 있음 — **제네릭 추가 안 함**. `FormField<TSelf, TValue, TForm> implements EntityField` 의 단방향 구현.

이유: getField 반환값을 `EntityField<T['id']>` 같은 걸로 narrow 하려면 필드명→값타입 매핑 테이블이 필요 — 엔티티에 메타정보 없이는 불가능.

### 2.7 `OnChangeEntityForm` / `ModifyEntityFormFunc` / `OnFetchData` 등 callback 타입

- `ModifyEntityFormFunc` (from EntityFormMethod): `(entityForm: EntityForm) => Promise<EntityForm>` → `<T>(entityForm: EntityForm<T>) => Promise<EntityForm<T>>`
- `EntityForm.onChanges: ((entityForm, fieldName) => void)[]` → T 전파
- `OnChangeEntityForm.changeHidden(name, options) → ModifyEntityFormFunc<T>` — static 메소드이므로 타입 파라미터를 메소드 레벨에 추가

**전파 범위 (파일)**:
```
config/Config.ts              — FieldValue, ConditionalValue, types
config/EntityField.ts         — EntityField (제네릭 추가 X), FieldRenderParameters (entityForm: EntityForm<any>)
config/EntityForm.tsx         — 메인
config/EntityFormMethod.ts    — ModifyEntityFormFunc<T>
config/EntityFormTypes.ts     — SubmitFormData<T>?, FieldError, AlertMessage (대부분 T 와 무관)
config/EntityTab.ts           — EntityTab<T> 검토 (필드 컨테이너)
config/EntityFieldGroup.ts    — EntityFieldGroup<T> 검토
config/OnChangeEntityForm.ts  — ModifyEntityFormFunc<T>
config/form/EntityFormBase.tsx → EntityFormExtensions.tsx  (5 abstracts)
components/fields/abstract/FormField.tsx                   — 메인
components/fields/abstract/{ListableFormField,OptionalField,CheckButtonValidationField,AbstractManyToOneField,AbstractDateField}.tsx  (6 abstracts)
```

### 2.8 FieldRenderParameters / callback 시그니처

```ts
// 현재
export interface FieldRenderParameters {
  entityForm: EntityForm;
  ...
  onChange: (value: any, propagation?: boolean) => void;
}

// 승격
export interface FieldRenderParameters<T extends object = any, TValue = any> {
  entityForm: EntityForm<T>;
  ...
  onChange: (value: TValue, propagation?: boolean) => void;
}
```

**주의**: `FieldRenderParameters` 는 React 컴포넌트 prop 으로 흘러들어가므로, 제네릭 추가 시 컴포넌트 (FieldRenderer 등) 도 제네릭 필요. UI 컴포넌트 층의 제네릭화는 **구현 세션에서 스코프 조정 권장** — 1차 구현은 `EntityForm<T>` 까지만, `FieldRenderParameters<T, TValue>` 는 phase 2.

---

## 3. 기본값 `= any` 의 의미 (Backward-compat 계약)

### 3.1 소비자 무수정 호환 매트릭스

| 소비자 패턴 | 컴파일 가능? | 추천 조치 |
|---|---|---|
| `const f: EntityForm = new EntityForm(...)` | ✅ | 유지 OK. 점진 승격 가능 |
| `new EntityForm('name', '/url')` | ✅ (T=any) | 선택적으로 `new EntityForm<User>(...)` |
| `class F extends FormField<F>` | ✅ (TValue=TForm=any) | 선택적으로 `<F, string, User>` |
| `(form: EntityForm) => {...}` | ✅ | EntityForm = EntityForm<any> |
| `form.getValue('name')` | ✅ → `Promise<any>` | `EntityForm<User>` 로 승격하면 `Promise<User['name']>` |
| `form.getField('x') as MyField` | ✅ | cast 패턴 유지. generic 으로 해결 안 됨 |

### 3.2 **잠재 Breaking 포인트**

기본값이 any 라도 **타입 추론 경로 변화** 로 깨질 수 있는 엣지:

1. `EntityForm` 을 type param 에 넣는 경우. 예: `Map<string, EntityForm>` 은 `Map<string, EntityForm<any>>` 로 해석. 호환.
2. `interface Foo extends EntityForm {}` — 클래스를 interface extend 는 드물지만 가능. T 없이 extend 시 T=any 로 내려감. 호환.
3. F-bounded 재귀 타입 에러: `class X extends FormField<X>` 를 `class X extends FormField<X, SomeValue>` 로 부분 승격하는 도중 `X` 가 미정의된 상태에서 TValue 해석이 꼬일 수 있음. **권고**: 서브클래스 승격은 3-tuple 모두 명시 (`<X, string, User>`) 하거나 모두 생략 (`<X>`).
4. Conditional/mapped types 안에서 `EntityForm` 을 bare generic 으로 사용하면 TS 가 `EntityForm<any>` 로 해석 — 일반적으로는 호환이지만 specific inference 시나리오에서 예상과 다른 T 로 고정될 가능성 있음. 구현 후 gjcu 빌드로 검증 필요.

### 3.3 gjcu 호스트 영향 측정 (이 세션 수집)

- **13 개소 `new EntityForm(...)`**: 전부 `EntityForm` 또는 `: EntityForm` 어노테이션. T=any 로 안전.
- **1 개소 `extends FormField<Self>`** (RelatedMemoField): 무수정 동작 (TValue=TForm=any default).
- **10+ 개소 `entityForm.getValue('name')`**: 모두 `await` 후 타입 없이 사용. `Promise<any>` 반환으로 현재와 동일 동작. 승격 옵션 존재.
- **1 개소 `entityForm.getField('x') as RelatedMemoField`**: cast 패턴. 변화 없음.

**결론**: gjcu 는 **타입 에러 0 개 예상**. 단, 구현 후 `npm install` 시 peer type 에러 검증 필수.

---

## 4. Any 감축 예상

### 4.1 승격 가능 (generic 으로 치환)

| 위치 | 현재 | 승격 후 | 예상 감축 |
|---|---|---|---|
| `FieldValue.current/fetched/default: any` | 3 | `TValue` | 3 |
| `EntityForm.getValue/getCurrentValue/getField 관련 any` | ~20 | `T[K]` / `Promise<T[K]>` | 15 |
| `setFetchedValue(entity: any)` | 1 | `entity: Partial<T>` | 1 |
| `FormField.displayFunc / saveValue / maskedValueFunc` → `Promise<any>` | ~10 | `Promise<TValue>` | 8 |
| `FormField.getCurrentValue / getDisplayValue / getFetchedValue / getSaveValue` → `Promise<any>` | ~12 | `Promise<TValue>` | 10 |
| `FormField.overrideRender 의 entityForm 내부 any 사용` | ~5 | T | 3 |
| `EntityFormBase.setValue / withValue / withFetchedValue` 의 `value: any` | ~8 | `T[K]` | 6 |
| `attributes: Map<string, any>` | 유지 | (열린 set, 의도된 any) | 0 |
| `copyFields(origin: FormFieldProps, ...)` 내부 any | ~5 | 일부 TValue | 2 |
| misc config/form 파일의 entity 관련 any | ~40 | T 또는 TValue | 25 |

**예상 합계: ~70~90 건 승격**. 목표 "306 → 200 미만" 대비 공격적이면 달성, 보수적이면 230 수준.

### 4.2 유지 (의도된 any — 승격 불가)

- **UIProvider `ComponentType<any>`**: React 컴포넌트 다형성. 소비자가 임의 prop 을 전달하는 wrapper. DECISIONS #21.
- **parse(), JSON 반환**: 런타임 검증 도구 없이 정확한 타입 불가. unknown 으로 점진 전환은 가능하지만 Task E 스코프 밖.
- **`catch (e: unknown)` → type guard 패턴**: 이미 #65 에서 처리됨.
- **`attributes: Map<string, any>`**: 소비자 확장 포인트. `Map<string, unknown>` 으로 전환 검토 가능하지만 breaking.
- **`ConditionalValue.value: FieldValue | undefined`**: 이미 FieldValue 제네릭화로 승격 — `FieldValue<any>` default.
- **`OnChangeEntityForm.changeRequired(...options: ConditionalProps | ConditionalProps[])` 의 `ConditionalProps.value: any`**: UI 층의 조건부 값 매칭 — 임의 값 비교이므로 any 유지 필요.

### 4.3 측정 방법

승격 전/후 `npm run lint -- --rule '@typescript-eslint/no-explicit-any: error'` 로 any 카운트 변화 측정. 현재 eslint 룰은 off 이므로 구현 세션에서 one-shot 측정.

---

## 5. 구현 전략 (세션 2 용)

### 5.1 1 개 에이전트로 충분한 이유
- 변경 파일 ~20 개. 논리적으로 단일 리팩터 (제네릭 전파는 불가분).
- 3 분할 시 중간 상태가 빌드 깨짐 → 에이전트 간 synchronisation 불가능.
- Task D (3 병렬) 와 달리 Task E 는 "국소 타입 narrowing" 이 아니라 "전역 타입 시그니처 변경".

### 5.2 구현 순서 권장

**Phase 1 — foundation 타입**:
1. `Config.ts`: `FieldValue<TValue = any>` 추가. 기존 `FieldValue` 사용처 영향 0 (default any).
2. `EntityField.ts`: `value?: FieldValue<any>` 로 명시. 타입 변경 없음 (컴파일러가 유추하도록).
3. `EntityFormMethod.ts`: `ModifyEntityFormFunc<T = any>` 승격.

**Phase 2 — abstract 체인 제네릭화**:
4. `EntityFormBase.tsx` ~ `EntityFormExtensions.tsx` 5 파일: `<T extends object = any>` 추가 + `extends Parent<T>`.
5. `EntityForm.tsx`: `class EntityForm<T extends object = any> extends EntityFormExtensions<T>`.

**Phase 3 — 메소드 시그니처 승격**:
6. `EntityFormBase.getField / getValue` 에 keyof T overload 추가.
7. `EntityFormData.setValue / withValue` 에 keyof T overload.
8. `clone() / cloneWithEntityForm() / merge()` 반환 타입 `EntityForm<T>`.

**Phase 4 — FormField 체인**:
9. `FormField.tsx`: `T` → `TSelf`. `TValue`, `TForm` 추가. 내부 `any` 승격.
10. `abstract/{ListableFormField,OptionalField,CheckButtonValidationField,AbstractManyToOneField,AbstractDateField}.tsx`: 파라미터 append.
11. `MultipleOptionalField` (OptionalField.tsx 내부): 동일.

**Phase 5 — 검증**:
12. `npm run type-check` — library 자체 PASS.
13. `npm test` — 900+ tests 유지. Task C 의 config/form/fields 테스트가 generic 호환성 검증 역할.
14. `npm run lint`, `format:check`, `build` 통과.
15. gjcu 호스트 재설치 → `npm run type-check` → HTTP 303.

### 5.3 위험 / 완화

| 위험 | 완화 |
|---|---|
| F-bounded 체인 `FormField<TSelf extends FormField<TSelf, TValue, TForm>, TValue, TForm>` 의 재귀 제약 이 TS 추론 실패 유발 | default all `= any`. 서브클래스는 `<Self>` 만 쓰면 내부에서 `<Self, any, any>` 로 해석. Task D 전에 소규모 sanity 테스트 브랜치에서 검증 |
| `getValue<K extends keyof T & string>` overload 가 기존 string 호출과 충돌 | overload 순서: 구체(`keyof T & string`) → 일반(`string`). TS 가 먼저 매칭 시도. 소비자가 `EntityForm<any>` 면 `keyof any & string` = `string` 으로 축약 |
| gjcu 의 `EntityForm` bare 사용 위치가 제네릭 기본값 변화로 inference 실패 | 이론상 불가 (default=any 는 기존 `EntityForm` 과 동일). 구현 후 gjcu build 로 실측 |
| `FieldRenderParameters` 에 제네릭 추가 시 UI 컴포넌트 층 (FieldRenderer, ViewEntityForm 등) 까지 제네릭 전파 필요 → 스코프 폭증 | **Phase 1 구현에서 제외**. FieldRenderParameters 는 기존 `any` 유지. 별도 Task F 로 분리 가능 |
| FormField 내 `createInstance(name, order): TSelf` 가 TSelf 의 재귀 타입으로 추론 실패 | return 타입을 `this` 로 교체 검토. 다만 `this` 는 instance method 에서만 유효 — abstract method 반환타입에는 부적합. **TSelf 유지 결정** |

---

## 6. Breaking Change 판정

### 6.1 타입 레벨
- 모든 제네릭 파라미터 `= any` 기본값. 소스 코드 수정 없이 기존 소비자 컴파일.
- overload 추가 (keyof T & string) 는 구체 시그니처 우선 매칭이지만 default `T = any` 이면 `keyof T & string` = `string` → 기존 string 시그니처와 동일. **Soft-compat**.
- **예외**: `interface` 에 extend 한 소비자가 `EntityForm.getValue` 를 특정 시그니처로 기대하는 경우 — gjcu 에 없음.

### 6.2 런타임
- 변경 0. 타입 annotation only.

### 6.3 배포 권고
- **alpha.46** (minor) 로 충분. v0.2.0 major bump 불필요.
- 대안: v0.2.0 을 "의도된 any 정리 완료 + 공개 API 엄격" 마일스톤으로 마킹하고 싶다면 major bump. 하지만 소비자 입장에서는 alpha.46 과 차이 없음.
- **최종 결정은 구현 후 gjcu 빌드 결과 관찰 후**.

---

## 7. 소비자 마이그레이션 가이드 초안 (README 추가용)

### 7.1 무수정 사용 (Default)
```ts
// v0.1 스타일 — 그대로 동작
const form: EntityForm = new EntityForm('User', '/api/user');
form.addFields({ items: [new StringField('name', 10)] });
await form.getValue('name'); // Promise<any>
```

### 7.2 점진 승격 (Opt-in)
```ts
interface User {
  id: string;
  name: string;
  age: number;
}

// 엔티티 타입 명시
const form = new EntityForm<User>('User', '/api/user');
await form.getValue('name');  // Promise<string>
await form.getValue('age');   // Promise<number>
await form.getValue('typo');  // ❌ 컴파일 에러
form.setValue('age', 'x');    // ❌ 컴파일 에러
```

### 7.3 커스텀 FormField 승격
```ts
// v0.1 스타일 — 그대로 동작
class SlugField extends FormField<SlugField> {
  protected createInstance(n: string, o: number) { return new SlugField(n, o); }
  ...
}

// 점진 승격 — 필드값 타입 + 엔티티 타입 명시
class SlugField extends FormField<SlugField, string, Post> {
  ...
}
```

### 7.4 `FieldRenderParameters` 는 현재 generic 아님
```ts
class SlugField extends FormField<SlugField, string, Post> {
  protected renderInstance(params: FieldRenderParameters) {
    // params.entityForm: EntityForm<any>  — FieldRenderParameters 는 v0.3 에서 미승격
    // v0.4 에서 FieldRenderParameters<T, TValue> 승격 예정
    ...
  }
}
```

---

## 8. 스코프 외 (Task F 또는 그 이후)

- `FieldRenderParameters<T, TValue>` — UI 층 제네릭화. FieldRenderer / ViewEntityForm 등 React 컴포넌트 트리 전체 영향.
- `UIProvider ComponentType<any>` → `ComponentType<any>` 유지 (의도된 any, DECISIONS #21).
- `parse()` → `unknown` 전환 — 런타임 검증 (zod 등) 도구와 결합 시 의미 있음. 독립 진행 가능.
- `attributes: Map<string, any>` → `Map<string, unknown>` — breaking. v0.2.0 major bump 시 후보.
- `ConditionalProps.value: any` / `ConditionalSelectOption.value: any` — UI 조건부 매칭. 설계상 any 유지.

---

## 9. 세션 2 프롬프트 초안 (에이전트 1 개)

```
@rcm/listgrid v0.3 Task E 구현 — EntityForm<T> / FormField<TSelf, TValue, TForm>.

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**설계 문서**: docs/GENERIC_DESIGN.md (먼저 끝까지 읽기. Phase 1~5 순서 엄수)
**기준 commit**: 45b77d7 (Task D 마감)

**작업 범위 (파일 ~20 개)**:
- Phase 1: Config.ts (FieldValue<TValue>), EntityField.ts, EntityFormMethod.ts (ModifyEntityFormFunc<T>)
- Phase 2: EntityFormBase → EntityFormExtensions 5 abstract + EntityForm.tsx 에 `<T extends object = any>` 전파
- Phase 3: getField/getValue/setValue/withValue 에 keyof T & string overload 추가
- Phase 4: FormField.tsx 의 T 를 TSelf 로 rename + TValue, TForm 파라미터 append. 5 abstract 필드 클래스도 동일
- Phase 5: 검증 (type-check + test + lint + format + build)

**규칙**:
- 모든 제네릭 기본값 `= any` 로 backward-compat 유지. 33+ concrete 필드 서브클래스 무수정 필수
- `FieldRenderParameters` 는 이 Task 에서 제네릭화 제외 (phase 2)
- UIProvider ComponentType<any> 유지 (의도된 any)
- 구현 중 설계 미스 발견 시 GENERIC_DESIGN.md 의 해당 섹션 수정 + 이유 기록 후 진행

**검증**:
- npm run type-check PASS
- npm test 900+ tests PASS (회귀 0)
- npm run lint 0 errors
- npm run format:check PASS
- npm run build PASS
- any 측정: 306 → 목표 200 이하 (최소 200 대)

**반환 포맷**:
## Task E 구현 완료

### 수정 파일 목록 (카테고리별)
- Phase 1 foundation: ...
- Phase 2 abstract chain: ...
- Phase 3 keyof T overloads: ...
- Phase 4 FormField chain: ...

### 수치
- any before / after: 306 → N
- 테스트: 900 → N passing
- 빌드: PASS/FAIL

### API 변경 (소비자 영향)
- breaking: (있으면 나열)
- non-breaking: (default any 로 호환되는 것)

### 설계와 달라진 점
- (있으면)
```

---

## 10. 체크리스트 (세션 2 착수 전)

- [ ] 이 문서 전체 읽기
- [ ] STATUS.md 의 현재 상태 (commit 45b77d7, Task D 마감) 확인
- [ ] gjcu 호스트 worktree 가 alpha.45 설치 상태인지 (구현 후 재설치로 검증 대비)
- [ ] `npm test` / `npm run type-check` 현 상태 그린인지 사전 확인
- [ ] 설계 변경 필요 시 이 문서 수정 → commit 분리 → 구현

---

## 11. 메모

- 이 문서는 **v0.3 Task E 세션 1 산출물**. 구현은 후속 세션.
- 설계 변경은 이 문서를 직접 수정 + DECISIONS #70 에 변경 이력 추가.
- `docs/NEXT_SESSION.md` § 4 의 초기 설계 (FormField<TValue, TForm>) 와 달라진 점: **TSelf 유지** 결정. F-bounded 셀프 타입을 유지해야 기존 33+ 서브클래스를 무수정 호환할 수 있음.
