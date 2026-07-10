# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · **구동 트랙 = E2E-Parity Vertical Slice**(무인모드, 2026-07-10~ — 실제 GJCU 폼을 신 엔진에서 Playwright E2E로 동작 증명) · **Next up**: V0.1(schema-core 코어 — EntityForm+필드클래스). P0/P1 publish는 외부 승인 대기(별건).
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 E2E green까지 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — P3-4 표면 감사표 등 인용 기반 반복 작업만)
**Push**: manual (커밋까지 완료 후 사용자에게 push 대상 보고)
**Model policy**: **fable 불필요.** 세션 기본 sonnet, `[O]` 태스크만 opus (`/model`로 전환). `[H]`=haiku 위임 가능한 반복. 설계 판단이 ADR/헌장으로 해소되지 않으면 **구현하지 말고** §Open Questions에 기록 후 사용자에게 질의한다.
**Next session policy**: 새 세션은 ① 이 문서 → ② [documents/README.md](./README.md)(권위 순서) → ③ 착수할 태스크가 가리키는 ADR **만** 읽고 재개한다. 분석 원자료(analysis/2026-07-10/raw/)는 읽지 않는다(정정 전 주장 포함 — 필요 시 verification-log 경유).
**Last updated**: 2026-07-10 (**✅ V0 walking skeleton 완료** 🎉 — College(+dean ManyToOne 팝업)가 신 엔진 6패키지로 실브라우저 Playwright E2E green(2 tests: CRUD 왕복 + M2O 피커). ADR-0008 abort판정 GO 방향 실증. 전체 1088 unit + 2 E2E. V0.1~V0.4b 커밋됨. 다음: V1 Major(Number/Select/Date+validations+cross-field). 대기(외부): 0.3.26·alpha.0 publish 승인)

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
- **0.2.x(`release/0.2`) 선제 수정 금지 (사용자 확정 2026-07-10)** — 프로덕션 가동 중. 별도 에러 리포트가 들어오지 않는 한 백포트·수정하지 않는다. 0.3.x부터는 자유 수정·배포 가능.

## Progress State

| 페이즈 | 브랜치 | 상태 | 릴리스 | 요약 |
|---|---|---|---|---|
| P0 실버그 핫픽스 | `p0-hotfixes` | 🟡 코드완료 | 0.3.26 | 버그 9건+보안 3종+환경 완료 · publish/전환만 승인 대기 |
| P1 워크스페이스+패키징 | v0.4 | 🟡 코드완료 | alpha.0 | 스캐폴드·tsup dual·CI 로드게이트·sample 기동 완료 · alpha.0 publish만 승인 대기 |
| P2 특성화 오라클 | v0.4(=main src) | ✅ 완료 | (내부) | 하네스+4묶음 68테스트 · 엔진 wart 다수 특성화(이식 결정용) |
| P3 계약 골격+감사표 | v0.4 | 🟡 P3-1 완료 | alpha.N | schema-core 계약 골격(17 char tests) · 남음 P3-2~6 |
| P4 코어 이식 | v0.4 | ⬜ | alpha.N | schema-core+state · **abort 판정 지점** |
| P5 렌더러 이식 | v0.4 | ⬜ | alpha.N | 필드 40종 · store 구독 · sample 성장 |
| P6 어댑터·표면 | v0.4 | ⬜ | 0.4.0-rc | backend-rcm/rest · ui-default · exports |
| P7 GA | v0.4→승격 | ⬜ | **0.4.0** | 헌장 대조 · MIGRATION · 브랜치 플립 |

**타임박스**: P0~P3 3개월 / P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토(사용자 결정 사안).

## E2E-Parity Vertical Slice (구동 트랙 — 무인모드) · [계획](./plans/e2e-parity-vertical-slice.md)

실제 GJCU EntityForm(College→Major→Professor)을 신 `@listgrid/*`로 재구현 → 간단 SSR CRUD 백엔드 → **Playwright E2E green**. P3-2(state)·P5(렌더러)·P6(어댑터)를 **수직 슬라이스로 앞당겨 실행**(reorder — ADR/헌장은 설계 권위 유지). E2E 통과 = 헌장 보존검증3 + ADR-0008 abort 판정 조기 증명. 리프로직 이식(규율2)/아키텍처 신축(ADR).

> **✅ V0 (walking skeleton) 완료 (2026-07-10)** — College(+dean ManyToOne)가 신 엔진 6패키지(schema-core/state/react/ui-default/backend-rcm/next)로 실브라우저 E2E green. **ADR-0008 abort 판정 = GO 방향 실증**(합성이 실동작). 헌장 C1(선언=화면)·C3(관계 1급)·C5(검증)·C7(호스트주입)·C9(리스트) 실증. 남음: V1 필드/검증 심화(Major), V2 SubCollection(Professor).

| 마일스톤 | 범위 | 게이트 | 상태 |
|---|---|---|---|
| **V0.1** schema-core 코어 | EntityForm + 필드클래스(String/Bool/Number/Textarea/Markdown/Select/M2O) + value ops(dirty/blank) + validate | 단위테스트 ✅ 32 green | ✅ `8ca3932` |
| **V0.2** state 스토어 | createFormStore(값슬라이스·validate·hydrate·toSaveData[M2O flatten])/createListStore + SearchForm + BackendAdapter 계약 | 스토어 단위테스트 ✅ 11 green | ✅ |
| **V0.3** ui-default + react 폼 | ui-default 프리미티브 11종 + 5-seam 프로바이더(throw) + FieldRenderer 레지스트리(D4 슬라이스 구독) + ViewEntityForm(validate→onSave) | jsdom 렌더 테스트 ✅ (타이핑→store·required 에러·onSave) | ✅ |
| **V0.4a** backend+list+form+E2E | backend-rcm 어댑터(12t) + @listgrid/next + sample College/Prof/Univ CRUD + ViewListGrid + College 재구현 + 페이지(list/new/edit) + Playwright | **College CRUD E2E green ✅** (list fetch→생성→required검증→POST→목록반영→edit(getOne+hydrate)→PUT→영속) | ✅ |
| **V0.4b** ManyToOne 팝업 | AdapterProvider seam + ManyToOne 렌더러(Modal + ViewListGrid 피커, id→entity 해소) + College dean(→Professor thunk) + E2E | **College+dean E2E green ✅** (피커 열기→교수 fetch→선택→표시→저장 deanId flatten) | ✅ |
| **V1** Major | Number/Select/Date + validations 카탈로그 + 조건부 가시성(cross-field cascade — V0.3 갭 해소) | Major E2E | ⬜ ← next |
| **V2** Professor | SubCollection(inline/table) + 자식 store 격리(ADR-0002§4) | Professor E2E | ⬜ |

**확정 설계 결정**: **D1** 관계 thunk 지연참조(College↔Professor↔Major 순환생성 방지) · **D2** RCM 0.1.0 wire(POST `/{url}/search` 리스트+M2O공용·bulk `DELETE {url}`·Spring-Page envelope·ADR-0005 에러코드) · **D3** 5-seam 프로바이더(UI/Modal/Router/Auth/Message, 미주입 throw) · **D4** 값슬라이스 셀렉터 구독(clone(true) 소멸) · **D5** 이식 오라클(P2/신규 단위테스트 green). 근거·상세는 [계획 문서](./plans/e2e-parity-vertical-slice.md).

---

## Tasks

### P0 — 실버그 핫픽스 (main, 0.3.26) — 모두 독립 태스크, 순서 무관

고친 로직이 이후 이식 대상. 실행: `p0-hotfixes` 브랜치(main off) 위 8-에이전트 워크플로우 fan-out → 중앙 적용·검증·태스크별 커밋. 전체 게이트 green(type-check·962 tests·lint·format·build). 상세는 커밋/CHANGELOG.

- [x] **P0-1** ✅ `0f01861` · min/max 우선순위 괄호 수정(getValueAsString과 동형), current=0/false 보존 + MinMaxNumber 재동작, 회귀 6건 green
- [x] **P0-2** ✅ `80329dd` · DatetimeField type 'date'→'datetime', Excel export/import 왕복 시간보존 테스트 green, 필터 무회귀 확인
- [x] **P0-3** ✅ `ab82315` · `applyFieldChange()` 추출 + 두 진입점 try/catch→setErrors, unhandled rejection/에러삼킴 제거 (deviation: §Needs Review)
- [x] **P0-4** ✅ `6d2320c` · defaultPageSize 명시값>전역>기본, 회귀 green (deviation: prop 스레딩 §Needs Review)
- [x] **P0-5** ✅ `d6cdbfa` · useLoadingStore zustand화(반응성), configureLoading 호스트교체 계약 유지, 모든 caller 컴포넌트 내 훅
- [x] **P0-6** ✅ `848ed1d` · clone `{...manageEntityForm}` 얕은복사, aliasing 회귀 green
- [x] **P0-7** ✅ `04d120b` · configureHtmlSanitizer+싱크3 텍스트폴백/warn · simpleCrypt cryptKey 미설정 throw · menu warn+주석정정 (**Breaking** → §Needs Review)
- [x] **P0-8** ✅ `214c85d`·`a786ff3`·`5cb4b9b` · localStorage 폴리필(Node26 27건) · engines/.nvmrc/CI 20·22+v0.4 · release-docs 게이트 · no-explicit-any error(135파일 동결)
- [x] **P0-9** ✅ `fe58523` · ASSET_SERVER_URL 폴백제거(빈문자열+warn) · AdvancedSearchForm(v1) @deprecated
- [~] **P0-10** 🟡 `898296a` · CHANGELOG 0.3.26 + version bump + 마이그레이션 리빙문서 완료 · **남음(승인): ① npm publish ② p0-hotfixes→main ③ main→v0.4 전환**

**P0 게이트**: 전량 green ✅(962) · publish ⏸(승인 대기) · 소비자 무변경은 **crypt/HTML/asset 3종 Breaking 확인 필요**(§Needs Review).

### P1 — v0.4 개시: 워크스페이스 + 패키징 + 샘플 골조 [ADR-0008 §구조, ADR-0001, sample-spec §P1]

실행: `p0-hotfixes`→`v0.4` 병합(`0a6dace`, P0 이식원본 확보) 후 v0.4에서 진행. P1-2·P1-5는 sonnet 에이전트 위임(빌드/부팅 검증 동반), 나머지 인라인.

- [x] **P1-1** ✅ `3fc5147` · 루트 workspaces + `@listgrid/*` 8패키지 스텁(composite tsconfig)+apps/sample 스텁 · tsc -b 8패키지 green, src/ 무변경(이식원본 유지)
- [x] **P1-2** ✅ `62d4277` · tsup dual(.js ESM/.cjs CJS/.d.ts/.d.cts/map) 12진입점 · exports 3-조건+typesVersions · publint/attw green · 954KB(<2.5x) (caveat §Needs Review)
- [x] **P1-3** ✅ `b77534e` · CI publint+attw+`scripts/smoke-load.sh`(npm pack→temp install→require/import) · verify-build 이중산출 검증 추가
- [~] **P1-4** 🟡 `c519f7d` · publish.yml prerelease→dist-tag `next` 라우팅 · **alpha.0 실배포는 승인 대기**(외부)
- [x] **P1-5** ✅ `333316c` · Next15 App Router + 목업 rcm 백엔드(Spring-Data-Page envelope, employee CRUD 왕복) + 홈(workspace 로드 증명) · dev 기동<1s·API 200·build green 검증

**P1 게이트**: 로드 스모크 green ✅(publint/attw+pack smoke) · alpha.0 설치·로드 ⏸(승인 대기) · sample 기동 ✅(직접 확인).

### P2 — 특성화 테스트 그물 = 이식 오라클 [ADR-0007 §2]

구엔진(v0.4의 src/, P0-fixed) 행동을 고정. 하네스 1곳에서만 엔진 import(P4에서 2개 specifier flip으로 신 엔진 전환). fan-out(sonnet ×4)으로 4묶음 병렬 작성. 특성화가 드러낸 엔진 wart는 이식 판단용으로 [특성화 발견 체크리스트](./analysis/characterization-findings.md)에 정리(P4/P5 keep-vs-fix 결정 근거).

- [x] **P2-1** ✅ `3af8c2a`+`bb211ca` · 하네스(엔진 2-pointer indirection·renderWithProviders[Router/Auth/UI]·mockRcmFetch[ApiClient seam]·envelope)+3 fixture
- [x] **P2-2** ✅ `39dec04` · FieldRenderer 6종 9테스트(chip-degenerate/withSelectBoxView 우회 포함)
- [x] **P2-3** ✅ `39dec04` · 폼 로직 19테스트(create/update init·save wire·reset·isDirty 엣지·탭)
- [x] **P2-4** ✅ `39dec04` · 리스트 13테스트(SearchForm.toJSON wire·페이지·다중정렬·bulk-delete payload)
- [x] **P2-5** ✅ `39dec04`+`bb211ca` · ViewEntityForm 25테스트(서브컬렉션·버튼·탭 + 전체 렌더)

**P2 게이트**: 전량 green ✅(68 char + 전체 1030) · 렌더 파일 5개(68테스트 — 파일수보다 행동밀도 우선, 대표 표면 커버; 문자적 25파일 미달은 §Needs Review) · 커버리지 래칫 ⏳(임계 상향은 P3 진입 시 재측정).

### P3 — 계약 골격 + 표면 감사표 (spec-first 게이트)

- [x] **P3-1 [O] schema-core 계약** ✅ 2026-07-10 · `fb8f9cb` · 순수메타 EntityField·FieldValueSlice·FieldEvalContext·PermissionPolicy 통합(+SubColl)·Validation base · 1047 green · 결정 2건→§Needs Review
- [ ] **P3-2 [O] state 계약** — `packages/state`: `createFormStore()/createListStore()` API(zustand vanilla), 셀렉터 규약, 중첩 폼의 자식 store 생성+부모 캐시 전달 프로토콜(ADR-0002 §Decision 4).
- [ ] **P3-3 [O] BackendAdapter 계약** — `packages/schema-core` 또는 별도: ADR-0005 §Decision 1 인터페이스 + `BackendErrorCode` enum. 구현은 P6(여기선 타입+기본 어댑터 시그니처만).
- [ ] **P3-4 [S, codex eligible] 표면 감사표** — 구 배럴(src/listgrid/index.ts) 580 심볼 전수 → `documents/analysis/surface-audit.csv`(심볼·분류[유지/이동/삭제]·이동 대상 패키지·근거 한 줄). 판정 기준: ADR-0004 §Decision 1. 목표 공개 심볼 ≤220.
- [ ] **P3-5 [S] 렌더러 레지스트리 + StringField 파일럿 이식** — `packages/react`: `registerFieldRenderer(type, component)` + 미등록 폴백(dev 경고+문자열). StringField를 **레시피 확립용으로 1종 완전 이식**(메타는 schema-core, 값은 store, 렌더는 레지스트리) → 특성화 P2-2 String 케이스가 신 엔진에서 green → **이식 레시피 문서화**(`documents/plans/transplant-recipe.md`: 단계·체크리스트·동시 처리 목록 — 이후 39종의 표준 절차).
- [ ] **P3-6 [O] 헌장 대조 리뷰** — C1~C9 × 계약 골격 매핑 표 작성(빈 칸 = 계약 보완 필요). apps/sample에 파일럿 필드 데모 페이지 추가.

**P3 게이트**: 골격 컴파일 + 파일럿 1종이 sample에서 렌더·입력·검증 동작 + 감사표 완성 + 대조표에 빈 칸 없음.
**P3 종료 세션의 의무**: 아래 P4·P5 개요를 **체크박스 태스크로 전개**해 이 문서에 커밋한다(전개 규칙은 각 개요에 명시).

> **P3 착수 노트 (cold-start — 여기서 실제 엔진 이식 시작)**: 지금까지(P0~P2)는 바닥다지기(버그픽스·골격·오라클), src/ 52k LOC·필드 59종은 아직 미이식(`@listgrid/*` 전부 빈 스텁). P3부터 실코드 이식. **읽을 것**: ADR-0003(schema/render 분리 — EntityField view() 제거, 렌더러 레지스트리, useSession 인자화)·ADR-0002(폼 상태 — createFormStore 값슬라이스 `{current,fetched,default,errors,dirty}`, 셀렉터 구독)·ADR-0004(표면)·ADR-0005(백엔드). **권장 순서**: P3-1→P3-2 계약 → **P3-5 StringField 파일럿(첫 실이식, 레시피 확립)** → P3-4 감사표 → P3-3 → P3-6. **검증**: P2 오라클 준비됨 — 파일럿 이식 후 `harness.ts`의 2개 엔진 pointer를 `@listgrid/*`로 flip해 특성화 테스트가 신 엔진에서 green이면 이식 완료. **[O] 태스크는 opus 세션 권장.**

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

[마이그레이션 리빙 문서](./plans/migration-0.3-to-0.4.md)를 `docs/MIGRATION.md`(사용자 대면)로 승격 + codemod · docs/api 재생성 · **헌장 대조표**(C1~C9 × 구현 위치 × sample 페이지 — 빈 행 시 GA 불가) · 실엔티티 재현 검증(헌장 §보존 검증 3 — GJCU/edustack급 엔티티 1종) · getting-started 전면 개정(코드 블록=sample 실코드) · 브랜치 플립(main→release/0.3, v0.4 승격) · 0.3.x 지원 정책 고지.

---

## Needs Review (P0 fan-out deviations — 사용자 확인 후 `[x]`)

- [ ] **P0-7 Breaking 소비자 영향** (最우선, publish 전 확인) — simpleCrypt cryptKey 미설정 throw / HTML 싱크 텍스트폴백 / asset-url 폴백제거. GJCU·edustack이 `configureRuntime({cryptKey})` + (HTML 필요시)`configureHtmlSanitizer` 설정하는지 확인해야 무회귀. [detail](./plans/migration-0.3-to-0.4.md#1-0325--0326-하드닝-릴리스--지금-조치-필요)
- [ ] **P0-7 API 범위** — ADR-0006 §3의 encrypt/decrypt 공개 API 제거는 v1.0 단계로 판단, 이번엔 폴백키 제거+throw만 구현(encrypt/decrypt 여전히 export). 의도 확인.
- [ ] **P0-3 신규 사용자 문구** — 에러 표면화 시 `'필드 값을 처리하는 중 오류가 발생했습니다.'` 신설(리포 관례 '~하는 중 오류가 발생했습니다.' 따름). i18n 키화는 P5 동시처리 목록으로 이월.
- [ ] **P0-4 최소범위 초과** — hook이 per-list defaultPageSize에 접근 불가라 `QuickSearchBar`/`ViewListGrid`에 prop 스레딩 추가(1→3파일). 브리핑의 useListGridLogic 우선순위 정렬 지시상 불가피.
- [ ] **P0-8 동결 방식** — no-explicit-any 135파일 동결을 인라인 주석 대신 `eslint.config.mjs` override 블록으로(동일 효과·1파일 diff·whittle-down 용이).
- [ ] **P1-2 ESM 메인배럴 caveat** — 순수 Node ESM `import('@rchemist/listgrid')`(메인)은 `react-sortablejs`(CJS-only peer, ESM/exports 없음)의 named export 미검출로 실패. 번들러(Next/webpack) 소비자는 정상. 대응: (a) 수용+MIGRATION 명시 / (b) v0.4에서 react-sortablejs를 ESM 대체(예: @dnd-kit)로 교체 검토(P5 렌더러 이식 시). 결정 필요.
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후(지금 아님).
- [ ] **P2 렌더 파일수 게이트** — 게이트 문구는 "렌더 테스트 파일 9→25+"이나 실제는 밀도높은 5파일 68테스트(대표 표면 커버)로 구현. 파일수 목표를 문자적으로 채울지(필드 40종 개별 파일 등) vs 행동밀도로 충족 인정할지 — 커버리지 래칫 재측정과 함께 P3 진입 시 판단.
- [ ] **P3-1 조건부 컨텍스트 협소화 (소비자 breaking)** — 조건부 함수 `withHidden((props)=>…)` 등이 EntityForm-carrying `ConditionalValue` 대신 순수 `FieldEvalContext{renderType,session,value,values}`를 받음. 근거 ADR-0003§4·헌장 C2(EntityForm은 렌더 객체). MIGRATION 1:1 대응표 필요 + P5 렌더러 배선서 실사용 검증. [detail](../packages/schema-core/src/field/eval-context.ts)
- [ ] **P3-1 권한추출 협소화 (행동 narrowing)** — canonical `extractPermissions`=2-way(`roles ?? authentication.roles`)만; 구엔진 getViewableTabs의 `this.session` 인스턴스 폴백(EntityFormBase:356-361) 제거(ADR-0002 상태보관 제거와 정합, 스토어가 session 명시전달). 무영향 예상 — 확인. [detail](../packages/schema-core/src/permission.ts)

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격(P7 개요에 반영).
- **P3-1 스카우트 발견 (P4/P5 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).

## Open Questions

- [x] **릴리스 기전 확정(2026-07-10)** — `v*` 태그 push→`publish.yml` 자동배포(dist-tag `-alpha`→next/`0.2.x`→legacy-0.2/else latest). 게이트 선행.
- [ ] **0.3.26 실배포 트리거 (외부 — 사용자 실행/승인)** — 준비 완료(`p0-hotfixes`, 게이트 green). 배포 절차: `p0-hotfixes`→main 병합 → `git tag v0.3.26` → push → latest 자동배포. **선결 확인: 0.3.26은 hardening Breaking 3종 포함(patch에 breaking) — GJCU/edustack이 cryptKey/sanitizer 설정했는지 확인 후 배포**(§Needs Review). 로컬 미푸시 상태 유지 중.
- [ ] **0.4.0-alpha.N 배포** — `v0.4.0-alpha.N` 태그 push → next 자동배포(파이프 검증). P1 완료로 준비됨(빈 골격이어도 실행 가능). 사용자 실행/승인 시점 결정.
- [ ] apps/sample 목업 백엔드에 실제 rcm-backend-framework 연결 옵션(로컬 인스턴스)을 둘지 — 현재 명세는 fixture 단독 (P5 전까지)
- [x] **0.2.x 백포트 → No (2026-07-10)** — `release/0.2` 프로덕션 핸즈오프(§Do-NOT). 에러 리포트 시만 대응.

## 완료 기록 (태스크 완료 시 여기에 한 줄 증거 누적, 페이즈 완료 시 progress-archive로 이동)

(비어 있음)
