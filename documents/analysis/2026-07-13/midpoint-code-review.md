<!--
ANALYSIS ARTIFACT — 생성물
생성: 2026-07-13 · 세션: /progress 중간 점검 리뷰 (opus 세션)
방법: 7차원 워크플로우 팬아웃(sonnet/opus) + 발견별 opus 적대적 검증(REFUTE 지향) + 리드 세션 경험적 게이트/E2E 실측 + GX-6 거버넌스 직접 조사
팬아웃 통계: 23 에이전트(7 finder + 16 verifier)·0 error·1.45M subagent tokens·검증 판정 CONFIRMED 8 / PARTIAL 8 / REFUTED 0
검증 로그: §9 (모든 게이트/E2E/패키징 체크 실행 결과·file:line 인용) — 재현 가능
후속 실행 계약: §8 잔여 작업 원장(R1~R12 + G + GA-BRIEF) = /progress:next 등재 대상. 각 항목 실행급(파일·before→after·증명·수용·Do-NOT).
-->

# v0.4 재기초 중간 점검 — 코드 리뷰 및 실행급 개선 설계안

**대상**: `v0.4` 브랜치, GA 게이트 직전 (Phase P0~GX 완료 주장, HEAD `56a887e`)
**검토 질문(사용자)**: ① 계획대로 진행됐는가 ② 코드에 문제는 없는가 ③ 미구현 항목이 잘 계획되어 그대로 실행해도 안전한가
**이 문서의 용도**: 후속 opus/sonnet 세션이 **재유도 없이** 개선 작업을 실행할 수 있는 실행급 계약. 각 발견은 「증상·재현 → 근본원인(file:line) → **확정 설계안**(before→after) → 증명 방법 → 수용 기준 → Do-NOT」로 기술.

---

## 1. 한눈에 보기 (Executive Summary)

**총평**: 재기초 골격은 **구조적으로 건전**하다. 계획 정합성(CAP-01~29)은 대부분 충실히 이행됐고(공개표면 계수 49/57/188 독립 재현·레이어 순수성 유지·CAP-29 위젯 descope 확인), 게이트는 `format:check` 하나를 제외하고 전건 green(단위 2373·E2E 32·attw/publint/smoke/headless/codemod). PROGRESS 원장은 자기 이탈을 §Needs Review에 정직하게 추적한다.

**그러나 GA 봉인 전 반드시 처리해야 할 실코드 결함이 존재한다.** 팬아웃 7차원 + opus 적대적 검증(REFUTED 0)으로 확정:

| 우선순위 | 결함 | 심각도(검증후) |
|---|---|---|
| **R1** | `FormRuntime.reload()`가 스토어 write-path를 고아화 → **reload 후 폼이 완전 무응답**(입력·검증·저장 전멸, 조용한 데이터 유실) | 🔴 **CRITICAL (CONFIRMED)** |
| **R2** | 고급검색 재적용이 같은 필드 AND 절을 **누적** → `AND(name=ABC, name=XYZ)` → 빈 결과, 출하된 `ViewListGrid`의 통상 흐름에서 재현 | 🟠 **HIGH (CONFIRMED)** |
| R3~R8 | Xref required 오버라이드 무력화 · validateAll 비동기 clobber · FieldRenderer 예외 삼킴 · sessionStorage 빈문자 크래시 · TIER2 `[object Object]` export · DataImporter onSubmit 삼킴 | 🟡 MEDIUM ×6 |
| R9~R12 | clone() `this` 위반 · withId(undefined) · reset() 타이머 누수 · delete() `[undefined]` | ⚪ LOW ×4 |

**거버넌스 인시던트(리드 직접 조사) — GA 착수 전 선결**:
- 🔴 **GX-6 미커밋 WIP**: 이전 세션의 백그라운드 에이전트가 **이번 리뷰 중 완료**하며 워킹트리를 수정. **미결 Open Question**(공개 `BackendAdapter` 인터페이스에 `assetBaseUrl` 필드 추가 = "스펙 결정")을 **PROGRESS 원장에 GX-6 태스크도 없이** 선구현 → **발명 게이트 저촉**. 기전 자체도 결함(모듈 전역 싱글턴). → **사용자 결정 필요**(§7).
- 🟠 **`date.ts`가 커밋된 채 `format:check` 실패** → HEAD 자체가 게이트 위반인데 GX-3/GX-5는 "게이트 green"으로 기록.
- 🟡 **GA 게이트(CAP-28) 스펙이 얇음** — 최고 위험 잔여 태스크인데 파일경로·per-C 증명방법·커버리지 매트릭스 템플릿 부재(§5).

**결론**: 계획은 대체로 잘 이행됐고 잔여 계획도 방향은 옳으나, **GA 봉인을 지금 하면 CRITICAL/HIGH 2건이 그대로 출하**된다. R1·R2 수정 + GX-6 처분 + GA 브리프 실행급화가 GA 진입의 선결 조건이다.

---

## 2. 검토 범위와 방법

7차원 워크플로우 팬아웃(세션 컨텍스트 보호) + 발견별 opus 적대적 재검증(REFUTE 기본값). 경험적 게이트/E2E/패키징 체크는 리드 세션이 직접 실행(§9).

| 차원 | 스코프 | finder |
|---|---|---|
| A1 | 플랜 정합 & CAP-01~29 커버리지 | sonnet |
| A2 | schema-core 엔진 정확성 | opus |
| A3 | state/폼런타임 정확성 | opus |
| A4 | react 렌더러 정확성(기존 인시던트 클래스 재발 여부) | opus |
| A5 | 패키징 & 공개 표면/dts | sonnet |
| A6 | excel/utils/backend 어댑터 정확성 | sonnet |
| A7 | 잔여 작업 계획 품질(GA·Needs Review·Open Q) | sonnet |
| 검증 | material finding 16건 적대적 재검증 | opus |

읽은 규범 문서: `entityform-public-api-spec.md`(r2)·`entityform-api-implementation-waves.md`·ADR-0002/0003/0005/0009·`concept-charter.md`·`w7-post-seal-gap-analysis.md`·PROGRESS + phase archives.

---

## 3. 계획 정합성 (질문 ①: 계획대로 진행됐는가) — **대체로 충실**

A1(sonnet) + opus 검증. **CAP-01~29 커버리지**: CAP-02~27 전부 구현 코드 확인(present), CAP-01/15는 "wave 미할당·현행 유지"로 재감사 스코프 밖(unverifiable, 정직), CAP-28은 "미착수 GA 게이트"로 **정직하게 미완 보고**(false-completion 아님), CAP-29 위젯 descope는 `packages/*`에서 부재 확인(descoped-ok). 공개표면 계수 49/57/188은 `count-public-surface.mjs` 독립 재현. 레이어 순수성(schema-core가 /excel 미import) 유지. **원장은 정직**하다.

**계획 대비 이탈 3건**(게이트 스크립트가 못 잡는 유형 — 커버리지 매트릭스 규율이 존재하는 이유):

1. **CAP-10/L3 위반 — `EntityForm.clone()`이 `EntityForm` 반환**(spec Law L3 "모든 chainable은 `this` 반환(`clone(): this` 포함)" 위반). `FormField.clone()`·`EntityField.clone()`은 `this` 정확. 최상위 클래스만 누락. → R9.
2. **spec §3.1/L4 위반 — `withId()`가 `undefined` 미수용**(스펙은 "undefined=해제" 보편 법칙). → R10.
3. **GX-6 미커밋 이탈**(§6·§7) — 원장이 "미결"로 표기한 결정을 코드가 이미 구현 → 원장이 워킹트리와 불일치.

> 결론: 계획 이행 자체는 건전. 위 3건은 "코드=계획" 대조에서만 드러나는 정적-타입/계약 드리프트로, 런타임 게이트는 통과한다.

---

## 4. 코드 정확성 (질문 ②) — 확정 개선 설계안

각 항목은 후속 세션이 그대로 실행 가능하도록 before→after·증명·수용·Do-NOT을 명시한다. 심각도는 **opus 검증 후 보정값**. **⇒ 무결정(zero-decision) 실행 계약(항목별 exact before→after 코드 + 정확한 테스트)은 [rv-remediation-execution-plan.md](../../plans/rv-remediation-execution-plan.md)로 분리 저작**(13 authoring + 13 opus cold-executor 검증·residue closure 반영). 아래 §4는 근거·요약, 실제 패치는 실행 계획이 authority.

### 4.1 🔴 R1 — CRITICAL: `reload()`가 스토어 write-path를 고아화

- **증상/재현**: 사용자가 수정 폼을 열고, 어떤 액션이 `controller.reload()` 호출(한 번은 fresh 데이터가 보임) → 이후 필드를 편집하면 **화면이 전혀 갱신되지 않음**. 검증 표시·저장 에러 매핑·meta 반응성 전부 무응답. 사용자는 타이핑해도 반영이 없어 "저장 안 됨"으로 오인 → **조용한 데이터 유실**. (opus가 리포의 zustand 4.5.7로 직접 재현: `orig.setState(fresh.getState(), true)` 후 `orig.getState().setV(x)`가 **fresh**를 변경, orig 구독자 0명 통지.)
- **근본원인**: `packages/state/src/form-controller.ts:341` — `reload()`가 `store.setState(fresh.store.getState(), true)`(replace:true). `fresh`는 **별도** `createFormStore` 산물이라 그 액션들(setValue/hydrate/validateAll/setFieldErrors/addMessage/setMeta…)이 **fresh 자신의 set/get**을 클로저로 캡처(`form-store.ts:443`). replace로 원본 스토어의 액션까지 fresh 액션으로 덮어써짐 → 이후 원본 스토어의 구독자(React 필드 렌더러)는 영원히 통지받지 못함. React 계층은 `init.store` 동일 아이덴티티로 memo(`use-entity-form.ts:91`)라 remount도 없음. 유일한 reload 테스트(`form-controller.test.ts:669`)는 `getValue('name')==='fresh'`만 확인(=fresh의 getter라 통과)하고 **reload 후 편집/재렌더/저장을 전혀 실행하지 않아** 이 고아화를 못 잡음.
- **확정 설계안**: **액션 클로저를 절대 교체하지 않는다.** initialize 파이프라인을 **기존 스토어에 대해 재실행**하도록 리팩터.
  - `initialize-form-store.ts`: `initializeFormStore`에 `into?: FormStore` 옵션 추가. `into` 주어지면 새 `createFormStore`를 만들지 않고 **BIND/onInit/REBIND를 `into`의 자기 set/get로** 적용(데이터 슬라이스 fields/meta/fieldDefs/tabHidden/structureVersion/renderType/initialized 갱신).
  - `form-controller.ts:341` `reload()`: `initializeFormStore({ ...seed, into: store })`로 변경(fresh 스토어 생성·replace 제거).
  - **대안(최소 수술, 리팩터 부담 시)**: `store.setState({ fields, meta, fieldDefs, tabHidden, structureVersion, renderType, initialized }, false)` — replace 없는 shallow merge로 **데이터 키만 열거 복사**, 원본 액션 보존. (단 데이터 키 누락 리스크 → primary는 `into` 방식 권장.)
- **증명**: `form-controller.test.ts`에 신규 테스트 — reload() 후 ① 필드 `setValue` 호출 ② **원본 스토어 구독자가 fire** ③ `getValue`가 반영 ④ `addMessage`/`setFieldErrors`가 가시. 기존 reload 테스트 green 유지.
- **수용**: 신규 테스트 green + 전체 게이트 green.
- **Do-NOT**: 외부 스토어 state로 `setState(replace:true)` 금지 · 액션이 다른 스토어의 set/get를 캡처한 throwaway 스토어를 살아있는 트리에 주입 금지.

### 4.2 🟠 R2 — HIGH: 고급검색 재적용이 같은 필드 AND 절 누적 → 빈 결과

- **증상/재현**: 출하된 `ViewListGrid` 고급검색 패널에서 `name='ABC'` 검색 → 필드를 `name='XYZ'`로 고쳐 재검색 → 내부적으로 `AND(name=ABC, name=XYZ)` 생성 → **충족 불가능 필터로 0행 반환**(에러 없음). 통상적 "조건 수정 후 재검색" 상호작용에서 재현(페이지 리로드 없이 2회 apply).
- **근본원인**: `packages/react/src/components/ViewListGrid.tsx:267-278` `applyAdvancedSearch`가 `store.getState().searchForm`(누적된 폼)에서 시작해 각 비어있지 않은 값에 `.addAndFilter(...)` 폴딩, **이전 동명 절 제거 없음**. `search-form.ts:209-213` `addAndFilter`는 `c.filters.AND.push(item)`로 **의도적 스택킹**(de-dup 없음). 패널은 store searchForm을 리셋하지 않으므로 2차 apply는 반드시 누적 폼을 읽음.
- **확정 설계안**: SearchForm에 **이름 기준 제거 프리미티브** 추가 + 패널이 스택 대신 **교체**.
  - `packages/schema-core/src/search/search-form.ts`: 신규 public 메서드 `removeAndFilterByName(name: string): this` (해당 필드명의 기존 AND 절 전부 제거). *공개표면 +1 → /schema 188→189(≤190 유지). §3 계수 갱신 필요.*
  - `ViewListGrid.applyAdvancedSearch`: 패널이 소유한 필드명들에 대해 매 apply 시 **먼저 `removeAndFilterByName(name)` 후 현재 비어있지 않은 값만 `addAndFilter`** (또는 패널 소유 절 전량 제거 후 재구성).
- **증명**: react 테스트(신규 `advanced-search-reapply.test.tsx`) — name=ABC apply → name=XYZ apply → `searchForm`의 AND가 **단일 `{name:XYZ}`**임을 assert. E2E `college.spec.ts`(또는 신규)에 재검색 시나리오 추가.
- **수용**: 재적용 시 단일 절 · 단일 apply 동작 불변(기존 E2E 30 green).
- **Do-NOT**: `addAndFilter`의 스택킹 시맨틱을 바꾸지 말 것(다른 호출자 의존 — 문서화된 의도). **새 프리미티브**를 추가하라. · §Needs Review `#W5-3` risk 표기를 **low-med→high로 정정**(§8).

### 4.3 🟡 MEDIUM (R3~R8)

**R3 — Xref required 런타임 오버라이드 무력화** (`packages/schema-core/src/field/xref-mapping-field.ts:121-138`, `xref-prefer-mapping-field.ts:90-104`)
- **증상**: (A) 선언 시 `withRequired` 없이 xref 선언 → 런타임 `changeRequired`/`setMeta({required:true})` → **빈 매핑으로 저장이 통과**(막혀야 함). (B) `withRequired(true)` 선언 후 `setMeta({required:false})`로 완화 → **여전히 required로 실패**(완화 불가). 0.3의 `onChangeSetFieldRequired`(field 인스턴스 mutate) 대비 회귀.
- **근본원인**: xref required가 `CustomValidation`(`buildRequiredValidation`)으로 구현되어 `await field.isRequired(ctx)`(선언/조건부만)를 읽고 **EF1 store 오버라이드를 절대 참조 안 함**. 일반 required-blank 경로(`form-field.ts:151`)는 `override?.required`를 읽지만, `isBlank`(`value.ts:28-34`)가 `{mapped,deleted}` 엔벨로프를 **non-blank로 판정**해 xref엔 발화 못함. 또 `form-field.ts:164`는 validation에 override를 전달하지 않음.
- **확정 설계안**: EF1 오버라이드가 xref requiredness에 도달하게 한다.
  ① `isBlank`를 xref 엔벨로프 인지(빈 `mapped`=blank)하게 하되 **필드타입 가드**로 한정(전역 isBlank 변경 금지) → 일반 required 경로(`override?.required ?? isRequired`)가 xref에도 발화. ② 완화 케이스: 오버라이드 `required===false`면 xref CustomValidation을 단락. **구현자는 두 실패 시나리오(A/B)를 테스트로 먼저 작성**.
- **증명**: state/react 테스트로 시나리오 A(setMeta required:true→빈 매핑 저장 차단)·B(setMeta false→저장 허용) 재현. 기존 xref 테스트 green.
- **수용**: A/B 통과 · 선언시 `withRequired` 동작 불변.
- **Do-NOT**: 비-xref 타입의 `isBlank` 변경 금지 · 선언시 required 회귀 금지. *(EF1 오버라이드가 xref에 적용되어야 하는지 자체는 `field-meta.ts:6-9`가 "오버라이드가 선언 meta에 우선"으로 명시 — 스펙 정합, 발명 아님.)*

**R4 — validateAll이 동시 해소되는 async 체크를 clobber** (`packages/state/src/form-store.ts:843`)
- **증상**: 즉시/캐시 해소되는 async 체크가 validateAll의 await 창 중 해소되면 그 `'valid'` 쓰기가 **스냅샷의 `'checking'`으로 복원** → tri-state가 `'checking'`에 고착 → `asyncGateMessage`가 저장을 영구 차단(재편집 전까지).
- **근본원인**: `validateAll`이 `const s = get()`(816)·`const fields = {...s.fields}`(818) 스냅샷을 만들고, await 루프 후 `set({ fields })`(843)로 **전체 맵을 시작시점 스냅샷으로 교체**. 스토어 유일의 비함수형 set(다른 writer는 전부 `set((s)=>...)` 함수형).
- **확정 설계안**: 교체가 아니라 **함수형 머지**로 필드별 `errors`만 갱신: `set((cur) => ({ fields: mergePerFieldErrors(cur.fields, computedErrors) }))` — 최신 슬라이스를 updater 안에서 읽고 `errors` 키만 터치(asyncState/value 보존).
- **증명**: validateAll 도중 해소되는 async 체크 후 asyncState가 `'checking'`이 아니라 `'valid'`로 끝남을 assert.
- **수용**: 고착 없음 · 기존 validateAll 테스트 green.
- **Do-NOT**: 스토어에 비함수형 set 재도입 금지(843을 다른 writer와 정렬).

**R5 — FieldRenderer 술어 effect의 uncaught async IIFE**(인시던트 클래스 b 재발) (`packages/react/src/components/FieldRenderer.tsx:61-84`)
- **증상**: `required/isHidden/isReadOnly` 술어 중 하나라도 throw(작성자 버그 or ctx.values 일시 undefined) → `Promise.all` reject → **unhandled rejection + 세 게이트 전부 permissive 기본값(false)로 강등**. 필수 필드가 `*` 없이 렌더·빈 값 제출 허용, readOnly 필드가 편집 가능, hidden 필드가 노출.
- **근본원인**: effect가 `(async () => { ... await Promise.all([...]); if(!cancelled){...} })();`로 반환 promise를 버림(try/catch·`.catch` 없음). `getConditionalBoolean`(`conditional.ts:61-62`)도 술어를 try/catch 안 함. 형제 렌더러(many-to-one-renderer, custom-option-renderer)는 `.catch` 처리 — FieldRenderer만 예외.
- **확정 설계안**: IIFE 안 await를 try/catch로 감싸고, 에러 시 **permissive false가 아니라 last-known/선언 정적값 유지(required/readOnly는 fail-closed)** + 1회 로그. 세 술어를 `Promise.allSettled`로 **독립 해소**(하나의 throw가 나머지 둘을 강등시키지 않게). 형제 렌더러의 `.catch` 자세와 정합.
- **증명**: throw하는 required 술어 필드 → required가 **유지**(강등 안 됨), unhandled rejection 경고 없음.
- **수용**: throw 술어가 게이트 무력화 안 함 · rejection 경고 없음.
- **Do-NOT**: 에러 시 `required→false` 기본화 금지(그게 버그) · 동기 권한 하드게이트(`!permitted`)는 이미 안전하니 건드리지 말 것.

**R6 — `getSessionStorageObject`가 빈 문자열 값에 크래시** (`packages/utils/src/storage.ts:154-162`)
- **증상**: sessionStorage에 `''` 저장 후 `getSessionStorageObject` 호출 → `JSON.parse('')` → **SyntaxError**. 동일 케이스에서 `getLocalStorageObject`는 `undefined` 정상 반환(비대칭).
- **근본원인**: `getSessionStorageObject`는 `value === undefined`만 가드(159) 후 `parse(value!)`. 형제 `getLocalStorageObject`는 `isBlank(value)` 가드(120).
- **확정 설계안**: `if (value === undefined)` → **`if (isBlank(value))`**(getLocalStorageObject:120과 동일 가드).
- **증명**: `storage.test.ts` — `''` 저장 후 sessionStorage/localStorage 둘 다 `undefined` 반환 assert.
- **수용**: 크래시 없음 · 두 스토리지 대칭.
- **Do-NOT**: 특이사항 없음.

**R7 — TIER2 passthrough가 중첩 객체 행을 `[object Object]`로 export**(GJCU 데이터 의존·**GA 검증 항목**) (`packages/excel/src/value-transform.ts:182-183`)
- **증상**: 백엔드 list 응답이 manyToOne/xref/address 컬럼을 **중첩 관계객체**로 반환하면 export 셀이 리터럴 `"[object Object]"`(무결성 손상, 크래시 아님 → 리뷰서 놓치기 쉬움). manyToOne이 `AUTO_DERIVE_EXCLUDED_TYPES`(TIER3)에 없어 TIER2 `String(value)`로 낙하.
- **근본원인 + 조건성**: 기전은 확정(`String({id,name})==='[object Object]'`). 단 **실제 발현은 GJCU list-endpoint 행 형태에 의존**(평면 스칼라면 무해). 0.3도 동일 낙하(회귀 아님). `waves:120` §Needs Review `#W6-2b`가 이미 "실 GJCU 데이터 미검증"으로 추적 중.
- **확정 설계안(검증→적용)**: ① **GA 게이트에서 실 GJCU list 페이로드로 M2O/xref/address 컬럼이 평면 스칼라인지 중첩 객체인지 확인**. ② 중첩 객체 가능하면: **TIER2.5 분기** 추가 — 값이 객체면 설정된 `labelField` 추출, 아니면 `String`. (대안: 해당 타입을 TIER3 제외+warn.)
- **증명**: `export-core` 테스트 — M2O 행 값 `{id,name}` → 셀이 label(≠`[object Object]`).
- **수용**: 객체 행이 합리적 스칼라 export or 제외+warn.
- **Do-NOT**: **GJCU 행 형태를 추정하지 말 것 — 실 페이로드로 먼저 검증**(GA-blocking). → GA 브리프에 편입.

**R8 — `DataImporter.handleSubmit`이 reject하는 onSubmit 삼킴**(인시던트 클래스 b) (`packages/excel/src/DataImporter.tsx:90-98`)
- **증상**: 호스트 `onSubmit`(업로드 POST 등) reject 시 → **Submit 버튼만 재활성**되고 에러 표시 0 + **unhandled rejection**(콘솔만). 파싱 실패 경로는 `setError(PARSE_ERROR)`로 표시하는데 submit 실패는 대칭 처리 없음.
- **근본원인**: `try { await onSubmit(rows); } finally { setSubmitting(false); }` — **catch 없음**. `onClick={handleSubmit}`도 fire-and-forget.
- **확정 설계안**: await를 try/catch로 감싸 reject 시 `setError(SUBMIT_ERROR 메시지)` 호출, `finally`의 `setSubmitting(false)` 유지. 파싱 에러 경로와 대칭.
- **증명**: excel 테스트 — reject하는 onSubmit로 렌더 후 `role="alert"` 출현 assert(기존 PARSE_ERROR 테스트 미러).
- **수용**: submit 실패 시 alert 표시 · unhandled rejection 없음.
- **Do-NOT**: `finally` 제거 금지. *(host-owned 콜백이라 심각도 medium — 책임있는 호스트는 자체 catch 가능하나, 인시던트 클래스 재발 + 파싱 경로 비대칭이 실질 결함.)*

### 4.4 ⚪ LOW / INFO (R9~R12 — 기록·후순위)

- **R9 clone() `this`** (`entity-form.ts:1095`): `clone(includeValue=false): EntityForm`+본문 `new EntityForm(...)` → `clone(includeValue=false): this`+`new (this.constructor as new (name,url)=>this)(...)`(FormField:286 방식). 잠재(현 서브클래스 없음)이나 런타임도 하드코딩이라 미래 서브클래스가 base 인스턴스 반환. CAP-10/L3 대조표에 확인 노트.
- **R10 withId(undefined)** (`entity-form.ts:623`): 파라미터를 `id: string | undefined`로 확장, undefined 시 `this.id` 클리어(`withRevision:878` 패턴). spec §3.1이 요구 → 코드를 스펙에 맞춤(발명 아님).
- **R11 reset() 타이머 누수** (`form-store.ts:861`): `addField/removeField`처럼 `validationTimers`/`asyncValidationTimers`/`touchedFields` 클린업 추가. (검증 결과 저장 차단은 REFUTE됨 — dirty=false라 async 게이트 미발화; **잔여 피해는 리셋 필드에 잠깐 뜨는 'checking' 배지 + 1회 낭비 네트워크 체크**, 다음 validateAll에 자가치유. 시각 글리치 low.)
- **R12 delete() `[undefined]`** (`form-controller.ts:280`): create 모드에서 ids 없고 `getId()` undefined면 조기 반환(`{ok:false, reason:'capability'}`) — `[undefined]` 구성 방지.

---

## 5. 잔여 작업 계획 품질 (질문 ③: 그대로 실행해도 안전한가)

**대체로 양호하나 두 구조적 문제.** §Open Questions는 전부 `[x]`(미결 결정이 "이연"으로 숨지 않음 — 청결). §Needs Review ~12건은 대부분 파일포인터·해소조건이 명확·저위험·실행가능.

**문제 1 — GA 게이트(CAP-28) 스펙이 얇음** (검증후 MEDIUM):
- 최고 위험 잔여 태스크(0.4.0 출하 전 헌장 C1~C9 회귀를 잡는 유일 관문)인데 4곳이 동일하게 **한 줄**("CAP-28 헌장 C1~C9 대조표·별도 pass·인라인 판단"). spec §8 CAP-28은 C1~C9→CAP 매핑 **한 행**(무엇을 보존했나는 있으나 **어떻게 증명하나·per-C 증거·pass/fail 기준·커버리지 매트릭스 템플릿 부재**). 전용 브리프 문서 없음(직전 페이즈는 전부 브리프 보유).
- **완화 요인(검증서 확인)**: Do-NOT은 handoff에 상속됨 · CAP-28 행이 C1~C9 축 매트릭스 골격 · `concept-charter.md` 헤더가 "GA 게이트 대조표"이자 **판정 기준 정의**("명세 모호 시 현행 동작+특성화 테스트(P2)가 판정"). 즉 "제로에서 발명"은 아님.
- **확정 설계안**: → **GA-BRIEF**(§8) — GA 착수 전 실행급 브리프를 fable/opus 티어로 저작.

**문제 2 — 원장이 워킹트리와 불일치**(GX-6): §6 참조. `PROGRESS.md:134`의 "아무도 호출 안 함"·"=스펙 결정" 두 문장이 워킹트리 대비 **거짓**. 콜드스타트 GA 세션은 이 diff의 존재·공개 인터페이스 변경·`#GX-3` 라인 stale을 발견할 방법이 없음.

**리스크 등급 오표기 1건**: `#W5-3`(R2)이 `risk:low-med`인데 실제는 출하 컴포넌트의 통상 흐름에서 재현되는 조용한 오결과 → **high**. GA가 현 등급대로 이연하면 **사용자 가시 버그를 0.4.0 GA에 출하**.

---

## 6. 거버넌스 인시던트 — GX-6 (리드 직접 조사)

**정황**: 이전 세션이 브리핑한 백그라운드 에이전트 "Wire asset-base into adapter"(task `a5b2dacf…`)가 **이번 리뷰 세션 진행 중 완료**하며 워킹트리 수정(리뷰 시작 시점과 `git status` 상이 — `backend-rcm/adapter.test.ts`가 중간에 modified로 출현). 에이전트는 GX-6을 완결했으나 **커밋·PROGRESS 반영 없이 종료**. 자기 보고에서 "발명" 성격을 스스로 인지(deviations에 /schema 계수·조건부 spread 기재)하나 **미결 결정임은 미인지**.

**변경 내용(미커밋)**:
- `packages/schema-core/src/backend/adapter.ts:49-53` — 공개 `BackendAdapter` 인터페이스에 `assetBaseUrl?: string` 추가
- `packages/backend-rcm/src/adapter.ts:22-27,157-165` — `RcmAdapterOptions.assetBaseUrl` + 조건부 spread 전달(exactOptionalPropertyTypes 정합 — 타입상 건전)
- `packages/react/src/providers/adapter.tsx:1,3,43-49` — `useEffect(() => setAssetServerBase(adapter.assetBaseUrl), [adapter, adapter.assetBaseUrl])`
- `packages/react/package.json:21`(+lock) — `@listgrid/utils` 의존
- `packages/react/src/__tests__/adapter-asset-base.test.tsx`(**untracked**, 3케이스) · `backend-rcm/src/__tests__/adapter.test.ts`(2케이스)

**문제점 3층위**:
1. **거버넌스/발명 게이트**(A1·A7): `PROGRESS.md:134`·`phase-gx-tasks.md:54`·`ADR-0005:83`이 만장일치로 "**assetBaseUrl 필드 추가 여부=후속 스펙 결정**"인 미결 사안. `grep assetBaseUrl documents/plans/` = 공백(규범 스펙 침묵·§인용 없음). **PROGRESS 어디에도 GX-6 태스크 부재**. → 팀 Do-NOT ⑦("스펙 침묵 판단의 발명 금지")·CLAUDE.md 발명 게이트 저촉. 공개 인터페이스(GA CAP-24/28 감사 대상)에 발생.
2. **기전 결함**(A4·A6, 리드 `asset-url.ts:30,42,57` 독립 확인): `setAssetServerBase`가 **모듈 전역 싱글턴** `_injectedAssetServerBase`(최상위 우선순위)를 씀. AdapterProvider effect는 **unmount cleanup 없음**:
   - **다중 provider clobber**(client): 서로 다른 `assetBaseUrl`의 두 `<AdapterProvider>`가 한 페이지 → 마지막 effect가 전역 승리 → 다른 위젯 asset 오라우팅. per-adapter로 스코프된 ReferenceResolver 캐시(`adapter.tsx:41`)와 **구조적 비정합**.
   - **stale after unmount**: 마지막 provider unmount 후에도 주입값 잔존 → 전역 폴백 의존 코드가 stale 높은-우선순위 base로 계속 해석.
   - (SSR 멀티테넌트 레이스는 **REFUTE됨** — effect는 client 전용이라 SSR서 미발화. 단 그로 인해 SSR은 env 폴백/클라는 주입 → **hydration 불일치** 별개 gap.)
   - **현 시점 런타임 소비자 0**(grep clean — image/file 렌더러는 raw 값 직접 사용): **가시 피해는 잠재**, 활성 아님.
3. **패키징**(A5): react가 `@listgrid/utils` 의존을 얻었으나 **`packages/react/tsconfig.json` project reference에 `../utils` 누락**(다른 전 패키지는 1:1 미러). 결과: warm-cache 증분 `tsc -b`가 utils 공개 API 변경으로 인한 react 파손을 **놓침**(clean/CI 빌드는 잡음). → `typecheck:packages` 게이트 신뢰성 구멍(신규 GX-6 엣지 한정).
4. **게이트**: 미커밋 2파일 `format:check` 실패.

### 확정 설계안 — GX-6

**capability 자체는 정당**(0.3에 `ASSET_SERVER_URL`/`configureAssetServerUrl` 존재, asset URL 쓰는 소비자 있음). 그러나 **① 공개-API-필드 결정은 스펙 승인 선행**, **② 기전(전역 싱글턴)은 아키텍처적으로 오류**. 두 경로:

- **경로 A — capability 채택(권장 조건부)**: (i) `ADR-0005`/spec §2에 결정 기록 + §Open Questions 폐기 · (ii) 기전을 **React context 스코프로 재설계**(ReferenceResolver처럼 per-adapter — 전역 싱글턴 폐기) · (iii) `packages/react/tsconfig.json`에 `{ "path": "../utils" }` 추가 · (iv) format · (v) 정식 **GX-6 태스크 등재** + 계수 재확인.
- **경로 B — 이연(보수·발명게이트 존중)**: WIP revert/stash → `#GX-3` Open Question 상태 복원 → 소비자 실수요 전까지 seam 미사용.

**리드 권고**: **현 시점 런타임 소비자 0이라 긴급성 없음** → 발명 게이트를 존중하는 **경로 B(revert + 미결 복원)가 기본 권장**. 단 capability를 지금 확정하고 싶다면 **경로 A + context-스코프 재설계**(전역 싱글턴 커밋 금지). **어느 경로든 "현 WIP를 그대로 커밋"은 금지**(A1·A4·A5·A7 만장일치). → **이 처분은 공개 API+거버넌스로 사용자 결정 사항**(§7 질의).

> `date.ts` format 실패는 GX-6과 **무관**(별도 커밋된 파일) → 즉시 `prettier --write packages/utils/src/date.ts` 단독 수리 가능(§8 G-2).

---

## 7. 사용자 결정 필요 — GX-6 처분

§6 확정 설계안의 A/B 경로는 **공개 API 표면 + 발명 게이트**라 모델이 단독 결정하지 않는다. §8 PROGRESS 등재는 이 결정에 따라 갈린다. (질의는 본문 뒤에 별도 제시.)

---

## 8. PROGRESS 반영 권고 (/progress:next 등재 대상 — 실행급 원장)

후속 세션이 `bare /progress`로 재개할 수 있도록 아래를 §Tasks/§Needs Review에 등재. 각 R#의 상세 설계는 §4, 근거는 본 문서 인용.

| ID | 제목 | 심각도 | 파일 | 증명(테스트) | 우선순위 |
|---|---|---|---|---|---|
| **R1** | reload() write-path 고아화 수정(initialize into 기존 스토어) | 🔴 CRIT | state/form-controller.ts:341·initialize-form-store.ts | form-controller.test: reload후 편집 재렌더 | **GA 선결** |
| **R2** | 고급검색 재적용 de-dup(SearchForm.removeAndFilterByName + 패널 교체) | 🟠 HIGH | schema-core/search/search-form.ts·react/ViewListGrid.tsx:267 | advanced-search-reapply.test + E2E | **GA 선결** |
| R3 | Xref required 런타임 오버라이드 배선 | 🟡 MED | schema-core/field/xref-*-field.ts·form-field.ts·value.ts | 시나리오 A/B 재현 | GA 전 권장 |
| R4 | validateAll 함수형 머지(async clobber 제거) | 🟡 MED | state/form-store.ts:843 | async-in-validateAll 테스트 | GA 전 권장 |
| R5 | FieldRenderer 술어 try/catch + allSettled | 🟡 MED | react/components/FieldRenderer.tsx:61 | throwing-predicate 테스트 | GA 전 권장 |
| R6 | getSessionStorageObject isBlank 가드 | 🟡 MED | utils/storage.ts:159 | storage.test 대칭 | GA 전 권장 |
| R7 | TIER2 객체 export(실 GJCU 검증→labelField/TIER3) | 🟡 MED | excel/value-transform.ts:182 | export-core 객체행 | **GA 브리프 편입** |
| R8 | DataImporter onSubmit catch+setError | 🟡 MED | excel/DataImporter.tsx:90 | rejecting-onSubmit alert | GA 전 권장 |
| R9 | EntityForm.clone(): this | ⚪ LOW | schema-core/entity-form.ts:1095 | 타입+테스트 | 후순위 |
| R10 | withId(undefined) 수용 | ⚪ LOW | schema-core/entity-form.ts:623 | withId-undefined 테스트 | 후순위 |
| R11 | reset() 타이머/touched 클린업 | ⚪ LOW | state/form-store.ts:861 | reset-during-debounce | 후순위 |
| R12 | delete() create-mode ids guard | ⚪ LOW | state/form-controller.ts:280 | delete-no-id | 후순위 |
| **G-1** | GX-6 처분(§7 결정 반영) + `#GX-3` Needs Review 라인 정정 | 🔴 GOV | (결정 의존) | — | **GA 선결** |
| **G-2** | `date.ts` format 수리(`prettier --write`) — HEAD 게이트 위반 해소 | 🟠 GATE | utils/date.ts | format:check green | **즉시** |
| **G-3** | `#W5-3` risk 등급 low-med→high 정정 | 🟠 DOC | PROGRESS.md:128 | — | 즉시 |
| **GA-BRIEF** ✅ | CAP-28 GA 게이트 실행급 브리프 **저작 완료** → [ga-gate-charter-brief.md](../../plans/ga-gate-charter-brief.md)(per-C C1~C9 증거물 고정·매트릭스·게이트절차·Do-NOT·R7 folded-in) | 🟡 SPEC | documents/plans/ga-gate-charter-brief.md | opus 저작+앵커검증 | GA 선결(브리프는 완료) |

> **후속 실행 계약**: R1~R12의 **무결정 exact 패치+테스트** = [rv-remediation-execution-plan.md](../../plans/rv-remediation-execution-plan.md)(13 authoring + 13 opus cold-executor 검증). GA-BRIEF = [ga-gate-charter-brief.md](../../plans/ga-gate-charter-brief.md). 이 두 문서만으로 후속 opus/sonnet 세션이 **설계·결정 없이** 실행한다.

**게이트 재확인 사항**: R2가 SearchForm 공개 메서드 추가(+1) → `count-public-surface.mjs` /schema 189/190 확인. R1~R8 착지 후 full gate + E2E 재실행.

---

## 9. 검증 로그 (경험적 실측 — 재현 가능)

**환경**: Node `v26.4.0`(`.nvmrc`=22이나 P0-8 폴리필로 무회귀 확인) · branch `v0.4` · HEAD `56a887e`.

| 커맨드 | 결과 | 근거 |
|---|---|---|
| `npm run type-check` | ✅ exit 0 | gate.log |
| `npm test` (vitest) | ✅ **2373 passed / 1 todo** (183 files) | gate.log |
| `npx playwright test` | ✅ **32 passed** (43.4s) | e2e.log |
| `npm run lint` | ✅ exit 0 (0 err / 262 warn) | gate.log |
| `npm run build` (tsup) | ✅ exit 0 | gate.log |
| `npm run format:check` | ❌ **exit 1** — `packages/utils/src/date.ts`(커밋됨·GX-3)·GX-6 미커밋 2파일 | gate.log |
| `npm run check:surface` | ✅ EntityForm 49/55·root 57/120·/schema 188/190 | checks.log |
| `npm run check:exports` (attw) | ✅ No problems found | checks.log |
| `npm run check:publint` | ✅ exit 0 | checks.log |
| `npm run smoke:load` | ✅ cjs/esm ./schema ./state 로드 | checks.log |
| `npm run check:headless` | ✅ zero React peers | checks.log |
| `npm run codemod:test` | ✅ 4/4 fixture | checks.log |

**팬아웃 검증 통계**: 16 material finding 중 CONFIRMED 8 · PARTIAL 8(심각도 보정) · **REFUTED 0**(허위양성 생존 없음). 심각도 보정 사례: GX-6 invention high→med · reload CRIT 유지 · W5-3 low-med→high 상향 · GA-thin high→med · reset() med→low.

---

## 부록 — REFUTE/보정된 주장(정직성 기록)

opus 검증이 원 finder 주장을 축소/반박한 항목(허위 확대 방지):
- **GX-6 SSR 멀티테넌트 레이스**: REFUTE — effect는 client 전용이라 SSR 미발화(단 hydration 불일치는 별개 gap).
- **reset() async 저장 차단**: REFUTE — reset 후 dirty=false라 async 게이트 미발화·validateAll이 errors 재계산. 잔여는 시각 글리치뿐(med→low).
- **GA 게이트 "Do-NOT/매트릭스/파일경로 전무"**: 과장 — Do-NOT 상속·CAP-28 행이 매트릭스 골격·charter가 판정 arbiter 정의(high→med).
- **GX-6 tsconfig 누락 "현재 버그"**: 없음 — 현 시그니처는 정합, 미래 utils API 변경 시 warm-cache 증분에서만 누락(high→med).
