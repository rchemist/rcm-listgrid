# Phase Foundation (P0·P1·P2) — 바닥다지기 아카이브

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)
**Status**: P0 🟡 코드완료(publish/전환 승인 대기) · P1 🟡 코드완료(alpha.0 publish 승인 대기) · P2 ✅ 완료(내부)
**요약**: 버그픽스·워크스페이스 골격·특성화 오라클. src/ 52k LOC·필드 59종은 여기까지 미이식(이후 수직 슬라이스에서 신 엔진 실증). 외부 승인 대기 2건(P0-10 publish/전환, P1-4 alpha.0)만 open.

---

## P0 — 실버그 핫픽스 (main, 0.3.26) — 모두 독립 태스크, 순서 무관

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

---

## P1 — v0.4 개시: 워크스페이스 + 패키징 + 샘플 골조 [ADR-0008 §구조, ADR-0001, sample-spec §P1]

실행: `p0-hotfixes`→`v0.4` 병합(`0a6dace`, P0 이식원본 확보) 후 v0.4에서 진행. P1-2·P1-5는 sonnet 에이전트 위임(빌드/부팅 검증 동반), 나머지 인라인.

- [x] **P1-1** ✅ `3fc5147` · 루트 workspaces + `@listgrid/*` 8패키지 스텁(composite tsconfig)+apps/sample 스텁 · tsc -b 8패키지 green, src/ 무변경(이식원본 유지)
- [x] **P1-2** ✅ `62d4277` · tsup dual(.js ESM/.cjs CJS/.d.ts/.d.cts/map) 12진입점 · exports 3-조건+typesVersions · publint/attw green · 954KB(<2.5x) (caveat §Needs Review)
- [x] **P1-3** ✅ `b77534e` · CI publint+attw+`scripts/smoke-load.sh`(npm pack→temp install→require/import) · verify-build 이중산출 검증 추가
- [~] **P1-4** 🟡 `c519f7d` · publish.yml prerelease→dist-tag `next` 라우팅 · **alpha.0 실배포는 승인 대기**(외부)
- [x] **P1-5** ✅ `333316c` · Next15 App Router + 목업 rcm 백엔드(Spring-Data-Page envelope, employee CRUD 왕복) + 홈(workspace 로드 증명) · dev 기동<1s·API 200·build green 검증

**P1 게이트**: 로드 스모크 green ✅(publint/attw+pack smoke) · alpha.0 설치·로드 ⏸(승인 대기) · sample 기동 ✅(직접 확인).

---

## P2 — 특성화 테스트 그물 = 이식 오라클 [ADR-0007 §2]

구엔진(v0.4의 src/, P0-fixed) 행동을 고정. 하네스 1곳에서만 엔진 import(P4에서 2개 specifier flip으로 신 엔진 전환). fan-out(sonnet ×4)으로 4묶음 병렬 작성. 특성화가 드러낸 엔진 wart는 이식 판단용으로 [특성화 발견 체크리스트](../analysis/characterization-findings.md)에 정리(P4/P5 keep-vs-fix 결정 근거).

- [x] **P2-1** ✅ `3af8c2a`+`bb211ca` · 하네스(엔진 2-pointer indirection·renderWithProviders[Router/Auth/UI]·mockRcmFetch[ApiClient seam]·envelope)+3 fixture
- [x] **P2-2** ✅ `39dec04` · FieldRenderer 6종 9테스트(chip-degenerate/withSelectBoxView 우회 포함)
- [x] **P2-3** ✅ `39dec04` · 폼 로직 19테스트(create/update init·save wire·reset·isDirty 엣지·탭)
- [x] **P2-4** ✅ `39dec04` · 리스트 13테스트(SearchForm.toJSON wire·페이지·다중정렬·bulk-delete payload)
- [x] **P2-5** ✅ `39dec04`+`bb211ca` · ViewEntityForm 25테스트(서브컬렉션·버튼·탭 + 전체 렌더)

**P2 게이트**: 전량 green ✅(68 char + 전체 1030) · 렌더 파일 5개(68테스트 — 파일수보다 행동밀도 우선, 대표 표면 커버; 문자적 25파일 미달은 §Needs Review) · 커버리지 래칫 ⏳(임계 상향은 P3 진입 시 재측정).
