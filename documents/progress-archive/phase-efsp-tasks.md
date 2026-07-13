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
