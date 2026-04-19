# Task F — `FieldRenderParameters<T, TValue>` / `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` Generic Refactor 설계

**세션**: 1 of 2 (설계만. 구현은 다음 세션)
**작성일**: 2026-04-19
**기준 commit**: `4854afa` (Task E 마감 / alpha.47 배포 완료)
**DECISIONS**: #21 / #65 (의도된 any 맥락), #62 (메인 context 보호), #70 (Task E 설계), #71 (Task E 구현), #72 (alpha.46~47 실측), #73 (이 설계 — Task F 세션 1)

참고 문서: `docs/GENERIC_DESIGN.md` (Task E 설계 — 동일 구조/섹션 템플릿)

---

## 0. TL;DR

1. `FieldRenderParameters<T extends object = any, TValue = any>` — **엔티티 스키마 T + 필드값 TValue** 로 제네릭화. `entityForm: EntityForm<T>`, `onChange: (value: TValue, ...) => void`, `updateEntityForm?: (updater: (EntityForm<T>) => Promise<EntityForm<T>>) => Promise<void>` 3 속성이 narrowing 대상.
2. `FilterRenderParameters<T extends object = any, TValue = any>` 동일 패턴. `FieldInfoParameters<T extends object = any>` 는 T 한 개 (entityForm 만 존재).
3. **FormField 체인 연결**: 이미 Task E 에서 제네릭화된 `FormField<TSelf, TValue, TForm>` 의 TValue/TForm 을 renderInstance/render/view/overrideRender 파라미터로 자연스럽게 전파. 33+ concrete 서브클래스는 **모두 default `= any`** 로 무수정 동작.
4. **`FieldRenderer` React 컴포넌트 자체는 제네릭화 하지 않음** — JSX 에서 `<FieldRenderer<User, string> {...} />` 문법 / Next.js RSC 경계 / `getFieldRenderer(name)` 의 dynamic registry 호환성 때문. 컴포넌트 내부에서 `FieldRenderParameters<any, any>` 로 파라미터 객체를 생성 → 필드 클래스의 `renderInstance` 가 narrowing 책임을 가짐.
5. 예상 any 감축: **~20~35 건** (현재 286 → 260 전후). Task E 의 9 건 (grep 표면) 대비 실질적으로 유사한 규모. 주 효과는 "renderInstance 내부 `params.entityForm.getValue('x')` 의 narrowing" (간접 감축).
6. Breaking change 판정: **타입/런타임 모두 호환** (모든 default `= any`). alpha.48 minor bump 권고.

---

## 1. 배경 (Why)

### 현재 상태 (Task E 마감 시점, alpha.47)

Task E (#70/#71) 로 **config 층 제네릭화** 는 완료:
- `EntityForm<T extends object = any>` — `getValue<K>(name: K): Promise<T[K]>` 키 narrowing
- `FormField<TSelf, TValue = any, TForm extends object = any>` — 필드값 / 엔티티 narrowing
- `FieldValue<TValue = any>`, `ModifyEntityFormFunc<T>` 등 callback 타입 제네릭화

그러나 **UI 층 파라미터 인터페이스 3 개** (EntityField.ts line 144~185) 는 Task E 에서 **의도적으로 스코프 제외** (#70 § 2.8, § 5.3 위험 표):

```ts
// 현재 (Task E 완료 후에도 동일)
export interface FieldRenderParameters {
  entityForm: EntityForm;                              // EntityForm<any> 로 해석
  onChange: (value: any, propagation?: boolean) => void;
  updateEntityForm?: (updater: (EntityForm) => Promise<EntityForm>) => Promise<void>;
  ...
}
export interface FilterRenderParameters {
  entityForm: EntityForm;
  onChange: (value: any, op?: QueryConditionType) => void;
  value?: Promise<any>;
  ...
}
export interface FieldInfoParameters {
  entityForm?: EntityForm | undefined;
  ...
}
```

### Task F 가 해결하는 것

필드 클래스 시그니처를 점진 승격하면:

```ts
// v0.3 스타일 (현재)
class SlugField extends FormField<SlugField, string, Post> {
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    // params.entityForm: EntityForm<any>     — narrowing 안 됨
    // params.onChange: (value: any) => void   — narrowing 안 됨
    params.onChange(42);     // ❌ 런타임 런오류. 컴파일은 통과.
    const author = await params.entityForm.getValue('author');  // Promise<any>
  }
}

// Task F 후
class SlugField extends FormField<SlugField, string, Post> {
  protected renderInstance(
    params: FieldRenderParameters<Post, string>,  // ← TForm, TValue narrow
  ): Promise<React.ReactNode | null> {
    params.onChange(42);     // ✅ 컴파일 에러 (string 아님)
    const author = await params.entityForm.getValue('author');  // Promise<Post['author']>
  }
}
```

즉 Task F 는 "**이미 Task E 로 narrow 된 FormField.TValue/TForm 을 render 시점까지 일관 전파**" 시키는 작업.

### Task F 가 해결 못하는 것

- **dynamic field registry** (`UIProvider.getFieldRenderer(name)` / `registerSmsHistoryField` 같은 호스트 확장 포인트) — 소비자가 임의 React 컴포넌트를 주입. 컴포넌트의 prop 타입이 열린 집합이므로 `ComponentType<any>` 유지 (DECISIONS #21).
- **FieldRenderer React 컴포넌트 자체** — JSX 제네릭 컴포넌트 `<FieldRenderer<User, string> />` 는 문법상 가능하지만 (a) Next.js RSC boundary 시 serializable 제약 (b) FieldRenderer 는 **여러 FormField 타입을 한 트리에서 렌더** 하는 범용 컴포넌트라 단일 `<T, TValue>` 로 수렴 불가. 이 지점은 `FieldRenderParameters<any, any>` 로 파라미터 객체를 구성하고, **필드 서브클래스의 renderInstance** 에서 narrowing 하는 쪽이 자연스러움.
- **overrideRender / withOverrideRender** 의 callable signature — `FormField.overrideRender?: (params: FieldRenderParameters<TForm, TValue>) => Promise<ReactNode | null | undefined>` 로 전파되지만, 소비자가 `withOverrideRender((params) => ...)` 호출 시 TS 가 TForm/TValue 를 inference 해야 함. FormField instance 에서 호출되면 TS 가 추론 가능. 설계 § 2.4 에서 검증.

### 왜 Task F 를 Task E 와 분리했나

Task E 설계 (#70 § 2.8) 에서 명시적으로 **UI 컴포넌트 층 영향이 폭증** 하는 이유:
- `FieldRenderParameters` 는 33+ concrete 필드의 `renderInstance` 시그니처
- + `FormField` abstract 5 개 (ListableFormField, OptionalField, CheckButtonValidationField, AbstractManyToOneField, AbstractDateField) 의 renderInstance
- + FieldRenderer / ViewEntityForm / FieldRendererHelper / RuleFieldRenderer 등 helper / 컴포넌트
- + `FilterRenderParameters` / `FieldInfoParameters` 의 별도 흐름

= **49 파일, 110 occurrences** (grep 측정). Task E 가 20 파일이었던 것과 비교하면 2.5x 규모. 한 번에 섞으면 (a) 제네릭 전파 오류 vs exactOpt 회귀 vs Task E 의 TSelf F-bounded 재귀 제약 이슈 셋이 교차해서 **디버깅 미궁** 우려. 분리가 올바른 판단이었고, alpha.47 실측 (#72) 으로 Task E 는 peer 회귀 0 건으로 확인됨.

### 왜 v0.3 내에 하나

- Task E 의 FormField chain (`FormField<TSelf, TValue, TForm>`) 이 alpha.47 에 안정 착지. Task F 는 이 체인에 "render 시점 전파" 를 이어 붙이는 국소 작업. Task E 기반 없이는 할 수 없음
- gjcu 호스트 실측 (#72) 으로 backward-compat 루프 (라이브러리 수정 → overlay → diff → 배포) 확립. Task F 도 동일 루프로 검증 가능
- v0.2.0 major bump 은 "Task E + F + attributes Map 승격" 묶음이 자연스러운 마일스톤. Task F 완료 전 major bump 는 시기상조

---

## 2. 타입 파라미터 위치 결정 (가장 중요한 섹션)

### 2.1 `FieldRenderParameters<T extends object = any, TValue = any>`

**선택: `T` 먼저, `TValue` 뒤** (엔티티 → 필드값 순서).

**근거**:
- FormField 의 제네릭 순서 `<TSelf, TValue, TForm>` 와 충돌 않기. FormField 는 TSelf 가 앞이라 F-bounded 셀프 타입. FieldRenderParameters 는 셀프 타입이 없으므로 "entity → value" 순 자연.
- Task E 설계 (#70 § 2.8) 에서 예시로 `FieldRenderParameters<T, TValue>` 명시 — 그 순서 유지.
- 추후 `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` 와 일관.

```ts
// 승격
export interface FieldRenderParameters<T extends object = any, TValue = any> {
  entityForm: EntityForm<T>;
  session?: Session;
  onChange: (value: TValue, propagation?: boolean) => void;
  onError?: (message: string) => void;
  clearError?: () => void;
  required?: boolean;
  readonly?: boolean;
  placeHolder?: string;
  helpText?: ReactNode;
  subCollectionEntity?: boolean;
  updateEntityForm?: (updater: (entityForm: EntityForm<T>) => Promise<EntityForm<T>>) => Promise<void>;
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>;
}
```

**narrowing 대상 3 속성**:
- `entityForm: EntityForm<T>` — `T = any` default 면 `EntityForm<any>` (기존과 동일)
- `onChange: (value: TValue, ...) => void` — `TValue = any` default 면 기존 시그니처
- `updateEntityForm?` 콜백의 updater 인자/반환 타입 모두 `EntityForm<T>` 로 전파

**narrowing 대상 아닌 속성**:
- `session?`, `onError`, `clearError`, `required`, `readonly`, `placeHolder`, `helpText`, `subCollectionEntity`, `resetEntityForm` — 엔티티/필드값과 무관. 그대로.

### 2.2 `FilterRenderParameters<T extends object = any, TValue = any>`

```ts
// 승격
export interface FilterRenderParameters<T extends object = any, TValue = any> {
  entityForm: EntityForm<T>;
  onChange: (value: TValue, op?: QueryConditionType) => void;
  placeHolder?: string;
  helpText?: string;
  value?: Promise<TValue>;
}
```

**narrowing 대상**:
- `entityForm: EntityForm<T>`
- `onChange(value: TValue, op?)` — 필터에서 값 변경 시 전달되는 값
- `value?: Promise<TValue>` — 현재 필터 값

### 2.3 `FieldInfoParameters<T extends object = any>`

TValue 없음. `entityForm?` 만 존재.

```ts
export interface FieldInfoParameters<T extends object = any> {
  entityForm?: EntityForm<T> | undefined;
  session?: Session | undefined;
  renderType?: RenderType | undefined;
}
```

**narrowing 대상**:
- `entityForm?: EntityForm<T> | undefined`

`FieldInfoParameters` 는 `isRequired(props)` / `isHidden(props)` / `isReadonly(props)` / `getPlaceHolder(props)` / `getTooltip(props)` / `getHelpText(props)` 등 조건부 값 평가 시 쓰임. TValue 불필요.

### 2.4 `EntityField` 인터페이스의 메소드 시그니처 (가장 큰 전파 범위)

`EntityField` 는 Task E 에서 제네릭 추가 하지 않기로 결정됨 (#70 § 2.6 — 런타임 다형 핸들). Task F 도 동일. 단, `EntityField` 의 메소드 중 `FieldRenderParameters` / `FilterRenderParameters` / `FieldInfoParameters` 를 파라미터로 받는 것들은 **기본값 `= any` 인 제네릭 파라미터를 그대로 통과** 시킴:

```ts
// 현재
export interface EntityField extends EntityItem {
  overrideRender?: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>;
  view(params: FieldRenderParameters): Promise<ReactNode | null>;
  isRequired(props: FieldInfoParameters): Promise<boolean>;
  isBlank(renderType?: RenderType): Promise<boolean>;
  getPlaceHolder(props: FieldInfoParameters): Promise<string>;
  ...
}

// 승격 후 — default = any 덕에 타입 레벨 변화 없음
export interface EntityField extends EntityItem {
  overrideRender?: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>;
  view(params: FieldRenderParameters): Promise<ReactNode | null>;
  isRequired(props: FieldInfoParameters): Promise<boolean>;
  ...
}
```

EntityField 인터페이스 자체는 **무변경**. 단지 `FieldRenderParameters` 가 제네릭 인터페이스로 바뀌었으나 기본값으로 해석되므로 호환.

### 2.5 `FormField` 체인의 메소드 시그니처 (TValue / TForm 실제 전파)

**핵심**: FormField 는 이미 `<TSelf, TValue, TForm>` 제네릭화 완료 (Task E). renderInstance 시그니처를 자연 전파:

```ts
// 현재
export abstract class FormField<
  TSelf extends FormField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> implements EntityField {
  overrideRender?: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>;

  protected abstract renderInstance(params: FieldRenderParameters): Promise<ReactNode | null>;

  async view(params: FieldRenderParameters): Promise<ReactNode | null | undefined> {...}
  public render(params: FieldRenderParameters): Promise<ReactNode | null | undefined> {...}

  withOverrideRender(
    fn: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>,
  ): this {...}

  async isRequired(props: FieldInfoParameters): Promise<boolean> {...}
  async isHidden(props: FieldInfoParameters): Promise<boolean> {...}
  async isReadonly(props: FieldInfoParameters): Promise<boolean> {...}
  async getPlaceHolder(props: FieldInfoParameters): Promise<string> {...}
  async getTooltip(props: FieldInfoParameters): Promise<ReactNode> {...}
  async getHelpText(props: FieldInfoParameters): Promise<ReactNode> {...}
}

// 승격 후 — TValue / TForm 을 render/view/overrideRender 로 전파
export abstract class FormField<
  TSelf extends FormField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> implements EntityField {
  overrideRender?: (
    params: FieldRenderParameters<TForm, TValue>,
  ) => Promise<ReactNode | null | undefined>;

  protected abstract renderInstance(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<ReactNode | null>;

  async view(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<ReactNode | null | undefined> {...}

  public render(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<ReactNode | null | undefined> {...}

  withOverrideRender(
    fn: (params: FieldRenderParameters<TForm, TValue>) => Promise<ReactNode | null | undefined>,
  ): this {...}

  async isRequired(props: FieldInfoParameters<TForm>): Promise<boolean> {...}
  // isHidden/isReadonly/getPlaceHolder/getTooltip/getHelpText 동일
}
```

**33+ concrete 서브클래스 무수정 확인 (핵심 호환성 전제)**:

```ts
// 현재 (Task E 완료 후)
class StringField extends FormField<StringField> {
  //                               ^ TSelf
  //                               TValue = any, TForm = any (default)
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    //                                   ^^^^^^^^^^^^^^^^^^^^^^^
    //                                   FieldRenderParameters<any, any> 로 해석 (default)
  }
}
```

FormField 가 `FieldRenderParameters<TForm, TValue>` 로 바뀌면 `FieldRenderParameters<any, any>` (TForm=TValue=any default) 로 해석되고, StringField 가 상속한 추상 메소드의 실제 시그니처는 `renderInstance(params: FieldRenderParameters<any, any>)`. StringField 가 선언한 `params: FieldRenderParameters` 는 `FieldRenderParameters<any, any>` 와 동일. **무수정 통과**.

### 2.6 abstract 중간 클래스 전파

Task E 에서 이미 모든 abstract 가 `<TSelf, TValue = any, TForm = any>` 로 제네릭화. Task F 는 각 abstract 의 render 계열 메소드 / filter 계열 메소드 / info 계열 메소드 시그니처를 `FieldRenderParameters<TForm, TValue>` 등으로 전파:

- `ListableFormField` (FormField 확장):
  - `renderListFilter(params: FilterRenderParameters)` → `<TForm, TValue>`
  - `renderListFilterOriginal` / `renderListFilterInstance` 동일
  - `renderListItem(props: ViewListProps)` 는 TValue/TForm 과 무관 (ViewListProps 은 별개 interface, 이번 Task 스코프 외)
- `OptionalField` / `MultipleOptionalField` — 주로 ListableFormField 의 것을 재사용. 독자 renderInstance 있으면 파라미터 전파
- `CheckButtonValidationField`:
  - `renderCheckButtonValidationField(params: FieldRenderParameters)` → `<TForm, TValue>`
- `AbstractManyToOneField` / `AbstractDateField` — 필드 특유 render 메소드들에 `<TForm, TValue>` 전파

**주의**: abstract 중간 클래스가 **자체 TValue 를 고정** 하지 않음. 즉 `ListableFormField<TSelf, TValue, TForm>` 이지 `ListableFormField<TSelf, string, TForm>` 같은 고정은 하지 않음 — 각 concrete (StringField) 이 default any 를 유지하므로.

### 2.7 `FieldRenderer` React 컴포넌트는 제네릭화 하지 **않음** (결정 포인트)

**결정**: FieldRenderer 컴포넌트 자체는 `<T, TValue>` 제네릭 prop 을 추가하지 않음.

**근거**:
1. **JSX 제네릭 컴포넌트 문법 부담** — `<FieldRenderer<User, string> field={f} entityForm={e} />` 는 가능하지만 많이 쓰이지 않는 패턴. 소비자 학습 비용.
2. **FieldRenderer 는 범용 컨테이너** — 하나의 FieldRenderer 인스턴스가 여러 FormField 타입 (StringField, NumberField, ...) 을 한 트리에서 렌더링. 소비자가 `<FieldRenderer field={stringField} />` 와 `<FieldRenderer field={numberField} />` 를 섞어 쓰므로 단일 TValue 로 수렴 불가.
3. **파라미터 객체는 FieldRenderer 내부에서 생성** — FieldRenderer 의 useEffect 에서 `viewParams: FieldRenderParameters = {...}` 로 조립 후 `field.view(viewParams)` 호출. 이 생성 지점에서는 field 의 TForm/TValue 가 **일반** (FormField<any>) 상태. `FieldRenderParameters<any, any>` 로 타입 유지.
4. **narrowing 은 필드 서브클래스가 자기 책임** — 소비자가 `class SlugField extends FormField<SlugField, string, Post>` 로 정의하면, **renderInstance(params: FieldRenderParameters<Post, string>)** 시그니처가 narrow. FieldRenderer 는 `FieldRenderParameters<any, any>` 를 넘기지만 **구조적으로 호환** (TForm=any 는 모든 TForm 의 supertype, TValue=any 도 마찬가지. covariance OK).

**Props 에 `field: FormField<any>` 유지**:

```ts
// FieldRenderer.tsx line 43 (현재)
interface FieldRendererProps extends EntityFormManageable {
  field: FormField<any>;  // 그대로 유지
  ...
}
```

FormField 가 `<TSelf, TValue, TForm>` 이므로 `FormField<any>` 는 `FormField<any, any, any>` 로 해석 (TValue/TForm default). 제네릭 전파 효과 0, 기존과 동일.

**예외 — `ViewEntityForm` 도 동일 판정**: `ViewEntityForm.tsx` 에서 `FieldRenderParameters` 직접 사용 없음 (grep 결과 0). 전파 불필요.

### 2.8 `FieldRendererHelper` / `RuleFieldRenderer` (helper 층)

```ts
// 현재 FieldRendererHelper.tsx line 11
export async function getInputRendererParameters(
  field: FormField<any>,
  params: FieldRenderParameters,
) {
  return {
    ...params,
    value: await field.getDisplayValue(params.entityForm, params.entityForm.getRenderType()),
    ...
  };
}

// 승격 후 — 제네릭 함수로
export async function getInputRendererParameters<TForm extends object = any, TValue = any>(
  field: FormField<any, TValue, TForm>,
  params: FieldRenderParameters<TForm, TValue>,
) { ... }
```

**전파 효과**: 호출처 (Xref/Address/Color 계열 Views) 에서 `getInputRendererParameters(this, params)` 호출 시 `this` 의 TValue/TForm 을 TS 가 infer. 기존 호출은 모두 field=FormField<any>, params=FieldRenderParameters (default) 이므로 `TForm=any, TValue=any` 로 해석 → 무수정.

`RuleFieldRenderer` 도 동일 패턴이지만 Rule 전용 로컬 `EntityForm('temp', '')` 을 쓰므로 **굳이 제네릭 전파 불필요** — `FieldRenderParameters<any, any>` 그대로 둘 것 (단순화).

### 2.9 전파 범위 (파일 인벤토리)

```
config/EntityField.ts          — FieldRenderParameters / FilterRenderParameters / FieldInfoParameters 3 interface (메인)
config/EntityField.ts          — EntityField interface 의 메소드 시그니처 (기본값으로 자동 호환 — 무수정 권장)

components/fields/abstract/FormField.tsx                       — renderInstance / render / view / overrideRender / withOverrideRender / isRequired / isHidden / isReadonly / getPlaceHolder / getTooltip / getHelpText 시그니처 전파
components/fields/abstract/ListableFormField.tsx               — renderListFilter / renderListFilterOriginal / renderListFilterInstance 전파
components/fields/abstract/OptionalField.tsx                   — 자체 override 가 있으면 전파 (대부분 ListableFormField 재사용)
components/fields/abstract/CheckButtonValidationField.tsx      — renderCheckButtonValidationField 전파
components/fields/abstract/AbstractManyToOneField.tsx          — 특유 render 메소드들 전파
components/fields/abstract/AbstractDateField.tsx               — 특유 render 메소드들 전파

components/fields/*.tsx (33+)  — concrete 서브클래스. **default = any 로 전부 무수정** (검증만)

components/form/FieldRenderer.tsx                              — 파라미터 객체 생성 시 FieldRenderParameters<any, any> 유지 (무수정)
components/form/ViewEntityForm.tsx                             — 직접 참조 없음 (무수정)

components/helper/FieldRendererHelper.tsx                      — getInputRendererParameters 제네릭 함수화 (1 함수)
components/fields/rule/RuleFieldRenderer.tsx                   — FieldRenderParameters<any, any> 로 유지 (단순화 — 전파 안 함)
components/revision/RevisionField.tsx                          — 2 occurrences. renderInstance 시그니처 그대로 (TForm=any default)

components/list/ui/InlineSubCollectionView.tsx                 — 2 occurrences. 컨테이너 성격. default 유지
components/fields/filter/DatetimeFilter.tsx                    — FilterRenderParameters 참조 1. default 유지
```

**예상 수정 파일 수**: 약 15~20 개 (Task E 와 비슷한 규모).
- 메인 수정 (제네릭 전파 필요): EntityField.ts + FormField.tsx + ListableFormField.tsx + CheckButtonValidationField.tsx + AbstractManyToOneField.tsx + AbstractDateField.tsx + FieldRendererHelper.tsx = **7 파일**
- 검증만 (무수정 확인 필요): concrete 필드 33+ + FieldRenderer + ViewEntityForm + RuleFieldRenderer 등

### 2.10 설계 edge case

1. **overrideRender callable 의 inference**:
   ```ts
   const f = new SlugField('slug', 1);
   // FormField<SlugField, string, Post>
   f.withOverrideRender((params) => {
     //                   ^ params: FieldRenderParameters<Post, string>  ← TS 가 infer
     params.onChange('new-slug');  // ✅
   });
   ```
   TS 가 `this.TForm` / `this.TValue` 를 콜백으로 흘려보내므로 infer 가능. 검증 필요.

2. **EntityField 로 업캐스트된 후 호출**:
   ```ts
   const f: EntityField = entityForm.getField('slug');
   f.overrideRender?.({ entityForm, onChange, ... });
   //  ^ overrideRender: (params: FieldRenderParameters<any, any>) — EntityField 인터페이스 시그니처
   ```
   EntityField 인터페이스 메소드는 **제네릭 파라미터 없음** → default any 로 해석. 호환.

3. **FilterRenderParameters 의 TValue 가 filter 전용인가**:
   ListableFormField.renderListFilterOriginal 에서 FilterRenderParameters 를 FieldRenderParameters 로 re-wrap 하는 패턴 (line 200~208):
   ```ts
   protected renderListFilterOriginal({ onChange, ...params }: FilterRenderParameters) {
     return this.render({
       ...params,
       required: false,
       onChange: (value) => onChange(value),
     } as FieldRenderParameters);
   }
   ```
   승격 후:
   ```ts
   protected renderListFilterOriginal(
     { onChange, ...params }: FilterRenderParameters<TForm, TValue>,
   ) {
     return this.render({
       ...params,
       required: false,
       onChange: (value: TValue) => onChange(value),
     } as FieldRenderParameters<TForm, TValue>);
   }
   ```
   FilterRenderParameters 와 FieldRenderParameters 의 TForm/TValue 는 같은 의미 (같은 필드의 필터/렌더). 일관.

4. **view() 반환 타입 불일치**: EntityField 인터페이스의 `view(params): Promise<ReactNode | null>` 는 `undefined` 를 제외하지만 FormField 구현체는 `Promise<ReactNode | null | undefined>` 반환. Task E 에서 이미 존재하던 불일치 (#71 설계 보정 #1 참고). Task F 에서 **추가 건드리지 않음** — 기존 불일치 유지 (별도 Task 로 분리).

---

## 3. 기본값 `= any` 의미 (Backward-compat 계약)

### 3.1 소비자 무수정 호환 매트릭스

| 소비자 패턴 | 컴파일 가능? | 추천 조치 |
|---|---|---|
| `class MyField extends FormField<MyField>` + `renderInstance(params: FieldRenderParameters)` | ✅ (TForm=TValue=any) | 유지 OK. 점진 승격 옵션 존재 |
| `class MyField extends FormField<MyField, string, User>` + `renderInstance(params: FieldRenderParameters)` | ✅ | **narrowing 기회** — `renderInstance(params: FieldRenderParameters<User, string>)` 로 승격 권장 |
| `class MyField extends FormField<MyField, string, User>` + `renderInstance(params: FieldRenderParameters<User, string>)` | ✅ + narrow | 최적. params.onChange 가 `(value: string) => void` 로 narrow |
| `field.withOverrideRender((params) => ...)` bare callback | ✅ | TS 가 field 의 TForm/TValue infer |
| `const params: FieldRenderParameters = { entityForm, onChange: (v) => ..., ... }` (소비자가 직접 생성) | ✅ | `FieldRenderParameters<any, any>` 로 해석 |
| `form.getField('x')?.overrideRender?.(params)` | ✅ | EntityField.overrideRender 는 제네릭 인자 없이 호출. `FieldRenderParameters<any, any>` |
| `f.isRequired({ entityForm })` | ✅ | `FieldInfoParameters<any>` |
| `declare const r: FilterRenderParameters` (bare) | ✅ | `FilterRenderParameters<any, any>` |

### 3.2 잠재 Breaking 포인트

Task E 설계 (#70 § 3.2) 와 동일 관찰:

1. **타입 레벨 추론 경로 변화**: `Map<string, FieldRenderParameters>` 는 `Map<string, FieldRenderParameters<any, any>>` 로 해석. 호환.
2. **`interface X extends FieldRenderParameters {}`**: 소비자 인터페이스 확장 패턴. default 경로 → 호환. 실측 권장.
3. **Conditional/mapped types** 에서 bare generic 사용 시 인퍼런스 예상 밖 고정 가능성 — Task E 에서 관찰 안 됨. Task F 도 동일 가능성, 실측 필요.
4. **EntityField 인터페이스 호환**: EntityField 의 `view / overrideRender / isRequired` 등 메소드는 `FieldRenderParameters` (제네릭 인자 없음) 를 쓰므로 `FieldRenderParameters<any, any>` 해석. `FormField<TSelf, TValue, TForm>` 이 `FieldRenderParameters<TForm, TValue>` 시그니처로 구현해도 **구조적 호환** (covariance — narrow 구현은 wide 인터페이스 호환).
   - **검증 필요**: TS 가 structural sub-typing 으로 FormField.view 를 EntityField.view 의 구현으로 인정하는지. 이론상 OK, 실측 필수.

### 3.3 gjcu 호스트 영향 측정 (이 세션 수집)

실제 grep 기반 추정:

- **13 개소 `renderInstance(...)` 오버라이드** 예상 (gjcu 내 custom FormField 서브클래스 수): 전부 `params: FieldRenderParameters` (default) 형태로 선언되어 있을 가능성 높음. default 경로로 **무수정 호환 예상**.
- **1 개소 `withOverrideRender(...)` 사용** (gjcu 관례): callback 내부 infer 로 narrow 가능성 — TS 가 FormField 인스턴스의 TForm/TValue 를 흘려보낸다면 narrow, 아니면 any. 실측 필요.
- **0 개소 `FieldRenderParameters` import 직접** 예상: 대부분 FormField 서브클래스 내부에서 사용되므로 import 는 abstract 에서 이루어짐. 소비자는 파라미터 타입을 **생략** (재선언 안 함). default 경로 호환.
- **0 개소 `FilterRenderParameters` / `FieldInfoParameters` import 직접** 예상: 동일 이유.

**결론**: gjcu 는 **타입 에러 0 건 예상**. Task E 에서 실측 760 이었지만 그중 Task E 제네릭 자체 문제는 0 건, 나머지는 export 누락 / 상대경로 swap 미완. Task F 도 동일 패턴 예상 — **제네릭 자체로는 회귀 0**, 단 alpha.47 에서 이미 공개 API export 가 보완되어 있으므로 추가 export 누락 이슈는 **없을** 것으로 예상.

**검증**: 구현 후 gjcu-academic-front `apps/admin` type-check 재실측. alpha.48 overlay → error diff (baseline alpha.47 vs candidate alpha.48, 고유 위치 기준) 측정.

---

## 4. Any 감축 예상

### 4.1 승격 가능 (generic 으로 치환)

| 위치 | 현재 | 승격 후 | 예상 감축 |
|---|---|---|---|
| `FieldRenderParameters.entityForm: EntityForm` | 1 | `EntityForm<T>` | 1 (간접 — T=any default 유지) |
| `FieldRenderParameters.onChange: (value: any, ...) => void` | 1 | `(value: TValue, ...) => void` | 1 |
| `FieldRenderParameters.updateEntityForm 의 updater: (EntityForm) => Promise<EntityForm>` | 2 | `EntityForm<T>` 전파 | 2 |
| `FilterRenderParameters.onChange: (value: any, op?) => void` | 1 | `(value: TValue, op?) => void` | 1 |
| `FilterRenderParameters.value?: Promise<any>` | 1 | `Promise<TValue>` | 1 |
| `FormField.renderInstance/render/view/overrideRender 내부 any 사용` (params.entityForm 등) | ~8 | TForm/TValue 로 narrow | 5~8 |
| `ListableFormField.renderListFilter 계열 내부 any` | ~4 | TForm/TValue | 3 |
| `CheckButtonValidationField.renderCheckButtonValidationField 내부` | ~2 | TValue | 1 |
| `AbstractManyToOneField / AbstractDateField 특유 render 내부` | ~4 | TForm/TValue | 3 |
| `FieldRendererHelper.getInputRendererParameters` params 내부 any | ~3 | TForm/TValue | 2 |
| `EntityField.isRequired/isHidden/isReadonly/getPlaceHolder 호출부에서 props.entityForm?.getValue any` | ~4 | TForm narrow (호출자 선언한 경우) | 2~4 |

**예상 합계: ~20~30 건** (표면 grep 기준). Task E (9 건 grep 표면) 대비 비슷한 규모. 실질적 narrow (논리적 any) 는 **40~60 건**.

### 4.2 유지 (의도된 any)

- `FieldRenderer.tsx` 의 `field: FormField<any>` — 여러 필드 타입 컨테이너. 유지.
- `FieldRenderer.tsx` 의 `currentValue: any` — dynamic 값. 유지.
- `FieldRenderer.tsx` 의 `handleFieldChange(value: any, ...)` — 커스텀 렌더러용. 유지.
- **UIProvider `ComponentType<any>`** — DECISIONS #21. 유지.
- **dynamic field registry** (`registerSmsHistoryField` 등) — `any`. 유지.
- `FieldRendererHelper.getInputRendererParameters` 의 반환 객체 내 `attributes: Map<string, any>` 유지 (Task G 후보).
- `RuleFieldRenderer` 의 `FieldRenderParameters<any, any>` — 단순화 의도. 유지.
- `ViewListProps.item: any` — list row 는 여전히 any (ListableFormField 스코프 외).

### 4.3 측정 방법

Task E 와 동일: `grep -cE ': any\\b'` 로 표면 측정 + 제네릭 파라미터로 치환된 논리적 any 수동 집계. 현재 base (alpha.47) 기준 **286 any** 에서 **260 전후** 로 감축 목표.

---

## 5. 구현 전략 (세션 2 용)

### 5.1 1 개 에이전트로 충분한 이유

- 변경 파일 ~15~20 개. 논리적 단일 리팩터 (제네릭 전파는 불가분).
- 3 분할 시 중간 상태가 빌드 깨짐 → Task E 와 동일 판정.
- Task E (1 에이전트, phase 1~5, 문제 없이 수렴) 와 복잡도 유사.

### 5.2 구현 순서 권장

**Phase 1 — foundation 인터페이스 제네릭화** (단일 파일, `config/EntityField.ts`):
1. `FieldRenderParameters<T extends object = any, TValue = any>` 추가. `entityForm: EntityForm<T>`, `onChange: (TValue, ...)`, `updateEntityForm` 콜백 `EntityForm<T>` 전파.
2. `FilterRenderParameters<T extends object = any, TValue = any>` 추가. 동일 패턴.
3. `FieldInfoParameters<T extends object = any>` 추가. `entityForm?: EntityForm<T>` 만.
4. `EntityField` 인터페이스 **무수정** (제네릭 기본값 자동 호환). 이 단계에서 type-check 통과 확인.

**Phase 2 — FormField abstract 체인 전파**:
5. `FormField.tsx`:
   - `renderInstance(params: FieldRenderParameters<TForm, TValue>)` 전파
   - `render / view / overrideRender / withOverrideRender` 시그니처 전파
   - `isRequired / isHidden / isReadonly / getPlaceHolder / getTooltip / getHelpText` 에서 `FieldInfoParameters<TForm>` 사용
6. `ListableFormField.tsx`:
   - `renderListFilter / renderListFilterOriginal / renderListFilterInstance` 에 `FilterRenderParameters<TForm, TValue>` 전파
7. `OptionalField.tsx` — 자체 override 있으면 전파 (주로 ListableFormField 재사용)
8. `CheckButtonValidationField.tsx` — `renderCheckButtonValidationField(params: FieldRenderParameters<TForm, TValue>)` 전파
9. `AbstractManyToOneField.tsx` — 특유 render 메소드 전파
10. `AbstractDateField.tsx` — 특유 render 메소드 전파

**Phase 3 — 33+ concrete 필드 서브클래스 검증** (기대: 무수정):
11. `src/listgrid/components/fields/*.tsx` 전체 `renderInstance(params: FieldRenderParameters)` 시그니처 그대로 유지. `FieldRenderParameters<any, any>` 로 해석.
12. `renderListFilterInstance(params: FilterRenderParameters)` 도 동일.
13. type-check 로 무수정 호환 확인. 실패 시 해당 파일 개별 수정 (예상: 0 건).

**Phase 4 — helper / 기타 컴포넌트 전파**:
14. `FieldRendererHelper.tsx`:
   - `getInputRendererParameters<TForm = any, TValue = any>(field: FormField<any, TValue, TForm>, params: FieldRenderParameters<TForm, TValue>)` 제네릭 함수화
   - 호출처는 `this` 의 TForm/TValue 를 TS 가 infer — 무수정 호환
15. `FieldRenderer.tsx`:
   - Props 의 `field: FormField<any>` 유지 (default 경로)
   - viewParams 객체 생성 시 `FieldRenderParameters<any, any>` 해석 — 타입 annotation 명시 생략 가능, 있어도 default
   - 핵심: **무수정** 확인
16. `ViewEntityForm.tsx`:
   - FieldRenderParameters 직접 참조 없음 — 무수정
17. `RuleFieldRenderer.tsx`:
   - `FieldRenderParameters<any, any>` 유지 (단순화 의도) — 무수정

**Phase 5 — 검증**:
18. `npm run type-check` — 라이브러리 자체 PASS.
19. `npm test` — 900+ tests 유지. (UI 층 제네릭 변경이 로직에 영향 없어야 함)
20. `npm run lint`, `format:check`, `build` PASS.
21. gjcu 호스트 overlay → type-check. alpha.47 baseline 대비 **고유 위치 diff 0** 확인.
22. 정식 배포 alpha.48.

### 5.3 위험 / 완화

| 위험 | 완화 |
|---|---|
| `FormField.view(params: FieldRenderParameters<TForm, TValue>)` 가 `EntityField.view(params: FieldRenderParameters)` 구현으로 인정 안 됨 (structural sub-typing 실패) | TS 의 parameter variance 는 bivariant (method signature). `FieldRenderParameters<TForm, TValue>` 는 `FieldRenderParameters<any, any>` 와 동일 (TForm=any 일 때). 이론상 OK. 실측 필수. 만약 오류 발생 시 EntityField 인터페이스의 시그니처를 `FieldRenderParameters<any, any>` 로 명시 (타입 레벨 호환 완성) |
| overrideRender 콜백의 inference 실패 (TForm/TValue 가 흘러가지 않음) | `withOverrideRender(fn: (params: FieldRenderParameters<TForm, TValue>) => ...)` 로 명시적 제네릭 전파. FormField instance method 이므로 `this.TForm` / `this.TValue` 자동. 실측 확인 |
| 33+ concrete 필드 중 일부가 `params.` 속성을 narrow 한 타입에 맞지 않는 값으로 호출 (예: StringField 에서 `params.onChange(123)` — default any 경로에서는 통과하지만 narrow 시 실패) | FormField<StringField> (TSelf 만 명시, TValue=any) 의 경우 `renderInstance(params: FieldRenderParameters<any, any>)` 해석. `onChange: (value: any, ...) => void` — 123 도 통과. **무수정 호환 유지** |
| FilterRenderParameters ↔ FieldRenderParameters 교차 캐스트 (ListableFormField.renderListFilterOriginal line 200~208) 에서 TForm/TValue 비일치 | FilterRenderParameters 와 FieldRenderParameters 가 같은 `<TForm, TValue>` 계열이므로 `{ ...params, onChange: (v: TValue) => onChange(v) } as FieldRenderParameters<TForm, TValue>` 로 명시 캐스트. Task E 에서도 유사 패턴 (exactOpt 호환 캐스트) 해결 경험 있음 |
| gjcu 호스트에서 `renderInstance(params: FieldRenderParameters)` 가 default 경로로 해석되지만 TS 버전 차이로 추론 실패 | gjcu 의 TS 버전 확인 (peer devDep, typically 5.0+). Task E 실측 시 이미 통과했으므로 Task F 도 OK 예상 |
| `FieldRendererHelper.getInputRendererParameters` 를 제네릭 함수화 후 호출처 `getInputRendererParameters(this, params)` 의 `this` 가 FormField<any> 로 widened 해석 → TValue/TForm 안 흘러감 | 호출처에서 `this` 대신 `this as FormField<TSelf, TValue, TForm>` 캐스트 필요할 수 있음. 실측 후 결정. 최악의 경우 제네릭 함수화를 **취소** 하고 단순 any 파라미터 유지 (의도된 any) |

---

## 6. Breaking Change 판정

### 6.1 타입 레벨
- `FieldRenderParameters` / `FilterRenderParameters` / `FieldInfoParameters` 3 인터페이스에 제네릭 파라미터 **뒤에** 추가. 기본값 `= any` 로 bare 사용 호환.
- `FormField.renderInstance / render / view / overrideRender` 시그니처가 `FieldRenderParameters<TForm, TValue>` 로 변경되었으나 TForm=TValue=any default 로 기존과 동일 해석. **Soft-compat**.
- 33+ concrete 필드 서브클래스는 `renderInstance(params: FieldRenderParameters)` 선언 그대로 유지. default 해석으로 override 유효성 판정.
- EntityField 인터페이스는 **무수정**. EntityField 의 메소드에서 사용하는 `FieldRenderParameters` 는 제네릭 인자 없이 `FieldRenderParameters<any, any>` 로 해석.

### 6.2 런타임
- 변경 0. 타입 annotation only. 함수 body / 객체 리터럴 구조 무변경.

### 6.3 배포 권고
- **alpha.48** (minor) 로 충분. v0.2.0 major bump 불필요.
- 대안: Task F 완료 + attributes Map 승격 (Task G 후보) 묶음을 v0.2.0 major bump 로 박제 가능. 다만 현재 Task F 만으로는 소비자 무수정 호환이므로 minor 가 자연.
- **최종 결정은 구현 후 gjcu 빌드 결과 관찰 후** (Task E 와 동일 루프, #72 패턴).

---

## 7. 소비자 마이그레이션 가이드 초안 (README 추가용)

### 7.1 무수정 사용 (Default)

```ts
// v0.3 / Task E 스타일 — 그대로 동작
class SlugField extends FormField<SlugField, string, Post> {
  protected createInstance(n: string, o: number) { return new SlugField(n, o); }

  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    //                                    ^ FieldRenderParameters<any, any> 로 해석
    //                                    params.entityForm: EntityForm<any>
    //                                    params.onChange: (value: any) => void
    ...
  }
}
```

### 7.2 점진 승격 (Opt-in, 권장)

```ts
// Task F 스타일 — params 까지 narrow
class SlugField extends FormField<SlugField, string, Post> {
  protected createInstance(n: string, o: number) { return new SlugField(n, o); }

  protected renderInstance(
    params: FieldRenderParameters<Post, string>,  // ← 명시
  ): Promise<React.ReactNode | null> {
    // params.entityForm: EntityForm<Post>
    // params.onChange: (value: string) => void
    // params.updateEntityForm?: (updater: (EntityForm<Post>) => Promise<EntityForm<Post>>) => Promise<void>

    const title = await params.entityForm.getValue('title'); // Promise<Post['title']>
    params.onChange(`slug-${title}`);  // ✅
    params.onChange(42);               // ❌ 컴파일 에러
    ...
  }
}
```

### 7.3 커스텀 Filter / Info 메소드 승격

```ts
class DateRangeField extends ListableFormField<DateRangeField, [Date, Date], Booking> {
  protected async renderListFilterInstance(
    params: FilterRenderParameters<Booking, [Date, Date]>,
  ): Promise<React.ReactNode | null> {
    // params.entityForm: EntityForm<Booking>
    // params.onChange: (value: [Date, Date], op?: QueryConditionType) => void
    ...
  }

  async isRequired(props: FieldInfoParameters<Booking>): Promise<boolean> {
    // props.entityForm?: EntityForm<Booking> | undefined
    const status = await props.entityForm?.getValue('status');
    return status === 'confirmed';
  }
}
```

### 7.4 overrideRender 콜백은 자동 infer

```ts
const f = new SlugField('slug', 1);  // FormField<SlugField, string, Post>
f.withOverrideRender((params) => {
  //                   ^ params: FieldRenderParameters<Post, string>  ← TS 가 infer
  params.onChange('new-slug');  // ✅
  return undefined;
});
```

---

## 8. 스코프 외 (Task G 또는 그 이후)

- `parse()` → `unknown` 전환 — 런타임 검증 (zod 등) 도구와 결합 시 의미. 독립 진행 가능. **Task G 유력 후보**.
- `attributes: Map<string, any>` → `Map<string, unknown>` — breaking. v0.2.0 major bump 시 후보.
- **FieldRenderer React 컴포넌트 자체의 제네릭화** — 이번 설계에서 **명시적으로 제외** (§ 2.7 근거). JSX 제네릭 컴포넌트 문법 / 범용 컨테이너 / Next.js RSC 제약. 향후 필요 시 별도 Task.
- **EntityField 인터페이스의 `view` 반환타입 불일치 해소** (`Promise<ReactNode | null>` vs 구현체 `Promise<ReactNode | null | undefined>`) — Task E #71 에서 보정한 패턴과 동일. 별도 micro-task 로 처리 가능.
- **ViewRenderProps / ViewRenderResult / ViewValueProps / ViewValueResult** 제네릭화 — 현재 `item: any`. List/Card SubCollection 쪽 영향이 커서 별도 Task.
- **ViewListProps / ViewListResult** (ListableFormField 리스트 렌더링) 제네릭화 — 동일 이유로 별도 Task.
- **UIProvider `ComponentType<any>` wrapper** — 유지 (DECISIONS #21).
- **dynamic field registry** (`registerSmsHistoryField` 등) — 유지 (열린 집합).

---

## 9. 세션 2 프롬프트 초안 (에이전트 1 개)

```
@rcm/listgrid v0.3 Task F 구현 — FieldRenderParameters<T, TValue> / FilterRenderParameters<T, TValue> / FieldInfoParameters<T>.

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**설계 문서**: docs/FIELD_RENDERER_GENERIC_DESIGN.md (먼저 끝까지 읽기. Phase 1~5 순서 엄수)
**기준 commit**: 4854afa (Task E 세션 1 완료 meta — 실제 구현 후 가장 최신 alpha.47 base)
**참고**: docs/GENERIC_DESIGN.md (Task E 설계 — 동일 구조 템플릿)

**작업 범위 (파일 ~15~20 개)**:
- Phase 1: config/EntityField.ts 의 3 인터페이스 (FieldRenderParameters / FilterRenderParameters / FieldInfoParameters) 제네릭화 <T extends object = any, TValue = any>
- Phase 2: FormField 체인 6 abstract (FormField / ListableFormField / OptionalField / MultipleOptionalField / CheckButtonValidationField / AbstractManyToOneField / AbstractDateField) 의 render / filter / info 메소드 시그니처 전파 (TForm, TValue)
- Phase 3: 33+ concrete 필드 서브클래스 무수정 호환 검증 (기대: 0 수정)
- Phase 4: helper (FieldRendererHelper.getInputRendererParameters) 제네릭 함수화. FieldRenderer / ViewEntityForm / RuleFieldRenderer 무수정 확인
- Phase 5: 검증 (type-check + test + lint + format + build) + gjcu overlay 실측

**규칙**:
- 모든 제네릭 기본값 `= any` 로 backward-compat 유지. 33+ concrete 필드 서브클래스 무수정 필수
- FieldRenderer React 컴포넌트 자체는 **제네릭화 하지 않음** (설계 § 2.7). Props field: FormField<any> 유지. 파라미터 객체는 내부에서 FieldRenderParameters<any, any> 로 해석
- EntityField 인터페이스는 무수정 (default 자동 호환)
- overrideRender / withOverrideRender 콜백의 TForm/TValue inference 검증 필수 — 실패 시 명시 제네릭 전파 또는 캐스트
- 구현 중 설계 미스 발견 시 FIELD_RENDERER_GENERIC_DESIGN.md 의 해당 섹션 수정 + 이유 기록 후 진행

**검증**:
- npm run type-check PASS (라이브러리)
- npm test 900+ tests PASS (회귀 0)
- npm run lint 0 errors
- npm run format:check PASS
- npm run build PASS
- any 측정: 286 → 목표 260 전후 (최소 270 이하)
- gjcu overlay: alpha.47 baseline vs alpha.48 candidate 고유 위치 diff = 0 (Task E 실측 패턴, DECISIONS #72)

**반환 포맷**:
## Task F 구현 완료

### 수정 파일 목록 (카테고리별)
- Phase 1 foundation (EntityField.ts): ...
- Phase 2 FormField chain (6 abstracts): ...
- Phase 3 concrete 필드 무수정 확인: ...
- Phase 4 helper / 컴포넌트: ...

### 수치
- any before / after: 286 → N
- 테스트: 900 → N passing
- 빌드: PASS/FAIL
- gjcu overlay 고유 위치 diff: N

### API 변경 (소비자 영향)
- breaking: (있으면 나열)
- non-breaking: (default any 로 호환되는 것)

### 설계와 달라진 점
- (있으면)
```

---

## 10. 체크리스트 (세션 2 착수 전)

- [ ] 이 문서 전체 읽기
- [ ] docs/GENERIC_DESIGN.md (Task E 설계) 11 섹션 재참조 (같은 템플릿, 비슷한 패턴)
- [ ] STATUS.md 의 현재 상태 (alpha.47 배포 완료, gjcu 호스트 0 errors) 확인
- [ ] DECISIONS #70 / #71 / #72 (Task E 설계 / 구현 / 실측) 를 참고해 동일한 루프 (build → overlay → diff → 배포) 재활용
- [ ] gjcu 호스트 worktree 가 alpha.47 설치 상태인지 확인 (구현 후 overlay 로 회귀 검증 대비)
- [ ] `npm test` / `npm run type-check` 현 상태 그린인지 사전 확인
- [ ] 설계 변경 필요 시 이 문서 수정 → commit 분리 → 구현

---

## 11. 메모

- 이 문서는 **v0.3 Task F 세션 1 산출물**. 구현은 후속 세션.
- 설계 변경은 이 문서를 직접 수정 + DECISIONS #73 에 변경 이력 추가.
- Task E 와의 관계:
  - Task E 로 `EntityForm<T>` / `FormField<TSelf, TValue, TForm>` / `FieldValue<TValue>` config 층 제네릭화 완료
  - Task F 는 이 위에 "render 시점 전파" 를 이어 붙임 — UI 층 3 인터페이스 + abstract 6 + helper 1
  - **논리적 후속 관계**: Task E 의 TValue/TForm 이 Task F 의 render 파라미터에서 활성화 — Task E 없이는 narrow 의미 없음
- **FieldRenderer 컴포넌트 자체의 제네릭화를 포함하지 않은 이유** (설계 § 2.7 요약):
  1. JSX `<FieldRenderer<T, V> />` 문법 부담
  2. 범용 컨테이너 (여러 필드 타입 섞임)
  3. 파라미터 객체는 FieldRenderer 내부에서 조립 → narrow 불가
  4. **narrowing 책임은 필드 서브클래스의 renderInstance 에** — 이게 natural fit
- **Task G 후보 (순서 권장)**:
  1. `parse()` → `unknown` 전환 (zod 등 결합 시 의미)
  2. `attributes: Map<string, any>` → `Map<string, unknown>` (v0.2.0 major bump)
  3. ViewRenderProps / ViewListProps 제네릭화 (별도 Task)
