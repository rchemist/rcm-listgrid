> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 아키텍처 심판 — 근본 결함인가 수리 가능한가

대상: `@rchemist/listgrid` v0.3.25 / 핵심 도메인·폼·리스트 런타임
판정 기준: "상용급 범용 라이브러리로 승격 가능한가"를 아키텍처 골격 관점에서만 심판한다.
방법: 서브시스템 지도 3종(map-core-model / map-form-runtime / map-list-runtime)을 읽고,
판정에 결정적인 코드(`EntityForm.tsx`, `config/form/*` mixin 6종, `EntityField.ts`,
`FieldRenderer.tsx`, `useEntityFormLogic.ts`, `RuntimeConfig.ts`, `auth/AuthContext.tsx`,
`SubCollectionField.tsx`)를 직접 재검증했다.

---

## 0. 한 줄 판정 (headline)

**근본 결함은 "국소적으로 근본적"이다 — 골격 전체를 버릴 이유는 없으나, 제자리(in-place) 리팩터링으로는
못 고치는 3개의 축(① 폼 상태 전파 모델, ② config↔render 인터페이스 계약, ③ 모듈 전역 가변 싱글턴)이
존재하며, 이 셋은 "코드를 다듬는" 작업이 아니라 "계층 경계를 새로 긋는" 작업이다.** 나머지(God-class 상속
체인, 4종 SubCollectionField 복붙, 권한 3중 복붙, clone aliasing 버그)는 전부 제자리 수리 가능한
"수리 대상"이다. 즉 **rewrite-from-scratch는 과잉대응이고, "레이어드 재설계 + 표면 유지"가 정답**이다.
전체 마이그레이션은 시니어 1인 기준 대략 **20~30 person-week**, 그 중 진짜 위험한 핵심(폼 상태 모델
재설계)이 **8~12 person-week**다. 코드 생존율은 LOC 기준 **약 70~75%**로 추정한다(§5).

정량 기준선(비테스트 소스, 실측): 총 `52,347` LOC / `config` 도메인 `6,797`(그 중 `config/form` mixin
`1,991`) / `components/form` 런타임 `5,782` / `components/fields` `17,917` / `components/list` `11,628`.
필드 구현 클래스 `40`종(`grep extends *FormField* → 40`).

---

## 1. Q1 — config-class/render 결합은 근본 결함인가, 제자리 수리인가

### 1.1 유지보수자의 프레이밍은 부정확하다 — 그래서 수리가 더 쉽다

"EntityForm이 `.tsx`인데 UI를 품고 있다"는 서면 불만은 **코드로 확인하면 틀렸다.**
`EntityForm.tsx`(1,074L) 본문에 **JSX 리턴이 0건**이다(`grep 'return <|<div|<>|React.createElement'
config/EntityForm.tsx → 0`). `.tsx` 확장자는 `ReactNode` 타입 참조와 `useSession` import 때문에 붙은
오도성 잔재일 뿐, 이 파일의 실제 책임은 HTTP CRUD·검증·submit 데이터 조립이다. **즉 "EntityForm에서 UI를
뜯어낸다"는 접근은 뜯어낼 UI가 없으므로 헛다리다.**

진짜 config↔render 결합은 **두 개의 구체적 지점**에 있고, 둘 다 위치가 특정된다:

1. **인터페이스 계약에 렌더가 박혀 있다.** `config/EntityField.ts:60` 이 `view(params):
   Promise<ReactNode | null>` 를 **필수 멤버**로 선언한다. 주석(`EntityField.ts:11` "모든 EntityField 는
   render 메소드를 이용해 화면에 표시된다")이 이를 설계 의도로 못박는다. 이 한 줄이 "필드 메타데이터를
   정의하는 순간 그 필드의 렌더 방법까지 계약에 포함된다"는 뜻이고, 이 계약을 40개 필드 구현체가 전부
   구현한다.
2. **config 클래스가 직접 JSX를 반환한다.** `config/SubCollectionField.tsx:308` 이 `<ViewListGrid .../>`
   를 리턴한다(그리고 Card/Table/Inline 3변형도 동일). 이건 "데이터 홀더가 곧 React 컴포넌트 팩토리"라는
   증거다.
3. **config 클래스가 React Hook 규칙에 종속돼 있다.** `EntityForm.tsx:613-615` 의 `fetchData()` 가
   클래스 async 메소드 안에서 `useSession()` 을 직접 호출하고 `// eslint-disable-next-line
   react-hooks/rules-of-hooks` 로 규칙 위반을 자백한다.

### 1.2 §1.1-③은 "냄새"가 아니라 잠복 크래시 — map-core-model의 추정을 반증한다

map-core-model(§3)은 "`useSession` 이 진짜 훅이 아니라 모듈 전역을 읽는 위장 훅일 가능성이 높다"고
추정하며 위험을 낮게 봤다. **이 추정은 틀렸다.** `auth/AuthContext.tsx:23-32` 를 직접 읽으면 `useSession`
은 `useContext(AuthContext)` 를 호출하는 **진짜 React Context 훅**이며, provider 부재 시 `throw` 까지
한다. 그리고 `fetchData()`/`initialize()` 의 호출부는 전부 **렌더 페이즈 밖**이다:
`useEntityFormInitializer.ts:54`(async effect 내부), `useListGridLogic.ts:531`(effect), `ManyToOneView.tsx:97,118`
(effect/이벤트 핸들러), `ManyToOneField.tsx:508,523,537`(이벤트 핸들러). React의 `useContext` 를 렌더
밖에서 호출하면 dispatcher가 null이라 "Invalid hook call" 로 **터진다.** 지금 프로덕션이 안 터지는
유일한 이유는 대부분의 EntityForm이 `sessionRequired=true` 를 켜지 않아 `if (this.isSessionRequired())`
분기(`EntityForm.tsx:613`)를 타지 않기 때문이다. **즉 이건 "언젠가 세션 필수 폼 + effect 경유 fetch"
조합이 만나는 순간 재현되는 시한폭탄**이며, config가 UI 프레임워크(React 훅 생명주기)에 결합돼 있다는
가장 날카로운 증거다. 세션은 반드시 **인자로 주입**되어야 하고(호출부는 이미 `session` 을 들고 있다 —
`internalSave(session?)` 처럼), 훅 호출은 config 계층에서 제거돼야 한다.

### 1.3 판정: 근본적 계약 결함이나, 기계적으로 제자리 수리 가능(단 표면이 넓다)

- config↔render 결합은 "God-class 안에 UI가 뒤섞였다"는 스파게티가 **아니다.** 결합은
  `EntityField.view()` 라는 **단일 인터페이스 라인**과 4개 SubCollectionField 클래스, 그리고 1개 훅
  오용에 국소화돼 있다. 이것이 이 문제를 "근본적이지만 수리 가능"으로 만든다.
- 처방: `EntityField` 를 **순수 메타 계약**(`type`, `name`, `validations`, `isPermitted`, `isRequired`
  …)과 **렌더 계약**(`view()`)으로 쪼개고, 후자를 별도 레지스트리(`FieldRenderer` 맵: `type → 렌더러
  컴포넌트`)로 뽑는다. `view()` 를 인터페이스에서 제거하면 40개 필드 구현체를 건드려야 하지만(breaking),
  이는 **위험(behavioral)한 변경이 아니라 넓은(mechanical) 변경**이다 — 각 필드의 `view()` 본문 로직은
  그대로 렌더러 컴포넌트로 이사한다.
- 비용: `EntityField` 인터페이스 분리 + 40개 필드의 `view()` 이관 + `useSession` 인자화 ≈ **4~6
  person-week**. 이 중 위험 구간은 `useSession` 제거(세션 주입 경로를 fetch/initialize/save 전체에
  관통시켜야 함)뿐이고, `view()` 이관은 haiku/sonnet 급 반복 작업이다.

---

## 2. Q2 — 중첩 폼 상태 문제: 3개 후보 설계 비교

### 2.1 문제의 정확한 좌표 (재검증)

폼 상태는 "저장소"가 없다. 폼 화면 하나의 값·에러·dirty·탭이 전부 `useEntityFormLogic.ts:31-49` 의
`useState<EntityForm>()` **참조 하나**에 얹혀 있고, 그 알맹이는 리액트 밖의 **가변 클래스 그래프**
(`EntityForm → Map<string,FormField> → value{current,default,fetched}`)다. 반응형이 되려면 매번
`setEntityForm(new ref)` 로 참조를 갈아야 한다. 여기서 3개 트리거가 겹쳐 "키 1타 = 폼 전체 재계산"이
된다(map-form-runtime §5, 직접 재확인):

- **(a) O(N) 딥클론**: `FieldRenderer.tsx:86,250` 의 `onChange` 가 매 키입력마다 `entityForm.clone(true)`
  를 호출 → `EntityForm.tsx:43-119` 의 `cloneWithEntityForm` 이 `tabs/fields/collections` 3개 Map을
  전부 순회하며 각 원소 `.clone()`. 필드 100개면 1타에 100개 인스턴스 재생성.
- **(b) 죽지 않는 탭**: `ViewTabPanel.tsx:62` 의 `unmount={false}` 로 비활성 탭 필드까지 항상 마운트.
- **(c) 광역 구독**: `FieldRenderer.tsx:178-350` 의 주 `useEffect` deps가 `[entityForm, setEntityForm]`
  이라, 참조가 바뀌면 **무관한 필드까지 전부** 5개 안팎의 async 재계산(`isRequired/isReadonly/
  getTooltip/getHelpText/view`)을 수행.

중첩(재진입)은 별개 축이다: ManyToOne 팝업/SubCollection 모달이 열릴 때마다 `useEntityFormLogic` 전체가
**새로 초기화 + 재fetch**되고(`ManyToOneView.tsx:219-300`, `SubCollectionModal.tsx:19-78`), 부모/자식은
콜백 프로토콜(`postSave`)로만 통신한다. props 드릴링은 `ViewTabPanel → ViewFieldGroup → FieldRenderer`
3단 스프레드(`ViewTabPanel.tsx:76`, `ViewFieldGroup.tsx:300`, `FieldRenderer.tsx:41`)로, prop 하나
추가에 3~4파일 동시 수정을 강제한다.

**핵심 통찰: props 드릴링과 리렌더 폭발은 같은 뿌리 — "상태 전파 채널이 참조 하나뿐"이다.** 드릴링은
그 참조를 손으로 나르는 것이고, 리렌더 폭발은 그 참조에 모두가 구독하는 것이다. 둘 다 **상태 전파 방식을
바꿔야** 사라진다.

### 2.2 후보 A — 인스턴스별 스토어 + 셀렉터 구독 (zustand createStore factory / jotai scope)

**설계**: 폼 인스턴스마다 격리된 store를 만든다(`createFormStore()` 팩토리 → React Context로 그 store를
서브트리에 주입, 모달 재진입 시 자식은 **자기 store**를 새로 만든다 — 부모/자식 격리는 지금의 "완전 독립
서브트리" 장점을 그대로 계승). store는 **값(value/error/dirty)만 정규화 슬라이스**로 담고, 필드 메타
(거의 불변인 validations/type/conditional 함수)는 클래스 인스턴스에 남기는 **하이브리드**. `FieldRenderer`
는 `useFormStore(s => s.fields[name])` 로 **자기 필드만 구독** → (c) 광역 리렌더 소멸. `onChange` 는
`store.setValue(name, v)` 로 **해당 슬라이스만 immutable 갱신** → (a) O(N) 클론 소멸. 드릴링은 store
Context가 대체 → props 드릴링 소멸.

- **해결 범위**: (a)(c) + 드릴링 + 재진입 refetch(부모 store를 캐시로 자식에 전달 가능)까지 **전부**.
  (b) `unmount={false}` 는 store 셀렉터로 리렌더가 격리되면 성능 부담이 대폭 완화(마운트는 유지되나
  재계산 안 됨).
- **위험**: `EntityForm` 이 "값과 메타를 한 덩어리로 clone"하는 근본 설계와 충돌 → 값/메타 분리가
  선결 과제. 이걸 안 하고 store만 얹으면 O(N) 클론이 안 사라진다(map-form-runtime §8-4가 정확히 지적).
- **선결 조건**: 현재 `useEntityFormLogic`/`FieldRenderer` 테스트 0건 → 회귀 안전망부터 구축 필요.
- **비용**: store 팩토리 + Context 주입(1w) + 값/메타 분리 및 clone→슬라이스 갱신 전환(3~4w) +
  `FieldRenderer` 구독 전환 + 드릴링 제거(2~3w) + 재진입 캐시(1w) + 특성화 테스트(2~3w) =
  **8~12 person-week**. **← 권장.**

### 2.3 후보 B — 폼 상태 머신 (xstate 류)

**설계**: 폼 생명주기(idle→loading→editing→validating→saving→error)를 상태 머신으로 명시하고 필드값을
context에 담는다.

- **장점**: create/update/subCollection 분기, autoSave, step 위저드(`currentStep`,
  `useEntityFormLogic.ts`) 같은 **흐름 제어**는 지금 postSave 콜백 체인(`useEntityFormLogic.ts:116-179`)의
  암묵적 분기보다 훨씬 명료해진다.
- **단점**: 필드 **값** 자체는 상태 머신에 담기에 부적합하다(수십 개 필드값은 "상태"가 아니라 "데이터").
  결국 값은 별도 store가 필요해 A와 겹치고, 머신은 위에 얹는 오케스트레이터가 된다. 단독으로는 리렌더
  폭발을 못 고친다.
- **위험/비용**: 새 의존성(xstate) + 팀 러닝커브 + 값 store까지 결국 필요 → **12~16 person-week**,
  ROI 낮음. **권장하지 않음(흐름 제어가 실제로 아플 때 A 위에 선택적으로 도입).**

### 2.4 후보 C — 유지보수자의 `SubViewEntityForm` 분리

**설계**: `subCollection={true}` 플래그로 분기하던 `ViewEntityForm` 을 별도 컴포넌트로 쪼갠다.

- **효과**: `ViewEntityForm.tsx:94-98,130-131` 의 렌더 분기를 컴포넌트 경계로 옮기는 **가독성 개선**뿐.
- **한계(치명적)**: 재진입 메커니즘(모달+콜백)도, (a) 딥클론도, (b) 탭 마운트도, (c) 광역 구독도,
  드릴링도 **하나도 안 사라진다.** map-form-runtime §8-1이 정확히 판정했고 본 심판도 동의한다 —
  **증상 대응이지 처방이 아니다.**
- **비용**: **1~2 person-week**. 싸지만 성능/드릴링 문제 0% 해결.

### 2.5 Q2 판정

| 후보 | 리렌더 폭발 | 드릴링 | 재진입 refetch | 비용(pw) | 판정 |
|---|---|---|---|---|---|
| A 인스턴스 store+셀렉터 | ✅ | ✅ | ✅ | 8~12 | **권장** |
| B 상태 머신 | △(값 store 필요) | △ | △ | 12~16 | 보류(A 위 선택) |
| C SubViewEntityForm | ❌ | ❌ | ❌ | 1~2 | 증상 대응 |

**A를 골격으로, 값/메타 분리를 선결 조건으로, 흐름이 복잡해지면 B의 머신을 A 위에 선택적으로 얹는다.
C는 A의 컴포넌트 정리 단계에서 부산물로 흡수하면 되며 단독 채택은 자원 낭비다.**

---

## 3. Q3 — 모듈 전역 configure* 싱글턴 vs React Context: SSR/멀티테넌시 안전성

### 3.1 실측: 모듈 전역 가변 싱글턴 14개

`grep '^let _' src` 로 확인한 **프로세스 전역 가변 상태 14개**:
`RuntimeConfig.ts:119 _config`, `menu/MenuPermissionChecker.ts:29 _checker`,
`message/MessageProvider.ts:47 _services`, `api/ApiClient.ts:69 _client`,
`loading/index.ts:12 _store`, `auth/SessionProvider.ts:8 _signOut`,
`transfer/registry.ts:28 _components`, `utils/i18n.ts:29 _factory`,
`extensions/FieldExtensions.ts:18,62`, `misc/index.ts:431,432`,
`store/index.ts:60 _baseOverlayZIndex`, `transfer/Provider/ExcelProvider.ts:47`.
설정 진입점은 `configureRuntime/configureLoading/configureMessages/configureApiClient/
registerSignOut/registerMenuPermissionChecker/configureTranslator/...` 등 **14개 export 함수**.

### 3.2 SSR/멀티테넌트에서 무엇이 깨지는가

- **격리 부재**: `RuntimeConfig.ts:125-133` 의 `configureRuntime` 은 `_config = {..._config, ...}` 로
  **모듈 전역을 덮어쓴다.** Node 단일 프로세스가 여러 테넌트(호스트 A/B)를 서빙하면, A 요청이 설정한
  `endpoints/permissions/cryptKey` 가 동시에 처리되는 B 요청에 그대로 새어 나간다. 특히 `cryptKey`
  (`RuntimeConfig.ts:70`)와 `permissions`(`canSendSms/canOpenInNewWindow`)는 **보안 경계**라 교차
  오염이 치명적이다.
- **부트스트랩 경쟁**: 이 싱글턴들은 `'use client'` 지시어가 없어(map-providers 확인) 서버/클라이언트
  어디서든 import되며, 요청마다 `configure*` 재호출 시 경쟁 상태가 문서화조차 안 돼 있다.
- **정적 메서드 딜레마**: 이 싱글턴들이 존재하는 이유는 `EntityForm.getEndpoint()` 같은 **클래스
  메소드(비 React 컨텍스트)에서도 설정에 접근해야** 하기 때문이다. Context는 훅에서만 읽히므로, config
  클래스가 렌더 트리 밖에서 도는 한 순수 Context로는 못 바꾼다 — **이건 §1.2의 `useSession` 문제와 같은
  뿌리**(config 계층이 렌더 트리 밖에 산다)다.

### 3.3 판정: Context 단독 교체는 오답, "요청 스코프 컨테이너" 주입이 정답

- 순수 React Context 이전은 **불가능**하다(클래스 메소드가 Context를 못 읽음). 대신:
  1. **SPA/CSR 단독 소비자**(대다수): 현 싱글턴은 **부트스트랩 1회 설정**이므로 실질 안전하며, 이건
     "라이브러리化를 향한 올바른 방향"(map-core-model §10 동의)이다. 억지로 Context화할 필요 없음.
  2. **SSR/멀티테넌트**: `AsyncLocalStorage` 기반 **요청 스코프 config 컨테이너**를 도입하고,
     `getRuntimeConfig()` 가 전역 대신 현재 요청 컨텍스트를 먼저 조회하도록 바꾼다. 클래스 메소드는
     인스턴스에 주입된 config를 쓰거나(§2 A의 store처럼), `EntityForm` 생성 시 config 스냅샷을 받는다.
- **비용**: `getRuntimeConfig/getEndpoint/getPermission` 접근자에 요청 컨텍스트 조회를 끼우는 것은
  국소적이나(1~2w), 14개 싱글턴 전부를 컨테이너화 + config를 EntityForm에 주입하는 건 §1의 `useSession`
  인자화와 함께 묶어야 한다 → **합산 3~5 person-week**. **SSR 멀티테넌시를 명시적 판매 포인트로 걸지
  않는다면 P1이 아닌 P2로 미뤄도 되는, 결함이지만 봉쇄 가능한 문제.**

---

## 4. 부수 구조 결함 — 전부 제자리 수리 가능(근본 아님)

판정에 영향을 주므로 "이건 rewrite 근거가 아니다"를 못박는다:

- **God-class 5단 상속**: `EntityFormBase→Validation→Data→Actions→Extensions→EntityForm`
  (`config/form/*` 6파일, 1,991L)은 파일 분할로 위장한 단일 클래스이며, base가 최종 서브클래스를
  `instanceof EntityForm` 로 되짚는 죽은 방어(`EntityFormBase.tsx:482,558,605,665`,
  `EntityFormActions.tsx:460`)까지 있다. → **컴포지션(FormDataService/FormValidationService를
  EntityForm이 소유)으로 재설계**. 위험하지만 제자리 수리. 4~6pw.
- **clone aliasing 버그 (critical)**: `EntityForm.tsx:51` 이 `manageEntityForm` 만 참조 그대로 복사
  (`= this.manageEntityForm`)하는데 다른 필드는 전부 `new Map`/spread로 딥카피(`:55-91`). `withUpdatable`
  등이 spread 없이 직접 mutate(`EntityFormValidation.tsx:126-138`) → clone된 폼이 원본 권한 객체를
  공유하는 산발적 버그. **1줄 수정**(`{ ...this.manageEntityForm }`). 근본 아님, 즉시 수리.
- **SubCollectionField 4종 복붙**: `buildSearchForm`/`fetchOptions` 병합/tooltip/Suspense/clone 약
  300L가 Card/Table/Inline에 판박이(map-core-model §6). → 공유 abstract `FetchableSubCollectionField`.
  2~3pw.
- **권한 3중 복붙 + SubCollection 권한 누락**: `isPermitted` 가 `EntityTab.ts:42-50 ≈
  EntityFieldGroup.ts:54-62 ≈ FormField.tsx:853-860` 3중 복붙, 정작 `SubCollectionField` 엔 권한 체크가
  없고 `getVisibleCollections`(`EntityFormBase.tsx:588-625`)는 `isHidden` 만 본다 → **보안 경계
  불일치**. 단일 `PermissionPolicy` 유틸 추출 + SubCollection 적용. 2~3pw.
- **213개 순환 의존성**: `Config ↔ EntityForm ↔ components/fields` 삼각 순환(madge 실측, map-core-model
  §8). tree-shaking·부분 재사용을 구조적으로 막음 = **"새 프로젝트가 원 호스트 아키텍처에 종속된다"는
  불만의 기술적 근거.** §1의 필드 렌더러 레지스트리화 + 타입 전용 계약 분리로 대부분 해소. §1과 묶임.

---

## 5. Q4 — 목표 아키텍처와 생존율

### 5.1 레이어드 타깃 (schema-core / headless-state / renderer / adapters)

```
┌─────────────────────────────────────────────────────────────────────┐
│ adapters         @rchemist/listgrid-next, RuntimeConfig 요청스코프    │
│                  컨테이너, UI/Router/UrlState/Auth Provider           │
├─────────────────────────────────────────────────────────────────────┤
│ renderer         FieldRenderer 레지스트리(type→컴포넌트), ViewEntity  │
│  (React 종속)    Form/ViewListGrid, 40개 필드의 view() 본문           │
├─────────────────────────────────────────────────────────────────────┤
│ headless-state   createFormStore()/createListStore() 인스턴스별 store │
│  (React 무관)    셀렉터 구독, 값/메타 분리, 흐름 오케스트레이션        │
├─────────────────────────────────────────────────────────────────────┤
│ schema-core      EntityField(순수 메타), SearchForm, validations,     │
│  (프레임워크 0)  FieldType, 권한 정책 — JSX/Hook 0 참조               │
└─────────────────────────────────────────────────────────────────────┘
```

핵심 규칙 3개: (1) **schema-core는 `ReactNode`·React Hook을 import하지 않는다** — `EntityField.view()`
와 `useSession()` 호출을 이 계층에서 추방(§1). (2) **상태는 headless store에 산다** — 값/메타 분리, 참조
하나 구독 금지(§2 A). (3) **전역 설정은 adapters의 요청 스코프 컨테이너로** — 클래스 메소드는 주입받는다
(§3).

### 5.2 생존율 추정 (LOC 기준)

| 계층 | 원본 소스 | 생존 형태 | 생존율 | 비고 |
|---|---|---|---|---|
| schema-core | config `6,797` 중 mixin 제외 ≈ `4,800` + SearchForm/validations | 인터페이스에서 `view()` 제거, 나머지 로직 유지 | **~75%** | 계약 편집이지 로직 폐기 아님 |
| config/form mixin `1,991` | → 컴포지션 서비스로 재조직 | **~50%** | 상속→컴포지션 재배선, 로직 자체는 이전 |
| headless-state | `components/form` `5,782` + `list` 훅 일부 | store 기반으로 **재작성** | **~40%** | 초기화/저장/검증 로직은 이식, 배선은 신규 |
| renderer (fields) | `components/fields` `17,917` | `view()` 본문이 렌더러로 이사, 로직 대부분 유지 | **~80%** | 이 계층이 진짜 노동가치 — 거의 살아남음 |
| renderer (list/form UI) | `components/list` `11,628` + ViewEntityForm | 컴포넌트 분해 + store 소비로 전환 | **~65%** | ViewListGrid God-component 분해 필요 |
| adapters | RuntimeConfig/Provider 계층 | 요청스코프 컨테이너로 감쌈 | **~85%** | 방향 이미 옳음, 격리만 추가 |

**종합 생존율 ≈ 70~75%.** 파괴적 변경은 **~15~20% LOC**에 집중된다: EntityForm 상속 체인,
폼 상태 배선(useEntityFormLogic/FieldRenderer), 싱글턴→컨테이너. **`components/fields` 17.9k LOC —
전체의 34% — 가 대부분 생존한다는 점이 "rewrite 불필요"의 정량적 근거**다. 40개 필드의 렌더/검증/포맷
로직은 실제 도메인 노동이며 버릴 이유가 없다.

### 5.3 마이그레이션 총량과 순서

| 단계 | 작업 | pw | 위험 |
|---|---|---|---|
| 0 | 특성화 테스트 그물(useEntityFormLogic/FieldRenderer/useListGridLogic 0건 → 계약 테스트) | 3~4 | 낮음(선결) |
| 1 | clone aliasing 1줄 수정 + 권한 정책 추출 + SubCollection 4종 통합 | 4~5 | 낮음 |
| 2 | `EntityField` 계약 분리 + `view()` 렌더러 레지스트리화 + `useSession` 인자화 (§1) | 4~6 | 중(useSession 관통) |
| 3 | 값/메타 분리 + 인스턴스 store + 셀렉터 구독 + 드릴링 제거 (§2 A) | 8~12 | **높음(핵심)** |
| 4 | 상속→컴포지션 재조직 (§4) + 순환 의존성 해소 (§4) | 4~6 | 중 |
| 5 | RuntimeConfig 요청스코프 컨테이너 (§3, SSR 판매 시에만) | 3~5 | 중(선택) |

**합계 ≈ 20~30 person-week(단계 5 포함 시 상단).** 단계 0→1→2는 저위험 준비운동으로 즉시 착수 가능하고,
단계 3이 프로젝트의 성패를 가르는 코어다. 단계 3을 못 하면 나머지는 화장(cosmetic)에 그친다.

---

## 6. 최종 심판

**"근본 결함인가 수리 가능한가"에 대한 답: 골격은 살아 있고 수리 가능하다. 단, "제자리에서 다듬는"
수리가 아니라 "계층 경계를 새로 긋는" 수리다.**

- **버릴 것은 없다.** 필드 카탈로그(17.9k LOC)·SearchForm·테마 시스템·URL 어댑터·RuntimeConfig
  레지스트리 방향은 상용급 자산이다. rewrite-from-scratch는 이 자산을 태우는 오판이다.
- **그러나 3개 축은 in-place로 못 고친다**: ① 폼 상태를 "가변 클래스 참조 하나"에서 "인스턴스 store +
  셀렉터"로(§2 A), ② config에서 렌더 계약과 React 훅을 추방(§1), ③ 전역 싱글턴을 요청 스코프로(§3).
  이 셋은 계층을 새로 긋는 작업이라 "리팩터링"이 아니라 "재설계"로 예산을 잡아야 한다.
- **유지보수자의 3가지 불만 재판정**: (1) "UI/로직 스파게티" — 폼 최상위는 사실 아님(`ViewEntityForm`
  은 순수 렌더), 진짜 스파게티는 `ViewListGrid`(§list-runtime)와 config↔render 계약이다. (2) "권한이
  이상하다" — 사실이며 3중 복붙 + SubCollection 누락(§4). (3) "props 드릴링 + 재귀 ViewEntityForm" —
  사실이나 `SubViewEntityForm` 분리(후보 C)로는 못 고침, store 재설계(A)가 정답(§2).
- **가장 위험한 미보고 리스크**: config 클래스 안 `useSession()` 은 냄새가 아니라 **세션 필수 폼 +
  effect 경유 fetch 조합에서 재현되는 잠복 크래시**다(§1.2). 상용 배포 전 최우선 봉쇄 대상.

**한 문장 결론: 이 라이브러리는 "다시 쓸" 물건이 아니라 "계층을 다시 그을" 물건이다. 20~30 person-week의
레이어드 마이그레이션으로 70~75%의 코드를 살린 채 상용급으로 승격 가능하며, 성패는 폼 상태 모델
재설계(단계 3, 8~12pw) 하나에 달려 있다.**
