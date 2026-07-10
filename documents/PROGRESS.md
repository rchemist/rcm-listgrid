# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active (설계 완료 · 작업 미착수)
**Engine**: claude (codex eligible 태스크는 개별 표기 — P3-4 표면 감사표 등 인용 기반 반복 작업만)
**Push**: manual (커밋까지 완료 후 사용자에게 push 대상 보고)
**Model policy**: **fable 불필요.** 세션 기본 sonnet, `[O]` 태스크만 opus (`/model`로 전환). `[H]`=haiku 위임 가능한 반복. 설계 판단이 ADR/헌장으로 해소되지 않으면 **구현하지 말고** §Open Questions에 기록 후 사용자에게 질의한다.
**Next session policy**: 새 세션은 ① 이 문서 → ② [documents/README.md](./README.md)(권위 순서) → ③ 착수할 태스크가 가리키는 ADR **만** 읽고 재개한다. 분석 원자료(analysis/2026-07-10/raw/)는 읽지 않는다(정정 전 주장 포함 — 필요 시 verification-log 경유).
**Last updated**: 2026-07-10 (PROGRESS 설계 — P0-1부터 착수 가능)

## Goal

[ADR-0008](./adr/ADR-0008-refoundation-strategy.md) 재기초 전략의 실행: `v0.4` 브랜치의 모노레포 워크스페이스에 4계층 골격을 신축하고, 구엔진(0.3.x)의 검증된 로직을 특성화 테스트 오라클 아래 **이식**하여 0.4.0 GA에 도달한다. 보존 대상 개념은 [개념 헌장](./prd/concept-charter.md) C1~C9가 전부이며, GA 게이트에서 대조표로 검증한다.

## Context

- **브랜치**: `main`=0.3.x 유지보수(P0만 여기). **`v0.4`**=재기초(P1~P7). 세션 시작 시 착수 태스크의 브랜치로 checkout 확인. main에 0.4 코드 금지, v0.4에 0.3 픽스 직접 커밋 금지(main에서 고치고 이식 시 반영).
- **환경**: Node은 `.nvmrc` 기준(P0-8에서 생성 — 그전엔 Node 22 LTS 사용. **Node 26에서는 기존 테스트 27건이 jsdom localStorage 문제로 실패하니 버전을 반드시 확인**). 품질 게이트: `npm run type-check && npm test && npm run lint && npm run format:check && npm run build`.
- **릴리스**: 0.3.26(main, P0), 0.4.0-alpha.N(v0.4, dist-tag `next`, P1부터 상시), 0.4.0 GA(P7). **npm publish는 외부 공개 — 반드시 사용자 승인 후 실행.**
- 근거 문서: 분석 보고서 §6(버그 좌표) · ADR-0001~0008 · 헌장 · [apps/sample 명세](./prd/sample-site-spec.md) · [로드맵](./plans/v1-roadmap.md)(페이즈 정의의 원본 — 이 문서와 어긋나면 로드맵이 우선).

## 불변 규율 (전 세션 공통 — ADR-0008 방지 장치)

1. **헌장 = 스코프 울타리**: 이식 중 신기능·개선 아이디어는 구현하지 말고 §Backlog에 한 줄 기록.
2. **이식 우선, 재발명 금지**: 리프 로직(필드/검증/포맷)은 테스트와 함께 옮긴다. 다시 쓰려면 커밋 메시지에 사유 필수.
3. **특성화 오라클**: P2 테스트 그물이 신구 양쪽에서 green이어야 이식 완료.
4. **이식 중 동시 처리는 고정 목록만**: i18n 키화 / 중복 통합 / `any` 제거 / 도메인 리터럴→presets-rcm / a11y 3종. 그 외 "하는 김에" 금지.
5. **검증 없는 ✅ 금지**: 완료 체크에는 증거(테스트 수·실행 커맨드·결과) 한 줄 필수. 렌더 변경은 apps/sample(P1 이후)에서 실제 화면 확인.
6. **매 태스크 종료**: diff 셀프 리뷰 → 논리 단위 커밋(관례: `feat|fix|refactor(scope): 내용`) → 이 문서 체크 갱신 커밋. push는 manual.

## Do-NOT (재론 금지 — 근거: 분석 §7, ADR-0002/0003/0008)

- 전면 백지 재작성(규율 2 위반) · SubViewEntityForm 단독 분리 · xstate 도입 · 전역 싱글턴의 React Context화 · 무료 기능 유료화
- 구 배럴(main)의 표면 재단(0.4에서만 — 이중 작업 금지) · docs/api 커밋 재개 · 헌장 밖 신기능의 v0.4 편입
- react-hook-form/TanStack Form로 폼 상태 대체(ADR-0002 기각 사유 참조)

## Progress State

| 페이즈 | 브랜치 | 상태 | 릴리스 | 요약 |
|---|---|---|---|---|
| P0 실버그 핫픽스 | main | ⬜ 미착수 | 0.3.26 | 확정 버그 9건 + 안전 기본값 + 환경 고정 |
| P1 워크스페이스+패키징 | v0.4 | ⬜ | alpha.0 | 스캐폴드 · tsup dual · CI · apps/sample 골조 |
| P2 특성화 오라클 | main→공용 | ⬜ | (내부) | 행동 고정 테스트 4묶음 |
| P3 계약 골격+감사표 | v0.4 | ⬜ | alpha.N | spec-first 게이트 · 파일럿 이식 |
| P4 코어 이식 | v0.4 | ⬜ | alpha.N | schema-core+state · **abort 판정 지점** |
| P5 렌더러 이식 | v0.4 | ⬜ | alpha.N | 필드 40종 · store 구독 · sample 성장 |
| P6 어댑터·표면 | v0.4 | ⬜ | 0.4.0-rc | backend-rcm/rest · ui-default · exports |
| P7 GA | v0.4→승격 | ⬜ | **0.4.0** | 헌장 대조 · MIGRATION · 브랜치 플립 |

**타임박스**: P0~P3 3개월 / P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토(사용자 결정 사안).

---

## Tasks

### P0 — 실버그 핫픽스 (main, 0.3.26) — 모두 독립 태스크, 순서 무관

여기서 고친 로직이 이후 이식 대상이 된다(버그째 이식 방지). 각 태스크 = 수정 + 회귀 테스트 + 기존 스위트 green.

- [ ] **P0-1 [S] min/max 검증 무력화 수정** — `src/listgrid/validations/Validation.tsx:109-124` `getValueAsNumber/getValueAsBoolean`: `??`보다 `===`가 먼저 평가되는 우선순위 버그. 같은 파일 `getValueAsString(:92-101)`이 올바른 참조 구현 — 동일 형태로 괄호 수정: `value?.current ?? (entityForm.getRenderType() === 'update' ? value?.fetched : value?.default)`. 테스트: update 모드에서 current가 있으면 current 검증 / `current=0` 보존 / `MinMaxNumberValidation` 실동작.
- [ ] **P0-2 [S] DatetimeField 타입 오등록** — `src/listgrid/components/fields/DatetimeField.tsx:24` `super(name, order, 'date', …)` → `'datetime'`. 주의: 지금껏 죽은 코드였던 `transfer/Type.ts:565-576,607-610`의 datetime 분기가 처음 활성화됨 — Excel **range export + import** 왕복에서 시간 보존 테스트 필수. 필터는 `HeaderFieldFilter.tsx:172`가 'date'||'datetime' 양쪽 처리라 무회귀 예상(확인만).
- [ ] **P0-3 [S] FieldRenderer onChange 2벌 통합 + 에러 삼킴 제거** — `src/listgrid/components/form/FieldRenderer.tsx:77-142`(handleFieldChange) vs `:240-310`(viewParams.onChange)이 축자 중복이며 두 IIFE 모두 `.catch()` 없음(validate/getManyToOneLink throw 시 unhandled rejection, 필드가 값·에러를 조용히 잃음). 공통 `applyFieldChange()` 헬퍼로 추출하고 IIFE 전체를 try/catch — catch에서 사용자 피드백(setErrors) 보장. 테스트: validator throw 시나리오.
- [ ] **P0-4 [S] pageSize 우선순위 역전 수정** — `src/listgrid/components/list/hooks/useQuickSearchBar.ts:112-117`이 전역 localStorage 값으로 리스트별 `options.defaultPageSize`를 마운트 시 덮어씀(`useListGridLogic.ts:461`과 대조). 명시 지정 > 전역 저장값 > 라이브러리 기본 순으로 정정. 테스트: defaultPageSize=50 리스트가 전역=20이어도 50 유지.
- [ ] **P0-5 [S] useLoadingStore 구독 배선** — `src/listgrid/loading/index.ts:12-29`: 훅 이름인데 구독 메커니즘 없음(상태 변경해도 리렌더 안 됨). zustand store로 교체(이미 의존성). `configureLoading`의 호스트 교체 계약은 유지. 테스트: 상태 변경 시 구독 컴포넌트 리렌더.
- [ ] **P0-6 [H] clone 권한 aliasing** — `src/listgrid/config/EntityForm.tsx:51` `= this.manageEntityForm` → `= { ...this.manageEntityForm }`. 테스트: clone 후 원본의 withUpdatable 변경이 클론에 미전파.
- [ ] **P0-7 [S] 보안 기본값 3종** (ADR-0006 §Decision 1·2·3) — ① `configureHtmlSanitizer((html)=>string)` 신설, 싱크 3곳(`HtmlField.tsx:34`, `ShowNotifications.tsx:90`, `ViewHelpIcon.tsx:28`)이 경유하도록 — 미설정 시 raw HTML 거부(이스케이프 텍스트 + dev warn). ② `MenuPermissionChecker.ts` 미설정 첫 호출 시 console.warn 1회 + 헤더 주석 'WRITE'→'ALL' 오기 정정. ③ `simpleCrypt.ts:9-11` 폴백 키 제거 — cryptKey 미설정 시 encrypt/decrypt throw. 테스트: `<img onerror=…>` 페이로드가 텍스트로 렌더 / warn 1회.
- [ ] **P0-8 [S] 환경 고정 + 릴리스 게이트** (ADR-0007 P0) — `engines.node >=20` + `.nvmrc`(22 LTS) + ci.yml Node 20/22 매트릭스. jsdom localStorage 27건: 먼저 `src/test-setup.ts`에 localStorage 셋업/폴리필 또는 jsdom 옵션으로 해소 시도, 실패 시 .nvmrc 고정으로 봉쇄하고 사유 기록. `scripts/check-release-docs.mjs`(CHANGELOG 최상단 버전==package.json) 작성 + publish.yml 게이트 연결. eslint `no-explicit-any: error` + 기존 위반 파일은 파일 단위 disable로 동결(신규 유입만 차단). 수용: 고정 Node에서 `npm test` 전량 green.
- [ ] **P0-9 [H] 잔재 정리** — `misc/index.ts:423-425` `http://127.0.0.1:8320` 폴백 제거(빈 문자열 + 미설정 warn) · `AdvancedSearchForm`(V1, 내부 사용처 0)에 `@deprecated` TSDoc + CHANGELOG 제거 예고.
- [ ] **P0-10 [S] 0.3.26 마감 + v0.4 전환** — CHANGELOG 0.3.26 작성(게이트 스크립트 통과 확인) · version bump · 사용자 승인 후 publish · **전환 절차**: 이 PROGRESS를 v0.4 브랜치에 반영(`git checkout v0.4 && git merge main` — P0 시점엔 문서/픽스만이라 병합 가능; 이후 발산 시작) + main의 PROGRESS 상단에 "P1+는 v0.4 브랜치의 PROGRESS가 진실" 스텁 문구 추가. 이후 모든 PROGRESS 갱신은 **v0.4에 커밋**.

**P0 게이트**: 신규 테스트 포함 전량 green · 0.3.26 publish · 소비자(edustack/GJCU) 무변경 동작.

### P1 — v0.4 개시: 워크스페이스 + 패키징 + 샘플 골조 [ADR-0008 §구조, ADR-0001, sample-spec §P1]

- [ ] **P1-1 [S] 워크스페이스 골조** — 루트 package.json `workspaces: ["packages/*","apps/*"]`. `packages/{schema-core,state,react,ui-default,backend-rcm,backend-rest,presets-rcm,next}` + `apps/sample` 생성(각각 package.json private + tsconfig project reference + 빈 index.ts). 기존 `src/`는 **이식 원본으로 유지**(삭제 금지 — P4~P5에서 파일 단위로 비워짐). 내부 패키지명은 `@listgrid/<name>` 작업명(배포는 루트 단일 패키지 — ADR-0008 §배포 형태).
- [ ] **P1-2 [S] tsup dual 빌드** — ADR-0001 구현 계획 1~3항: 루트에서 진입점별 ESM+CJS+d.ts+sourcemap, exports 맵 3-조건(`types/import/require`), `build:styles` 유지, engines 반영.
- [ ] **P1-3 [S] CI 이중화 + 로드 게이트** — ci.yml: main·v0.4 트리거, Node 20/22 매트릭스, 로드 스모크(`node -e require` + `--input-type=module` import, 대표 서브패스 포함), publint + @arethetypeswrong/cli. 수용: ADR-0001 수용 기준의 4경로 로드.
- [ ] **P1-4 [S] alpha 배포 파이프** — publish.yml에 v0.4 분기: `npm version 0.4.0-alpha.N --no-git-tag-version` + `npm publish --tag next`(--provenance 유지). **첫 배포(alpha.0)는 빈 골격이어도 실행**(파이프 검증이 목적). 사용자 승인 후 publish.
- [ ] **P1-5 [S] apps/sample 스캐폴드** — [명세](./prd/sample-site-spec.md) §P1 범위: Next.js App Router + workspace 참조 + **목업 rcm 백엔드**(route handlers가 rcm 0.1.0 envelope로 메모리 fixture 서빙: `POST /api/{entity}/search`, bare GET `/{id}`, POST/PUT/DELETE) + 홈(로드된 패키지 버전 표시). 수용: `npm run dev -w apps/sample` 단독 기동.

**P1 게이트**: 로드 4경로 green · alpha.0 이 `npm i @rchemist/listgrid@next`로 설치·로드됨 · sample 기동.

### P2 — 특성화 테스트 그물 = 이식 오라클 [ADR-0007 §2]

구엔진(main의 src/) 행동을 고정한다. **신구 양쪽에서 실행 가능해야 한다** — 테스트가 라이브러리 진입점을 하드코딩하지 말고 하네스 모듈 1곳에서 import하도록(P4부터 같은 테스트를 신 엔진으로 돌린다).

- [ ] **P2-1 [S] 하네스** — `tests/characterization/harness.ts`: 진입점·fixture(엔티티 선언 3종 — sample 도메인 재사용)·fetch 목업을 단일 모듈로.
- [ ] **P2-2 [S] FieldRenderer 특성화** — 대표 6종(String/Number/Select/Date/ManyToOne/Boolean): 렌더 → 입력 → 검증 실패/통과 → 에러 표시 → 값 반영. 스냅숏 금지, 행동 단언만.
- [ ] **P2-3 [S] 폼 로직 특성화** — 초기화(create/update: fetch 목업 경유 값 채움) · 저장(submit payload 형태 고정 — envelope 포함) · 리셋 · 탭 전환 · dirty 판정 엣지(빈 문자열/0/빈 배열).
- [ ] **P2-4 [S] 리스트 로직 특성화** — 검색→검색폼 직렬화(wire 형식 고정)→페이지→다중 정렬→행 선택→일괄 삭제 payload.
- [ ] **P2-5 [S] ViewEntityForm 구조 특성화** — 스텝 위저드 진행 · 서브컬렉션 표시/모달 재진입 콜백 · 버튼 배치 규칙.

**P2 게이트**: main에서 전량 green · 렌더 테스트 파일 9→25+ · 커버리지 래칫 가동(ADR-0007 §3).

### P3 — 계약 골격 + 표면 감사표 (spec-first 게이트)

- [ ] **P3-1 [O] schema-core 계약** — `packages/schema-core`: EntityField **순수 메타 인터페이스**(view() 제거 — ADR-0003 §Decision 1), FieldValue 슬라이스 스키마(`{current,fetched,default,errors,dirty}` — ADR-0002 §Decision 1), `PermissionPolicy` 단일 구현(구엔진 3중복 통합 + **SubCollection 권한 포함** — 구엔진에 없던 유일한 신규 규칙, 헌장 C2).
- [ ] **P3-2 [O] state 계약** — `packages/state`: `createFormStore()/createListStore()` API(zustand vanilla), 셀렉터 규약, 중첩 폼의 자식 store 생성+부모 캐시 전달 프로토콜(ADR-0002 §Decision 4).
- [ ] **P3-3 [O] BackendAdapter 계약** — `packages/schema-core` 또는 별도: ADR-0005 §Decision 1 인터페이스 + `BackendErrorCode` enum. 구현은 P6(여기선 타입+기본 어댑터 시그니처만).
- [ ] **P3-4 [S, codex eligible] 표면 감사표** — 구 배럴(src/listgrid/index.ts) 580 심볼 전수 → `documents/analysis/surface-audit.csv`(심볼·분류[유지/이동/삭제]·이동 대상 패키지·근거 한 줄). 판정 기준: ADR-0004 §Decision 1. 목표 공개 심볼 ≤220.
- [ ] **P3-5 [S] 렌더러 레지스트리 + StringField 파일럿 이식** — `packages/react`: `registerFieldRenderer(type, component)` + 미등록 폴백(dev 경고+문자열). StringField를 **레시피 확립용으로 1종 완전 이식**(메타는 schema-core, 값은 store, 렌더는 레지스트리) → 특성화 P2-2 String 케이스가 신 엔진에서 green → **이식 레시피 문서화**(`documents/plans/transplant-recipe.md`: 단계·체크리스트·동시 처리 목록 — 이후 39종의 표준 절차).
- [ ] **P3-6 [O] 헌장 대조 리뷰** — C1~C9 × 계약 골격 매핑 표 작성(빈 칸 = 계약 보완 필요). apps/sample에 파일럿 필드 데모 페이지 추가.

**P3 게이트**: 골격 컴파일 + 파일럿 1종이 sample에서 렌더·입력·검증 동작 + 감사표 완성 + 대조표에 빈 칸 없음.
**P3 종료 세션의 의무**: 아래 P4·P5 개요를 **체크박스 태스크로 전개**해 이 문서에 커밋한다(전개 규칙은 각 개요에 명시).

### P4 — 코어 이식 (개요 — P3 종료 시 전개) **[abort 판정 지점]**

EntityForm 선언 모델(5단 상속→컴포지션), 검증 12종, SearchForm 직렬화, OnChange 연쇄를 schema-core+state로 이식.
**전개 규칙**: 감사표의 "유지" 심볼 중 config/·form/·validations/ 소속을 모듈 단위(≈8~12 태스크)로 나누고, 태스크마다 ①이식 원본 경로 ②대상 패키지 ③대응 특성화 테스트 ④모델 태그를 기입. 감리 [O], 실행 [S].
**게이트**: 특성화 로직 계층 테스트가 신 코어에서 동일 green · madge circular ≤20 · 추정 150% 초과 시 abort 검토(사용자 결정).

### P5 — 렌더러 이식 (개요 — P4 중반 전개)

파일럿 레시피(P3-5)로 39종 반복 [H/S] → ViewEntityForm/ViewListGrid를 store 셀렉터 구독으로 재구성(드릴링 0) → CSS 이식+레이어 충돌 4건 정리(raw/map-styles §2.3 — 이 항목만 원자료 참조 허용) → 동시 처리 고정 목록 적용 → sample 엔티티 3종 + /theming 완성.
**전개 규칙**: `grep -l "extends.*FormField" src/listgrid/components/fields` 목록으로 필드별 체크박스 생성(1필드=1태스크=1커밋, 특성화 or 신규 렌더 테스트 동반).
**게이트**: ADR-0002 수용 기준(키 입력 리렌더=1필드·onChange clone 0회·중첩 재fetch 0회) + 그물 전량 green + `t()` 한글 키 0건.

### P6 — 어댑터·표면 완성 (개요)

backend-rcm(현행 URL/envelope 관례 **무변경 이사** — EntityForm.tsx:676-688, form/Type.ts:91-168이 원본) + backend-rest + 에러 코드 재배선(ADR-0005) · ui-default(headlessui/react-select/sortablejs 격리 — ADR-0004 §4) · next 어댑터 이식 · exports 맵 = 감사표 착지 · sample /extensibility E1~E6([명세](./prd/sample-site-spec.md)).
**게이트**: ADR-0005 4항 + ADR-0004 6항(심볼≤220 · 도메인 어휘 코어 0건 · 코어 필수 peer ≤4) + E1~E6 시연.

### P7 — 0.4.0 GA (개요)

MIGRATION "0.3→0.4" + codemod · docs/api 재생성 · **헌장 대조표**(C1~C9 × 구현 위치 × sample 페이지 — 빈 행 시 GA 불가) · 실엔티티 재현 검증(헌장 §보존 검증 3 — GJCU/edustack급 엔티티 1종) · getting-started 전면 개정(코드 블록=sample 실코드) · 브랜치 플립(main→release/0.3, v0.4 승격) · 0.3.x 지원 정책 고지.

---

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

(비어 있음)

## Open Questions

- [ ] npm publish 승인 방식: alpha.N마다 개별 승인 vs "alpha는 포괄 승인" — 사용자 결정 필요 (P1-4 전까지)
- [ ] apps/sample 목업 백엔드에 실제 rcm-backend-framework 연결 옵션(로컬 인스턴스)을 둘지 — 현재 명세는 fixture 단독 (P5 전까지)
- [ ] 0.2.x 라인(release/0.2)에 P0 버그 중 백포트할 항목이 있는지 — P0-1(검증)·P0-2(엑셀)는 후보 (P0-10 전까지)

## 완료 기록 (태스크 완료 시 여기에 한 줄 증거 누적, 페이즈 완료 시 progress-archive로 이동)

(비어 있음)
