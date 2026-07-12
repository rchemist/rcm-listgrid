# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · Phase EG(W1~W7) 게이트 green이나 **봉인 잠정 재개** — 봉인 후 조사(2026-07-12)서 GA-blocking 갭 발견(SearchForm `withFilter` parity·wire 충실도·유틸·프록시 문서). **Next up: Phase GX(0.4 프레임워크 정합 + parity·GA-blocking)** GX-1~5 → 그 후 GA 게이트(CAP-28). 근거 [gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md). 계수 49/57/186. P0/P1 publish=외부 승인 대기.
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: auto (사용자 확정 2026-07-11 — 커밋·push·배포까지 자율 실행 후 결과 보고. "커밋할까요/배포할까요" 금지)
**Model policy**: 설계 pass 완료 — **구현 wave(W1~W7)는 실행급 브리프로 opus/sonnet 세션 실행 가능**. 위임 기본 sonnet(waves 브리프=브리핑 원문). **스펙이 침묵하는 판단=구현 금지**(스펙 §10 게이트 4) — 스펙 개정만 상위 티어.
**Next session policy**: Phase EG(W1~W7) 게이트 green이나 **봉인 재개** — 새 세션은 **Phase GX(0.4 프레임워크 정합, GA-blocking)부터**. cold-start=[gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md)(결정·프레임워크 계약·GX-1~5 백로그)+[rcm-backend-framework 0.1.0] 계약. **확정 결정(2026-07-12)**: 위젯 descope·유틸 새 `/utils` 전량 이식·SearchForm `withFilter` 완전 부활·GA-blocking·**wire=rcm-backend-framework 0.1.0 기준(GJCU 0.2 아님)**. GX 후 GA 게이트(CAP-28). **Do-NOT**: 스펙 §를 인용 못하는 설계 판단 구현(§10 게이트 4)·src/ 삭제(오라클)·dts experimentalDts 재시도·0.2(GJCU) shape를 primary로 채택(폴백만).
**Last updated**: 2026-07-12 (**봉인 후 조사 → Phase GX 개설** — 사용자가 descope 처분·SearchForm/프록시 온전성 재조사 지시. 3 검증 워크플로우(적대검증+메인 재확인) 결과: ①위젯 descope OK ②유틸 진짜 삭제→`/utils` 이식 필요 ③프록시 안 깨짐·문서갭만 ④**SearchForm `withFilter`('AND'|'OR',...) 부재=GA 갭·spec/MIGRATION "무변경" 거짓** ⑤테스트 백엔드=**프레임워크 0.1.0 shape 맞음**(0.2 아님)·부분 충실도 갭. 사용자 결정: withFilter 부활·`/utils` 전량·GA-blocking·wire=프레임워크 기준. → **Phase GX GX-1~5** 개설. 근거 [gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md). 다음=GX-1.)

## Goal

[ADR-0008](./adr/ADR-0008-refoundation-strategy.md) 재기초 전략의 실행: `v0.4` 브랜치 모노레포에 4계층 골격을 신축하고, 구엔진(0.3.x)의 검증된 로직을 특성화 테스트 오라클 아래 **이식**하여 0.4.0 GA에 도달. 보존 대상은 [개념 헌장](./prd/concept-charter.md) C1~C9이며, GA 게이트에서 대조표로 검증한다.

## Context

- **브랜치**: `main`=0.3.x 유지보수(P0만). **`v0.4`**=재기초(현 작업 브랜치). main에 0.4 코드 금지, v0.4에 0.3 픽스 직접 커밋 금지.
- **환경**: Node은 `.nvmrc` 기준. **Node 26에서는 기존 테스트 27건이 jsdom localStorage 문제로 실패하니 버전 확인 필수**(P0-8 폴리필로 해소됨). 품질 게이트: `npm run type-check && npm test && npm run lint && npm run format:check && npm run build`.
- **릴리스**: 0.3.26 **배포됨(2026-07-11)**, 0.4.0-alpha.N(W2 후·dist-tag `next`), 0.4.0 GA(W7 후). **배포 자율 실행(사용자 확정 2026-07-11)** — 게이트(CHANGELOG==version·full gate) 선행 + 소비자 영향 직접 검증. 타 팀 프로덕션 반영 조율만 보고 대상.
- 근거 문서: ADR-0001~0008 · 헌장 · [apps/sample 명세](./prd/sample-site-spec.md) · [로드맵](./plans/v1-roadmap.md)(페이즈 정의 원본 — 어긋나면 로드맵 우선).

## 불변 규율 (전 세션 공통 — ADR-0008 방지 장치)

1. **헌장 = 스코프 울타리**: 이식 중 신기능·개선 아이디어는 구현하지 말고 §Backlog에 한 줄 기록.
2. **이식 우선, 재발명 금지**: 리프 로직(필드/검증/포맷)은 테스트와 함께 옮긴다. 다시 쓰려면 커밋 메시지에 사유 필수.
3. **특성화 오라클**: P2 테스트 그물이 신구 양쪽에서 green이어야 이식 완료.
4. **이식 중 동시 처리는 고정 목록만**: i18n 키화 / 중복 통합 / `any` 제거 / 도메인 리터럴→presets-rcm / a11y 3종. 그 외 "하는 김에" 금지.
5. **검증 없는 ✅ 금지**: 완료 체크에는 증거(테스트 수·커맨드·결과) 한 줄 필수. 렌더 변경은 apps/sample에서 실제 화면 확인.
6. **매 태스크 종료**: diff 셀프 리뷰 → 논리 단위 커밋(`feat|fix|refactor(scope): 내용`) → 이 문서 갱신 커밋. push는 manual.

## Do-NOT (재론 금지 — 근거: 분석 §7, ADR-0002/0003/0008)

- 전면 백지 재작성(규율 2 위반) · SubViewEntityForm 단독 분리 · xstate 도입 · 전역 싱글턴의 React Context화 · 무료 기능 유료화
- 구 배럴(main)의 표면 재단(0.4에서만 — 이중 작업 금지) · docs/api 커밋 재개 · 헌장 밖 신기능의 v0.4 편입
- react-hook-form/TanStack Form로 폼 상태 대체(ADR-0002 기각 사유 참조)
- **0.2.x(`release/0.2`) 선제 수정 금지 (사용자 확정 2026-07-10)** — 프로덕션 가동 중. 에러 리포트 없는 한 백포트·수정 안 함. 0.3.x부터 자유 수정·배포 가능.

## Progress State

| 페이즈/트랙 | 브랜치 | 상태 | 릴리스 | 상세 |
|---|---|---|---|---|
| P0 실버그 핫픽스 | `p0-hotfixes` | 🟡 코드완료(publish/전환 승인 대기) | 0.3.26 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P1 워크스페이스+패키징 | v0.4 | 🟡 코드완료(alpha.0 승인 대기) | alpha.0 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P2 특성화 오라클 | v0.4 | ✅ 완료(내부) | — | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| **수직 슬라이스 V0~V2** | v0.4 | ✅ 완료(5 E2E green) | — | [archive](./progress-archive/vertical-slice-V0-V2.md) |
| 형식 P3~P7 (계약골격→GA) | v0.4 | ⬜ 보류(수직 슬라이스가 앞당겨 실증) | — | [archive](./progress-archive/formal-roadmap-P3-P7.md) |
| **하드닝/확장 트랙** | v0.4 | [~] 진행 중 (H·EF·EA/EB/EC ✅ · EG W1~W7 게이트green · **Phase GX 프레임워크정합 GA-blocking**) | — | 이 문서 §Tasks · [gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md) |

**타임박스**: P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토 — 수직 슬라이스가 abort 판정을 **GO로 조기 실증**(2026-07-11)해 위험 완화됨.

## 세션 인계 (Handoff — Phase EG(W1~W7) 게이트 green이나 **봉인 재개**. 다음: **Phase GX — 0.4 프레임워크 정합 + parity(GA-blocking)** GX-1~5 → GA 게이트(CAP-28). 콜드스타트 [gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md))

- **⚠ 다음 = Phase GX(0.4 프레임워크 정합·GA-blocking)** — 봉인 후 조사(2026-07-12)서 발견한 GA 갭. **확정 결정(사용자)**: 위젯 descope·유틸 새 `/utils` 전량 이식·SearchForm `withFilter('AND'|'OR',...) 완전 부활·GA-blocking·**wire=rcm-backend-framework 0.1.0 기준**(GJCU 0.2는 폴백만·edustack이 실사용 레퍼런스). GX-1~5(§Tasks Phase GX)·실행급 계약+근거=[gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md). 핵심: SearchForm.toJSON `{filters:{AND,OR}}`는 프레임워크 SearchRequest와 이미 일치 → withFilter 복원 wire 리스크 낮음. GX 후 GA 게이트(CAP-28 헌장 대조·인라인 판단). **§Needs Review 9건 중 descope 계열은 GX-5로 흡수·나머지 GA 이월.**
- **dts 최종 선례(Do-NOT 재시도)**: packages/* multi-entry dts는 **`dts.compilerOptions.paths`로 @listgrid/*→packages/*/src 매핑**이 정답(tsup.config.ts). **`experimentalDts`+api-extractor 금지**(per-entry `.d.ts`를 `export {}` 빈 스텁 방출=published 타입 전무·attw/publint 거짓green). **교훈**: dts 검증은 attw/publint 불충분 — **소비자 tsc(check:headless)가 실 게이트**. [archive #W7-1~3](./progress-archive/phase-eg-api-redesign.md#w7-1-패키징-코어-2026-07-12--published-진입점-srcpackages). **W7 후 = GA 게이트**(헌장 C1~C9·CAP-28·별도 pass).
- **재설계 governing docs(설계 pass ✅ 2026-07-11 fable)**: [waves 브리프](./plans/entityform-api-implementation-waves.md)(실행 계약 W1~W7·위임 원문)·[스펙 r2](./plans/entityform-public-api-spec.md)(규범 CAP-01~29)·[ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)(결정). **W1~W3 실행 상세+W3 Handoff**=[phase-eg archive](./progress-archive/phase-eg-api-redesign.md).
- **읽는 순서(cold-start)**: ① waves 브리프 전역 규칙+해당 W표 → ② 스펙의 **인용된 §만** → ③ 판단 필요 시 ADR-0009. 구 `src/listgrid/`·8그룹 map·감사 문서는 W5 entry pass까지 불필요 — 스펙이 이미 소화했다.
- **실행 규율**: waves 브리프가 위임 브리핑의 원문(기본 sonnet). **스펙 §를 인용할 수 없는 설계 판단이 나오면 구현 금지** — §Open Questions에 올리고 스펙 개정 선행(스펙 §10 게이트 4). wave 종료마다 CAP-ID 대조(누락은 표 대조로 검출).
- **이미 SOUND한 것(유지)**: store 값 모델(ADR-0002)·schema-core 순수성(ADR-0003)·FormMutator seam·EF1-7 파이프라인·필드 24+주소+Xref·권한 배선(EG1/EG2). **2131 unit/27 E2E, 전부 push.** 재설계는 공개 표면 — 엔진 재작성 아님.
- **Do-NOT**: ① 0.3 복붙·구 버그 재현 금지(스펙 L8) ② SOUND 내부 재작성 금지 ③ store 직접 수신 금지(FormMutator 경유)·동적 mutation 후 entityForm.getFields() 직접 읽기 금지(store.fieldDefs) ④ exactOptionalPropertyTypes 조건 spread(반복 결함 1위 — waves 전역 규칙) ⑤ hot-file 3종(entity-form/form-store/ViewEntityForm) 병렬 편집 금지 ⑥ Agent 출력파일 jq 파이프 금지(JSONL — 구조화 추출→Write→Read) ⑦ **스펙 침묵 판단의 발명 금지**(위 실행 규율).
- **작업 규율**: 완료=logic 커밋→PROGRESS 커밋→push(사용자: 전부 push). 게이트 waves §전역 규칙(full gate+E2E 16+). active-session marker=이 PROGRESS.

---

## Tasks

완료: H(하드닝)·E-트랙(EF 명령형 라이프사이클·EA 필드24·EB 주소·EC 실브라우저 실증·EA-D2 Xref·EG1/2 권한) — **1876 unit + 16 E2E, 전부 push**. 상세 [archive](./progress-archive/phase-e-track-tasks.md). **현 활성 = Phase EG(공개 API first-principles 재설계, fable — §세션 인계 Handoff).**

### H — 하드닝 ✅ 완료 (전 5태스크 — 게이트·CI·SubColl·H1 캐시·H2 a11y) · [archive](./progress-archive/phase-hardening-H.md)

### E — 확장 (사용자 확정 2026-07-11: 전 필드 이식 + 동작 실증 + Daum 주소) · [계획](./plans/e-track-field-parity.md)

- [x] **E·Email/Phone** Email/Phone 필드클래스(내장 검증, C4 "클래스1+렌더러1" 패턴 실증, Subject E2E) · `20f5156`

**핵심**: 신 엔진은 선언적 라이프사이클(dependsOn cascade)만 있고 **명령형(onInitialize/onChanges/META 반응성)이 전무** → 필드 렌더만 이식하면 동작이 조용히 no-op. **Phase EF(기반) 먼저 → EA(필드 대량) → EB(주소) → EC(폼+E2E).** 근거·상세 [계획](./plans/e-track-field-parity.md) + [원자료](./analysis/2026-07-11/e-track-understand-workflow.md).

#### Phase EF ✅ 완료 (2026-07-11 — EF1~5 + 리뷰게이트 R1·R2 + gate 통과, 명령형 라이프사이클 완비 · 1205 unit+5 E2E) · [archive](./progress-archive/phase-e-track-tasks.md) · parity map [analysis](./analysis/2026-07-11/ef-gate-parity-map.md)

#### Phase EA/EB/EC ✅ 완료 (2026-07-11) · [archive](./progress-archive/phase-e-track-tasks.md)
- EA(필드21+공유)·EA-D2(Xref)·EB(주소+Daum)·EC1~3(실브라우저)·EC3-0·EC-R1/EC-F·EF6/EF7 완료. E2E 5→16. [archive](./progress-archive/phase-e-track-tasks.md).
- [ ] **EC4** GraduationReview(custom onSave·role readonly·옵션 pruning) — 후순위(**W3 권한·능력 착지 후** role-readonly 실증으로 재개)

#### Phase EG — EntityForm 공개 API **first-principles 재설계** (PIVOT 2026-07-11) · **W1~W7 게이트 green(2026-07-12)** · ⚠ 봉인 후 조사서 GA 갭 발견 → Phase GX로 정합(아래)

**규범**: [ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)+[스펙 r2](./plans/entityform-public-api-spec.md)(CAP-01~29) · **실행 계약**: [waves 브리프](./plans/entityform-api-implementation-waves.md). 완료 상세(commit·CAP·검증)=[phase-eg archive](./progress-archive/phase-eg-api-redesign.md).

**완료 W1~W6** (전 commit·CAP·상세 → archive):
- **EG1/2** 권한 배선 `a1f3deb`(isPermitted end-to-end) · **EG-D** 설계 pass(ADR-0009+스펙 r2+waves·4렌즈 22건)
- **W1** 표면정비 `599a3f3..4c04906`(CAP-12) · **W2** 훅+FormRuntime/Controller `005b4a3..ed77ecf`(8훅)
- **W3** 권한·능력·액션 `4d30159..b4ecda3`(CAP 7종·4버그) · **W4** 폼완결 `3b3518f..44edfae`(CAP-05·07·10·13·23·4버그)
- **D1** async save-gating(스펙 §5.3/§6.2 개정) · **D2** §Needs Review 9건 처분(2026-07-12·§Open Q 0)
- **W5** list-track(entry+W5-1~4 · `2223f35` 등)(CAP-18·19·20)·계수 47/57/184·E2E28
- **W6** data-transfer(entry+W6-1~4 · `@listgrid/excel`)(CAP-16·17)·**full gate+E2E 30/30**·계수 49/57/186

**W7 패키징+마이그레이션 (마지막 wave·CAP-24·25)** — 실행 계약 [waves §W7 표](./plans/entityform-api-implementation-waves.md):
- [x] **W7 entry-brief pass** ✅ 2026-07-12 · opus · 결정8 소진+**스코프 정정**(published=구 src/→packages/* 전환)·콜드리더 통과 · [detail](./progress-archive/phase-eg-api-redesign.md#w7-entry)
- [x] **W7-1 패키징 코어** ✅ 2026-07-12 · published 진입점 src/→packages/* §2 맵·peers 26→6·dts:paths · full gate green(49/57/186·attw/publint) · [detail](./progress-archive/phase-eg-api-redesign.md#w7-1)
- [x] **W7-2 headless fixture** ✅ 2026-07-12 · /schema+/state fixture·React **런타임** 0 tsc+node(cjs/esm) green·check:headless · [detail](./progress-archive/phase-eg-api-redesign.md#w7-2)
- [x] **W7-3 adapter headers 함수형** ✅ 2026-07-12 · sonnet→검증 · headers 함수형 지연평가(resolveHeaders·5메서드 1지점)·14 tests green · [detail](./progress-archive/phase-eg-api-redesign.md#w7-3)
- [x] **W7-4 MIGRATION+codemod** ✅ 2026-07-12 · sonnet→검증 · §9 42행 전수(빈행0)+서브패스제거+페이지셸+미이관·codemod 기계10규칙·smoke:load 신맵 green · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)
- [x] **W7-5 wave-end** ✅ 2026-07-12 · **Phase EG 종료** · full gate+E2E30+smoke+headless+attw/publint·계수 49/57/186·CAP-24/25+구결함 §1~9 봉인 · [detail](./progress-archive/phase-eg-api-redesign.md#w7-5)

#### Phase GX — 0.4 프레임워크 정합 + parity (봉인 후 조사 2026-07-12 · **GA-blocking**)

**규범**: [gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md)(결정·프레임워크 0.1.0 계약·근거 file:line) · **wire source-of-truth**: `rcm-backend-framework` 0.1.0(`SearchResponse`/`SearchRequest`/`FilterItem`·QueryConditionType 24)·edustack=실사용 레퍼런스. **Do-NOT**: 0.2(GJCU) shape primary 채택(폴백만)·구 src/ 삭제.

- [ ] **GX-1 SearchForm wire 완전 정합** — **← Next up**. `packages/schema-core/src/search/search-form.ts`: `withFilter('AND'|'OR',...items)`+`withFilterIgnoreDuplicate` 복원(결정3·filters[op] push)·`FilterItem.subFilters`→`{[op]:FilterItem[]}` 중첩맵·`filters`에 NOT 키·`cacheKey` wire 제거·QueryConditionType 12→24(프레임워크 enum)·quickSearch de-dup 버그(`__quick__` prefix 미일치). 검증: `SearchRequestJacksonTest` JSON ↔ toJSON 대조 유닛 + college E2E green.
- [ ] **GX-2 apps/sample 백엔드 프레임워크 충실화** — `apps/sample/lib/mock-backend/envelope.ts`: `searchEnvelope` 9필드 완비(page/pageSize/sorts/attributes/errors)·404→RFC7807 ProblemDetail(+`backend-rcm/adapter.ts` 파서 정합)·"Spring Page" 주석 정정 · `employee/collabo/search/route.ts` filters 배선. 검증: E2E 30 + 어댑터 에러 경로.
- [ ] **GX-3 `/utils` 패키지 + 전량 이식**(결정2) — 새 `packages/utils`(오라클 `src/listgrid/misc/` 기계 이식): 정규식11·날짜포맷터·비교4·URL/스토리지·asset-URL·formatPrice·isEquals/isEqualCollection 배럴(RequestUtil/EntityError 제외). §2 exports+dts+attw+publint+smoke:load. **OQ 해소(2026-07-12)**: ①날짜=**자체구현·런타임 의존 0**(고정포맷은 손수 짜 0.3 바이트동일·상대시간=`Intl.RelativeTimeFormat`·date-fns는 devDep만) ②asset-URL=**BackendAdapter 주입 base 우선 + 전역 `ASSET_SERVER_URL` 폴백**(util은 어댑터 hard import 금지·AdapterProvider가 base 주입, seam GX-3서 설계).
- [ ] **GX-4 API 프록시 seam 문서화**(§3) — spec §6.2/ADR 애드덤: `RcmAdapterOptions.fetch`+`baseUrl`=프록시 seam 명시+워크드 예제(GJCU shouldSkipProxy 패턴)·MIGRATION `./api` 행에 "serverProxy 자동 승계 아님" 경고. 임의 외부호출(getExternalApiData)은 별도 컴포넌트-parity로 트래킹.
- [ ] **GX-5 문서 정정 + descope 원장** — spec §9:370+MIGRATION:66 "무변경" 거짓 정정(withFilter 복원 반영)·정규식 "8종"→11종·widgets(QR/KakaoMap/ApiSpec/XrefPrice) CAP-29 descope 명문화·CAP 매트릭스 프록시/조건타입 행. §Needs Review descope 계열 흡수.

**Next up**: **GX-1 SearchForm wire 완전 정합** — 근거·계약 [gap analysis §GX-1](./analysis/2026-07-12/w7-post-seal-gap-analysis.md). 이후 GX-2~5 → GA 게이트(CAP-28 헌장 대조·인라인 판단). GX-1/2는 hot-file 아님·병렬 가능하나 GX-1(SearchForm) 먼저(GX-2 mock이 GX-1 wire 검증 대상).

---

## Needs Review (deviations — 사용자 확인 후 `[x]`)

- [x] **전건 처분(30항목) 2026-07-11** — 확정(P0-7 직접검증·changeSelectOptions→W2-8·+29). [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md)
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후.
- [x] **#W4-3a → DECIDED+구현(D1, 2026-07-12)** — dirty 미확인 async=validateAll 실패→save 차단·스펙 §5.3/§6.2 개정. [D1](./progress-archive/phase-eg-api-redesign.md)
- [x] **D2 잔여 9건 처분(2026-07-12)** — 스펙 저자 확정(발명금지 해제): 코드2+문서7·§Open Q 0. [dispositions](./progress-archive/needs-review-dispositions-2026-07-12.md)
- [x] **#W5-1 operator 타입 확정** — operator=open `string` 유지·캐스트=addAndFilter만 · [detail](./progress-archive/phase-eg-api-redesign.md#w5-3-advanced-search-cap-20)
- [x] **#W6-2a importValue +options** — label→value=3번째 `options?`(exportValue 대칭) 승인 · [detail](./progress-archive/phase-eg-api-redesign.md#w6-2a-excel-foundation-cap-17)
- [x] **#W6-2a multiselect `|||` 양방향** — 구 import bug→양방향 `|||`·L8 봉인 · [detail](./progress-archive/phase-eg-api-redesign.md#w6-2a-excel-foundation-cap-17)
- [ ] **#W7-2 headless @types/react 해석** — `/schema`(+shared chunk 경유 `/state`) `.d.ts`가 ReactNode 조건타입(OptionalReactNode 등) 노출 → headless tsc는 `@types/react`(dev type-only) 필요. **런타임 react peer=0**(계약 충족). 해석: 헤드리스=런타임 React 0·타입레벨 @types/react는 dev 양보(스펙 §2 "React peer 0"=런타임). 스펙 저자 확인 · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w7-2-headless-fixture-2026-07-12--cap-25)
- [ ] **#W6-2b TIER3 uniform 필터 경계** — /excel이 getDataTransfer() 반환 필드에 TIER3 uniform 제외(명시/파생 미구분). M2O/xref/address는 TIER2 passthrough(평면행 값 export)이나 실 GJCU 데이터 미검증 → 소비자 확인(garbage면 TIER3 편입) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w6-2b-excel-exportimport-core-cap-17)
- [ ] **#W5-3 재적용 de-dup 미구현** — 고급검색 매 apply가 `store.searchForm.addAndFilter` 폴딩 → 같은 필드 재검색 시 AND 절 누적(단일 apply=정확·E2E green). SearchForm "이름별 제거" 프리미티브가 W5-3 스코프 밖(search-form.ts 미포함) → 브리프 Do-NOT 준수 미구현·flag · risk:low-med · [detail](./progress-archive/phase-eg-api-redesign.md#w5-3-advanced-search-cap-20)
- [ ] **#W5-2 major/staff withList 확대** — 브리핑 3페이지 외 major/staff에도 withList(M2O/Xref 피커 target·폴백폐기 후 E2E 파손 방지) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#W5-2 EntityField 캐스트** — list-columns.ts `(field as FormField).getListConfig()`(인터페이스 미선언·후속 W5-3/W7서 EntityField 이관 검토) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#W5-2 픽스처 4파일 withList** — react 테스트 픽스처(columns prop 없는 피커)에 withList(폴백폐기 대응·§5.1 인용·행동약화 아님) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#W7-4 서브패스 제거 descope 확인** — 0.4가 다수 0.3 공개 심볼 미이관/축소(/qr·/api-spec·/xref-price 전체·/misc 대부분·KakaoMap 지도뷰·SearchForm 헬퍼 3종·EntityWithId·/api HTTP 유틸). 의도 descope(CAP-29)인지 GJCU gap인지 소비자 확인 필요 · risk:low-med · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)
- [ ] **#W7-4 spec §9 #29 라벨 재조정** — spec §9는 withCreatedAndUpdatedAtFields를 codemod로 표기하나 impl=수동/이연(presets-rcm 빈 스캐폴드). spec 저자: §9 라벨 정정 or /presets/rcm 감사헬퍼 출하 후 codemod화 · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)
- [ ] **#W7-4 guide SUPERSEDED 배너** — list-page-composition-guide.md 상단에 ⛔ SUPERSEDED→MIGRATION §3 포인터 추가(원문 무삭제). 브리핑 declared 4산출물 밖 touch(관례상 정당·정보 흡수 보존) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)

## Progress notes

- EF/EA 페이즈 노트(EF-R2 stash anomaly·EF-gate FIND-ONLY·EA-A fan-out 커밋방식·EA-D reorder)는 [archive](./progress-archive/phase-e-track-tasks.md#progress-notes-본문-이월-2026-07-11--efea-페이즈-완료로-아카이브)로 이월.
- W1~W3 방법론·검증 노트(W1 tsc+test 이중검증·EG-D 4렌즈·harness 교차리포·W2/W3 착수 규율·W3-1 발명게이트 해소)는 [phase-eg archive §Progress notes](./progress-archive/phase-eg-api-redesign.md)로 이월(2026-07-11 slim).
- W4-0 계수 재산정 방법론(count-public-surface.mjs: get*Handlers+getReadOnly→53·§10-A 갭 명문화·규칙 무변경·대안 미채택)은 [phase-eg archive §Progress notes](./progress-archive/phase-eg-api-redesign.md)로 이월(2026-07-12 slim).
- W5-3 실행 상세(setSearchForm 배선·operator 캐스트·deriveFilterFields·deviation 5)는 [phase-eg archive #W5-3](./progress-archive/phase-eg-api-redesign.md#w5-3-advanced-search-cap-20)로 이월(2026-07-12 post-completion slim).

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격.
- **P3-1 스카우트 발견 (필드 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).
- react-daum-postcode를 required peer로 전환(EB-R1) — 주소 미사용 소비자용 subpath opt-in 분리(#7 이슈 3분류 선례)는 P5 패키징에서 검토.

## Open Questions

- [x] **릴리스 기전 확정(2026-07-10)** — `v*` 태그 push→`publish.yml` 자동배포(dist-tag `-alpha`→next/`0.2.x`→legacy-0.2/else latest). 게이트 선행.
- [x] **0.3.26 실배포 완료(2026-07-11)** — 소비자 무회귀 확인 → main ff-merge `853660b` → `v0.3.26` 태그 → publish.yml latest 자동배포. [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md).
- [x] **0.4.0-alpha.N → W2 착지 후 보류(모델 결정 2026-07-11)** — 현 표면은 W1이 즉시 대개명할 표면(폐기 예정 이름에 소비자 통합 방지). W2 완료 시 자동 재개.
- [x] apps/sample 실백엔드 연결 → **fixture 단독 유지(모델 결정 2026-07-11)** — GA 데모 요구 시 재검토(§Backlog).
- [x] **0.2.x 백포트 → No (2026-07-10)** — `release/0.2` 프로덕션 핸즈오프(§Do-NOT). 에러 리포트 시만 대응.
- [x] **다음 방향 = 하드닝 + 점진 확장 (사용자 확정 2026-07-11)** — 실 worklist는 §Tasks(하드닝/확장 트랙)로 승격됨. **하드닝 H 트랙 완료**(게이트·CI·SubColl·H1 캐시·H2 a11y). 남음 = 확장 E 트랙(E1/E2).
- [x] **E-트랙 우선순위 → 전부 (사용자 확정 2026-07-11)** — 전 필드 이식+동작 실증+Daum 주소, foundation-first(EF→EA→EB→EC) 완료로 종결. [계획](./plans/e-track-field-parity.md)
- [x] **업로드 backend seam → 사용자 질문 아님으로 재분류(2026-07-11)** — W5/W6 착수 시 GJCU 관례 확인 후 모델 자동 결정(옵션: sample 업로드 endpoint / BackendAdapter.upload / 외부 URL만).
- [x] **계수 ceiling 재산정 완료(2026-07-11, W4-0)** — 스펙 §10-A 최종 인벤토리 근거로 재산정: **EntityForm 45→55**(최종 53=45 소비자멤버+8 get*Handlers+getReadOnly)·**/schema 180→190**(최종 186=180+W4 2+W5 2+W6 2)·root 120 유지(최종 ~55). count-public-surface.mjs+스펙 §2/§3/§10/§10-A+waves entry-rule 반영. **범위 확장**: Open Q는 /schema만 지목했으나 EntityForm도 최종 45 초과(W4-4서 46) 발견→동반 상향. 임의완화 아님(현값 41/180은 이미 PASS·상한을 최종 설계에 맞춤). gate 재검증: 41/49/180 PASS(임계 55/120/190).

## 완료 기록 (페이즈 완료 시 progress-archive로 이동)

- P0~P2 바닥다지기 + 수직 슬라이스 V0~V2 상세 → [progress-archive/](./progress-archive/) (foundation-P0-P2 · vertical-slice-V0-V2 · formal-roadmap-P3-P7)
