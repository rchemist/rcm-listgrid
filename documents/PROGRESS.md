# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · **GA 게이트(CAP-28) ✅ + R7 실결함 수정(RV-R13) 2026-07-13**: 헌장 C1~C9 전건 present·edustack 실 대조로 R7 검증→manyToOne labelField 실결함 발견→수정. 전 게이트 green([결과](./analysis/2026-07-13/ga-gate-result.md)·2399u/E2E32/surface 49·61·188 무변경). **코드축 GA-READY** · **`0.4.0-alpha.0` 배포됨(dist-tag `next`·`1ebbc4d`·latest=0.3.26 무영향)** · **GA-L1(needs-review 일괄 처분) 완료 2026-07-13**. 잔여=GA-L2 소아킹(외부/시간 gated)→GA latest.
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: auto (사용자 확정 2026-07-11 — 커밋·push·배포까지 자율 실행 후 결과 보고. "커밋할까요/배포할까요" 금지)
**Model policy**: 설계 pass 완료 — **구현 wave(W1~W7)는 실행급 브리프로 opus/sonnet 세션 실행 가능**. 위임 기본 sonnet(waves 브리프=브리핑 원문). **스펙이 침묵하는 판단=구현 금지**(스펙 §10 게이트 4) — 스펙 개정만 상위 티어.
**Next session policy**: **코드축 GA-READY·`0.4.0-alpha.0` 배포됨(next)·GA-L1 완료** — 활성=**Phase GA-L**, 미착수 잔여(GA-L2 소아킹·GA-L3 flip·GA-L4 latest 배포) **전건 gated**(외부/시간·사용자 크리티컬 패스). bare `/progress`로 재개해도 자율 진행 불가 — 사용자 신호(실 소비자 피드백 or GA-latest go) 대기. cold-start=이 §Handoff + §Tasks Phase GA-L. **Do-NOT**: §Handoff 계승 목록.
**Last updated**: 2026-07-13 (GA-L1 완료 — low-risk §Needs Review 일괄 처분. model-decidable 9건 확정(#RV-R7 코멘트+#W7-4 §9 라벨 정정 적용·build green·#W7-4 배너/#GX-3 상호참조 실측·#W5-2 ×3 배송수용·#W7-2/#RV-R4 검증수용)·실백엔드 gated 3건(#W6-2b/#GX-1/#GX-2)→GA-L2 재앵커. [dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md). **잔여 전건 gated → 세션 정지.**)

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
| P0 실버그 핫픽스 | main | ✅ 배포됨(main ff-merge `853660b`·`v0.3.26`) | 0.3.26 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P1 워크스페이스+패키징 | v0.4 | ✅ 0.4.0-alpha.0 배포됨(dist-tag `next`·2026-07-13) | 0.4.0-alpha.0 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P2 특성화 오라클 | v0.4 | ✅ 완료(내부) | — | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| **수직 슬라이스 V0~V2** | v0.4 | ✅ 완료(5 E2E green) | — | [archive](./progress-archive/vertical-slice-V0-V2.md) |
| 형식 P3~P7 (계약골격→GA) | v0.4 | ⬜ 보류(수직 슬라이스가 앞당겨 실증) | — | [archive](./progress-archive/formal-roadmap-P3-P7.md) |
| **하드닝/확장 트랙** | v0.4 | H·EF·EA/EB/EC·EG·GX·RV·**GA 게이트 ✅ + R7 수정(RV-R13)** → **코드축 GA-READY** | 0.4.0-alpha.0 | §Tasks · [GA 결과](./analysis/2026-07-13/ga-gate-result.md) |
| **[~] GA-latest 봉인 트랙 (GA-L)** | v0.4→main | 활성 — GA-L1 needs-review 처분 ✅(2026-07-13) · 잔여(소아킹·flip·latest 배포) 전건 gated | 0.4.0 | §Tasks Phase GA-L |

**타임박스**: P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토 — 수직 슬라이스가 abort 판정을 **GO로 조기 실증**(2026-07-11)해 위험 완화됨.

## 세션 인계 (Handoff — **코드축 GA-READY + `0.4.0-alpha.0` 배포됨(next) 2026-07-13**. 활성 = GA-latest 봉인 트랙)

- **현 상태**: 헌장 C1~C9 전건 `present`([GA 결과](./analysis/2026-07-13/ga-gate-result.md))·전 게이트 green(**2399u·E2E32**·surface 49/55·61/120·188/190·attw/publint/headless zero-React). R7 실결함(edustack manyToOne `{id,title}`을 raw id로 export)=수정 완료(RV-R13·`/excel` labelField 스레드). `@rchemist/listgrid@0.4.0-alpha.0` = npm dist-tag `next`(opt-in)·`latest=0.3.26` 무영향. **코드 잔여 작업 0.**
- **다음(Phase GA-L)** = GA `latest` 봉인 트랙. **GA-L1(needs-review 일괄 처분) 완료 2026-07-13** ([dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md)). 미착수 잔여 **전건 gated**: GA-L2 alpha 소아킹(시간·실 소비자 데이터 — R7/#W6-2b/#GX-1/#GX-2 실검증)·GA-L3 flip·GA-L4 latest 배포. **크리티컬 패스 결정(사용자)**: 0.4.0 `latest` 배포 GO 여부 + 시점. 자율 진행 여지 소진 → 사용자 신호 대기.
- **GA-latest 릴리스 기전**(GA-L4): root `package.json` 0.3.26→0.4.0 + CHANGELOG `## [0.4.0]` top 섹션(`scripts/check-release-docs.mjs` 게이트=top==version) + `v0.4.0` 태그 push→`publish.yml`(Node24·prepublishOnly clean+type-check+test+build→`npm publish --provenance` dist-tag `latest`). **선결=`v0.4`→`main` 플립**(브랜치 전략: 전작업+검증 후·GA-L3).
- **Do-NOT(계승)**: 스펙 §를 인용 못하는 설계 판단 발명 금지(§10 게이트 4)·구 src/ 삭제 금지(오라클)·**dts `experimentalDts`+api-extractor 재시도 금지**([선례](./progress-archive/phase-eg-api-redesign.md#w7-1)·소비자 tsc `check:headless`가 실 게이트)·0.2(GJCU) shape primary 채택 금지(폴백만)·R7 실페이로드 확인 없이 형태 추정 금지·**mock이 실 소비자 형태 가릴 수 있음**(R7 교훈: apps/sample `name`이 edustack `title` 결함 은폐)·`search-form.ts` addAndFilter 시맨틱 변경 금지.
- **이미 SOUND(유지·재작성 금지)**: store 값 모델(ADR-0002)·schema-core 순수성(ADR-0003)·FormMutator seam·EF1-7·필드24+주소+Xref·권한 배선. 재설계는 공개 표면 — 엔진 재작성 아님. 규범=[스펙 r2](./plans/entityform-public-api-spec.md)(CAP-01~29)·[ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)·[헌장](./prd/concept-charter.md).
- **작업 규율**: **publish/commit/push 전부 자율 판단·즉시 실행·후 보고**(Push:auto·묻지 말 것). 완료=logic 커밋→PROGRESS 커밋→push. active-session marker=이 PROGRESS. 완료 페이즈 상세=[progress-archive](./progress-archive/)(RV=phase-rv-tasks.md·EG·GX·E-track).

---

## Tasks

완료: H·E-트랙·EG(공개 API 재설계 W1~W7)·GX(프레임워크 정합)·RV(중간점검 개선)·**GA 게이트(헌장 C1~C9)·R7 수정(RV-R13)**. **현 상태 = 코드축 GA-READY·`0.4.0-alpha.0` 배포됨(next). 활성 = Phase GA-L(GA `latest` 봉인 트랙, 아래).** 완료 페이즈 상세 → [progress-archive](./progress-archive/).

#### 완료 페이즈 (상세=archive · 시간순)
- **H** 하드닝 ✅ (게이트·CI·SubColl·H1 캐시·H2 a11y) · [archive](./progress-archive/phase-hardening-H.md)
- **E-트랙** 필드 대량 이식+동작 실증+주소 ✅ (EF 명령형 라이프사이클·EA 필드21+Xref·EB Daum주소·EC 실브라우저·E2E→16) · [archive](./progress-archive/phase-e-track-tasks.md) · [계획](./plans/e-track-field-parity.md)
- **EG** EntityForm 공개 API first-principles 재설계 ✅ (PIVOT 2026-07-11·W1~W7 게이트 green·계수 49/57/186) · [archive](./progress-archive/phase-eg-api-redesign.md) · 규범=[스펙 r2](./plans/entityform-public-api-spec.md)(CAP-01~29)+[ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)
- **GX** 0.4 프레임워크 정합+parity ✅ (2026-07-13·wire/mock 정합·`/utils` 이식·2368u·49/57/188) · [archive](./progress-archive/phase-gx-tasks.md)
- **RV** 중간점검 개선 ✅ (2026-07-13·R1~R12+G-1~3+GA-BRIEF·`3c41ebf`..`7ffb60d`) · [archive](./progress-archive/phase-rv-tasks.md)
- **GA 게이트(CAP-28)** 헌장 C1~C9 대조 ✅ + **RV-R13 R7 실결함 수정** (2026-07-13·`ccc6520`·edustack 대조→manyToOne labelField 수정·2399u/E2E32) · [결과](./analysis/2026-07-13/ga-gate-result.md)

#### Phase GA-L — GA `latest` 봉인 트랙 (활성 · 2026-07-13~)

코드축 GA-READY·`0.4.0-alpha.0` 배포됨(next). GA `latest` 봉인까지 잔여 작업. **GA-L3/L4는 사용자 GA-latest go 결정(크리티컬 패스) 대기.**

- [x] **GA-L1** low-risk §Needs Review 일괄 처분 — ✅ 2026-07-13 · model-decidable 9건 확정(#RV-R7 코멘트·#W7-4 §9 라벨 정정·build green·#W7-4 배너/#GX-3 상호참조 실측·#W5-2 ×3 배송수용·#W7-2/#RV-R4 검증수용) · 확인필요 3건(#W6-2b/#GX-1/#GX-2)=실백엔드 gated→GA-L2 재앵커 · [dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md)
- [ ] **GA-L2** alpha 소아킹 (외부/시간 gated) — `0.4.0-alpha.0` 실 소비자(edustack 등) 피드백 수렴. **실검증 목록**: ① R7 수정=edustack manyToOne 엑셀 export가 title로 나오는지 ② #W6-2b M2O/xref/address TIER2 passthrough가 실 데이터서 garbage 아닌지 ③ #GX-1 빈 AND/OR wire를 실백엔드가 no-op 수용하는지 ④ #GX-2 실백엔드 필요 조건타입이 mock 5종 초과인지. [dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md)
- [ ] **GA-L3** `v0.4`→`main` 플립 (브랜치 전략: 전작업+검증 완료 후). GA-latest go 결정 시 실행. **선결**=GA-L1 정리 + alpha 무회귀.
- [ ] **GA-L4** 0.4.0 GA `latest` 배포 — root 0.3.26→0.4.0 + CHANGELOG `## [0.4.0]` + `v0.4.0` 태그 push→publish.yml(latest). After GA-L1~L3. 자율 배포(Push:auto).
- [ ] **EC4** (기존 이연) GraduationReview(custom onSave·role readonly·옵션 pruning) — GA-latest 독립 후순위 잔여.

**Next up**: **GA-L2** (alpha 소아킹) — GA-L1 완료(2026-07-13). GA-L2는 외부/시간 gated(실 소비자 피드백), GA-L3/L4는 사용자 GA-latest go 결정(크리티컬 패스) 대기 → **미착수 잔여 전건 gated: 자율 진행 불가, 사용자 신호 대기.**

---

## Needs Review (deviations — 사용자 확인 후 `[x]`)

- [x] **전건 처분(30항목) 2026-07-11** — 확정(P0-7 직접검증·changeSelectOptions→W2-8·+29). [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md)
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후.
- [x] **#W4-3a → DECIDED+구현(D1, 2026-07-12)** — dirty 미확인 async=validateAll 실패→save 차단·스펙 §5.3/§6.2 개정. [D1](./progress-archive/phase-eg-api-redesign.md)
- [x] **D2 잔여 9건 처분(2026-07-12)** — 스펙 저자 확정(발명금지 해제): 코드2+문서7·§Open Q 0. [dispositions](./progress-archive/needs-review-dispositions-2026-07-12.md)
- [x] **#W5-1 operator 타입 확정** — operator=open `string` 유지·캐스트=addAndFilter만 · [detail](./progress-archive/phase-eg-api-redesign.md#w5-3-advanced-search-cap-20)
- [x] **#W6-2a importValue +options** — label→value=3번째 `options?`(exportValue 대칭) 승인 · [detail](./progress-archive/phase-eg-api-redesign.md#w6-2a-excel-foundation-cap-17)
- [x] **#W6-2a multiselect `|||` 양방향** — 구 import bug→양방향 `|||`·L8 봉인 · [detail](./progress-archive/phase-eg-api-redesign.md#w6-2a-excel-foundation-cap-17)
- [x] **GA-L1 배치 처분(9항목) 2026-07-13** — model-decidable 전건 확정(build green): #W7-4 배너·#GX-3 상호참조=이미 반영(실측)·#RV-R7 코멘트 정정·#W7-4 §9 라벨 정정·#W5-2 ×3 배송수용·#W7-2 peer0=런타임·#RV-R4 검증수정. [dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md)
- [x] **#W5-3 de-dup → RV-R2 해소(2026-07-13, `dcd82b2`)** — 신규 API 대신 기존 `SearchForm.withFilter`(name 교체) 재사용(공개표면 무변경)·addAndFilter 스택킹 빈결과 해소 · [R2](./plans/rv-remediation-execution-plan.md)
- [x] **#GX-3 asset-base 배선 → 해소(2026-07-13, `9095504`)** — 사용자 결정=채택+재설계: context-스코프 3티어(전역 싱글턴 GX-6 기각·제거) · [design](./plans/asset-url-resolution-design.md)
- [x] **#W7-4 서브패스 descope 처분** — 위젯 4종=CAP-29·`/misc`=`/utils`(GX-3)·`withFilter`=복원(GX-1) · [detail](./analysis/2026-07-12/w7-post-seal-gap-analysis.md)
- [ ] **#W6-2b / #GX-1 / #GX-2 → GA-L2 재앵커** — 실백엔드/실소비자 데이터 gated(TIER2 passthrough garbage 여부·빈 AND/OR wire 수용·조건타입 커버). alpha 소아킹서 edustack/GJCU 실 대조 · risk:low · [dispositions](./progress-archive/needs-review-dispositions-2026-07-13.md)

## Progress notes

- EF/EA 페이즈 노트(EF-R2 stash anomaly·EF-gate FIND-ONLY·EA-A fan-out 커밋방식·EA-D reorder)는 [archive](./progress-archive/phase-e-track-tasks.md#progress-notes-본문-이월-2026-07-11--efea-페이즈-완료로-아카이브)로 이월.
- W1~W3 방법론·검증 노트(W1 tsc+test 이중검증·EG-D 4렌즈·harness 교차리포·W2/W3 착수 규율·W3-1 발명게이트 해소)는 [phase-eg archive §Progress notes](./progress-archive/phase-eg-api-redesign.md)로 이월(2026-07-11 slim).
- W4-0 계수 재산정 방법론(count-public-surface.mjs: get*Handlers+getReadOnly→53·§10-A 갭 명문화·규칙 무변경·대안 미채택)은 [phase-eg archive §Progress notes](./progress-archive/phase-eg-api-redesign.md)로 이월(2026-07-12 slim).
- W5-3 실행 상세(setSearchForm 배선·operator 캐스트·deriveFilterFields·deviation 5)는 [phase-eg archive #W5-3](./progress-archive/phase-eg-api-redesign.md#w5-3-advanced-search-cap-20)로 이월(2026-07-12 post-completion slim).
- RV-R2 검증: 실행계획 R2 수용기준의 root surface baseline "57/120"은 G-1(asset-URL·`9095504`) 이전 수치 — 실제 현재 **61/120**. R2는 surface-neutral(before==after=61). RV track-end check:surface·GA 게이트는 61 기준.

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격.
- **P3-1 스카우트 발견 (필드 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).
- react-daum-postcode를 required peer로 전환(EB-R1) — 주소 미사용 소비자용 subpath opt-in 분리(#7 이슈 3분류 선례)는 P5 패키징에서 검토.
- **GA-L1 처분 후속(저위험·GA 후)**: ① `EntityField` 인터페이스에 `getListConfig`/`getFilterConfig`/`getDisplayValue` 선언 이관(현 list-columns.ts `(field as FormField)` 캐스트 제거·#W5-2) · ② `presets-rcm` `auditFields()` 헬퍼 출하 후 `withCreatedAndUpdatedAtFields`→codemod화(spec §9 #29·현 수동/이연).

## Open Questions

- [x] **GA 봉인 HOLD ① R7 GJCU-shape → 해소(2026-07-13, RV-R13)** — edustack 실 대조로 manyToOne=`{id,title}` 확인·RV-R7 가드 실결함 발견→`/excel` labelField 스레드 수정. xref=실 소비자 raw 바인딩無(flat sibling)+CAP-29 descope=low-risk 한계 문서화·address=flat 무관. [결과 §3](./analysis/2026-07-13/ga-gate-result.md)
- [x] **publish 0.4.0-alpha.0 → 배포 완료(2026-07-13, `1ebbc4d`·tag `v0.4.0-alpha.0`)** — dist-tag `next`(opt-in). CI publish.yml green(prepublishOnly type-check+test+build+publish --provenance). **npm 확인**: `next=0.4.0-alpha.0`·`latest=0.3.26` 무변경(0.3.x 무영향). 다음=alpha 소아킹 → GA `latest`(v0.4→main 플립 후).
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
