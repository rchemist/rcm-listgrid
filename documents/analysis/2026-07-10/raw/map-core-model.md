> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도: 도메인 모델 (config/: EntityForm·EntityField·ListGrid)

대상: `src/listgrid/config/**` (EntityForm.tsx, form/EntityFormBase.tsx 외 4개 mixin 계층, Config.ts, EntityField.ts, ListGrid.ts, EntityTab.ts, EntityFieldGroup.ts, RuntimeConfig.ts, SubCollectionField 4종)

---

## 1. 한 줄 요약

이 서브시스템은 "선언적 엔티티 메타데이터" 처럼 보이지만 실제로는 **렌더링 책임을 내부에 품은 클래스 계층**이다. `EntityField` 인터페이스 자체에 `view(): Promise<ReactNode>` 가 있고, `SubCollectionField`(및 3개 변형)는 `render()` 메소드에서 JSX를 직접 리턴한다. 즉 "config가 순수 메타데이터"라는 전제가 틀렸다 — config 클래스는 데이터 홀더이자 React 컴포넌트 팩토리를 겸한다. `EntityForm`은 5단계 상속(`EntityFormBase → EntityFormValidation → EntityFormData → EntityFormActions → EntityFormExtensions → EntityForm`)으로 852+570+245+152+172+301(EntityForm 자체 1074L 포함) 줄을 파일 단위로만 쪼갠 "한 몸 클래스"이며, `clone()`에는 실제 얕은복사 버그가 있다. `SubCollectionField`의 3개 변형(Card/Table/Inline)은 거의 100% 동일한 로직을 3번 복붙했다. `isPermitted()`/`withRequiredPermissions()` 권한 로직은 EntityTab/EntityFieldGroup/FormField에 글자 하나 안 틀리고 3중 복붙되어 있다. `madge --circular`로 실측하면 config↔components 사이에 **213개의 순환 의존성**이 존재한다.

---

## 2. 클래스 계층 구조 — "5단 상속"은 파일 분할일 뿐, 실제로는 단일 God Object

`EntityForm`은 다음 체인으로 정의된다:

```
EntityFormBase<T>       (form/EntityFormBase.tsx, 852L)  — 상태 필드 + getter/setter, abstract initialize()/clone()
  └─ EntityFormValidation<T>  (form/EntityFormValidation.tsx, 152L) — 에러맵, manageEntityForm(권한) 토글
       └─ EntityFormData<T>       (form/EntityFormData.tsx, 245L) — setValue/changeValue/isDirty/copyEntityFormToInnerFields
            └─ EntityFormActions<T>    (form/EntityFormActions.tsx, 570L) — addFields, getListFields, dataTransferConfig
                 └─ EntityFormExtensions<T> (form/EntityFormExtensions.tsx, 172L) — Client Extension 등록/실행
                      └─ EntityForm<T>       (EntityForm.tsx, 1074L) — clone/initialize/save/validate/delete
```
(`form/EntityFormExtensions.tsx:12` `extends EntityFormActions<T>`, `form/EntityFormActions.tsx:34` `extends EntityFormData<T>`, `form/EntityFormData.tsx:18` `extends EntityFormValidation<T>`, `form/EntityFormValidation.tsx:7` `extends EntityFormBase<T>`)

**이건 모듈화가 아니다.** 6개 파일 모두 `this.fields`, `this.tabs`, `this.collections` 등 동일한 인스턴스 상태를 직접 mutate 하는 하나의 클래스일 뿐이며, 컴파일되면 여전히 하나의 2,700줄+ 짜리 인스턴스다. TypeScript의 파일 경계가 곧 책임 경계인 것처럼 보이지만, 실제로는 캡슐화가 전혀 없다 — 6개 파일 모두 `this.fields.set(...)` 을 직접 호출하고 서로의 private 여부도 구분이 안 된다(`EntityFormActions.getDataFieldsFromFields`가 `private`인데도 `this instanceof EntityForm` 체크로 우회, `form/EntityFormActions.tsx:459-464`).

또한 base 클래스(`EntityFormBase`, 심지어 `EntityFormActions`)가 정작 자신의 최종 서브클래스인 `EntityForm`을 `instanceof` 로 되짚어 체크하는 코드가 반복된다:
- `form/EntityFormBase.tsx:482` `if (fieldGroup && this instanceof EntityForm) {`
- `form/EntityFormBase.tsx:558` `if (this instanceof EntityForm) {`
- `form/EntityFormBase.tsx:605` `if (this instanceof EntityForm) {`
- `form/EntityFormBase.tsx:665` `if (field && this instanceof EntityForm) {`
- `form/EntityFormActions.tsx:460` `if (!(this instanceof EntityForm))  throw new Error(...)`
- `EntityForm.tsx:434,450,496` 등 (`if (!(this instanceof EntityForm)) throw ...`)

`EntityFormBase`는 추상 클래스이고 `EntityForm` 외의 구현체가 리포 안에 하나도 없다(`grep -rn "extends EntityFormExtensions" src` → `EntityForm.tsx` 단 1건). 즉 이 방어 코드는 "언젠가 다른 서브클래스가 생길 수 있다"는 가정 하의 죽은 코드이며, 실질적으로는 base 클래스가 abstract method로 처리했어야 할 로직을 `instanceof` 분기로 흉내낸 것이다 — 상속 설계가 실패했다는 신호.

**판정**: 이 5단 상속은 "리팩토링을 파일 분리로 눈속임한" 전형적 패턴이다. 실제 응집도 있는 서비스 분리(FormValidationService, FormDataService 등을 EntityForm이 컴포지션으로 소유)로 다시 설계해야 실질적 단일 책임을 얻는다.

---

## 3. `EntityForm.tsx` — 왜 `.tsx`인데 JSX가 없는가

파일 전체(1074줄)를 읽었지만 **JSX 리턴문이 단 하나도 없다** (`grep -n "return <\|JSX\|<div\|<>" EntityForm.tsx` → 0 matches). `.tsx` 확장자가 붙은 이유는 아마 과거 리팩토링 잔재이거나, import 하는 타입들이 `ReactNode`를 참조하기 때문일 것으로 추정된다 — 즉 확장자 자체가 이 파일의 실제 책임(HTTP CRUD, 검증, submit 데이터 조립)을 오도한다.

다만 렌더링 "책임"은 없어도 렌더링 "제약"은 새어 들어온다. `fetchData()`가 React Hook을 클래스 메소드 내부에서 직접 호출한다:

```ts
// EntityForm.tsx:608-623
public async fetchData(fetchUrl: string = this.getFetchUrl()): Promise<ResponseData> {
  if (this.overrideFetchData !== undefined) {
    return this.overrideFetchData(fetchUrl, this);
  }

  if (this.isSessionRequired()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = useSession();
    ...
```

`// eslint-disable-next-line react-hooks/rules-of-hooks` 주석이 이미 "규칙 위반임을 알고 억지로 통과시킨다"는 자백이다. `useSession()`은 React 컴포넌트 함수 본문이나 커스텀 훅에서만 호출되어야 하는데, 여기서는 **일반 클래스의 async 메소드** 안에서 호출된다. 이게 실제로 크래시 없이 동작하는 이유는 `useSession`이 (다른 서브시스템 보고서 대상이겠지만) 진짜 `useContext` 훅이 아니라 모듈 전역 변수를 읽는 위장 훅이기 때문일 가능성이 높다 — 만약 실제 React Context 기반이라면 이 코드는 "Rendered more hooks than during the previous render" 류의 크래시를 일으킨다. 어느 쪽이든 "config 클래스가 React 훅 규칙에 종속되어 있다"는 결합 자체가 config/UI 분리 실패의 직접 증거다.

**severity: high** — 규칙 위반이 명시적으로 억제된 코드이며, `sessionRequired: true`로 설정된 EntityForm에서 fetchData가 컴포넌트 렌더 트리 바깥 컨텍스트(예: 이벤트 핸들러, Promise.then 콜백, batch 작업)에서 호출될 경우 훅 규칙 위반으로 실제 크래시 가능성이 있다.

---

## 4. `EntityField` 인터페이스 — config의 핵심 계약에 렌더링이 박혀 있다

`EntityField.ts:60` :

```ts
view(params: FieldRenderParameters): Promise<ReactNode | null>;
```

이건 사족이 아니라 **인터페이스의 필수 멤버**다. "모든 EntityField는 render 메소드를 이용해 화면에 표시된다"는 주석(`EntityField.ts:11`)이 이를 명시적으로 인정한다. 즉 필드 메타데이터를 정의하는 시점에 이미 "이 필드가 스스로를 어떻게 그릴지"까지 계약에 포함된다 — Config(무엇을 보여줄지)와 View(어떻게 그릴지)를 아키텍처 차원에서 분리하지 않겠다는 설계 의도가 명확하다. 상용 프레임워크로 확장하려면 이 인터페이스부터 손대야 하는데, 이는 곧 모든 FormField 구현체(수십 개)의 관계된 파일을 전부 건드리는 breaking change다.

`Config.ts` 자체도 641줄짜리 "God config 파일"인데, 타입 정의뿐 아니라 React 관련 로직까지 섞여 있다:

```ts
// Config.ts:1
import React, { ReactNode } from 'react';
...
// Config.ts:177-183
if (
  typeof condition === 'string' ||
  typeof condition === 'number' ||
  React.isValidElement(condition)
) {
  return condition;
}
```

`getConditionalReactNode`, `getConditionalBoolean`, `getConditionalString` 세 함수(Config.ts:108-197)는 "값이 함수/객체/원시값 중 어떤 형태인지 런타임에 타입가드로 구분"하는 로직으로, 이런 다형적 조건부 표현(`ConditionalReactNodeValue = ReactNode | OptionalReactNode | ValuedReactNode`)은 코드 상단 주석(Config.ts:175 `// 이 부분이 질문 / condition 이 ReactNode 타입인걸 어떻게 확인할 수 있어?`)에서 원작자 스스로도 확신이 없었다고 고백한다. API로서는 유연하지만, 세 가지 다른 타입(`boolean`, `{onCreate,onUpdate}`, `(props)=>Promise<boolean>`)을 한 필드에 다 허용하는 것은 타입 안전성을 떨어뜨리고 사용자가 "이 필드에 뭘 넣어야 하는지" 매번 문서를 봐야 하게 만든다.

---

## 5. `clone()` 의 실제 버그 — 얕은 복사가 새는 지점

`EntityForm.clone()`은 "불변성 있는 copy-on-write" 패턴을 표방한다. 생성자 주석부터가 그렇다:

```ts
// form/EntityFormBase.tsx:36
// 깊은 복사로 할당하여 원본이 변경되지 않도록 함
this.manageEntityForm = { ...MANAGE_ENTITY_ALL };
```

`fields`, `tabs`, `collections`, `clientExtensions`, `fieldValidationStates`, `attributes` 등은 `cloneWithEntityForm()`에서 전부 `new Map(...)` 또는 개별 `.clone()` 호출로 제대로 복제된다(`EntityForm.tsx:55-91`). 그런데 딱 하나, **`manageEntityForm`만 참조를 그대로 옮긴다**:

```ts
// EntityForm.tsx:51
entityForm.manageEntityForm = this.manageEntityForm;
```

`{...this.manageEntityForm}`이 아니라 원본 객체 참조 그대로다. 이후 `withCreatable()`/`withUpdatable()`/`withDeletable()`은 스프레드 없이 **직접 mutate** 한다:

```ts
// form/EntityFormValidation.tsx:126-129
withCreatable(creatable: boolean = true): this {
  this.manageEntityForm.create = creatable;
  return this;
}
```

결과: `formA.clone()` 으로 만든 `formB`는 `formA`와 **같은 `manageEntityForm` 객체를 공유**한다. `formB.withUpdatable(false)`를 호출하면 `formA.manageEntityForm.update`도 같이 `false`가 된다 — 원본이 절대 안 바뀐다고 믿고 clone을 쓰는 모든 호출부(`EntityForm.tsx:163` `let entityForm = this.clone(true);`, `EntityForm.tsx:650` `let form = this.clone(true) as EntityForm<T>;`, `ListGrid.ts:23` `this.entityForm = entityForm.clone(true);`)가 잠재적으로 이 aliasing에 노출된다. `ListGrid`가 생성자에서 매번 `entityForm.clone(true)`를 하는 이유가 바로 "원본 EntityForm 설정을 건드리지 않기 위해서"인데, `manageEntityForm`만은 이 보장이 깨진다.

실제 트리거 시나리오: 호스트 앱이 상태에 따라 동적으로 버튼 노출을 바꾸려고 `entityForm.clone(true).withUpdatable(canEdit)` 패턴을 쓰면(문서화된 관용구), `canEdit=false`인 요청 하나가 전역 싱글턴처럼 캐시된 원본 EntityForm 인스턴스의 `manageEntityForm.update`를 영구히 `false`로 오염시킬 수 있다. 이후 그 원본에서 파생되는 모든 clone이 "수정 불가"로 보이는 재현하기 까다로운 버그가 된다.

**severity: critical** — 불변성이 계약(comment로 명시)인데 실제로 깨져 있고, aliasing bug는 재현이 산발적이라 QA로 잡기 어렵다. 수정은 간단하다(`entityForm.manageEntityForm = { ...this.manageEntityForm };`)지만, 지금 상태로 커머셜 라이브러리에 포함하면 사용자가 원인 모를 "권한이 갑자기 바뀐다" 버그 리포트를 낼 소지가 크다.

---

## 6. SubCollectionField 4종 — 복붙 중복의 교과서 사례

`SubCollectionField`(기반 클래스, `SubCollectionField.tsx`)는 그 자체로 `render()`에서 `<ViewListGrid>`를 리턴하는 "리스트형" 변형이다. 여기서 `CardSubCollectionField`, `TableSubCollectionField`, `InlineSubCollectionField` 세 개가 상속하는데, 세 파일을 비교하면 다음 블록이 **거의 글자 그대로** 반복된다:

### 6-1. `buildSearchForm()` — 3개 파일에 동일 로직 3회

- `CardSubCollectionField.tsx:216-252`
- `TableSubCollectionField.tsx:140-169`
- `InlineSubCollectionField.tsx:289-325`

세 메소드 모두: `searchForm.withPageSize(...)` → `viewDetail` 세팅 → `getMappedByFilter()` 호출 → `fetchOptions.filters`가 있으면 첫 필터그룹에 mappedBy를 unshift, 없으면 `handleAndFilter` — **로직이 100% 동일**하고 변수명까지 같다. 세 곳 다 다음 6줄이 판박이다:

```ts
if (this.fetchOptions?.filters) {
  const additionalFilters = await this.fetchOptions.filters(parentEntityForm);
  if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
    const hasMappedByFilter = additionalFilters[0]!.items.some(
      (item: FilterItem) => item.name === mappedByFilter.name,
    );
    if (!hasMappedByFilter) {
      additionalFilters[0]!.items.unshift(mappedByFilter);
    }
```

### 6-2. 생성자의 `fetchOptions` 기본값 병합 패턴 — 2회 (Card/Table 완전 동일, Inline 변형)

- `CardSubCollectionField.tsx:139-148`
- `TableSubCollectionField.tsx:77-85`

```ts
const defaultFetchOptions: CardSubCollectionFetchOptions = {
  useSearchForm: true,
  viewDetail: true,
  pageSize: 10000,
};
this.fetchOptions = props.fetchOptions
  ? { ...defaultFetchOptions, ...props.fetchOptions }
  : defaultFetchOptions;
```

### 6-3. `withTooltip`/`getTooltip` — 3회 동일

- `CardSubCollectionField.tsx:167-174`, `TableSubCollectionField.tsx:99-106`, `InlineSubCollectionField.tsx:198-205` — 완전히 동일한 5줄짜리 메소드가 base 클래스인 `SubCollectionField`에는 없고(`SubCollectionField.tsx:73-76`은 `withTooltip`이 `console.error('not supported')`만 하는 스텁), 세 서브클래스가 각자 재발명했다.

### 6-4. `render()` 의 `React.Suspense` 래핑 — 3회 동일 구조

- `CardSubCollectionField.tsx:305-315`, `TableSubCollectionField.tsx:213-223`, `InlineSubCollectionField.tsx:378-388` — `fallback`의 클래스명(`rcm-loading-overlay`, `rcm-spinner`)까지 동일한 3중 복붙.

### 6-5. `clone()` 보일러플레이트 — 4회(Base 포함)

각 서브클래스가 생성자 프로퍼티를 전부 나열해 새 인스턴스를 만들고 `cloned.form = this.form; cloned.hideLabel = this.hideLabel; ...`을 반복한다(`CardSubCollectionField.tsx:179-199`, `TableSubCollectionField.tsx:108-128`, `InlineSubCollectionField.tsx:258-284`).

**분석**: `CardSubCollectionField`와 `TableSubCollectionField`는 `cardConfig`/`tableConfig` 프로�터티명과 `import('.../CardSubCollectionView')` vs `import('.../TableSubCollectionView')` 딱 두 곳만 다르고 나머지 300줄 가까이가 동일하다. 공유 가능한 추상 클래스(`FetchableSubCollectionField` 같은)로 `buildSearchForm`, `fetchOptions` 병합, `tooltip`, Suspense 래퍼를 끌어올리고 `renderView(): ComponentType` 같은 추상 메소드 하나만 서브클래스가 구현하게 하면 코드량이 절반 이하로 줄고, 버그 수정 시(예: mappedBy 필터 로직 변경) 한 곳만 고치면 된다.

**severity: high** — 지금 구조로는 `getMappedByFilter` 병합 로직에 버그가 발견되면 4개 파일(Base 포함)을 전부 찾아 고쳐야 하고, 실제로 이미 그런 흔적이 있다(`InlineSubCollectionField.tsx:293`은 `pageSize`를 `this.fetchOptions?.pageSize ?? this.inlinePagination?.pageSize ?? 10`로 이중 fallback 하는데 Card/Table엔 `inlinePagination` 자체가 없어 로직이 미묘하게 갈라져 있다 — 유지보수 중 서서히 벌어지는 drift의 증거).

---

## 7. 권한(permission) 체크 로직 — 3중 복붙, "이상함"의 실체

유지보수자가 "permission handling이 이상하다"고 한 부분을 코드로 확인했다. `isPermitted`/`withRequiredPermissions` 쌍이 **완전히 동일한 구현**으로 3곳에 복붙되어 있다:

- `EntityTab.ts:28-50`
- `EntityFieldGroup.ts:40-62`
- `components/fields/abstract/FormField.tsx:838-860` (852줄 파일이라 이번 스코프 밖이지만 config가 호출하는 대상이라 인용)

세 곳 모두 다음 로직이 토씨 하나 안 다르다:

```ts
isPermitted(userPermissions?: string[]): boolean {
  if (!this.requiredPermissions || this.requiredPermissions.length === 0) {
    return true;
  }
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return this.requiredPermissions.some((permission) => userPermissions.includes(permission));
}
```

`EntityField.ts:113`에는 이게 인터페이스 시그니처로만 선언되어 있어(구현은 FormField), 결국 EntityTab/EntityFieldGroup/FormField 세 클래스 계층(서로 상속 관계 없음)에 독립적으로 구현이 흩어져 있다.

**문제점**:
1. **의미 모델이 얕다** — "OR 매칭"(하나라도 있으면 통과) 한 가지만 지원한다. AND(전부 있어야 함), NOT(제외), role hierarchy(admin이 하위 role 자동 포함) 같은 실무에서 흔한 요구가 전혀 없다.
2. **권한 소스가 하드코딩된 접근 경로 3개** — `EntityForm.tsx:910` `this.session?.roles ?? this.session?.authentication?.roles`, `form/EntityFormBase.tsx:357-361`도 동일 패턴 반복. `Session` 객체의 `roles`와 `authentication.roles` 두 위치 중 어디서 권한을 읽을지가 세션 스키마에 따라 갈리는데 이게 라이브러리 전역에 흩뿌려진 매직 경로다 — 세션 스키마가 바뀌면 이 패턴이 나온 모든 곳(최소 5곳 이상)을 찾아 고쳐야 한다.
3. **거버넌스가 없다** — 필드/탭/그룹 세 계층에 독립적으로 권한 체크가 구현되어 있어서, 새 EntityItem 타입(예: 새 SubCollectionField 변형)을 추가할 때 권한 체크를 빼먹어도 컴파일 에러가 안 난다. 실제로 `SubCollectionField`는 `isPermitted`가 아예 없고 `isHidden`/`isReadonly`만 있다(`SubCollectionField.tsx:182-188`) — 권한 필터링이 SubCollection 레벨에는 구현조차 안 되어 있다는 뜻이다. `EntityFormBase.getVisibleCollections`(`form/EntityFormBase.tsx:588-625`)를 보면 collection에 대해서는 `isHidden`만 체크하고 `isPermitted` 호출이 없다 — **탭/필드그룹/필드는 권한 체크가 있는데 SubCollection만 권한 체크가 빠져 있다.** 이는 일관성 없는 보안 경계다.

**severity: high (권한 누락은 medium~high 보안 리스크, 코드 중복은 유지보수 리스크)** — "SubCollection에 requiredPermissions 넣었는데 실제로 숨겨지지 않는다"는 버그가 그대로 재현 가능하다: `SubCollectionField`에 `requiredPermissions` 필드 자체가 없으므로 컴파일 타임에도 막히지 않고, 사용자가 실수로 그런 API가 있다고 착각하고 쓰면 조용히 무시된다.

---

## 8. 순환 의존성 (config ↔ components) — 213건 실측

`npx madge --circular --extensions ts,tsx src/listgrid/config/EntityForm.tsx` 실행 결과 **213개의 순환 의존성**이 검출되었다. 대표 사이클:

```
Config.ts > EntityForm.tsx > ../components/fields/CustomOptionField.tsx > ../components/helper/FieldRendererHelper.tsx > EntityField.ts
../validations/Validation.tsx > Config.ts > EntityForm.tsx (직접 순환, 4번 항목)
Config.ts > EntityForm.tsx > EntityFormMethod.ts > EntityFormTypes.ts > ../components/fields/Preset.tsx > ../components/fields/SelectField.tsx > ../components/fields/SelectFieldRenderer.tsx
```

근본 원인: `Config.ts`가 `EntityForm`을 타입으로 참조하고(`Config.ts:2` `import { EntityForm } from '../config/EntityForm';`), `EntityForm.tsx`는 반대로 필드 구현체(`CustomOptionField`, `PhoneNumberField` 등)를 구체 클래스로 import한다(`EntityForm.tsx:21,27`). 필드 구현체들은 다시 `Config.ts`의 타입을 참조한다. 이 삼각 구조(Config ↔ EntityForm ↔ Fields)가 "config가 계층을 이끈다"기보다는 "모든 게 서로를 알아야 하는 하나의 빅볼오브머드"라는 증거다.

**실질적 영향**: (1) tree-shaking이 사실상 불가능하다 — 필드 하나만 쓰려 해도 순환 그래프 전체가 번들에 딸려온다. (2) 새 프로젝트에 라이브러리를 부분 도입(예: EntityField 타입만 재사용)하려 해도 `EntityForm.tsx` 전체, 나아가 수십 개 필드 구현체까지 끌려온다 — "새 프로젝트가 원래 호스트 아키텍처에 종속된다"는 유지보수자의 불만이 기술적으로 여기서 설명된다. (3) Jest/Vitest 등에서 순환 의존성으로 인한 `undefined` 초기화 순서 버그(ESM 순환 임포트의 고전적 함정) 위험이 상존한다 — 지금까지 터지지 않은 건 번들러/런타임이 우연히 안전한 평가 순서를 만들어 준 것일 뿐, 구조적으로 보장된 안전은 아니다.

**severity: high** — 기능 버그는 아니지만 "재사용 가능한 라이브러리"라는 상품화 목표 자체를 정면으로 가로막는 구조적 문제. 순환을 끊으려면 `EntityField`/`Config`의 타입 전용 정의와, 구체 필드 구현체(`CustomOptionField`, `PhoneNumberField` 등)를 별도 배럴로 분리하고 `EntityForm.tsx`가 구체 클래스를 직접 import하는 부분(현재 SMS 이력/커스텀옵션 자동주입 로직, `EntityForm.tsx:212-253`)을 플러그인/레지스트리 패턴으로 뽑아내야 한다.

---

## 9. 제네릭 (`EntityForm<T>`) 스토리 — 있으나 마나

`EntityForm<T extends object = any>`(EntityForm.tsx:33)로 제네릭이 선언되어 있고 `setFetchedValue<K extends keyof T & string>`(EntityForm.tsx:135), `setValue<K extends keyof T & string>`(EntityFormData.tsx:42) 등 오버로드로 타입 안전한 API 흉내를 낸다. 하지만:

- 기본값이 `any`라서 `new EntityForm('name', '/url')`처럼 타입 인자를 생략하면 즉시 `EntityForm<any>`가 되어 제네릭이 무력화된다. 실제 빌더 체이닝 코드(`Config.test.ts` 등)에서 타입 인자를 명시하는 사례가 드물다.
- `getFields()`, `fields: Map<string, EntityField>` 등 핵심 저장소는 `T`와 무관하게 `EntityField`(런타임 다형 클래스) Map으로 유지된다 — 즉 `T`는 오직 `getValue`/`setValue`의 키 이름 자동완성에만 쓰이고, 필드의 실제 런타임 타입(`StringField`, `NumberField`, ManyToOne 등)은 전혀 제네릭으로 추적되지 않는다. `field.value` 자체가 `FieldValue<TValue = any>`(Config.ts:80)로 `any` 의존이라 `T[K]`와 실제 저장값의 타입이 컴파일러 차원에서 검증되지 않는다.
- `getSubmitFormData()`, `getValues()` 등 핵심 데이터 흐름은 전부 `data: any`(EntityForm.tsx:872, `form/EntityFormBase.tsx:333`)로 선언되어 있다 — 제네릭 `T`가 존재해도 서버로 나가는/서버에서 들어오는 데이터의 실제 타입 검증에는 관여하지 않는다.

**결론**: 제네릭은 "타입이 있어 보이는 장식"에 가깝다. 실질적으로 필드 접근 시 오타를 잡아주는 정도(`getField<K extends keyof T & string>`) 외에는 엔드투엔드 타입 안전성에 기여하는 바가 적다. 상용 라이브러리로 판다면 이 지점이 "TypeScript 완전지원"이라는 마케팅 문구와 실제 타입 안전성 사이의 괴리를 만든다.

**severity: medium**

---

## 10. `RuntimeConfig.ts` — 이 서브시스템에서 보기 드문 좋은 설계

칭찬할 부분: `RuntimeConfig.ts`는 "Stage 8/9 host-coupling detox"라는 주석(RuntimeConfig.ts:1-12)이 붙은 리팩토링 결과물로, 하드코딩된 엔드포인트/권한 predicate를 `configureRuntime()` 레지스트리로 뽑아냈다. `getEndpoint()`/`getPermission()` 접근자, `Partial<T>` 오버라이드 병합(`RuntimeConfig.ts:125-133`), 합리적 기본값(`DEFAULT_PERMISSIONS: () => true` — permissive-by-default) 모두 라이브러리化를 향한 올바른 방향이다. 다만 모듈 스코프의 가변 싱글턴(`let _config`, RuntimeConfig.ts:119)이라 SSR 멀티테넌시 시나리오(Next.js에서 요청마다 다른 host 설정이 필요한 경우)에는 격리가 안 된다는 한계는 있으나, 이건 이 파일만의 문제가 아니라 애초에 "런타임 전역 설정"이라는 패턴 자체의 한계이며 지금 스코프의 다른 문제들에 비하면 경미하다.

---

## 11. 종합 판정 (상품화 관점)

| 항목 | 판정 |
|---|---|
| Builder-pattern API 품질 | 메소드 이름/체이닝 관용구는 일관적이나(`with*` 접두어), `withHidden`처럼 오버로드가 3가지 형태(string, GROUP, TAB, FIELD)를 한 시그니처에 욱여넣어(`EntityForm.tsx:349-431`) API 표면이 필요 이상으로 복잡하다. |
| Mutability/clone semantics | `manageEntityForm` aliasing 버그(§5)로 "clone은 안전하다"는 핵심 계약이 깨져 있다. **critical**. |
| EntityForm이 `.tsx`인 이유 | JSX는 없지만 React Hook 규칙(§3)과 ReactNode 타입에 의존 — 렌더링과의 결합이 파일 확장자에는 남아있지만 실질 코드에는 형태만 남아있다. |
| Config↔UI 경계 | `EntityField.view()`, `SubCollectionField.render()`가 계약에 박혀 있어 사실상 경계가 없다(§4, §6). |
| SubCollectionField 4종 중복 | 실측 최소 300줄 규모 반복. 공유 추상화로 절반 이하 축소 가능(§6). **high**. |
| 순환 의존성 | 213건 실측, tree-shaking/부분 재사용 불가능(§8). **high**. |
| 권한 모델 | 3중 복붙 + SubCollection 레벨 권한 체크 누락(§7). **high**. |
| 제네릭 활용도 | 장식적 수준, 엔드투엔드 타입 안전성 기여 낮음(§9). **medium**. |
| God-class 증상 | 5단 상속 체인 자체가 "파일 분할로 위장한 단일 클래스"(§2). **high**. |

**한 문장 결론**: 도메인 모델 계층은 "선언적 config"라는 이름표를 달고 있지만 실제로는 렌더링·검증·HTTP·권한·데이터변환이 한 클래스 인스턴스에 뒤섞인 God Object이며, 이를 감싼 상속 체인과 파일 분할은 실질적 캡슐화를 제공하지 못한다. 상용 라이브러리로 확장하려면 (1) `manageEntityForm` clone 버그부터 즉시 수정, (2) SubCollectionField 4종을 공유 베이스로 통합, (3) 권한 체크를 단일 유틸로 추출하고 SubCollection에도 적용, (4) Config/EntityForm/Fields 삼각 순환 의존성을 타입 전용 계약 + 플러그인 레지스트리로 재설계하는 순서로 접근해야 한다.
