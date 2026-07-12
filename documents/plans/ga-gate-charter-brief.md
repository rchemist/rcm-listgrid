# GA 게이트 — 개념 헌장 C1~C9 대조 실행급 브리프 (CAP-28)

**대상**: `v0.4` 브랜치 0.4.0 GA 봉인 직전 · **성격**: 순수 검증(zero-design) 실행 계약
**상류 문서**: [concept-charter.md](../prd/concept-charter.md) (C1~C9 원본 + arbiter) · [entityform-public-api-spec.md §8 CAP-28 행](./entityform-public-api-spec.md) (~L326) · [midpoint-code-review.md §5](../analysis/2026-07-13/midpoint-code-review.md)
**전제**: R1·R2·G-1·G-2가 착지된 뒤 실행(§8 원장). 이 브리프는 CAP-28 자체의 실행 계약이다.

---

## 1. 목적과 판정자(arbiter)

**목적**: 헌장 §68의 GA 게이트 3요건 중 **요건 2(헌장 대조표)**를 기계적으로 닫는다 — C1~C9 각각에 대해 "신 엔진 구현 위치 + 시연 시나리오"를 **실재 증거물**로 미리 고정하고, GA 세션은 나열된 커맨드를 실행해 결과를 §5 매트릭스에 **대조(match)만** 한다. GA 세션은 어떤 설계 판단도, 새 테스트 작성도, 코드 수정도 하지 않는다.

**판정자(헌장 §L5 인용)**: *"현행 코드(v0.3.x)는 이 헌장의 레퍼런스 구현이다: 명세가 모호하면 현행 동작 + 특성화 테스트(P2)가 판정 기준이다."* 따라서:
- **명세가 명확한 C** → 아래 표의 pass/fail 기준을 그대로 적용.
- **명세가 C7(호스트 주입)과 겹쳐 모호한 C9의 'URL 상태 동기화'** → arbiter 발동: 엔진은 **직렬화 가능 searchForm seam**(`SearchForm.toJSON` + `createListStore({initialSearch})`)만 소유하고 URL 바인딩은 **호스트 라우터 주입(C7)** 몫 — 이것이 현행 동작이자 판정 기준이다. GA는 seam 존재를 매칭하고 "present(seam+host-injection)"로 판정한다(설계 재개 금지).

**요건 1(특성화 테스트 P2 동일 통과)**과 **요건 3(GJCU급 실 엔티티 재현)**은 이 브리프의 게이트 절차(§3)에 **folded-in** 되어 함께 판정된다.

---

## 2. per-C 대조표 (증거물 사전 고정 — 빈 행 금지)

각 행: **C-id | 헌장 주장 | 증거물(file:line / 테스트명) | pass/fail 기준**. 모든 증거물은 `v0.4` HEAD에서 실재 확인됨.

| C | 헌장 주장(요약) | 증거물 (실재) | pass/fail 기준 |
|---|---|---|---|
| **C1** | 한 곳 선언 → 리스트+폼 둘 다 파생. 체이너블 `withXxx` 문법 | **엔진**: `packages/schema-core/src/entity-form.ts:452`(`class EntityForm`) · `packages/schema-core/src/field/form-field.ts:265`(`withList` 컬럼 파생) · `packages/react/src/components/ViewListGrid.tsx:192`(`ViewListGrid`) · **선언 1종**: `apps/sample/lib/entities/college.ts` · **시연 페이지**: `apps/sample/app/college/page.tsx`(리스트)+`apps/sample/app/college/[id]/page.tsx`(폼) · **특성화**: `tests/characterization/view-entity-form.test.tsx:74,110`(동일 선언에서 CREATE/UPDATE 폼 파생) · **E2E**: `e2e/college.spec.ts:9`("College CRUD round-trips") | `e2e/college.spec.ts:9` green **AND** 단일 `college.ts` 선언이 `college/page.tsx`(list)와 `college/[id]/page.tsx`(form) 양쪽을 구동(별도 컬럼 정의 파일 부재). PASS=green+양방 파생 확인 |
| **C2** | hidden/readonly/required/권한을 **조건부 선언(데이터)**으로. 어휘 ALWAYS/HIDDEN/VIEW_ONLY/MODIFY_ONLY/ADD_ONLY, `withRequiredPermissions`, 함수형 conditional | **엔진**: `packages/schema-core/src/field/conditional.ts:33`(`ConditionalBooleanValue`) · `packages/schema-core/src/field/view-preset.ts:17-28`(`ALWAYS`/`HIDDEN`/`ADD_ONLY`/`MODIFY_ONLY`/`VIEW_ONLY`) · `packages/schema-core/src/field/form-field.ts:223`(`withRequiredPermissions`) · **선언**: `apps/sample/lib/entities/collabo.ts`, `perm-demo.ts` · **E2E**: `e2e/collabo.spec.ts:12`(조건부 readOnly+가시성+required가 폼 상태에 반응)·`:121`(type cascade가 required 게이팅) · `e2e/tab-permission.spec.ts:11`(requiredPermissions가 탭/그룹 게이팅) | `e2e/collabo.spec.ts:12` **AND** `:121` **AND** `e2e/tab-permission.spec.ts:11` 모두 green. PASS=조건부 정책이 if-분기 없이 선언에서 화면 상태를 구동 |
| **C3** | 관계 1급: ManyToOne(검색+팝업+필터), SubCollection(인라인/테이블 CRUD, mappedBy 자동필터, 격리 상태) | **엔진**: `packages/schema-core/src/field/many-to-one-field.ts` · `packages/schema-core/src/field/sub-collection-field.ts` · `packages/react/src/registry/many-to-one-renderer.tsx`·`sub-collection-renderer.tsx` · **E2E**: `e2e/professor.spec.ts:8`(degrees SubCollection가 격리 자식 폼으로 행 추가·저장) · `e2e/college.spec.ts:55`(dean M2O 피커 선택·저장) · `e2e/collabo.spec.ts:73`(M2O 중첩 autofill) · **특성화**: `tests/characterization/view-entity-form.test.tsx:329,338,510`(SubCollection: mappedBy AND-filter로 POST `{childUrl}/search`, 재진입) · `tests/characterization/field-renderer.test.tsx:322`(ManyToOneField 렌더+선택) | `e2e/professor.spec.ts:8` **AND** `e2e/college.spec.ts:55` **AND** `e2e/collabo.spec.ts:73` green **AND** 특성화 SubCollection describe(`view-entity-form.test.tsx:329`) green. PASS=외부참조가 id-텍스트박스로 퇴화하지 않음(피커+자식폼 실재) |
| **C4** | 40+ 필드 타입이 5문맥(입력·셀·필터·엑셀·검증)을 앎 + 미시결정(빈값 정규화·0/null·한국 전화/주소) 이식. 신규=클래스1+렌더러1 | **엔진**: `packages/schema-core/src/field/*.ts`(29 필드 클래스) · `packages/react/src/registry/`(30 렌더러) · `packages/react/src/registry/field-renderer-registry.tsx`(`registerFieldRenderer`) · **P2 특성화(미시결정 증명)**: `tests/characterization/form-logic.test.tsx:258-363`(빈문자 정규화 non-dirty / `0` non-normalized dirty / 빈배열 dirty / no-op set non-dirty) · `tests/characterization/field-renderer.test.tsx:58-410`(String/Number/Select/Date/Boolean/M2O 렌더+검증 미시결정) · `e2e/student-address.spec.ts:81,141`(한국 주소 composite→flat 왕복) | 전체 vitest suite green **AND** 위 특성화 파일 2종 무회귀(헌장 요건1과 동일 관문). PASS=P2 특성화 동일 통과(미시결정 보존 증명). *count(40+)는 판정 기준 아님 — 현행 이식분이 arbiter* |
| **C5** | 검증 선언(12종+커스텀+조건부), 변경시 필드스코프/저장시 전체, `onChange` 연쇄, 오류 필드귀속+폼병합(서버오류 동일채널) | **엔진**: `packages/schema-core/src/onchanges/change-required.ts`·`change-hidden.ts`·`change-select-options.ts`(onChange 연쇄) · store.messages 단일채널(spec CAP-04/14/21) · AsyncValidation(trigger:'button') · **E2E**: `e2e/async-validation.spec.ts:11,33,51,64,82`(중복확인 tri-state + Save 게이팅 + stale valid 무효화) · `e2e/collabo.spec.ts:43`(promoterType 상호배제 값 클리어)·`:73`(M2O 연쇄 autofill) · **특성화**: `tests/characterization/form-logic.test.tsx:192`(required-blank 클라이언트 거부, network 0) | `e2e/async-validation.spec.ts`의 5 테스트 전부 green **AND** `e2e/collabo.spec.ts:43` green. PASS=검증/연쇄가 선언에서 실행되고 오류가 필드 귀속 |
| **C6** | 탭/필드그룹/생성스텝/자동저장/리비전/엑셀 왕복 — 전부 선언 위 선언 | **엔진**: `packages/schema-core/src/entity-form.ts:829`(`withSteps`)·`:878`(`withRevision`) · addFields Tab/GroupInput(CAP-02) · `/excel` subpath(CAP-17) · **E2E**: `e2e/steps-demo.spec.ts:10,47,62`(위저드 3스텝·크로스스텝 값 보존·저장) · `e2e/college-excel.spec.ts:37,56`(export .xlsx + import 왕복) · **특성화**: `tests/characterization/view-entity-form.test.tsx:222-320`(STEP/WIZARD 게이팅) · `tests/characterization/form-logic.test.tsx:365`(탭 네비 상태) | `e2e/steps-demo.spec.ts:10` **AND** `e2e/college-excel.spec.ts:37,56` green. **descope 명시(재개 금지)**: 자동저장(이탈복구)·리비전 히스토리 **뷰**는 CAP-29로 0.4 GA 밖 — `withRevision` 선언 seam은 present이나 히스토리 뷰어 부재는 회귀 아님(spec:327). PASS=탭/그룹/스텝/엑셀 green + descope 항목은 매트릭스에 'descoped-ok' |
| **C7** | 엔진 무소유: 프리미티브·라우터·URL·세션·HTTP·메시지·i18n 전부 호스트 주입. schema-core+state는 React 0%. 미주입시 문서화 폴백+경고 | **엔진**: `packages/react/src/providers/ui.tsx`(`UIProvider`)·`router.tsx`·`adapter.tsx`·`auth.tsx`(4 주입 seam) · `packages/react/src/registry/field-renderer-registry.tsx`(프리미티브 교체) · **게이트**: `npm run check:headless`(scripts/headless-check.sh — `/schema`+`/state`에 React peer 0) · `npm run check:exports`(attw) | `npm run check:headless` exit 0(schema-core+state React import 0) **AND** `npm run check:exports` "No problems found". PASS=레이어 순수성 유지 + 4 주입 provider 실재 |
| **C8** | CRUD URL조립·응답해석·오류의미가 `BackendAdapter` 계약 뒤. RCM=1급 기본, 타 백엔드=어댑터1개 | **엔진**: `packages/schema-core/src/backend/adapter.ts:25`(`interface BackendAdapter` — list/getOne/create/update/remove) · `packages/backend-rcm/src/adapter.ts`(`createRcmAdapter` 1급 구현) · **E2E**: `e2e/backend-contract.spec.ts:12`(404가 RFC7807 ProblemDetail, 구 `{error:{message}}` 아님)·`:34`(search가 9필드 SearchResponse) | `e2e/backend-contract.spec.ts:12` **AND** `:34` green. PASS=관례가 어댑터 뒤에 격리(코어 하드와이어 부재) |
| **C9** | 리스트 기본내장: 페이지네이션·다중정렬·퀵서치·고급검색·필터·컬럼선택·행선택/일괄·**URL 상태 동기화**·행 액션 | **엔진(store)**: `packages/state/src/list-store.ts:26-38`(`setPage`/`setPageSize`/`setSort`/`quickSearch`/`setSearchForm`) · **엔진(UI)**: `packages/react/src/components/ViewListGrid.tsx:285`(퀵서치)·`:298`(고급검색 패널)·`:394`(행선택 체크박스)·`:425`(일괄확정)·`:440`(Pagination)·`:388`(`data-row-id` 행 액션 seam) · **URL seam(arbiter)**: `packages/schema-core/src/search/search-form.ts:274`(`toJSON` 직렬화) + `packages/state/src/list-store.ts:44,78`(`initialSearch` 복원) + 호스트 라우터 주입(C7) · **특성화**: `tests/characterization/list-logic.test.tsx:41`(퀵서치/필터 wire)·`:135`(페이지네이션)·`:243`(다중정렬)·`:311`(행선택+일괄삭제 wire) · **E2E**: `e2e/college.spec.ts:87`(고급검색)·`e2e/college-delete.spec.ts:12`(행 삭제) | 9 하위세트 각각 증거물 매칭: 페이지네이션/정렬/퀵서치/행선택-일괄 → `list-logic.test.tsx` describe green; 고급검색/필터 → `college.spec.ts:87` green; 행액션 → `ViewListGrid.tsx:388` seam 존재; **URL동기화 → arbiter 발동**: `SearchForm.toJSON:274`+`initialSearch:44` seam 존재로 "present(seam+host-injection)". PASS=9 하위세트 중 소비자 몫으로 밀린 것 0(URL은 seam+주입으로 충족) |

> **빈 행 검사**: 위 9행 모두 실재 file:line 또는 테스트명으로 채워짐 — 헌장 §71 "빈 행 있으면 GA 불가" 요건 충족.

---

## 3. 기계적 게이트 절차 (GA 세션이 그대로 실행)

순서대로 실행하고 각 결과를 §5 매트릭스 evidence 칸에 붙여넣는다. **모든 커맨드는 리포 루트에서.**

### 3.1 전체 게이트 (요건 1 특성화 포함 — vitest가 `tests/characterization/*` 포함)
```bash
npm run type-check      # tsc --noEmit → exit 0 기대
npm run test            # vitest run → 전건 green (특성화 P2 포함) 기대
npm run lint            # eslint → exit 0 (warn 허용) 기대
npm run build           # tsup + build:styles → exit 0 기대
npm run format:check    # prettier --check → §4 Do-NOT 참조(HEAD 기존 실패 분리)
```

### 3.2 E2E (C1~C9 시연 시나리오 — 요건 2·3 시연축)
```bash
npm run test:e2e        # playwright test → 32+ passed 기대
# 개별 재확인이 필요하면 per-C 스펙만:
npx playwright test e2e/college.spec.ts e2e/professor.spec.ts e2e/collabo.spec.ts \
  e2e/tab-permission.spec.ts e2e/async-validation.spec.ts e2e/college-excel.spec.ts \
  e2e/steps-demo.spec.ts e2e/backend-contract.spec.ts e2e/college-delete.spec.ts \
  e2e/student-address.spec.ts
```

### 3.3 공개 표면 & 패키징 (C7 레이어 순수성 + 계수 무드리프트)
```bash
npm run check:surface   # EntityForm 49/55·root 57/120·/schema 188/190 기대 (R2 착지시 /schema 188→189, ≤190 유지 확인)
npm run check:exports   # attw → "No problems found"
npm run check:publint   # exit 0
npm run smoke:load      # cjs/esm ./schema ./state 로드
npm run check:headless  # schema-core+state React peer 0 (C7 판정)
npm run codemod:test    # 4/4 fixture
```

### 3.4 요건 3 — GJCU급 실 엔티티 재현 + R7 GJCU-shape 확인 (folded-in)
- **재현**: `apps/sample`의 GJCU급 엔티티(`college`/`professor`/`collabo`)가 리스트+폼+관계+엑셀을 실제로 구동함을 §3.2 E2E(college/professor/collabo/college-excel spec)로 확인 — 별도 작업 아님, 위 green이 곧 요건3 충족.
- **R7 GJCU-shape 확인(체크만, 수정 금지)**: 실 GJCU/edustack list-endpoint 페이로드에서 **manyToOne/xref/address 컬럼이 평면 스칼라인지 중첩 관계객체인지** 확인한다. 근거: `packages/excel/src/value-transform.ts:182`의 TIER2 `String(value)` 폴백은 중첩객체를 `"[object Object]"`로 export(무결성 손상, 크래시 아님).
  - **평면 스칼라** → R7 무해, 매트릭스에 'R7-flat-ok'.
  - **중첩 객체** 또는 **실 페이로드 확인 불가** → 매트릭스에 'R7-nested / unverified' + **R7 후속 태스크 유지**(§8 원장). **인라인 수정 절대 금지**.

---

## 4. Do-NOTs (GA 세션 규율 — 위반=발명/오판정)

1. **게이트 중 코드 수정 금지**. C1~C9 회귀·결함을 발견하면 **인라인 수정하지 말고** PROGRESS §Tasks에 후속 태스크로 등재만 한다. 수정은 별도 세션의 일 — GA는 판정만 한다.
2. **봉인 결정 재개봉 금지**:
   - CAP-29 descope(자동저장/리비전 히스토리 뷰, `QrField`·`KakaoMap` 지도뷰·`ViewApiSpecification`·`XrefPriceMappingField`) — 부재는 회귀 아님.
   - GX-6 처분(§7 사용자 결정 대기) — 이 게이트에서 결정하지 않는다.
   - `addAndFilter` 스택킹 시맨틱(R2는 별 프리미티브로 해결됨) — 시맨틱 변경 금지.
3. **매칭으로만 판정, 설계로 판정 금지**. 증거물이 없거나 모호하면 매트릭스에 `partial`/`missing`으로 기록 + 후속 태스크. **증거물·테스트를 새로 발명하지 말 것**(새 테스트 작성은 GA의 일이 아님 — 필요하면 후속).
4. **HEAD 기존 게이트 위반을 헌장 회귀로 오인 금지**. `format:check`는 HEAD에서 `date.ts`(G-2)·GX-6 미커밋 WIP(G-1)로 이미 실패한다 — 이는 **별도 추적 항목**이며 C1~C9 판정과 **분리**한다. (전제대로 R1·R2·G-1·G-2 착지 후 실행하면 green이어야 하며, 그렇지 않으면 그 전제 미충족을 기록.)
5. **R7 GJCU-shape 추정 금지** — 실 페이로드 확인 없이 "평면일 것"으로 판정하지 말 것. 확인 불가 시 'unverified' + R7 후속 유지, 중첩객체 발견 시에도 인라인 수정 금지.

---

## 5. 커버리지 매트릭스 템플릿 (GA 세션이 채움)

각 행을 §2 증거물 매칭 + §3 커맨드 결과로 채운다. **verdict는 present / partial / missing / descoped-ok 중 하나** — 판단이 아니라 매칭 결과다.

| C-id | verdict | evidence (커맨드 출력 / 테스트명 / file:line) |
|---|---|---|
| C1 | ⬜ present/partial/missing | `e2e/college.spec.ts:9` = ____ ; college.ts→list+form 파생 = ____ |
| C2 | ⬜ | `e2e/collabo.spec.ts:12,:121` = ____ ; `tab-permission.spec.ts:11` = ____ |
| C3 | ⬜ | `professor.spec.ts:8` = ____ ; `college.spec.ts:55` = ____ ; `collabo.spec.ts:73` = ____ ; 특성화 `view-entity-form.test.tsx:329` = ____ |
| C4 | ⬜ | vitest green = ____ ; `form-logic.test.tsx:258-363` = ____ ; `field-renderer.test.tsx` = ____ (P2 무회귀=요건1) |
| C5 | ⬜ | `async-validation.spec.ts`(5) = ____ ; `collabo.spec.ts:43` = ____ |
| C6 | ⬜ | `steps-demo.spec.ts:10` = ____ ; `college-excel.spec.ts:37,56` = ____ ; 자동저장/리비전뷰 = **descoped-ok(CAP-29)** |
| C7 | ⬜ | `npm run check:headless` = ____ ; `check:exports` = ____ ; 4 provider 실재 = ____ |
| C8 | ⬜ | `backend-contract.spec.ts:12,:34` = ____ |
| C9 | ⬜ | `list-logic.test.tsx:135,243,311,41` = ____ ; `college.spec.ts:87` = ____ ; URL동기화=**present(seam `search-form.ts:274`+`list-store.ts:44`+host-injection, arbiter)** |
| — 게이트 | ⬜ | type-check ___ / test ___ / lint ___ / build ___ / format:check ___ / e2e ___ / check:surface ___(계수) / R7-shape ___ |

**GA 판정 규칙**: 9 C행이 전부 `present` 또는 `descoped-ok`(C6 일부) **AND** §3 게이트 전건 green(전제 R1·R2·G-1·G-2 착지 후) → **헌장 요건2 충족, GA 봉인 진행 가능**. 하나라도 `partial`/`missing`/`unverified` → 봉인 보류 + 해당 후속 태스크 등재(수정은 별도 세션).

---

## 6. 근거 추적 (감사)

- per-C 증거물은 `v0.4` HEAD `56a887e` 기준 실재 확인(파일·라인·테스트명 grep 검증).
- C9 URL-동기화 arbiter 처리: 헌장 §60(C9는 URL동기화 내장) vs §52(C7은 URL을 호스트 주입) 충돌 → §L5 arbiter로 "seam(엔진) + 주입(호스트)"이 현행 동작임을 확정, 설계 재개 없이 매칭.
- C4 count(40+) 비판정: 현행 이식분(29 필드/30 렌더러)이 arbiter 기준 — 헌장 §38 "재작성 아니라 이식", §L5.
- R7 folded-in 근거: [midpoint-code-review.md §4.3 R7 / §8 원장](../analysis/2026-07-13/midpoint-code-review.md)("GJCU 행 형태 추정 말 것 — 실 페이로드 먼저 검증, GA-blocking").

