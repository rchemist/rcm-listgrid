# Phase EF-SP Task Archive

## EFSP-0

스펙 query 복구 + SQLite proof lab/AST 게이트 — 2026-07-13

### Reuse review

- **Extend**: `packages/schema-core/src/entity-form.ts` — 기존 정렬·조회 규칙에 스펙 확정 query 4개만 추가한다.
- **Extend**: `apps/sample/lib/mock-backend/store.ts` — `EntityStore`의 CRUD/search 계약은 유지하고 persistence seam만 추가한다.
- **Reuse**: `apps/sample/lib/mock-backend/crud-routes.ts` — collection/item/search handler를 proof route에 그대로 바인딩한다.
- **Reuse**: `ViewEntityForm`, `useEntityForm`, `createListStore`, `ViewListGrid`, `rcmAdapter` — proof UI가 기존 엔진 진입점을 우회하지 않는다.
- **New**: proof hub/manifest/AST gate/SQLite adapter — 기존 도메인 샘플이나 메모리 registry는 전수 원장과 재시작 영속성을 제공하지 못한다.

### Term binding

| 토큰 | 결박 | 읽은 계약 |
|---|---|---|
| `EntityForm` query surface | `disk:packages/schema-core/src/entity-form.ts:1014` · `spec:entityform-public-api-spec.md §3.2/§10-A` | `getFields()` 정렬 순서를 보존하며 found/missing 질의를 추가하고 총 53멤버로 맞춘다. |
| `EntityStore` | `disk:apps/sample/lib/mock-backend/store.ts:353` · `spec:entityform-sample-proof-plan.md §3` | 한 인자 in-memory fixture는 보존하고 optional persistence가 snapshot/transaction을 제공한다. |
| generic CRUD/search | `disk:apps/sample/lib/mock-backend/crud-routes.ts:120` · `spec:entityform-sample-proof-plan.md §3 Route/page` | proof route는 기존 handler factory를 복제하지 않고 그대로 바인딩한다. |
| manifest AST gate | `spec:entityform-sample-proof-plan.md:134-177` | own public instance member를 정규화하고 정적 53-member manifest와 양방향 exact equality를 검사한다. |
| SQLite schema/restart | `spec:entityform-sample-proof-plan.md:185-224` · `spec:P-13` | namespace는 최초에만 seed하며 같은 DB에서 process restart 뒤 create/update/delete 결과가 유지된다. |
| proof route/page wiring | `spec:entityform-sample-proof-plan.md:226-267` | Node Route Handler만 SQLite를 import하고 hub/form/list는 기존 React/state API를 사용한다. |
| EFSP-0 acceptance | `spec:entityform-sample-proof-plan.md:391-416` | query red→green, AST discriminator, dev restart Chromium CRUD, reset, production smoke를 모두 실행 관찰한다. |

### Concrete readback

- Public API: `hasField(name): boolean`, `getTab(tabId): TabDef | undefined`, `hasTab(tabId): boolean`, `getTabFields(tabId): EntityField[]`; 마지막 메서드는 `getFields()` 순서를 보존한다.
- Store API: `new EntityStore(seed, persistence?)`; persistence는 snapshot과 원자 mutation/batch/reset을 제공하며 기존 한 인자 unit fixture는 파일을 만들지 않는다.
- SQL: `sample_namespace(entity_name PK, seeded_at)` + `sample_row(entity_name,id,payload,PK(entity_name,id))`; `id`는 payload와 동일하다.
- Proof inventory: source에 고정 작성한 53개 manifest member와 TypeScript AST 결과의 양방향 차집합이 모두 0이어야 한다.
- Runtime: 일반 E2E/재시작 runner/production smoke는 각각 격리된 `LISTGRID_SAMPLE_DB_PATH`를 쓰고 실제 Chromium+HTTP로 P-13을 관찰한다.

### Do-NOT

- 실제 class에서 manifest를 런타임 생성하지 않는다.
- generic CRUD/search 의미를 복제하거나 변경하지 않는다.
- client component에서 SQLite를 import하지 않는다.
- 개발 DB를 E2E에서 reset하지 않고 process restart를 module reload로 대체하지 않는다.

### Result

- **Implementation commit**: `4c5de9a` (`feat(sample): add persistent EntityForm proof lab`).
- **Query red→green**: `tab-hidden.test.ts` 신규 3 tests가 `hasField/getTab/getTabFields is not a function`으로 red, 4 query 구현 후 26/26 green. Surface는 EntityForm 49→53, root 61, `/schema` 188.
- **Static inventory**: manifest 53/53 exact, P-01~14 scaffold exact, implemented anchor 1. Synthetic manifest 삭제와 public API 추가가 각각 red인 discriminator를 `check:entityform-sample-proof`에서 관찰.
- **Persistence**: 모든 `getOrCreateStore` route singleton은 SQLite snapshot/transaction, direct `new EntityStore(seed)`는 in-memory 유지. namespace 최초 seed, reset 1행, 모두 삭제 후 재기동 0행을 실제 DB에서 확인.
- **Proof UI/routes**: `/entityform-proof`, baseline form/edit/list, generic CRUD/search, bulk import, allow-list reset을 기존 `ViewEntityForm`/`ViewListGrid`/adapter seam으로 배선. 홈에서 hub 진입 가능.
- **Spec corrections**: K-EFSP-3~5에 따라 nested meta 공유, `withReadOnly(undefined)=true`, GroupInput shape, root 61을 `⛔ SUPERSEDED` stamp로 정정.

### Verification evidence

- `npm run check:entityform-sample-proof` → 53/53, P 14/14, implemented anchors 1, 두 synthetic discriminator red PASS.
- `npm run type-check && npm run typecheck:packages` → green.
- `npm test -- --reporter=dot` → 192 files, 2512 passed, 1 todo.
- `npm run lint && npm run format:check` → 0 errors(기존 warnings), format green.
- `npm run check:surface` → EntityForm 53/55, root 61/120, `/schema` 188/190.
- `npm --prefix apps/sample run build` → 44 pages, proof hub/routes 포함 production build green.
- `npx playwright test e2e/entityform-proof-identity.spec.ts --grep baseline` → Chromium 1 passed.
- `npm run test:e2e` → Chromium 72/72 green; 기존 전체 sample route가 격리 SQLite로 회귀 없음.
- `npm run test:e2e:persistence` → id=2 create/update 재기동 유지, delete 404 유지, 전체 삭제 후 namespace 0행 유지.
- `npm run test:sample-production-smoke` → `next build` 후 임의 포트 `next start`, Chromium create/list/update/delete + 404 PASS.

### Do-NOT carried forward

- manifest는 계속 정적 원장으로 유지하며 class reflection으로 생성하지 않는다.
- EFSP-1은 getter diagnostics만 채워 완료 처리하지 않고 동일 branch의 DOM/request/response를 함께 관찰한다.
- SQLite/reset/persistence runner를 identity branch 편의를 위해 우회하거나 개발 DB에 연결하지 않는다.

## EFSP-1

identity/read/meta/clone/query 증명 — 2026-07-13

### Reuse review

- **Extend**: `apps/sample/lib/entities/entityform-proof.ts`의 단일 factory와 diagnostics projection에 case별 선언만 추가한다.
- **Extend**: `e2e/entityform-proof-identity.spec.ts`에서 실제 DOM과 POST/PUT/DELETE request를 관찰한다.
- **Reuse**: EFSP-0의 hub/dynamic pages/SQLite routes/AST gate; 별도 identity 전용 상태 엔진이나 API를 만들지 않는다.

### Term binding / readback

| 토큰 | 결박 | 이 task의 관찰 |
|---|---|---|
| EFS-01/03/05/20/23/24 | `spec:entityform-sample-proof-plan.md §4` | title/readOnly/id/meta/clone/query의 원자 branch를 case 선언과 h2/input/action/HTTP/diagnostics로 대조한다. |
| P-01/02/03/12 | `spec:entityform-sample-proof-plan.md §4 필수 pairwise` | id×capability, readOnly×replace-save, onInit×fetched clone, clone reference isolation을 실제 form 흐름에서 묶어 본다. |
| clone/meta 권위 | `disk:packages/schema-core/src/entity-form.ts:1130` · `spec:entityform-public-api-spec.md §3.2` | top-level containers는 독립이고 nested meta만 immutable-by-convention 공유한다. |
| form render/transport | `disk:apps/sample/app/entityform-proof/EntityFormProofClient.tsx` | 모든 case가 `useEntityForm`→`ViewEntityForm`과 EFSP-0 generic SQLite route를 그대로 쓴다. |

### Do-NOT

- getter JSON만으로 title/readOnly/id 동작을 완료 처리하지 않는다. h2/input/action/request method를 함께 단언한다.
- branch를 설명하기 위해 공개 EntityForm API를 더 추가하거나 별도 mock transport를 만들지 않는다.
- clone의 nested meta 공유를 deep clone으로 바꾸지 않고, 원본/clone을 E2E 편의상 같은 인스턴스로 만들지 않는다.

### Result

- **Implementation**: `EntityFormProofCase`에 title/readOnly/id/meta/query/fetched-init case를 추가하고, clone 격리 진단을 별도 공개 sample 함수로 고정했다.
- **DOM/HTTP proof**: 7개 Chromium 시나리오가 title fallback, readonly/action 슬롯, capability, POST/PUT, fetched init, meta/clone/query 계약을 관찰한다.
- **Manifest**: EFS-01/03/05/20/23/24 전 branch와 P-01/02/03/12를 `implemented`로 전환하고 실제 factory/diagnostics anchor에 연결했다.
- **Gate hardening**: AST 스크립트가 helper 호출의 상수 제목과 sample symbol까지 검사하며 구현 anchor 59개를 확인한다.

### Verification evidence

- `npm run type-check` → green.
- `npm run check:entityform-sample-proof` → 53/53, P 14/14, implemented anchors 59, synthetic deletion/API-add red PASS.
- `npx playwright test e2e/entityform-proof-identity.spec.ts --project=chromium` → 7/7 green.
- `npm run test:e2e` → Chromium 78/78 green.
- `npm --prefix apps/sample run build` → 44 pages production build green.
- `npm run lint` → 0 errors, 기존 warnings 262; 변경 파일 신규 warning 없음.
- targeted Prettier check와 `git diff --check` → green.

### Do-NOT carried forward

- EFSP-2 구조 branch를 diagnostics 배열만으로 증명하지 않는다. 실제 DOM 순서/가시성/저장 payload를 함께 단언한다.
- `FieldGroupDef.open` 미소비 결함은 EFS-18 red로 먼저 재현한 뒤 최소 구현한다.
- identity factory·SQLite route·manifest static inventory를 구조 증명 편의를 위해 복제하거나 우회하지 않는다.

## EFSP-2

field/tab/group/step 구조 증명 — 2026-07-13

### Reuse review

- **Extend**: `EntityFormProofCase`와 기존 dynamic proof page에 구조 case만 추가한다.
- **Reuse**: `ViewEntityForm`의 tab/group/step 렌더 및 EFSP-0 SQLite CRUD/reset 경로를 그대로 관찰한다.
- **Extend**: `ViewEntityForm`의 기존 group fieldset 렌더에 `FieldGroupDef.open`의 초기 disclosure 상태만 최소 배선한다.

### Term binding / readback

| 토큰 | 결박 | 이 task의 관찰 |
|---|---|---|
| EFS-14~18 | `spec:entityform-sample-proof-plan.md §4` | add/remove/patch 구조를 tab·legend·field DOM 순서와 POST payload로 대조한다. |
| EFS-19 | `disk:packages/schema-core/src/entity-form.ts#getSteps` · `disk:packages/react/src/components/ViewEntityForm.tsx` | replace/order/description/hidden/value 유지와 전부 hidden fallback을 wizard DOM으로 관찰한다. |
| P-05 | `spec:entityform-sample-proof-plan.md §4 필수 pairwise` | hidden/permission tab·group이 patch 뒤 다시 나타나지 않는지 고정 ADMIN session에서 확인한다. |
| P-06 | `disk:packages/react/src/components/ViewEntityForm.tsx#jumpToInvalidStep` | 마지막 step 저장 시 첫 invalid field 소유 step으로 이동하고 오류·focus를 관찰한다. |

### Do-NOT

- known gap인 `FieldGroupDef.open`은 red E2E 관찰 전 renderer를 수정하지 않는다.
- 구조 결과를 getter JSON만으로 완료 처리하거나 테스트 전용 renderer/API를 만들지 않는다.
- hidden과 requiredPermissions를 field 제거로 흉내 내지 않고 각각 실제 공개 설정을 사용한다.

### Result

- **Structure matrix**: EFS-14~19의 29개 원자 branch와 P-05/06을 case 규칙·독립 E2E 제목·manifest anchor에 1:1 연결했다.
- **DOM/payload proof**: tab/group label·order·hidden·권한·patch, field/tab 제거 POST payload, wizard replace/hidden/value/focus를 Chromium에서 관찰했다.
- **EFS-18 red→green**: `4f0927d`가 `open:false` 미소비를 red로 고정하고 `258becd`가 기존 fieldset을 보존한 disclosure 배선으로 수정했다.
- **P-06 red→green**: `2a6089c`가 step 이동 뒤 focus 누락을 red로 드러내고 `19b4a9e`가 mount 다음 frame에 focus를 복원했다.
- **Manifest/gate**: 구현 anchor가 59→90으로 늘었고 static 53-member inventory와 synthetic discriminator는 유지됐다.

### Verification evidence

- `npm run type-check` → green.
- `npm test -- --reporter=dot` → 192 files, 2514 passed, 1 todo.
- `npm run check:entityform-sample-proof` → 53/53, P 14/14, implemented anchors 90, synthetic red 2종 PASS.
- `npx playwright test e2e/entityform-proof-structure.spec.ts --project=chromium` → 31/31 green.
- `npm run test:e2e` → Chromium 109/109 green.
- `npm --prefix apps/sample run build` → 44 pages production build green.
- `npm run lint` → 0 errors, 기존 warnings 262; `npm run format:check`와 `git diff --check` green.

### Do-NOT carried forward

- EFSP-3 lifecycle은 diagnostics count나 mock spy로 끝내지 않고 실제 HTTP body/미호출/message/화면을 함께 관찰한다.
- lifecycle 결함은 red E2E 커밋 전 controller/renderer를 수정하지 않는다.
- 구조 proof case·group disclosure·wizard focus 회귀를 lifecycle 편의를 위해 우회하지 않는다.

## EFSP-3

form lifecycle/revision 증명 — 2026-07-13

### Reuse review

- **Extend**: `apps/sample/lib/entities/entityform-proof.ts`의 단일 proof factory와 기존 client diagnostics 구독에 lifecycle case만 추가한다.
- **Reuse**: `ViewEntityForm`→form controller→`rcmAdapter`→generic SQLite route의 실제 create/update/delete 경계를 그대로 관찰한다.
- **Extend**: `makeCollectionHandlers`의 선택적 create validation seam과 기존 RFC 7807 envelope에 복수 field/global 오류 fixture만 추가한다.

### Term binding / readback

| 토큰 | 결박 | 이 task의 관찰 |
|---|---|---|
| EFS-06/07 | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/state/src/form-controller.ts` | onChange/onInit 등록 순서, 값·meta·구조 변경, fetched baseline을 실제 렌더와 diagnostics로 대조한다. |
| EFS-08~11 | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/state/src/form-controller.ts` | save/delete 전후 hook의 cancel·throw·순서·context를 실제 HTTP body/미호출/message/후속 handler로 관찰한다. |
| EFS-21 | `disk:packages/schema-core/src/entity-form.ts#withRevision` · adapter CRUD 경로 | undefined/exact/clear와 create/update/delete payload의 `revisionEntityName`을 request에서 확인한다. |
| P-04/07/08/10/14 | `spec:entityform-sample-proof-plan.md §4 필수 pairwise` | dynamic write, before/after CRUD, revision 전 transport, backend 복수 field/global validation을 한 실제 흐름에서 봉인한다. |

### Do-NOT

- lifecycle diagnostics count나 mock spy만으로 완료 처리하지 않고 HTTP request·미호출·message·렌더 결과를 함께 단언한다.
- cancel/throw/order를 한 분기로 축약하거나 before/after 경계를 adapter 성공 이전으로 옮기지 않는다.
- backend field 오류와 global 오류를 한 문자열/채널로 합치지 않는다.

### Result

- **Lifecycle matrix**: EFS-06~11/21의 원자 branch 35개와 P-04/07/08/10/14를 40개 독립 Chromium 시나리오와 manifest anchor에 연결했다.
- **Runtime proof**: onChange/onInit의 값·meta·구조 변화, save/delete cancel·throw·순서, revision create/update/delete payload를 실제 controller/adapter/SQLite 경로에서 관찰했다.
- **Plural validation**: proof API가 field 오류 2개와 global 오류 2개를 RFC 7807 응답으로 반환하고 UI가 서로 분리해 모두 표시하며 저장 row 수를 유지한다.
- **Type correction**: production build가 `trace.push()` 숫자 반환 lifecycle handler를 잡았고 `051763a`에서 모든 handler가 명시적으로 void를 반환하도록 수정했다.
- **Manifest/gate**: EFS-06~11/21과 P-04/07/08/10/14를 implemented로 전환해 anchor가 90→130으로 늘었고 static 53-member inventory와 synthetic discriminator를 유지했다.

### Verification evidence

- `npm run check:entityform-sample-proof` → 53/53, P 14/14, implemented anchors 130, synthetic red 2종 PASS.
- `npm run type-check` → green; `npm --prefix apps/sample run build` → type validation + 44/44 static pages production build green.
- `npm test -- --reporter=dot` → 192 files, 2514 passed, 1 todo.
- `npm run test:e2e -- e2e/entityform-proof-lifecycle.spec.ts` → Chromium 40/40 green.
- `npm run test:e2e` → Chromium 149/149 green.
- `npm run lint` → 0 errors, 기존 warnings 262; `npm run format:check`와 `git diff --check` green.

### Do-NOT carried forward

- EFSP-4 capability/action은 diagnostics나 callback mock으로 끝내지 않고 실제 버튼 상태·실행 결과·권한 분기를 관찰한다.
- list lifecycle은 form lifecycle과 혼합하지 않고 실제 search request body와 응답 rows의 전후 관계를 단언한다.
- lifecycle proof route·validation seam·SQLite 경로를 action/list 편의를 위해 복제하거나 우회하지 않는다.

## EFSP-4

capabilities/actions/list lifecycle 증명 — 2026-07-13

### Reuse review

- **Extend**: `apps/sample/lib/entities/entityform-proof.ts`의 단일 proof factory에 capability/action/list-hook case를 추가한다.
- **Extend**: `apps/sample/app/entityform-proof/EntityFormProofList.tsx`가 기존 generic `createListStore`와 `ViewListGrid`를 유지한 채 case와 diagnostics를 받는다.
- **Reuse**: lifecycle E2E의 실제 request 감시·화면 trace 패턴과 `/api/entityform-proof/search` generic SQLite route를 그대로 사용한다.

### Term binding / concrete readback

| 토큰 | 결박 | 이 task의 구체 계약 |
|---|---|---|
| EFS-02 / `Capabilities` | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/schema-core/src/entity-form.ts:337` · `disk:packages/react/src/components/ViewEntityForm.tsx:616` | create/update/delete boolean과 async `(FieldEvalContext) => boolean`을 id 기반 action bar에 선언하고 pending은 visible, resolve 뒤 최종 버튼 상태를 관찰한다. |
| EFS-04 / `FormAction` | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/schema-core/src/entity-form.ts:353` · `disk:packages/react/src/components/ViewEntityForm.tsx:649` | order/visible/enabled/run/render/className/variant/replaces/id collision을 실제 action DOM과 `FormMutator` 결과로 관찰한다. |
| EFS-12 / `BeforeListFetchContext` | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/schema-core/src/entity-form.ts:191` · `disk:packages/state/src/list-store.ts:80` | 등록 순서대로 `setSearchForm(next)`를 thread하고 마지막 SearchForm이 실제 `POST /api/entityform-proof/search` body가 되며 throw 뒤 handler가 계속된다. |
| EFS-13 / `AfterListFetchContext` | `spec:entityform-sample-proof-plan.md §4` · `disk:packages/schema-core/src/entity-form.ts:220` · `disk:packages/state/src/list-store.ts:116` | adapter 응답의 rows/totalElements를 읽고 `setRows(rows)` 결과가 다음 handler와 최종 table rows에 전달되며 throw 뒤 handler가 계속된다. |
| P-09 | `spec:entityform-sample-proof-plan.md §4 필수 pairwise` · `disk:packages/schema-core/src/search/search-form.ts:177` · `disk:packages/schema-core/src/search/search-form.ts:201` | host quick-search의 OR/quickSearchFields와 before-hook의 status AND가 같은 request body에 공존하고 그 응답 rows가 after-hook을 거쳐 렌더된다. |

### Do-NOT

- function conditional의 pending 기본 true를 최종값으로 오인하지 않고 resolve 전후를 따로 관찰한다.
- `SearchForm.addAndFilter`의 append 의미나 generic route의 검색 의미를 바꾸지 않는다.
- capability/action을 diagnostics 또는 callback count만으로 완료 처리하지 않고 버튼·disabled·실행 결과·미요청을 관찰한다.

### Red evidence

- `npx playwright test e2e/entityform-proof-actions-list.spec.ts --project=chromium` → EFS-02g에서 ADMIN 버튼은 보이나 POST가 0회라 timeout. `EntityFormProofClient`가 Auth session을 controller에 전달하지 않는 view/controller 불일치를 재현했다.

### Result

- **Capability/action matrix**: EFS-02의 9개 branch와 EFS-04의 10개 branch를 boolean·async pending/session·merge 및 action DOM/실행 결과에 1:1 연결했다.
- **List lifecycle matrix**: EFS-12의 3개 branch, EFS-13의 4개 branch, P-09를 실제 `/search` request body·adapter response·최종 table row로 연결했다.
- **Session red→green**: `db90afe`가 ADMIN view/controller 불일치를 red로 고정했고 `24da750`이 proof client의 Auth session을 `useEntityForm`에 전달해 실제 POST를 복구했다.
- **Manifest/gate**: `actionsListProof`를 AST anchor gate에 등록해 implemented anchor가 130→157로 증가했고 53-member/P-14 exact inventory와 synthetic red 2종을 유지했다.

### Verification evidence

- `npm run check:entityform-sample-proof` → 53/53, P 14/14, implemented anchors 157, synthetic red 2종 PASS.
- `npm run type-check` → green; `npm --prefix apps/sample run build` → type validation + 44/44 static pages production build green.
- `npm test -- --reporter=dot` → 192 files, 2514 passed, 1 todo.
- `npx playwright test e2e/entityform-proof-actions-list.spec.ts --project=chromium` → 27/27 green.
- `npm run test:e2e` → Chromium 176/176 green.
- `npm run lint` → 0 errors, 기존 warnings 262; `npm run format:check`와 `git diff --check` green.

### Do-NOT carried forward

- EFSP-5 data transfer는 버튼 존재나 mock workbook으로 끝내지 않고 실제 xlsx 셀과 import 후 SQLite row를 관찰한다.
- action/list proof의 Auth session, request AND+OR, after-hook row threading을 transfer 편의를 위해 우회하거나 복제하지 않는다.
- manifest 157 anchors와 176 E2E 기준선을 closure 중 회귀시키지 않는다.

## EFSP-5

data transfer와 전수 closure — 2026-07-13

### Reuse review

- **Extend**: `apps/sample/lib/entities/entityform-proof.ts`의 단일 proof factory에 transfer case만 추가한다.
- **Extend**: `apps/sample/app/entityform-proof/EntityFormProofList.tsx`의 기존 `ViewListGrid.toolbar`에 College 샘플과 같은 Excel 모달 배선을 추가한다.
- **Reuse**: `@listgrid/excel`의 `getDataTransfer()`/Exporter/Importer와 `POST /api/entityform-proof/excel-upload`의 SQLite `upsertMany` transaction을 그대로 사용한다.
- **Reuse**: `e2e/college-excel.spec.ts`의 실제 browser download·Node workbook fixture 패턴을 proof 전용 E2E에서 확장한다.

### Term binding / concrete readback

| 토큰 | 결박 | 이 task의 구체 계약 |
|---|---|---|
| EFS-22 / `withDataTransfer` | `spec:entityform-sample-proof-plan.md §3/§4` · `disk:packages/schema-core/src/data-transfer.ts` | export/import 자동 파생, 명시 fields, fileName, 재호출 replace, 양방향 독립 해석을 실제 모달과 workbook으로 관찰한다. |
| 자동 파생 시점 | `spec:entityform-public-api-spec.md §3.5` · `disk:packages/schema-core/src/entity-form.ts#getDataTransfer` | `fields` 생략/빈 배열은 `getDataTransfer()` 호출 시점의 `getFields()` 선언 순서를 사용하며 고정 snapshot을 저장하지 않는다. |
| workbook 계약 | `spec:entityform-sample-proof-plan.md §3 Route/page 배선` · `disk:packages/excel/src/export-core.ts` | 실제 다운로드한 `EntityForm Proof` sheet에서 열 순서 `id,name,status,category,note`와 seed 셀을 읽는다. |
| import persistence | `disk:apps/sample/app/api/entityform-proof/excel-upload/route.ts` · `disk:apps/sample/lib/mock-backend/sqlite.ts` | 실제 xlsx 파싱 결과를 bulk route로 보내고 transaction 후 list refetch와 backend GET에서 같은 row를 확인한다. |
| P-11 | `spec:entityform-sample-proof-plan.md §4 필수 pairwise` | `withDataTransfer({export:{},import:{}})` 뒤 field add/remove가 export/import 양쪽의 최종 fields에 반영되어 stale snapshot이 없음을 증명한다. |

### Do-NOT

- 다운로드 버튼이나 모달 존재만으로 export를 완료 처리하지 않고 실제 파일의 sheet·header·data cell을 읽는다.
- import UI의 성공만으로 persistence를 주장하지 않고 list refetch와 SQLite-backed item GET을 함께 관찰한다.
- proof 편의를 위해 새 transfer registry, 별도 상태 엔진, 전용 mock adapter를 만들지 않는다.
