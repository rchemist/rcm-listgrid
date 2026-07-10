# Issue #9: EntityForm.initialize() 단건 fetch 가 response.data.data(2-depth) 로 언랩 → 기존 엔티티 수정/상세 폼 manageEntityForm 크래시 (save/list 는 1-depth)

## GitHub Issue Information
- **ID**: 9
- **Title**: EntityForm.initialize() 단건 fetch 가 response.data.data(2-depth) 로 언랩 → 기존 엔티티 수정/상세 폼 manageEntityForm 크래시 (save/list 는 1-depth)
- **Created**: 2026-06-17T07:43:44Z
- **Labels**: (없음)
- **Status**: CLOSED (구현 완료 — v0.3.22 릴리스 반영)
- **Assignee**: @me

## Issue Content (요약)
`ViewEntityForm` 으로 **기존 엔티티 단건 상세/수정 폼**(`EntityForm.clone().withId(id)`) 을 렌더하면 초기 fetch 직후
`TypeError: Cannot read properties of undefined (reading 'manageEntityForm')` 크래시.
신규(create) 폼은 정상. `initialize()` 의 단건 fetch 만 `response.data.data`(2-depth) 로 읽어,
봉투가 `{ data: ENTITY }`(1-depth) 이면 `response.data.data === undefined` → `setFetchedValues(undefined)` → 크래시.

## 정당성 검증 (결론: **정당한 버그 — 제보자 진단 정확**)
- 제보된 근본 원인을 코드와 대조해 **그대로 확인**. `initialize()` 만 2-depth, 나머지 전 경로는 1-depth.
- 추가로 **git 히스토리로 발생 경위까지 규명**(아래 "Provenance" 절). 사용자 질의 — "0.2.x 에선 잘 됐는데 0.3.x 에서 바뀐 건가 / 백엔드가 rcm-backend-framework 로 넘어와서인가 / consumer DTO 가 안 맞는 건가?" — 에 대한 답.

## Problem Analysis
- **Symptoms**: 기존 엔티티 edit/detail 폼 진입 시 fetch 직후 `undefined.manageEntityForm` 크래시. create 폼은 정상.
- **Scope of Impact**: rcm-backend-framework 0.1.0(봉투 없는 bare-entity GET) 백엔드 + 표준 `configureApiClient` 어댑터를 쓰는 **모든 컨슈머의 단건 상세/수정 폼**.
- **Severity**: **HIGH** — 수정/상세 폼이 전부 진입 불가. 회피 불가(에러 바운더리).

## Provenance — "0.2.x 에선 됐는데 왜 지금 깨지나" (git 대조)

`initialize()` 단건 언랩 vs save/list/delete 언랩 깊이를 태그별로 비교:

| 태그 | `initialize()` 단건 GET | `internalSave` / `delete` / list-search |
|------|------------------------|------------------------------------------|
| v0.2.29 | `response.data.data` (**2-depth**) | `response.data` (**1-depth**) |
| v0.3.1  | `response.data.data` (**2-depth**) | `response.data` (**1-depth**) |
| v0.3.20 / v0.3.21 | `response.data.data` (**2-depth**) | `response.data` (**1-depth**) |

**핵심 결론:**
1. **listgrid 코드는 한 글자도 안 바뀌었다.** `initialize` 의 2-depth 는 v0.2.29~v0.3.21 동일. → 0.3.x 회귀 아님.
2. list/search 경로는 v0.2.29 에서도 이미 1-depth(`response.data` → `payload.list`). → **단건 GET 만 혼자 2-depth 인 비대칭이 처음부터 잠재**.
3. v0.3.1 BREAKING 커밋("rcm-framework 0.1.0 정합, Decision #31") 은 **endpoint 경로/메서드** 와 **list 페이로드 alias**(`data.list||data.content`, `totalCount||totalElements`, `searchForm||searchRequest`) 만 0.1.0 에 맞췄고, **단건 GET 언랩 깊이는 손대지 않아** 옛 2-depth 로 방치됨.

**3가지 가설에 대한 답:**
- "0.3.x 로 오면서 바뀌었나?" → **아니오.** listgrid 측 단건 언랩은 불변. 회귀가 아니라 **처음부터 있던 잠재 비대칭**.
- "백엔드가 rcm-backend-framework 로 넘어와서인가?" → **네, 이게 진짜 트리거.** v0.2.x 실서비스의 구(0.0.5-line) 백엔드/어댑터는 단건 GET 페이로드를 **2-depth 로 중첩**(`response.data.data === entity`) 해 내려줘서 2-depth read 가 우연히 맞아 동작했다. rcm-backend-framework 0.1.0 `AbstractCrudController` 는 GET `/{id}` 를 **봉투 없는 bare entity** 로 주고 표준 어댑터가 한 번만 감싸 `{ data: entity }`(**1-depth**) 가 된다 → 기존 2-depth read 가 `undefined`.
- "consumer DTO 가 안 맞나?" → DTO 필드가 아니라 **봉투(envelope) 중첩 컨벤션**이 0.0.5-line(wrapped) → 0.1.0(bare entity) 로 바뀐 것. consumer 어댑터는 오히려 문서화된 `ResponseData` 계약(`.data` = payload)을 정확히 따른다(save/list/delete 가 이미 그 계약 준수). **`initialize` 만 계약에서 벗어나 있었다.**

→ 따라서 1-depth 수정은 *새 동작 추가*가 아니라, **v0.3.1 이 시작한 "0.1.0 정합" 을 완성**하는 것. (커밋 본문도 "0.3.x 부터는 rcm-framework 0.1.0 GA 정합" 명시 → 0.3.x 에서 1-depth 가 명백히 정답.)

## Root Cause (코드 대조 확인)

### `src/listgrid/config/EntityForm.tsx:173-179` `initialize()`
```ts
const response = await this.fetchData();          // callExternalHttpRequest GET
if (!response.isError()) {
  fetchedEntity = response.data.data;             // ← 2-depth (outlier)
  entityForm = await entityForm.setFetchedValues(fetchedEntity);  // fetchedEntity === undefined
  entityForm.id = response.data.data.id;          // ← 2-depth
}
```

### 같은 파일의 다른 모든 경로 = 1-depth
- `internalSave()` (line 684/689): `form.id = response.data.id; setFetchedValues(response.data)`
- `delete` (line 476): `if (response.data)`
- list/search `Type.ts:138`: `const payload = (response.data ?? (response as unknown)); payload.list || payload.content`

### 계약 근거 — `src/listgrid/api/ApiClient.ts:33-46`
> "The host adapter MUST wrap the raw HTTP body into a `ResponseData<T>` whose **`.data` holds the backend payload**." 예시 어댑터: `return new ResponseData({ data: body, status })` (body = `await res.json()`).
즉 단건 GET 에서 `body === entity` → `response.data === entity`(**1-depth**) 가 계약상 정답. `initialize` 의 `response.data.data` 가 단독 outlier.

## Code Analysis
### Frontend (이 라이브러리는 FE 전용; 백엔드 변경 없음)
- **Related Files**:
  - `src/listgrid/config/EntityForm.tsx` — `initialize()`(line 162~, 버그), `setFetchedValues()`(line 531~, 방어 보강)
  - `src/listgrid/api/ApiClient.ts` / `api/types.ts` — envelope 계약(참조용, 변경 없음)
  - `src/listgrid/config/EntityFormMethod.test.ts` 또는 신규 테스트 파일 — 회귀 테스트
- **Analysis**: 수정은 `EntityForm.tsx` 단일 파일. `setFetchedValues` 에 nullish 조기 가드를 더해 미래의 봉투 이슈에도 크래시 대신 graceful degrade.

## Feature Surface Map
| Layer | What changes | How verified | Shared/Hot? |
|-------|--------------|--------------|-------------|
| `EntityForm.initialize()` 단건 GET 언랩 | `response.data.data` → `response.data` (1-depth) | 단위 테스트 + 기존 엔티티 edit/detail 폼 렌더 | **YES — 모든 상세/수정 폼 진입 경로** |
| `EntityForm.setFetchedValues()` | `entity?.manageEntityForm` + nullish 조기 가드 | 단위 테스트 (`setFetchedValues(undefined)` no-throw) | **YES — initialize/save 공유** |
| create(신규) 폼 경로 | 변경 없음 (fetch 안 함) | 회귀 확인 | NO |
| save/list/delete 경로 | 변경 없음 (이미 1-depth) | 기존 테스트 통과 | NO |
| **consumer 임시 우회(GET double-wrap)** | 업스트림 수정 후 **제거 필요** | consumer 측 재배포 후 edit 폼 동작 확인 | **YES — 조율 필수** |

## Concrete Fix Plan

> Design note — **explicit contract over incidental nesting**: 단건 GET 도 문서화된 `ResponseData.data = payload` 계약(save/list/delete 와 동일)으로 1-depth 통일. **방어적 fallback(`response.data.data ?? response.data`) 은 채택하지 않는다** — `data` 라는 이름의 엔티티 컬럼이 있으면 오인 추출 위험(예: `{ id, data: '...' }` 엔티티). 0.3.x 는 rcm-framework 0.1.0 라인으로 명시돼 있어 1-depth 가 유일 정답. 대신 `setFetchedValues` 에 nullish 가드를 둬 어떤 봉투 사고에도 throw 대신 graceful 처리.

### Step 1: `initialize()` 단건 fetch 를 1-depth 로 통일
**파일**: `src/listgrid/config/EntityForm.tsx`

#### Current (line 176-179)
```ts
if (!response.isError()) {
  fetchedEntity = response.data.data;
  entityForm = await entityForm.setFetchedValues(fetchedEntity);
  entityForm.id = response.data.data.id;
} else {
```

#### After
```ts
if (!response.isError()) {
  // 단건 GET 도 save/list/delete 와 동일하게 ResponseData.data = backend payload (1-depth).
  // rcm-framework 0.1.0 AbstractCrudController 는 GET /{id} 를 봉투 없는 bare entity 로 반환하며,
  // 표준 어댑터가 { data: entity } 로 한 번 감싼다 (ApiClient envelope 계약).
  fetchedEntity = response.data;
  entityForm = await entityForm.setFetchedValues(fetchedEntity);
  entityForm.id = response.data?.id;
} else {
```

### Step 2: `setFetchedValues()` nullish 조기 가드 (방어선)
**파일**: `src/listgrid/config/EntityForm.tsx`

#### Current (line 531-538)
```ts
public async setFetchedValues(entity: Partial<T> | any): Promise<EntityForm<T>> {
  this.fetchedEntity = entity;
  if (entity.manageEntityForm) {            // ← entity 가 nullish 면 여기서 throw
    this.manageEntityForm = entity.manageEntityForm;
  }
  this.fields.forEach(...)
```

#### After
```ts
public async setFetchedValues(entity: Partial<T> | any): Promise<EntityForm<T>> {
  // 봉투/페이로드 이상으로 entity 가 nullish 로 들어와도 크래시 대신 현 상태 유지.
  if (entity == null) {
    console.error('[EntityForm] setFetchedValues received nullish entity — skipping value population');
    this.dataPreloaded = true;
    return this as unknown as EntityForm<T>;
  }
  this.fetchedEntity = entity;
  if (entity.manageEntityForm) {
    this.manageEntityForm = entity.manageEntityForm;
  }
  this.fields.forEach(...)
```
> 이후 `this.fields.forEach` 의 `entity[key]` 접근들도 nullish 가드 덕에 안전.

### Step 3: 회귀 테스트 추가
**파일**: `src/listgrid/config/EntityFormMethod.test.ts`(기존) 또는 신규 `EntityForm.initialize.test.ts`

- `overrideFetchData` 로 `ResponseData({ data: ENTITY })`(1-depth) 를 주입 → `initialize()` 후 `entityForm.id === ENTITY.id` 이고 각 필드 `fetched` 값이 채워짐 → **PASS** (현재 코드에선 crash → 회귀 고정)
- `setFetchedValues(undefined)` / `setFetchedValues(null)` → throw 없이 동일 form 반환 → **PASS**
- create(신규, isAbleFetch=false) 경로는 fetch 를 타지 않아 그대로 정상 → 회귀 확인

> 주의: `fetchData` 는 `useSession()` 등 React 훅을 탈 수 있으므로, 테스트는 `overrideFetchData`(line 596) 주입 경로로 초기화해 훅 의존을 피한다.

## Acceptance Scenario (executable — definition of done)
1. (단위) `overrideFetchData → ResponseData({ data: { id: 42, name: 'x', manageEntityForm: {...} } })` 주입, `initialize({})` 호출 → throw 없음, `entityForm.id === 42`, `name` 필드 `fetched === 'x'`, `manageEntityForm` 설정됨 → **PASS**
2. (단위) `setFetchedValues(undefined)` → throw 없이 form 반환, `dataPreloaded === true` → **PASS**
3. (통합/실환경) rcm-backend-framework 0.1.0 백엔드 + 표준 `configureApiClient` 어댑터로 **기존 엔티티 edit/detail 폼**(`withId(existingId)`) 진입 → 크래시 없이 폼 필드에 기존 값이 채워져 표시 → **PASS**
4. (회귀) **create(신규) 폼** 진입 → 종전대로 정상 → **PASS**
5. (조율) consumer 의 GET double-wrap 임시 우회 제거 후에도 edit/detail 폼 정상 → **PASS**

## Environment & Temporal Preconditions
- **Test data needed**: 단위는 `overrideFetchData` 주입으로 충분. 실환경(#3) 은 rcm-framework 0.1.0 `AbstractCrudController` 백엔드의 기존 엔티티 1건 + `id` 로 진입하는 edit/detail 라우트.
- **Temporal**: 무관.
- **Needs restart/redeploy to take effect**:
  - consumer 는 `@rchemist/listgrid` 0.3.22 로 **재설치/재빌드**.
  - **consumer 의 임시 우회(어댑터 GET double-wrap) 를 함께 제거**해야 함 — 제거하지 않으면 `response.data === { data: entity }` 가 되어 1-depth read 가 `{ data: entity }`(필드 없음) 를 잡아 폼이 비게 됨. (이슈 본문 "업스트림 수정 시 제거" 와 일치)
- **Target env / DB**: 무관 (프런트 언랩 로직). 백엔드 contract = rcm-framework 0.1.0 bare-entity GET.

## Validation and Test Plan
1. `npm run type-check` — PASS
2. `npm test` — 기존 + 신규 initialize/setFetchedValues 테스트 PASS
3. `npm run lint` / `npm run format:check` — 0 errors
4. `npm run build` — dist 생성 OK
5. **Acceptance #3(실환경 edit/detail 폼)** 을 consumer 에서 확인 + **#5(우회 제거 후) 동작** 확인

## Risk Factors and Mitigation
- **Risk**: consumer 가 임시 double-wrap 우회를 제거하지 않은 채 0.3.22 로 올리면 폼이 빈 값으로 뜬다. → **Mitigation**: 릴리스 노트/이슈 코멘트에 "우회 제거 필수" 명시(Acceptance #5). 1-depth 가 표준임을 CHANGELOG 에 기록.
- **Risk**: 0.0.5-line(구 백엔드, 2-depth 봉투) 를 아직 쓰는 0.3.x consumer 가 있다면 깨질 수 있음. → **Mitigation**: v0.3.1 커밋이 "0.3.x = rcm-framework 0.1.0 정합" 으로 선언했고 0.0.5-line 은 0.2.x 라인이 담당하므로 0.3.x 에서 1-depth 가 정책상 정답. 해당 consumer 는 0.2.x 사용.
- **Risk**: `data` 컬럼을 가진 엔티티에서 방어적 `?? ` fallback 이 오인 추출. → **Mitigation**: fallback 미채택(설계 노트 참조), 순수 1-depth.

## Success Criteria
1. 기존 엔티티 edit/detail 폼이 크래시 없이 기존 값으로 채워져 진입된다(Acceptance #3).
2. create 폼/ save / list / delete 동작 불변(regression 0)(Acceptance #4).
3. `setFetchedValues(nullish)` 가 throw 하지 않는다(Acceptance #2).
4. type-check / test / lint / build 전부 통과.
5. consumer 임시 우회 제거 후에도 정상(Acceptance #5) — 릴리스 노트에 제거 안내 포함.

## Implementation Results

**상태: 구현 완료 + 라이브러리 레벨 검증 green (릴리스 0.3.22)**

### 변경 파일
- `src/listgrid/config/EntityForm.tsx` —
  - `initialize()` 단건 fetch 언랩: `response.data.data`(2-depth) → `response.data`(1-depth), `entityForm.id = response.data?.id`.
  - `setFetchedValues()` nullish 방어선 추가: `entity == null` 이면 throw 대신 현 form 반환(+`dataPreloaded=true`).
- `src/listgrid/config/EntityForm.initialize.test.ts` (신규) — 1-depth 봉투 fetch 시 필드/ID 채움·manageEntityForm 설정, `0` 보존, `setFetchedValues(undefined|null)` no-throw 회귀 테스트.

### 검증 결과
- `npm run type-check` — **PASS**
- `npm test` — **929 passed / 1 todo / 0 fail** (신규 initialize 테스트 포함)
- `npm run lint` — **0 errors** · `npm run format:check` — **PASS** · `npm run build` — **PASS**
- 빌드된 `dist/listgrid/config/EntityForm.js` 에 1-depth 언랩·nullish 가드 반영 확인.

### Acceptance Scenario 실행 결과
- #1 1-depth 봉투(`{ data: entity }`) fetch → id/필드 채움, 크래시 없음 — **PASS (단위/통합 테스트)** *(수정 전이라면 이 경로가 crash)*
- #2 `setFetchedValues(undefined|null)` → throw 없이 form 반환 — **PASS (단위 테스트)**
- #3 실환경 rcm-framework 0.1.0 백엔드 edit/detail 폼 진입 → 크래시 해소 — **컨슈머 실환경 최종 확인 필요(아래 안내).**
- #4 create 폼 회귀 0 — **PASS (전체 스위트 green)**
- #5 컨슈머 임시 우회 제거 후 정상 — **컨슈머 측 적용 필요(아래 안내).**

### 컨슈머(클라이언트 프로젝트) 적용 안내 — 0.3.22 업그레이드 시
1. `@rchemist/listgrid` 를 **0.3.22** 로 올린다.
2. 어댑터(`configureApiClient`)의 `callExternalHttpRequest` 에서 **GET 응답을 double-wrap 하던 임시 우회**
   (`{ data: { data: json } }`) 가 있다면 **반드시 제거**한다. 표준 1-depth 봉투(`{ data: json }`)만 유지.
   - 제거하지 않으면 `response.data === { data: entity }` 가 되어 1-depth read 가 빈 객체를 잡아 **폼이 빈 값**으로 뜬다.
3. 우회가 애초에 없던 컨슈머(표준 어댑터만 사용)는 **추가 조치 없이** 0.3.22 로 올리면 edit/detail 폼 크래시가 해소된다.
4. 여전히 구(0.0.5-line, 2-depth 봉투) 백엔드를 쓰는 프로젝트는 **0.2.x 라인**을 사용해야 한다(0.3.x = rcm-framework 0.1.0 정합).
