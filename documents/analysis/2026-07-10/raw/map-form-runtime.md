> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 폼 런타임 지도 — ViewEntityForm + 상태관리

대상: `src/listgrid/components/form/**`, `src/listgrid/view/ViewEntityForm*`,
`src/listgrid/components/fields/abstract/FormField.tsx`, `src/listgrid/store/**`

---

## 1. 상태가 실제로 어디에 사는가

폼 런타임에는 "폼 상태 저장소"가 존재하지 않는다. `zustand` 는 이 서브시스템에서 딱 두 곳에만
쓰인다.

- `src/listgrid/store/index.ts:32` — `useModalManagerStore` (열린 모달 배열)
- `src/listgrid/loading` 의 `useLoadingStore` (전역 로딩 오버레이 on/off, `useEntityFormLogic.ts:51`)

**엔티티 폼 자체의 값·에러·dirty·탭 상태는 전부 `useEntityFormLogic` 훅 안의 `useState` 뭉치다**
(`src/listgrid/components/form/hooks/useEntityFormLogic.ts:31-49`):

```ts
const [entityForm, setEntityForm] = useState<EntityForm>();
const entityFormRef = useRef<EntityForm>(entityForm);   // L32 — 상태의 그림자 ref
const [tabIndex, setTabIndex] = useState<string>();
const [cacheKey, setCacheKey] = useState<string>();
...
const [selectedTabIndex, setSelectedTabIndex] = useState(0);
const [currentStep, setCurrentStep] = useState<number>(0);
const [tabs, setTabs] = useState<EntityTab[]>([]);
const [buttons, setButtons] = useState<React.ReactNode[]>([]);
```

여기서 `entityForm` 은 **일반 데이터가 아니라 가변 클래스 인스턴스**(`EntityForm`, `src/listgrid/config/EntityForm.tsx:33`)다.
필드값·에러·onChanges 콜백·검증 상태가 모두 이 인스턴스의 `Map` 프로퍼티(`fields`, `tabs`, `collections` 등)에
얹혀 있다. React 관점에서 "상태"는 이 인스턴스에 대한 **참조 하나**뿐이고, 실제 필드 단위 상태(값/더티/에러)는
그 안의 mutable 프로퍼티들이다. 즉:

- 상태 저장 위치: 컴포넌트 로컬 `useState` (트리 최상위 `useEntityFormLogic` 1곳)
- 상태의 알맹이: 리액트 밖의 mutable 클래스 그래프(`EntityForm` → `Map<string, FormField>` → 각 필드의 `value: {current, default, fetched}`)
- 리렌더 트리거 방식: `setEntityForm(newRef)` 로 참조를 바꿔야만 반응형이 됨 — 이는 아래 4절의 문제의 근원이다.

폼 화면 하나에 대해 "state" 관리 지점이 사실상 이 훅 하나로 응집돼 있는 것 자체는 나쁘지 않다(관심사는 모아져
있음). 문제는 **그 알맹이가 immutable 하지 않은 도메인 객체**라는 점, 그리고 그 참조가 트리 전체에 props로
드릴링된다는 점이다.

---

## 2. Props 드릴링 경로 (실측)

```
ViewEntityFormWrapper (view/ViewEntityFormWrapper.tsx:16)
  └─ ViewEntityForm (components/form/ViewEntityForm.tsx:76)
       - useEntityFormLogic(props) 훅 호출, {entityForm, setEntityForm, tabs, ...} 구조분해
       └─ ViewTab × N            (ViewEntityForm.tsx:296-334)  — entityForm, setTabIndex
       └─ ViewTabPanel × N       (ViewEntityForm.tsx:348-361)  — entityForm, setEntityForm, readonly, session...
            └─ ViewFieldGroup × M  (ViewTabPanel.tsx:69-81)     — entityForm, setEntityForm (spread)
                 └─ FieldRenderer × K (ViewFieldGroup.tsx:297-306) — entityForm, setEntityForm
                 └─ SubCollectionRenderer (ViewFieldGroup.tsx:327-331) — entityForm (session만, setEntityForm 없음!)
                      └─ collection.render({entityForm, session}) → 필드별 서브클래스가 알아서 렌더
```

`EntityFormManageable` 타입(대략 `{entityForm, setEntityForm}`)이 `ViewTabPanel` → `ViewFieldGroup` →
`FieldRenderer` 3단계에 걸쳐 반복적으로 스프레드된다 (`ViewTabPanel.tsx:76`, `ViewFieldGroup.tsx:300`).
매 단계가 구조분해 후 다시 스프레드하는 손타이핑 방식이라, 새 prop을 하나 추가하려면 3~4개 파일을 동시에
고쳐야 한다 — 실제로 `hideMappedByFields`, `resetEntityForm`, `session` 세 개가 이미 그 패턴을 그대로
반복하고 있다 (`ViewTabPanel.tsx:16,30-31`, `ViewFieldGroup.tsx:44,73`, `FieldRenderer.tsx:41`).

이건 "약간 장황한 정도"가 아니라 **구조적 결합**이다: `ViewEntityForm` 이 알아야 할 payload가 늘어날 때마다
중간의 모든 컴포넌트가 그 prop의 존재를 알아야 한다(pass-through 목적 외에는 아무 관심도 없는데도).
`SubCollectionRenderer` 만 `setEntityForm` 을 받지 않는 것도 일관성 결여의 증거 — SubCollection이 부모
entityForm을 직접 변형할 경로가 없다는 뜻이고, 대신 부모는 통째로 리마운트되는 팝업으로 우회한다(4절 참고).

---

## 3. 필드 값 변경 → 저장까지 데이터 흐름

`FieldRenderer.tsx` 의 `onChange` (viewParams 안, `FieldRenderer.tsx:239-311`, 그리고 커스텀 렌더러용
`handleFieldChange`, `FieldRenderer.tsx:75-145`, 로직이 사실상 **완전히 중복**돼 있다)는 다음 순서로 동작한다:

1. `entityForm.clone(true)` — **전체 EntityForm 딥클론** (모든 탭, 모든 필드, 모든 서브콜렉션 clone). `EntityForm.tsx:38-91` 참고 — `cloneWithEntityForm` 이 `this.tabs`, `this.fields`, `this.collections` 를 전부 순회하며 각 원소의 `.clone()` 을 호출한다. 필드 100개짜리 폼이면 키 하나 칠 때마다 필드 인스턴스 100개가 다시 생성된다.
2. `cloned.setValue(fieldName, value)` (`FieldRenderer.tsx:250-251`)
3. `cloned.validate({fieldNames:[fieldName]})` — 단일 필드만 검증 (`FieldRenderer.tsx:262-266`)
4. `cloned.onChanges` 배열 순회 — host가 등록한 cross-field 사이드이펙트 훅 (`FieldRenderer.tsx:270-283`)
5. `setEntityForm(cloned)` — 항상 새 참조로 교체 (`FieldRenderer.tsx:289-293`, 주석에 React 19 same-ref skip 회피용이라고 명시)
6. `requestAnimationFrame` 스크롤 위치 보정 (`FieldRenderer.tsx:297-309`) — DOM 부작용 완화용 패치가 onChange 경로 안에 상주

`setEntityForm(cloned)` 이 `useEntityFormLogic` 의 `entityForm` state를 갱신하면, 이 새 참조가 다시
`ViewEntityForm` → 모든 `ViewTabPanel` → 모든 `ViewFieldGroup` → 모든 `FieldRenderer` 로 props 재전달된다.

Dirty 추적: `FormField.isDirty()` (`FormField.tsx:542-589`) 가 `value.current` vs `value.fetched`/`default` 비교로
필드 단위 dirty를 계산한다. `FieldRenderer` 는 이를 매 `entityForm` 변경마다 다시 계산해 로컬 `dirty` state에
반영한다(`FieldRenderer.tsx:181-182, 258`). 폼 전체 dirty(저장 버튼 활성화 등)는 이 서브시스템에서 별도로
집계하는 코드가 보이지 않는다 — 필드별 "수정됨" 별 아이콘만 있고, 폼 레벨 isDirty 게이트는 두지 않았다.

저장(`onClickSaveButton`, `useEntityFormSave.ts:54-129`)은 `entityForm.save(session)` 을 호출해 서버 응답을
받고, 성공 시 `postSave` 콜백 체인(`useEntityFormLogic.ts:116-179`)이 `renderType`(create/update/subCollection)에
따라 분기해 라우팅/모달 닫기/`setCacheKey` 로 강제 리마운트 트리거 등을 처리한다.

---

## 4. 중첩 EntityForm 재진입 — 맵으로 그리면

```
[리스트 화면] ── ManyToOneField 입력 클릭 ──▶ ManyToOneView.handleCreateModal/handleEditModal/handleViewModal
                                                (components/fields/view/ManyToOneView.tsx:219-300)
                                                └─ openModal({ content: <ViewEntityForm entityForm={...} subCollection /> })
                                                     └─ 완전히 새로운 useEntityFormLogic 인스턴스가 모달 안에서 mount
                                                     └─ postSave 콜백 안에서 부모 필드 onChange(savedData) 호출해 부모 entityForm 값만 갱신

[상세 화면] ── SubCollection(TableSubCollectionField 등) 행의 "상세보기/수정" ──▶ SubCollectionModal
                                                (components/list/ui/SubCollectionModal.tsx:19-78)
                                                └─ <ViewEntityForm entityForm subCollection={true} .../> 를 Modal 안에 렌더
                                                     └─ 역시 새 useEntityFormLogic 인스턴스, 저장 성공 시 onRefresh() 로 부모 리스트만 리페치

[상세 화면] ── InlineSubCollectionField/CardSubCollectionField (인라인, 모달 없이) ──▶ ViewFieldGroup.tsx:327-331
                                                └─ SubCollectionRenderer → collection.render({entityForm, session})
                                                     └─ 필드 서브클래스가 자체적으로 리스트/그리드를 그림 (별도 ViewEntityForm 재진입 없음, 단 CardSubCollectionModal/SubCollectionViewModal 경유 시 위와 동일 패턴 재발)
```

즉 "ManyToOneField 팝업 폼"과 "SubCollectionField 인라인 편집 폼"은 **같은 컴포넌트
(`ViewEntityForm`) 를 `subCollection={true}` 플래그로 다시 마운트**하는 방식으로 재진입한다.
재귀 호출처럼 보이지만 실제로는:

- 각 재진입은 `Modal`(zustand `useModalManagerStore`)이 관리하는 **완전히 독립된 React 서브트리**로 열린다.
- 부모 `entityForm` 인스턴스와 자식 `entityForm` 인스턴스 사이에는 **상태 연결이 전혀 없다** — 부모는 자식이
  저장 완료(`postSave`) 콜백을 호출해줄 때만 `setManyToOneValue(savedData)` 로 자기 필드 하나를 갱신한다
  (`ManyToOneView.tsx:228-231, 255-257`).
- 재귀는 컨텍스트/스토어 공유가 아니라 **콜백 프로토콜**(`postSave`, `buttonLinks.onClickList` 등)로 이뤄진다.

이 설계는 "각 폼은 자기 완결적 상태를 가진다"는 점에서 사고 모델은 단순하다 — 부모 상태가 오염될 걱정은
없다. 하지만 대가가 크다:

- **탭/스텝/에러/버튼 등 모든 초기화 로직(`useEntityFormLogic`, `useEntityFormInitializer`)이 재진입마다
  통째로 다시 실행**된다. 서버 fetch(`initialEntityForm.initialize()`, `useEntityFormInitializer.ts:54`)도
  다시 탄다 — 부모가 이미 들고 있는 관련 엔티티 데이터를 재활용할 방법이 없다.
- 모달 콘텐츠는 클릭 시점의 클로저로 한 번 생성돼 `openModal({content: <ViewEntityForm .../>})` 에 박제된다
  (`ManyToOneView.tsx:225-243`). 부모가 그 사이 리렌더돼도 모달 속 자식은 갱신되지 않는다 — 클로저에 캡처된
  `value`, `entityForm` 은 모달을 여는 순간의 스냅샷.

---

## 5. 리렌더 폭발 지점 — 정확한 좌표

**핵심 트리거 3개가 겹쳐서 "키 하나 입력 = 폼 전체 재계산"이 된다.**

### (a) `EntityForm.clone()` 은 O(전체 필드 수) 딥클론이다
`src/listgrid/config/EntityForm.tsx:38-91` — `tabs`, `fields`, `collections` 세 개의 `Map` 을 전부
`Array.from(...).forEach(x => x.clone())` 으로 순회한다. 필드 하나만 바뀌어도 **모든 필드 인스턴스가
매번 새로 생성**된다. `FieldRenderer` 의 모든 `onChange`/`handleFieldChange` 경로가 이 clone을 매 키입력마다
호출한다(`FieldRenderer.tsx:86, 250`).

### (b) `Tab.Panel unmount={false}` 로 모든 탭이 항상 마운트돼 있다
`src/listgrid/components/form/ViewTabPanel.tsx:62` — `<Tab.Panel ... unmount={false}>`. Headless UI는
비활성 탭도 DOM에서 unmount하지 않고 `display:none` 등으로만 숨긴다. 즉 탭이 5개면 **보이지 않는 4개 탭의
필드까지 전부 React 트리에 살아있다.**

### (c) `FieldRenderer` 의 주 `useEffect` 의존성이 `entityForm` 참조 전체다
`src/listgrid/components/form/FieldRenderer.tsx:178-350`:
```ts
useEffect(() => {
  if (entityForm) {
    ...
    const required = await field.isRequired(fieldInfoParams);
    const readonly = await field.isReadonly(fieldInfoParams);
    const tooltip = await field.getTooltip(fieldInfoParams);
    const helpText = await field.getHelpText(fieldInfoParams);
    const placeHolder = await field.getPlaceHolder(fieldInfoParams);
    setView(await field.view(viewParams));
  }
}, [entityForm, setEntityForm]);   // ← L350
```
이 훅은 필드 이름/자기 자신과 무관하게 **entityForm 참조가 바뀔 때마다** 무조건 재실행되며, 5개의 async
호출(대부분 config 함수 실행, `getConditionalX` 계열)과 `field.view()` 재호출(각 필드 타입의 렌더 로직 재실행,
ManyToOneField 등은 내부에서 추가 fetch까지 가능)을 수반한다.

**(a)+(b)+(c) 를 합치면**: 필드 하나에 키 입력 → 전체 EntityForm 딥클론(모든 필드 clone) → `setEntityForm`
새 참조 → 현재 안 보이는 탭들을 포함한 **폼에 존재하는 모든 FieldRenderer 인스턴스**의 useEffect가 동시에
재실행 → 각각 5개 안팎의 await 체인 재수행. 필드 수가 N일 때 매 키 입력마다 O(N) 클론 + O(N) 비동기
재계산이 발생한다. 필드가 수십 개인 실무 폼(예: 이 리포의 다른 스크린들)에서는 타이핑 지연/포커스 유실
가능성이 매우 높은 패턴이다. 코드 내 주석(`FieldRenderer.tsx:122-127, 288`)이 "React 19 setState same-ref
skip 회피"를 위해 **일부러 매번 새 참조를 만든다**고 밝히고 있어, 리렌더 최소화보다 "값 반영 안 되는 버그
회피"를 택했음을 알 수 있다 — 즉 유지보수자도 이 트레이드오프를 인지하고 있었다.

### 부가 발견 — 스크롤 보정 부작용
`FieldRenderer.tsx:130-141, 297-309` : `onChange` 안에 `requestAnimationFrame` + `window.scrollTo` 보정
로직이 인라인으로 박혀 있다. 이는 (c)의 재계산이 실제로 레이아웃 시프트/스크롤 점프를 유발했었다는
방증이며, 근본 원인(불필요한 전체 트리 재계산)을 고치는 대신 증상(스크롤 튐)만 패치한 흔적이다.

---

## 6. 검증(validate) 흐름

- 필드 단위: `onChange` 시 `cloned.validate({fieldNames:[name]})` 로 **해당 필드만** 검증
  (`FieldRenderer.tsx:262-266`) — 이 부분은 합리적으로 스코프가 좁혀져 있다.
- 필드 자체 검증 로직: `FormField.validate()` (`FormField.tsx:779-823`) — hidden/readonly/권한 없음이면
  스킵, required 체크, 등록된 `Validation[]` 순회.
- 저장 시점 전체 검증은 `EntityForm.save()`(config/EntityForm.tsx, 이 리포트 범위 밖) 경유로 처리되는 것으로
  보이며, `useEntityFormSave.ts:84` 의 `processedEntityForm.save(session)` 호출 안에서 이뤄진다 — 필드
  단위 실시간 검증과 저장 시 전체 검증이 **두 갈래 경로**로 존재하고 이 서브시스템(FieldRenderer)에서는
  둘을 통합한 단일 "폼 valid 여부" 신호를 만들지 않는다. 저장 버튼은 클라이언트 valid 상태를 사전에 알 수
  없고, 항상 서버 라운드트립(`save()`) 후에야 에러를 알게 되는 구조로 읽힌다.

---

## 7. 맞는 부분 — 잘 설계된 지점

- **`useEntityFormLogic` 로 관심사를 한 곳에 모은 것 자체**는 옳은 방향이다. `ViewEntityForm.tsx` 는
  실제로 렌더 전용이고(주석에도 명시, `ViewEntityForm.tsx:64-71`), 로직은 훅 계층에 몰려 있다 —
  "UI와 로직이 완전히 뒤섞여 분리 불가"라는 서면 불만은 최소한 최상위 컴포넌트 레벨에서는 사실이 아니다.
  다만 이 로직 자체가 여러 훅(`useEntityFormInitializer`, `useEntityFormSave`, `useEntityFormTitle`,
  `useEntityFormAutoSave`)으로 이미 쪼개져 있음에도 `FieldRenderer` 안에는 `handleFieldChange`(커스텀
  렌더러용)와 `viewParams.onChange`(내장 렌더러용)가 **완전히 동일한 로직을 두 벌 유지**하고 있다
  (`FieldRenderer.tsx:75-145` vs `239-311`) — 리팩터링 부채로 지적할 부분.
- **필드 단위 validate 스코프 축소**(`fieldNames:[name]`)는 성능을 고려한 설계다.
- **AutoSave 훅의 sessionStorage 격리**(`useEntityFormAutoSave.ts`)는 entityForm 인스턴스에 대한 직접
  의존 없이 `getFieldValues()`로 값만 뽑아 저장하는 방식이라 재사용성이 있다.
- **모달 기반 재진입이 상태 오염을 만들지 않는다**는 점은 안전성 측면에서 나쁘지 않은 선택이다 — 코드 리뷰
  관점에서 "부모 state를 몰래 mutate하는 재귀" 같은 훨씬 나쁜 패턴은 피했다.

---

## 8. 핵심 질문에 대한 답 — SubViewEntityForm 분리가 정답인가, 폼 상태 컨텍스트/스토어가 정답인가

**결론: 관리자가 제안한 "별도 `SubViewEntityForm` 컴포넌트 분리"는 증상 대응이고, 근본 처방은 폼 상태를
context/store로 끌어올려 props 드릴링과 전체 트리 리렌더를 함께 없애는 것이다.**

근거:

1. `SubViewEntityForm` 을 새로 만들어도 **재진입 메커니즘(모달 + 콜백 프로토콜) 자체는 그대로**다. 지금
   `subCollection={true}` 플래그로 같은 컴포넌트를 재사용하는 것과, 별도 컴포넌트로 쪼개는 것의 차이는
   "분기 조건이 prop이냐 컴포넌트 선택이냐" 뿐이다. `ViewEntityForm.tsx` 안에서 `isSubCollectionEntity`/
   `isInlineMode` 로 갈라지는 렌더 분기(`ViewEntityForm.tsx:94-98, 130-131`)를 컴포넌트 경계로 옮기는
   정도의 효과이며, **4절의 "재진입마다 전체 재초기화", 5절의 "리렌더 폭발"은 그대로 남는다.**
2. 진짜 병목은 컴포넌트 경계가 아니라 (i) `EntityForm.clone()` 이 매 키 입력마다 전체 그래프를
   딥클론한다는 것, (ii) `entityForm` 참조 하나에 모든 하위 컴포넌트가 `useEffect` 로 구독하고 있다는 것,
   (iii) props 드릴링 때문에 "이 필드는 이 변경과 무관하다"는 정보가 어디에도 없다는 것이다. 이 세 가지는
   **컴포넌트를 몇 개로 쪼개든 상태 전파 방식을 바꾸지 않으면 그대로 재현**된다.
3. Context/store 기반 재설계가 실제로 여는 것:
   - 필드별 선택적 구독(예: `useSyncExternalStore` + 필드 단위 selector, 혹은 zustand로 `entityForm`
     을 옮기고 `useStore(selector)` 패턴)을 쓰면 **바뀐 필드의 `FieldRenderer` 만 리렌더**되고 나머지
     N-1개는 (b)의 `unmount={false}` 문제와 무관하게 조용히 있을 수 있다.
   - `clone()` 을 필드 단위 immutable update(예: Immer, 혹은 `Map` 대신 정규화된 slice 상태)로 바꾸면
     "전체 재계산" 자체가 사라진다. 이건 컴포넌트 분리로는 손댈 수 없는 `EntityForm` 클래스 설계 문제다.
   - 모달로 열리는 재진입 폼도 최상위에서 하나의 store(혹은 store factory — 폼 인스턴스별로 분리된 store를
     만들어야 부모/자식이 안 섞인다)를 쓰면, 지금처럼 "완전 독립 서브트리 + 콜백 프로토콜"을 유지하면서도
     불필요한 refetch 없이 부모가 들고 있는 관련 엔티티를 캐시로 재사용할 여지가 생긴다.
4. 다만 store 전환은 `EntityForm` 이 **가변 클래스 인스턴스**라는 근본 설계와 충돌한다. zustand/context로
   옮기려면 최소한 "필드 값"과 "필드 메타(hidden/readonly/validations 등, 거의 불변)"를 분리해, 값만
   반응형 상태로 관리하고 메타는 그대로 클래스 인스턴스에 남기는 하이브리드가 현실적이다. 지금처럼 값도
   메타도 전부 한 덩어리로 clone하는 구조를 유지한 채 store만 얹으면 (a)의 O(N) 클론 비용은 사라지지 않는다.

**요약**: `SubViewEntityForm` 분리는 코드 가독성(재진입 분기 제거)에는 도움이 되지만 리렌더/재초기화 성능
문제를 전혀 해결하지 못한다. 진짜 수정 지점은 (1) `EntityForm.clone()` 을 필드 단위 부분 갱신으로 바꾸고
(2) `FieldRenderer` 의 구독을 `entityForm` 참조 전체에서 "이 필드의 값/에러/메타"로 좁히는 것 — 둘 다
현재 props-drilling 아키텍처로는 안 되고, 상태를 컨텍스트/스토어로 끌어올려야 가능하다.

---

## 9. 종합 스멀 목록 (심각도순 근거는 구조적 요약 참고, StructuredOutput 참고)

| # | 위치 | 문제 |
|---|------|------|
| 1 | `EntityForm.tsx:38-91` + `FieldRenderer.tsx:86,250` | 필드 1개 변경마다 전체 폼(모든 탭/필드/서브콜렉션) 딥클론 |
| 2 | `ViewTabPanel.tsx:62` (`unmount={false}`) | 비활성 탭의 필드도 항상 마운트 상태 유지 |
| 3 | `FieldRenderer.tsx:178-350` (`useEffect` deps `[entityForm, setEntityForm]`) | entityForm 참조 변경 시 무관한 필드까지 전부 useEffect 재실행 (5개 안팎 await 체인) |
| 4 | `ViewTabPanel.tsx→ViewFieldGroup.tsx→FieldRenderer.tsx` (EntityFormManageable 반복 스프레드) | 3단계 props 드릴링, 새 prop 추가 시 3~4개 파일 동시 수정 필요 |
| 5 | `FieldRenderer.tsx:75-145` vs `239-311` | onChange 로직이 커스텀/기본 렌더러 두 경로에 완전 중복 |
| 6 | `ManyToOneView.tsx:219-300`, `SubCollectionModal.tsx:19-78` | 재진입 폼마다 useEntityFormLogic/초기화가 통째로 재실행 (부모 데이터 재사용 없음, refetch) |
| 7 | `FieldRenderer.tsx:130-141,297-309` | 리렌더 폭발의 증상(스크롤 튐)을 인라인 patch로만 봉합 |
| 8 | `useEntityFormLogic.ts:78-80` (주석 처리된 throw) | session 없을 때 에러를 던지지 않고 조용히 통과 — 세션 필수 폼에서도 무음 실패 가능 |
| 9 | 폼 레벨 dirty/valid 집계 부재 | 필드별 dirty 아이콘만 있고 "저장 가능 여부"를 사전에 판단할 클라이언트 신호가 없음 — 항상 서버 라운드트립 후 에러 발견 |
