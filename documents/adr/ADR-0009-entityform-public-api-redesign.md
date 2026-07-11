# ADR-0009 — EntityForm 공개 API first-principles 재설계 (0.3 이식 접근 폐기)

**Status**: accepted · **Date**: 2026-07-11 · **선행**: ADR-0002/0003(엔진 내부 — 유지), ADR-0004(0.3 표면 재단 — 본 ADR이 EntityForm 표면에 한해 확장·대체)
**근거**: [구 189멤버 카탈로그](../analysis/2026-07-11/old-entityform-member-catalog.md) · [v0.4 현 표면](../analysis/2026-07-11/v04-public-surface.md) · [소비자 실사용 감사](../analysis/2026-07-11/consumer-usage-audit.md) · [API 감사](../analysis/2026-07-11/entityform-api-audit.md) · 사용자 지시(2026-07-11): "0.3 복붙이 아니라 enterprise-grade·npm publishable 수준의 first-principles 재설계"

## Context

- 구 EntityForm 표면은 **189 공개 멤버**(계획 추정 ~130의 1.45배)로, 5단 mixin에 20년치 accretion이 쌓인 형태다: 값 변경 진입점 5종 파편화, `getTitle()` 기본 `''`, `reload()` 완전 no-op, `withExcludeListFields` 첫 호출 무시, shallow-Map clone 데이터 누수, `withReadonly`/`withReadOnly` 대소문자 충돌, 뷰가 실행하는 client-extension(headless `.save()`는 훅 미발동) 등 결함이 표면 자체에 배어 있다.
- 소비자 실사용(5개 제품, ~12,500 호출)의 **90%+가 필드 빌더 체이닝 + `addFields` 골격**이다. 반면 client-ext(1파일)·revision(0)·alert(7)·attribute bag(field-level 0)·withCheckDuplicate(주석 처리=시도 후 포기)는 사실상 미사용. 동시에 소비자들은 권한 버튼 게이트·멀티테넌트 헤더·headless 진입·커스텀 필드 확장을 전부 **우회 구현**(gjcu `as any` 286회, egov 40파일 래퍼 패키지, showcase 컴포넌트 비마운트)으로 해결 중 — 표면이 크면서도 정작 필요한 1급 API가 없다는 증거.
- v0.4 신 표면(263 심볼)은 아직 **어떤 소비자도 pin하지 않았다**(전원 ^0.2/^0.3). 즉 0.4 내부 표면은 지금 자유롭게 재형성 가능하며, 지켜야 할 마이그레이션 계약은 0.3→0.4 단 하나다.

## Decision

**0.3 충실 이식(EG 24태스크 프레이밍)을 폐기하고, EntityForm 공개 API를 capability-complete 기준으로 제로베이스 재설계한다.** 엔진 내부(ADR-0002 store, ADR-0003 4계층, FormMutator seam, EF1~7 파이프라인)는 SOUND — 재설계 대상은 공개 표면이다. 상세 스펙은 [공개 API 스펙](../plans/entityform-public-api-spec.md)(규범)이 담고, 본 ADR은 원칙을 고정한다.

1. **2상(相) 모델을 명명으로 강제**: 선언(Declaration)과 런타임(Runtime)을 어휘로 분리한다. `with*`(슬롯 설정)·`add*`(컬렉션 추가)·`on*`(라이프사이클 훅 등록)·`without*`(선언 구조 제거)는 선언 전용, 전부 chainable. `set*`·동사형 액션(save/delete/reload)은 런타임 전용으로 store/FormMutator/FormController에만 존재. **EntityForm에서 `set*` 전면 제거, 두 단계에 걸친 동명 메서드 0개** — 동명이의(setValue/setTabHidden 2계층 공존) footgun을 구조적으로 소멸시킨다.
2. **라이프사이클 훅 통합**: onInitialize/onFetchData/submitTransform/postSave/postDelete/onFetchListData + client-ext 10종(사용 1파일)을 **8개 정준 훅**으로 통합 — `onInit`/`onChange`/`onBeforeSave`/`onAfterSave`/`onBeforeDelete`/`onAfterDelete`/`onBeforeListFetch`/`onAfterListFetch`. 전부 append-순서 실행, **엔진(FormController/list-store)이 실행 소유** — 뷰-실행 구조가 만들던 headless 갭을 폐기한다. priority/enabled/continueOnError 옵션 시스템은 도입하지 않는다(등록 순서=실행 순서).
3. **FormController 신설**(state 계층, React 0): save/delete/reload/validate의 CRUD 오케스트레이션 단일 진입점. ViewEntityForm 버튼과 headless 호스트가 같은 코드를 호출한다. 서버 검증 에러는 여기서 필드(name-키)+폼 메시지로 매핑(구 label-키잉 버그 미재현). `reload()`는 실동작(구 no-op 수리).
4. **표면 큐레이션**: 실사용·헌장 근거 없는 표면은 공개하지 않는다 — client-ext 시스템, alert API(→store `messages` 단일 채널로 흡수), attribute bag 9종(→`withMeta` 단일 타입드 슬롯), 폼-레벨 필드 sugar(withReadonly(name)/withOptions/withHelpText(name,…) — 선언은 필드 빌더로, 런타임은 mutator.setMeta로), withShouldReload(store 반응성으로 무의미), merge/copyEntityFormToInnerFields/cacheKeyFunc/버전 등. **구 버그는 전부 fix가 기본**이며 재현 금지.
5. **필드 확장 = 1급 계약**: 소비자 최대 실체는 커스텀 필드 서브클래스 80종+(gjcu). `FormField`/`OptionsField` 추상 베이스, 열린 `FieldType`(브랜디드 string 허용), 렌더러 레지스트리, `serializeValue`/`bindValue`/`getDisplayValue` protected seam을 공개 계약으로 문서화·고정한다(`as any` 286회의 근본 해소).
6. **패키지 계약**: 단일 npm 패키지 `@rchemist/listgrid` + subpath exports(`/schema` `/state` `/ui-default` `/backend-rcm` `/next` `/excel` `/presets` `/presets/rcm`). 루트 peer는 react/react-dom만; 무거운 의존은 subpath 뒤로. `/schema`+`/state`만으로 headless wire-format 소비 가능(showcase 사례의 1급화). sideEffects:false, ESM-first(ADR-0001).
7. **명명·타입 법칙**: camelCase 통일(`readOnly`, `placeholder`), 모든 chainable은 polymorphic `this`, 모든 옵션 setter는 `undefined`로 해제 가능(exactOptionalPropertyTypes-safe), 조건부 값은 C2 policy-as-data 형태(`boolean | (ctx)=>…`)로 통일. semver: 0.x에서 BREAKING=MINOR 승격, @deprecated 1-MINOR 유예(ADR-0004 §2/3 계승), 공개 심볼 수 CI 계수.

## 기각한 대안 (Do-NOT — 재론 금지)

- **0.3 충실 이식(189멤버 API-parity)** — 결함(no-op/copy-paste/누수)까지 계약이 되고, semver freeze 불가능한 accretion을 0.4에 복제한다. capability는 전부 보존하되 표면은 재설계(사용자 확정 2026-07-11).
- **client-extension 시스템 보존** — 전 소비자 1파일 사용, 뷰-실행 구조 결함, 정준 훅 8종이 상위 호환으로 흡수. priority/enabled 메타옵션은 YAGNI.
- **react-hook-form/TanStack Form 재검토** — ADR-0002 기각 유지.
- **다중 npm 패키지 분리 배포**(@rchemist/listgrid-core 등) — 소비자 설치·버전 정합 부담 증가. 모노레포 내부 분리는 유지하되 배포는 단일 패키지+subpath.

## Consequences

- **0.3→0.4 마이그레이션 실비용 발생**(GJCU/edustack — 사용자 감수 확정): 재명명 계열은 codemod(정규식 치환) 수준(`useListField()`→`withList()`, `withOnInitialize`→`onInit` 등)이나, **EntityForm-레벨 name-키 sugar(gjcu `withHidden(name,…)` 774회 등)와 훅 컨텍스트 이동은 수동**(1:1 대응표 필수). 실사용 116멤버 전수의 대응표를 스펙 §9가 담는다.
- **0.4 내부 재작업 비용(허위 "무비용" 정정)**: EF6 `withSubmitTransform`·EF7 `setValue/setFetchedValue`는 0.4에 이미 출하(전용 테스트+sample 사용) — onBeforeSave/InitContext 대체 시 해당 테스트·샘플 재작성이 W1/W2 스코프에 계상된다. 외부 소비자는 0이므로 마이그레이션 계약 부담은 없음.
- transplant-EG 24태스크 blueprint는 capability 체크리스트로만 유효(무엇이 존재해야 하나). 구현 wave는 스펙 §구현 재편이 대체한다.
- 0.4.0 GA 게이트(헌장 대조표)는 신 표면 기준으로 재작성 — C1~C9 각각의 구현 위치가 스펙 §커버리지에 매핑된다.

## 수용 기준

- [ ] EntityForm 공개 멤버 ≤ 45 (구 189 대비 ≥75% 감축 — 계수 규칙은 스펙 §10 게이트 2, 현 스펙 44) — capability 손실 0 (스펙 §8 CAP 매트릭스에 빈 행 없음)
- [ ] `set*` 메서드가 EntityForm에 0개, 라이프사이클 훅 실행이 뷰 코드에 0개(엔진 소유)
- [ ] 구 결함 원장(카탈로그 Cross-Cutting §1-9) 전 항목이 신 표면에서 구조적 재현 불가
- [ ] 실사용 116멤버 전부에 신 API 대응(또는 명시 폐기+대체 경로)이 MIGRATION 표에 존재
- [ ] `/schema`+`/state`만 import하는 headless 소비가 React/UI peer 0으로 빌드됨(테스트로 고정)
