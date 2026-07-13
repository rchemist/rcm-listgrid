# EntityForm 설정 전수 샘플 증명 계획 (EF-SP)

**상태**: 실행 대기 · **작성**: 2026-07-13 · **상류 계약**:
[EntityForm 공개 API 스펙](./entityform-public-api-spec.md) §3~7,
[sample site 명세](../prd/sample-site-spec.md), [PROGRESS](../PROGRESS.md)

## 1. 목표와 완료 정의

`EntityForm`의 현재 공개 멤버 49개와 스펙상 누락된 질의 4개를 먼저 대조하고, 확정된
전체 공개 표면과 그중 사용자 설정을 만드는 22개 메서드를 `apps/sample` 소비자 코드와
Playwright에서 전부 증명한다. unit test만 있는 설정은 완료로 세지 않는다.

완료 조건은 다음과 같다.

1. 스펙 §3.2의 누락 질의 4개를 red-first로 복구한 뒤, 공개 멤버 **53개**가
   `apps/sample/lib/entities/entityform-proof-manifest.ts`에 정확히 한 번씩 등재된다.
2. 22개 설정 메서드는 스펙이 정의한 모든 원자 분기를 sample 선언에서 사용하고 브라우저·HTTP로 결과를 관찰한다.
3. 설정끼리 영향을 주는 필수 pairwise 조합은 §4를 모두 통과한다. 임의의 전체 Cartesian product는 만들지 않는다.
4. 각 manifest 행은 `status`, `sampleCase`, `sampleAnchor`, `e2eFile`, `testTitle`, `assertion`을 가진다.
   빈 값, `unit-only`, 최종 `planned` 잔존은 실패다.
5. AST 게이트가 실제 `EntityForm` 공개 멤버 집합과 manifest 집합의 exact equality를 검사한다. 새 API가 추가되면 CI가 즉시 실패한다.
6. `cd apps/sample && npm run dev` 후 `http://localhost:3000/entityform-proof`에서 모든 case를
   메뉴로 탐색하고 create/read/update/delete/search/import/export를 사람이 반복 실행할 수 있다.
7. 모든 CRUD는 브라우저 메모리가 아니라 Next Node.js Route Handler에서 수행되며 SQLite에
   커밋된다. 새로고침·페이지 이동·Next dev 서버 재시작 뒤에도 값이 유지된다.
8. Playwright는 전용 임시 DB를 쓰고 매 실행 전에 seed로 reset한다. 개발자의 수동 테스트 DB를
   읽거나 지우지 않으며, Next production build에서도 proof lab이 실제 실행된다.

> “전수”의 단위는 스펙에 이름 붙은 원자 동작과 필수 상호작용이다. boolean·조건부·create/update처럼
> 결과가 갈리는 분기는 각각 증명하지만, 의미 없는 모든 입력값 순열을 곱한 테스트는 만들지 않는다.

## 2. 기준선과 Search-first 결정

- 기준선: `EntityForm` 구현 공개 멤버 **49**, root 공개 심볼 61, `/schema` 188.
- 스펙 드리프트: §3.2가 유지/신설로 확정한 `hasField`, `getTab`, `hasTab`, `getTabFields`가
  구현에 없다. EFSP-0에서 먼저 4개를 복구하여 proof inventory 기준을 53으로 봉인한다.
- 현재 sample 직접 참조: react 9/61, schema 27/188, state 2/12. 기존 E2E는 C1~C9 대표 흐름이지 EntityForm 전수 원장이 아니다.
- **Reuse**: `apps/sample/lib/mock-backend/crud-routes.ts`의 `makeCollectionHandlers`, `makeItemHandlers`, `makeSearchHandler`.
- **Extend**: `apps/sample/lib/mock-backend/store.ts`의 `EntityStore` 공개 계약은 유지하고 backing
  storage만 메모리 배열에서 샘플 공용 SQLite repository로 교체한다. 모든 기존 API route가 함께 영속화된다.
- **Reuse**: `ViewEntityForm`, `ViewListGrid`, `useEntityForm`, `createFormStore`, `createListStore`와 기존 Providers.
- **Extend**: 기존 college/major/collabo/steps E2E 증거는 manifest에 연결하되, 한 분기라도 관찰이 부족하면 proof lab에서 보강한다.
- **New**: `entityform-proof` fixture/페이지와 AST manifest 게이트. 기존 도메인 페이지에 인위적 설정을 섞으면 샘플 의미가 흐려진다.

확정 스펙에 있으나 빠진 질의 4개 외에는 공개 API 시그니처를 바꾸지 않는다. before→after는 다음과 같다.

```ts
// before: 없음
// after
hasField(name: string): boolean
getTab(tabId: string): TabDef | undefined
hasTab(tabId: string): boolean
getTabFields(tabId: string): EntityField[] // getFields() 순서를 유지하여 해당 tab만 투영
```

```text
before: EntityForm 설정별 sample/E2E 전수 원장 없음, 49-member 구현과 53-member 스펙 불일치,
        sample CRUD는 프로세스 메모리라 서버 재시작 시 초기화
after:  53-member exact manifest + 22-setting branch proofs + CI AST equality gate +
        Next server-side SQLite CRUD + 브라우저용 proof hub/reset
```

### 참조/Decoder

| 토큰 | 정의 |
|---|---|
| C1~C9 | [개념 헌장](../prd/concept-charter.md) |
| `EntityForm`/`EntityField` | `packages/schema-core/src/entity-form.ts` / `packages/schema-core/src/field/entity-field.ts` |
| `SearchForm` | `packages/schema-core/src/search/search-form.ts` |
| `ViewEntityForm`/`ViewListGrid` | `packages/react/src/components/ViewEntityForm.tsx` / `ViewListGrid.tsx` |
| EFS-01~24, P-01~14 | 이 문서 §4 |
| EFSP-0~6 | 이 문서 §5 |
| D-EFSP-1~4 | 이 문서 Decision Ledger |
| K-EFSP-1~5 | 이 문서 “알려진 expected-red 기준선” |
| `ProofKind`/`EntityFormProofBranch`/`EntityFormProofEntry`/`EntityFormIntegrationProof`/`EntityFormProofManifest`/`EntityFormProofRow` | 이 문서 §3의 inline TypeScript 계약 |
| `EntityFormProofCase` | 이 문서 §3의 fixture factory 시그니처 |
| W4-6 | [EntityForm 공개 API 스펙](./entityform-public-api-spec.md) 및 `entity-form.ts`의 후대 hardening 결정 |

## Decision Ledger

| ID | 결정 | 기각 대안·이유 | 상태 |
|---|---|---|---|
| D-EFSP-1 | 사용자: “샘플 코드로 모두 증명이 되어야 해.” | C1~C9 대표 E2E만으로 전수라 주장 금지. 공개 설정 누락을 검출하지 못함 | 결정=CLOSED(2026-07-13) · 구현=미착수 |
| D-EFSP-2 | 전수 단위=스펙 원자 분기 + 영향 있는 pairwise 조합 | 전체 Cartesian product는 무한·중복이며 의미 있는 계약보다 입력 순열을 테스트함 | 결정=CLOSED(2026-07-13) · 구현=미착수 |
| D-EFSP-3 | `npm run dev`의 모든 CRUD는 Next Node.js Route Handler→SQLite로 처리하고 재시작 뒤 유지 | proof만 메모리 mock 사용 금지. 수동 브라우저 반복 테스트와 영속성 증명이 불가능 | 결정=CLOSED(2026-07-13) · 구현=미착수 |
| D-EFSP-4 | 개발 DB와 E2E DB를 경로로 격리하고 visible reset UI/API를 제공 | E2E가 개발 데이터를 삭제하거나 hidden test backdoor로 reset하는 방식 금지 | 결정=CLOSED(2026-07-13) · 구현=미착수 |

### 알려진 expected-red 기준선

- **K-EFSP-1**: 스펙 §3.2의 질의 4개가 구현에 없다. EFSP-0에서 정확한 시그니처의 unit red를
  먼저 추가한 뒤 복구한다. 공개 API를 새로 발명하는 일이 아니라 확정 스펙 누락을 바로잡는 작업이다.
- **K-EFSP-2**: `FieldGroupDef.open`은 선언돼 있지만 현재 `ViewEntityForm`의 plain `fieldset`이
  소비하지 않는다. EFS-18 DOM red를 먼저 남기고 기존 공개 계약을 구현한다.
- **K-EFSP-3**: 스펙 §3.2의 “meta 깊은 복제” 문구는 이후 W4-6의 top-level-only 결정 및 구현 주석과
  충돌한다. EFSP-0에서 해당 문구를 `⛔ SUPERSEDED — nested meta는 immutable-by-convention 공유`로
  폐기한다. 테스트는 top-level key 격리와 nested reference 공유를 각각 명시적으로 증명한다.
- **K-EFSP-4**: 스펙 §3.1의 `withReadOnly(undefined)=해제`는 같은 호출의 “무인자=기본 true” 및 실제
  default parameter와 양립하지 않는다. 후대 구현 계약인 `withReadOnly()`/명시적 `undefined`=true,
  `withReadOnly(false)`=해제를 권위로 삼고 상류 문구를 `⛔ SUPERSEDED` 처리한다.
- **K-EFSP-5**: 스펙의 “GroupInput hidden”, EntityForm 45/49/53, root 57/61 count 문장이 충돌한다.
  실제 type에는 GroupInput.hidden/open이 없고 open은 `withGroup`에만 있다. EFSP-0에서 타입 표,
  EntityForm 목표 53과 현재 root 실측 61을 정정한다.

## 3. 증명용 파일 계약

| 파일 | 변경 | 계약 |
|---|---|---|
| `apps/sample/app/page.tsx` | 수정 | localhost 첫 화면에서 proof hub와 기존 CRUD samples로 들어가는 탐색 메뉴 |
| `apps/sample/app/entityform-proof/page.tsx` | 신규 | 모든 case/CRUD 링크, 현재 DB 경로 종류(dev/test), reset 버튼을 제공하는 서버 렌더 hub |
| `apps/sample/lib/entities/entityform-proof.ts` | 신규 | case별 `EntityForm` 선언. 테스트 전용 가짜가 아니라 소비자가 복사 가능한 공개 API 사용 예시 |
| `apps/sample/lib/entities/entityform-proof-manifest.ts` | 신규 | 53멤버 exact inventory와 원자 branch ID, sample/E2E anchor |
| `apps/sample/lib/mock-backend/sqlite.ts` | 신규 | Node.js-only SQLite singleton, schema/migration/transaction, `LISTGRID_SAMPLE_DB_PATH` 해석 |
| `apps/sample/lib/mock-backend/store.ts` | 수정 | 기존 `EntityStore` API/검색 의미/직접 unit fixture는 보존하고 route singleton만 SQLite persistence 사용 |
| `apps/sample/lib/mock-backend/entityform-proof.ts` | 신규 | `getOrCreateStore` 기반 seed/store. 별도 CRUD 엔진 금지 |
| `apps/sample/app/api/entityform-proof/{route.ts,[id]/route.ts,search/route.ts,excel-upload/route.ts}` | 신규 | generic CRUD/search 바인딩 + transaction bulk import |
| `apps/sample/app/api/sample-admin/reset/route.ts` | 신규 | allow-list entity seed reset. proof hub와 E2E가 같은 공개 sample control 사용 |
| `apps/sample/app/entityform-proof/[case]/page.tsx` | 신규 | create/list/diagnostic case 렌더 |
| `apps/sample/app/entityform-proof/[case]/[id]/page.tsx` | 신규 | update/delete case 렌더 |
| `e2e/entityform-proof-identity.spec.ts` | 신규 | EFS-01/03/05/20/23/24 |
| `e2e/entityform-proof-structure.spec.ts` | 신규 | EFS-14~19 |
| `e2e/entityform-proof-lifecycle.spec.ts` | 신규 | EFS-06~11/21 |
| `e2e/entityform-proof-actions-list.spec.ts` | 신규 | EFS-02/04/12/13 |
| `e2e/entityform-proof-transfer.spec.ts` | 신규 | EFS-22 |
| `scripts/check-entityform-sample-proof.mjs` | 신규 | TS AST로 실제 53멤버↔manifest exact equality 및 anchor 존재 검사 |
| `scripts/run-sample-persistence-e2e.mjs` | 신규 | 같은 test DB로 Next 서버를 두 번 기동하여 브라우저 CRUD의 재시작 영속성을 증명 |
| `scripts/run-sample-production-smoke.mjs` | 신규 | `next build` 산출물을 `next start`로 기동해 hub/CRUD를 Chromium에서 증명 |
| `e2e/global-setup.ts`, `playwright.config.ts` | 수정 | 임시 SQLite 경로 주입·seed reset; 개발 DB와 완전 격리 |
| `apps/sample/package.json`, `next.config.mjs`, root package/lock, `.gitignore`, CI | 수정 | `better-sqlite3` server external, DB 경로/스크립트/gate; DB·WAL 추적 금지 |
| `documents/prd/sample-site-spec.md` | 수정 | “EntityForm 설정 전수 sample proof”를 상시 수용 기준으로 승격 |

proof page는 각 case에 `data-proof-case`, `data-proof-diagnostics`를 제공한다. diagnostics는 getter 결과와
hook 호출 순서를 JSON으로 렌더하며 Playwright는 내부 JS 객체가 아니라 화면·요청·응답을 단언한다.

AST 추출은 TypeScript compiler API로 `EntityForm` class의 **own public instance** constructor/property/
method/getter/setter만 읽는다. `private`/`protected`/`static`/상속 멤버는 제외하고 overload는 이름 기준 한 번,
constructor는 문자열 `constructor`, getter/setter 쌍은 property 이름 한 번으로 정규화한다. manifest 정적 집합과
양방향 차집합을 출력하고 둘 중 하나라도 비면이 아닌 경우 exit 1이다.

manifest와 fixture의 최소 타입은 다음으로 고정한다.

```ts
type ProofKind = 'constructor' | 'property' | 'setting' | 'query'

interface EntityFormProofBranch {
  id: `EFS-${string}`
  status: 'planned' | 'implemented'
  sampleCase: string                 // slash 없는 /entityform-proof/[case] path segment
  sampleAnchor: string               // repo-relative source file + exported factory name
  e2eFile: `e2e/${string}.spec.ts`
  testTitle: string                  // 해당 파일에 동일 title의 test(...)가 실재해야 함
  assertion: string                  // DOM/request/response 중 무엇을 관찰하는지 한 문장
}

interface EntityFormProofEntry {
  member: string                     // EntityForm AST public member와 exact equality
  kind: ProofKind
  branches: readonly EntityFormProofBranch[]
}

interface EntityFormIntegrationProof extends Omit<EntityFormProofBranch, 'id'> {
  id: `P-${string}`                  // pairwise/cross-cutting; 특정 member에 억지 귀속하지 않음
  members: readonly string[]         // 관련 EntityForm member; P-13/14는 [] 허용
}

interface EntityFormProofManifest {
  members: readonly EntityFormProofEntry[]
  integrations: readonly EntityFormIntegrationProof[]
}

interface EntityFormProofRow {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  category: 'A' | 'B'
  note: string
  [key: string]: unknown
}
```

`entityform-proof.ts`는 `EntityFormProofCase(caseId: string, id?: string): EntityForm` factory와
case별 작은 helper를 export한다. dynamic page는 URL의 `case`/`id`만 factory에 전달한다.
fixture seed는 `{id:'1', name:'Proof One', status:'ACTIVE', category:'A', note:'seed'}` 한 행이며
별도 상태 엔진 없이 `getOrCreateStore<EntityFormProofRow>('entityform-proof', seed)`를 쓴다.

SQLite 스키마는 임의 EntityForm row를 수용하도록 고정한다.

```sql
CREATE TABLE sample_namespace (entity_name TEXT PRIMARY KEY, seeded_at TEXT NOT NULL);
CREATE TABLE sample_row (
  entity_name TEXT NOT NULL,
  id TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (entity_name, id),
  FOREIGN KEY (entity_name) REFERENCES sample_namespace(entity_name) ON DELETE CASCADE
);
```

`payload`는 wire row 전체 JSON이며 `id`도 payload 안에 동일 값으로 보존한다. namespace가 없을 때만
seed를 transaction으로 넣으므로 “모두 삭제 후 재시작”이 seed 복원으로 뒤집히지 않는다. create/update/
delete는 transaction 완료 뒤에만 응답한다. 기본 개발 경로는 `apps/sample/.data/listgrid-sample.sqlite`,
E2E는 `LISTGRID_SAMPLE_DB_PATH=<os-tmp>/listgrid-e2e-<pid>-<uuid>/listgrid-sample.sqlite`를 명시한다. 모든 SQLite import가
포함된 모듈은 `server-only`이며 route는 `runtime='nodejs'`, `dynamic='force-dynamic'`으로 고정한다.
루트 지원 범위가 Node >=20이므로 `node:sqlite`에 기대지 않고 `better-sqlite3`와 해당 typings를 sample
workspace에만 둔다. `next.config.mjs.serverExternalPackages`에도 `better-sqlite3`를 등록한다.

store 내부 확장은 기존 한 인자 호출과 route factory type을 깨지 않는다.

```ts
// before
new EntityStore<T>(seed: T[])
// after — 두 번째 인자는 sample 내부 전용; 생략하면 기존 in-memory unit fixture
new EntityStore<T>(seed: T[], persistence?: EntityStorePersistence<T>)

// route store만 이 경로를 사용
getOrCreateStore(entityName, seed)
  -> new EntityStore(seed, sqliteEntityPersistence(entityName, seed))
```

persistent mode의 `search/findById`는 매 호출 SQLite snapshot을 읽고 기존 filter/sort 함수를 그대로 쓰며,
`create/update/remove`는 SQLite transaction 안에서 read→기존 의미 계산→write한다. 따라서 route module
Fast Refresh와 process restart 모두 DB가 권위 원본이고, `new EntityStore(seed)` 기반 unit test는 파일을 만들지 않는다.
Excel import를 위해 sample 내부 `upsertMany(rows: Partial<T>[]): T[]`를 추가한다. persistent mode는 전체
batch를 하나의 transaction으로 처리하고, id가 존재하면 update·없거나 미존재면 create한다. in-memory mode도
같은 결과를 내며 기존 CRUD/search 시그니처는 바꾸지 않는다.

### Route/page 배선 계약

```ts
// app/api/entityform-proof/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { POST, DELETE } = makeCollectionHandlers(entityFormProofStore);

// app/api/entityform-proof/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PUT } = makeItemHandlers(entityFormProofStore, 'entityform-proof');

// app/api/entityform-proof/search/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = makeSearchHandler(entityFormProofStore);

// app/api/entityform-proof/excel-upload/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest): Promise<NextResponse> {
  // body {rows: Record<string, unknown>[]}가 아니면 400
  // entityFormProofStore().upsertMany(rows) transaction 후 {rows,count} 200
}
```

`/entityform-proof`는 Server Component hub이며 manifest를 setting/member별 표로 렌더하고 각 branch의
설명·상태·실행 링크를 노출한다. `/entityform-proof/list`는 `ViewListGrid`와 새로 만들기 링크,
`/[case]`는 해당 create/diagnostic form, `/[case]/[id]`는 update/delete form을 렌더한다. client wrapper는
`EntityFormProofCase(case,id).clone().withId(id)`→`useEntityForm({entityForm,adapter:rcmAdapter,id})`→
`ViewEntityForm` 순으로만 연결한다. list는 동일 factory와 `createListStore`→`ViewListGrid`를 쓴다.
diagnostics는 `{caseId, member, renderType, title, id, fields, tabs, groups, steps, meta, hooks, transfer}`
키를 고정하고 값은 getter 결과를 JSON-safe projection한 것이다. diagnostics만으로 DOM/HTTP 증명을 대체하지 않는다.
여기서 “SSR backend”의 실행 계약은 hub/초기 shell은 Next Server Component가 서버 렌더하고, CRUD mutation과
조회는 Next Node.js Route Handler가 SQLite를 접근한다는 뜻이다. 브라우저 bundle이 DB 파일을 직접 다루지 않는다.

data transfer는 list toolbar의 기존 `getDataTransfer()` seam을 그대로 쓰며 export sheet 이름은
`EntityForm Proof`, 열 순서는 `id,name,status,category,note`다. import는
`POST /api/entityform-proof/excel-upload`로 parsed rows를 보내고 SQLite transaction 후 list를 refetch한다.
샘플 reset은 `POST /api/sample-admin/reset` body `{ "entities": ["entityform-proof"] }`만 허용하며,
서버의 정적 allow-list 밖 이름은 400이다. hub 버튼이 같은 endpoint를 호출하고 완료 후 router refresh한다.

### 수동 브라우저 합격 시나리오

```bash
cd apps/sample
npm run dev
# open http://localhost:3000/entityform-proof
```

1. hub에서 branch별 링크를 모두 열 수 있고 create/list/update/delete/transfer case가 설명과 함께 보인다.
2. 새 row를 만들고 list에서 검색한 뒤 detail을 열어 수정한다. 새로고침해도 수정값이 유지된다.
3. dev 서버를 종료하고 같은 명령으로 다시 실행한다. 만든 row와 수정값이 유지된다.
4. row를 삭제하고 다시 서버를 재시작한다. 삭제된 row가 seed로 부활하지 않는다.
5. “Proof 데이터 초기화”를 누르면 seed 한 행으로 돌아가고 브라우저 CRUD를 다시 반복할 수 있다.
6. validation case에서 한 필드의 오류 2개와 form global 오류 2개가 각각의 plural UI에 동시에 보인다.

`http://localhost:3000/` 첫 화면에서 “EntityForm proof lab” 링크로 hub에 진입할 수 있어야 하며,
URL을 외워 직접 입력해야만 도달하는 샘플은 수동 UI 증명으로 인정하지 않는다.

`npm run test:e2e:persistence`는 `scripts/run-sample-persistence-e2e.mjs`를 실행한다. runner는 임시 DB를
삭제·seed reset한 뒤 port 3101에 sample dev server를 child process로 띄우고 Chromium으로 create/update를
수행한다. child에 SIGTERM을 보내 exit를 확인한 다음 **같은 DB 경로**로 새 child를 띄워 read/search를
단언하고 delete한다. 다시 한 번 종료/재기동하여 item GET 404와 list 부재를 단언한 뒤 child와 임시 DB를
정리한다. 각 기동은 `/entityform-proof` 200 readiness를 기다리며 개발 기본 DB 경로에는 접근하지 않는다.

일반 Playwright config는 config 평가 시 `mkdtemp`+process id/random UUID로 실행별 DB 디렉터리를 만들고
그 경로를 webServer의 `LISTGRID_SAMPLE_DB_PATH`로 넘긴다. `workers: 1`, `fullyParallel: false`를 유지하고
global setup에서 그 실행의 DB만 reset, teardown에서 DB/WAL/SHM과 디렉터리만 삭제한다. persistence runner도
별도 `mkdtemp`를 쓰므로 동시 실행한 다른 Playwright/persistence process와 파일을 공유하지 않는다.

`npm run test:sample-production-smoke`는 isolated DB로 `npm --prefix apps/sample run build` 후 OS가 배정한
빈 port에 `npm --prefix apps/sample run start -- -p <port>`를 띄운다. Chromium이 hub를 열고 create→list/search→
update→delete를 수행하며 API 응답과 DOM을 확인한다. build 성공만으로 runtime green을 주장하지 않는다.

mock validation helper의 before→after는 다음으로 고정한다.

```ts
// before
validationFailed(fieldErrors, message?, code?): NextResponse
// after — 기존 호출 호환, errors가 adapter의 globalErrors로 매핑됨
validationFailed(fieldErrors, message?, code?, globalErrors?: string[]): NextResponse
```

proof validation save는 `name='VALIDATION_PROOF'`일 때만 `fieldErrors.name=['too short','reserved']`,
`errors=['date range is invalid','form combination is not allowed']`로 400을 반환하며 SQLite를 쓰지 않는다.

## 4. ID 커버리지 매트릭스

각 행의 모든 하위 분기가 manifest에 별도 branch ID(`EFS-01a` 형식)로 존재해야 한다.

| ID | 공개 설정 | 반드시 증명할 원자 분기 | 필수 관찰 |
|---|---|---|---|
| EFS-01 | `withTitle` | string, `{text}`, `{fromField}`, text→fromField→name-field→id→entity-name fallback, 재호출 replace | h2 title과 diagnostics |
| EFS-02 | `withCapabilities` | create/update/delete 각각 true/false, async 함수 context/session, pending true→resolved, 호출 간 shallow merge | 버튼 전이·존재/부재와 adapter 미호출 |
| EFS-03 | `withReadOnly` | 무인자/`undefined`=true, false 해제, Save/replaces-save 숨김, Delete·일반 action 유지 | readonly DOM과 action bar |
| EFS-04 | `addAction` | order, visible, enabled, run, render, className, variant, replaces save/delete, id collision=custom 유지·builtin 제거 | 순서·disabled·실행·교체 결과 |
| EFS-05 | `withId` | undefined=create, string=update, string→undefined clear | create/update HTTP method와 Delete 후보 |
| EFS-06 | `onChange` | 등록 순서, 값·meta·동적 field 변경, 연쇄 중복 실행 방지 | 상호작용 후 DOM/store 결과 |
| EFS-07 | `onInit` | create/data 없음, update/data 있음, values.set=dirty, setFetched=baseline/clean, setMeta, form 구조 변경, 순서 | 최초 paint와 branch별 dirty |
| EFS-08 | `onBeforeSave` | setData threading, values snapshot, cancel(reason), cancel(no reason), throw-skip, 순서 | request body·미호출·message |
| EFS-09 | `onAfterSave` | success only, handler 순서, throw-skip, result/mutator 사용 | 성공 후 화면·후속 handler |
| EFS-10 | `onBeforeDelete` | ids, cancel(reason/no reason), throw-skip, adapter 미호출 | DELETE 요청·미요청과 message |
| EFS-11 | `onAfterDelete` | success only, 순서, throw-skip | 삭제 후 화면/목록 상태 |
| EFS-12 | `onBeforeListFetch` | setSearchForm threading, 순서, throw-skip | 실제 `/search` request body |
| EFS-13 | `onAfterListFetch` | rows/totalElements 관찰, setRows threading, 순서, throw-skip | diagnostics와 렌더 목록 |
| EFS-14 | `addFields` | default/explicit tab·group, label/order, tab hidden, tab/group requiredPermissions | DOM 순서·legend·가시성·권한 |
| EFS-15 | `withoutField` | 존재 필드 제거, 없는 이름 no-op | 필드/저장 payload 부재 |
| EFS-16 | `withoutTab` | 탭과 소속 field 제거, 없는 탭 no-op | tab/field/payload 부재 |
| EFS-17 | `withTab` | label/order/hidden 정적·조건부/requiredPermissions, 재호출 patch | tab 순서·가시성·권한 |
| EFS-18 | `withGroup` | label/order/open/requiredPermissions, 재호출 patch, groupId 전역 key·tabId lookup 미사용 | group 순서·legend·권한/collapse |
| EFS-19 | `withSteps` | replace, order, description, hidden 조건, 일부/전부 hidden, step간 값 유지 | wizard nav/content/graceful fallback |
| EFS-20 | `withMeta` | shallow merge, last-write-wins, `undefined` 키 제거, clone 격리 | diagnostics |
| EFS-21 | `withRevision` | undefined 미주입, save/update/delete의 exact `revisionEntityName` 주입, 해제 | POST/PUT/DELETE request body |
| EFS-22 | `withDataTransfer` | export/import auto derive, explicit fields, fileName, 재호출 replace, import/export 독립 | `EntityForm Proof` sheet의 id/name/status/category/note 셀과 import 후 SQLite row |
| EFS-23 | `clone` | includeValues false/true, hooks/steps/action deep isolation, meta top-level 격리+nested 공유, subclass `this` | 원본/clone diagnostics와 계약대로의 공유/비공유 |
| EFS-24 | constructor + query surface | name/url 정규화, 28 query/getter 각각 sample 참조, has/get found·missing, getTabFields→wizard 조합 | 53-member diagnostics·wizard DOM + AST gate |

EFS-24 manifest가 반드시 포함할 비설정 멤버:

```text
name, url, getTitle, getId, getCapabilities, getReadOnly, getActions, getRenderType,
getChangeHandlers, getInitHandlers, getBeforeSaveHandlers, getAfterSaveHandlers,
getBeforeDeleteHandlers, getAfterDeleteHandlers, getBeforeListFetchHandlers,
getAfterListFetchHandlers, getFields, getField, hasField, getTabs, getTab, hasTab,
getFieldGroups, getGroupFields, getTabFields, getSteps, getMeta,
getRevisionEntityName, getDataTransfer, clone
```

### 필수 pairwise 상호작용

| Pair ID | 조합 | 실패 시 잡아야 하는 회귀 |
|---|---|---|
| P-01 | `withId` × create/update capability | store renderType가 update여도 id 없으면 update 호출하는 모순 |
| P-02 | `withReadOnly` × `addAction(replaces:'save')` | read-only인데 커스텀 Save 슬롯 노출 |
| P-03 | `onInit` × fetched data × `clone().withId()` | fetched baseline/dirty/clone 누수 |
| P-04 | `onChange` × dynamic meta/field | cascade 중복·stale DOM |
| P-05 | `withTab/withGroup` × hidden/permission | 숨김/권한이 구조 patch를 되살림 |
| P-06 | `withSteps` × 전체 validation | 첫 invalid field 소유 step으로 이동→필드 오류 표시→focus가 되지 않는 dead-end |
| P-07 | before/after save × cancel/throw/order | adapter 호출 순서·후속 handler 오실행 |
| P-08 | before/after delete × `showConfirm` true/false × cancel/throw | false면 무요청·무메시지, true만 hook/DELETE 진행 |
| P-09 | before/after list × search mutation | hook search가 host 검색과 불일치 |
| P-10 | `withRevision` × create/update/delete | 미설정 주입 또는 설정 누락 |
| P-11 | `withDataTransfer` × field add/remove | auto-derived fields가 stale snapshot 사용 |
| P-12 | `clone` × hooks/meta/steps/actions/values | 원본과 clone 사이 공유 참조 |
| P-13 | Next Route Handler × SQLite × process restart | 새로고침/서버 재시작 후 create/update가 사라지거나 delete가 seed로 부활 |
| P-14 | backend validation × field/global plural UI | 필드 복수 오류와 폼 전체 복수 오류가 섞이거나 하나만 표시 |

branch suffix는 각 EFS 행의 “반드시 증명할 원자 분기”를 왼쪽부터 `a`…`z`,`aa`,`ab` 순서로 부여한다.
slash로 묶인 create/update/delete는 각각 별도 suffix다. manifest의 `sampleCase`는
slash 없는 `<member-kebab>--<branch-id-lowercase>`, Playwright title은 정확히
`[<branch-id>] <member> — <branch assertion>` 형식이다. `clone`은 manifest entry 하나에 EFS-23의
행동 branches와 EFS-24 inventory branch를 함께 두며 member 중복이 아니다. 모든 P ID는
`manifest.integrations`에 정확히 한 번 있고 member entry에 중복하지 않는다. hub의 status는 branch의
`status` 필드가 원천이며 EFSP-6 gate는 모든 EFS/P가 `implemented`가 아니면 실패한다. EFS/P owner는
§5에서 한 번만 지정하고 다른 task는 prerequisite로만 참조한다.

## 5. 실행 태스크

의존성 DAG는 `EFSP-0 → EFSP-1 → EFSP-2 → EFSP-3 → EFSP-4 → EFSP-5 → EFSP-6`으로
직렬 고정한다. 각 task는 앞 task의 manifest/SQLite/browser 증거가 green인 상태에서만 시작한다.

### EFSP-0 — 스펙 query 복구 + SQLite proof lab/AST 게이트

**소화 ID**: P-13. EFS-24는 inventory 골격만 만들고 행동 완료는 EFSP-1이 소유한다.
**변경 파일**: schema query 4개+unit red, public spec superseded stamps, manifest/AST script,
SQLite/store/routes/hub/pages, persistence runner, package/Next config/gitignore/CI.
**수용 기준**:

- 스펙 누락 query 4개가 red→green이고 현재 53멤버가 manifest와 exact match한다.
- manifest에서 한 멤버를 지우거나 `EntityForm`에 임시 public method를 추가하면 게이트가 red가 된다.
- `/entityform-proof` hub와 `/entityform-proof/baseline`이 렌더되고 generic CRUD/search route를 호출한다.
- 브라우저 create→refresh→update→서버 종료/재기동→read→delete→재기동→not-found가 같은 SQLite DB로 통과한다.
- hub reset 후 seed 1행이며 모두 삭제한 뒤 재기동해도 seed가 임의 부활하지 않는다.
- production `next start`에서도 hub와 Chromium CRUD가 green이다.

**검증**:

```bash
npm run check:entityform-sample-proof
npm run type-check
npm --prefix apps/sample run build
npx playwright test e2e/entityform-proof-identity.spec.ts --grep "baseline"
npm run test:e2e:persistence
npm run test:sample-production-smoke
```

**Do-NOT**: manifest를 실제 class에서 런타임 자동 생성하지 않는다. 그러면 새 API와 누락이 동시에 추가되어 게이트가 통과한다.
기존 CRUD route/search semantics를 복사·변경하지 않는다. 개발 DB를 E2E에서 reset하지 않는다.
client component에서 SQLite를 import하지 않는다. process restart를 module reload로 대체하지 않는다.

### EFSP-1 — identity/read/meta/clone/query 증명

**소화 ID**: EFS-01/03/05/20/23/24, P-01/02/03/12.
**변경 파일**: proof entity/pages, `e2e/entityform-proof-identity.spec.ts`, manifest.
**수용 기준**: 해당 모든 branch 행이 sample+E2E anchor를 가지며 diagnostics와 DOM/HTTP 단언이 일치한다.

**Do-NOT**: getter 결과만 JSON에 찍고 설정 동작을 증명했다고 세지 않는다. readOnly를 capability 차단과 혼동하지 않는다.

### EFSP-2 — field/tab/group/step 구조 증명

**소화 ID**: EFS-14~19, P-05/06.
**변경 파일**: proof entity/pages, `e2e/entityform-proof-structure.spec.ts`, manifest.
**수용 기준**: 구조 제거·patch·정렬·조건부 hidden·권한·all-hidden wizard가 DOM과 저장 payload로 관찰된다.

**Do-NOT**: unit assertion으로 대체하지 않는다. 테스트 편의를 위해 ViewEntityForm 구조 규칙을 변경하지 않는다.

### EFSP-3 — form lifecycle/revision 증명

**소화 ID**: EFS-06~11/21, P-04/07/08/10/14.
**변경 파일**: proof entity/pages, lifecycle E2E, manifest.
**수용 기준**: create/update/delete 실제 요청과 hook order/cancel/throw/success-only가 모두 관찰된다.
validation proof는 field 2개/global 2개 메시지를 별도 DOM 채널에서 동시에 보이고 DB row count가 불변이다.

**Do-NOT**: hook 증명을 mock 함수 호출 횟수로 끝내지 않는다. 오류를 console만 보고 통과시키지 않는다.

### EFSP-4 — capabilities/actions/list lifecycle 증명

**소화 ID**: EFS-02/04/12/13, P-09. P-01/02 결과를 회귀 확인하되 소유권은 EFSP-1이다.
**변경 파일**: proof entity/list page, actions-list E2E, manifest.
**수용 기준**: 조건부 capability/action과 list hook이 실제 버튼·request body·rows에 반영된다.

**Do-NOT**: function conditional의 pending 기본값을 즉시 최종값으로 단언하지 않는다. `SearchForm.addAndFilter` 의미를 바꾸지 않는다.

### EFSP-5 — data transfer와 전수 closure

**소화 ID**: EFS-22, P-11 및 EFS-01~24 빈 행 폐쇄.
**변경 파일**: proof entity/list page, transfer E2E, manifest, sample spec.
**수용 기준**: `EntityForm Proof` sheet/고정 열의 실제 xlsx 왕복 + import 후 SQLite row +
manifest 53/53 + branch/pair 빈 행 0. `sample-site-spec.md`에 §“EntityForm proof lab 상시 게이트”를
추가하고 수동 합격 시나리오와 `npm run test:e2e:persistence`를 그대로 포함한다.

**Do-NOT**: 다운로드 버튼 존재만으로 export 성공 처리하지 않는다. workbook 셀과 import 후 backend row를 관찰한다.

### EFSP-6 — 최종 적대 감사와 GA 재봉인

**소화 ID**: 전체.
**변경 파일**: manifest/계획/PROGRESS와 `documents/analysis/2026-07-13/entityform-sample-proof-result.md`;
결함 발견 시 해당 소스+회귀 테스트를 별도 논리 커밋.
**수용 기준**:

```bash
npm run check:entityform-sample-proof
npm run type-check
npm run typecheck:packages
npm run test:coverage
npm run lint
npm run format:check
npm run build
npm --prefix apps/sample run build
npm run test:e2e
npm run test:e2e:persistence
npm run test:sample-production-smoke
npm run check:surface
npm run check:exports
npm run check:publint
npm run smoke:load
npm run check:headless
```

AST 53/53, EFS-01~24, P-01~14 빈 행 0, SQLite 재시작 증거(생성 id/재기동 전후 값/삭제 후 404)를
결과 문서와 PROGRESS에 기록해야 완료다.

**Do-NOT**: 테스트를 맞추려고 공개 API를 넓히거나 구현 의미를 바꾸지 않는다. 실제 결함이면 먼저 red E2E를 남기고 별도 수정한다.

## 6. 공통 검증·커밋 규율

- 각 태스크는 `sample declaration → Playwright red 확인 → 구현/fixture 보강 → green` 순서다.
- 새 샘플 case는 한 설정을 설명할 수 있어야 하며, 테스트 전용 hidden backdoor로 상태를 주입하지 않는다.
- E2E는 role/label/data-proof 속성과 HTTP request/response를 관찰한다. React state나 private field를 직접 읽지 않는다.
- 기존 증거를 재사용할 때도 manifest의 assertion과 정확히 같은 관찰을 하는지 확인한다. 이름만 비슷한 테스트 연결은 금지다.
- 매 태스크 종료: diff 셀프 리뷰 → 논리 커밋 → PROGRESS 커밋 → push.
