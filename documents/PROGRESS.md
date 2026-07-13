# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · **GA 게이트(CAP-28) ✅ + R7 실결함 수정(RV-R13) 2026-07-13**: 헌장 C1~C9 전건 present·edustack 실 대조로 R7 검증→manyToOne labelField 실결함 발견→수정. 전 게이트 green([결과](./analysis/2026-07-13/ga-gate-result.md)·2399u/E2E32/surface 49·61·188 무변경). **코드축 GA-READY** · **`0.4.0-alpha.0` 배포됨(dist-tag `next`·`1ebbc4d`·latest=0.3.26 무영향)**. 다음=alpha 소아킹→GA latest.
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: auto (사용자 확정 2026-07-11 — 커밋·push·배포까지 자율 실행 후 결과 보고. "커밋할까요/배포할까요" 금지)
**Model policy**: 설계 pass 완료 — **구현 wave(W1~W7)는 실행급 브리프로 opus/sonnet 세션 실행 가능**. 위임 기본 sonnet(waves 브리프=브리핑 원문). **스펙이 침묵하는 판단=구현 금지**(스펙 §10 게이트 4) — 스펙 개정만 상위 티어.
**Next session policy**: **GA 게이트 실행 완료** — 남은 봉인 게이트는 **소비자/외부 입력 2건**(R7 실 GJCU-shape·publish 승인)뿐, 코드 변경 없음. cold-start=[GA 결과](./analysis/2026-07-13/ga-gate-result.md) + §Open Questions HOLD 2건. **Do-NOT**: 스펙 §를 인용 못하는 설계 판단 구현(§10 게이트 4)·src/ 삭제(오라클)·dts experimentalDts 재시도·0.2(GJCU) shape를 primary로 채택(폴백만)·R7 실페이로드 확인 없이 형태 추정.
**Last updated**: 2026-07-13 (**GA 게이트 ✅ + R7 실결함 수정(RV-R13)** — 사용자 지시로 R7을 edustack(0.3.x 권위 소비자) 실 백엔드 대조 검증(9-agent 팬아웃+opus 적대검증): manyToOne list-row=`{id,title}`(labelField='title')·gjcu/apps-sample=`{id,name}`. **RV-R7 가드 `name→label→id`가 title 놓쳐 raw id export하는 실결함 발견**(apps/sample이 'name'써서 통과테스트가 가림). 수정=`/excel`이 field labelField 스레드(sonnet 위임→판별검증→pre-fix FAIL 확인). 전 게이트 green: test 2394→**2399**·E2E32·surface 무변경·attw/publint. xref=raw 바인딩無+CAP-29 descope(low-risk)·address=flat 무관. 코드축 **GA-READY**. 다음=0.4.0-alpha.0 publish(next).)

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
| P1 워크스페이스+패키징 | v0.4 | ✅ 0.4.0-alpha.0 배포됨(dist-tag `next`·2026-07-13) | 0.4.0-alpha.0 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P2 특성화 오라클 | v0.4 | ✅ 완료(내부) | — | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| **수직 슬라이스 V0~V2** | v0.4 | ✅ 완료(5 E2E green) | — | [archive](./progress-archive/vertical-slice-V0-V2.md) |
| 형식 P3~P7 (계약골격→GA) | v0.4 | ⬜ 보류(수직 슬라이스가 앞당겨 실증) | — | [archive](./progress-archive/formal-roadmap-P3-P7.md) |
| **하드닝/확장 트랙** | v0.4 | [~] H·EF·EA/EB/EC·EG·GX·RV ✅·**GA 게이트(CAP-28) 실행 완료** — 봉인 HOLD 2건(소비자/외부) | — | §Tasks · [GA 결과](./analysis/2026-07-13/ga-gate-result.md) |

**타임박스**: P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토 — 수직 슬라이스가 abort 판정을 **GO로 조기 실증**(2026-07-11)해 위험 완화됨.

## 세션 인계 (Handoff — **GA 게이트(CAP-28) 실행 완료 2026-07-13**·헌장 C1~C9 전건 present·전 게이트 green. 남은 봉인=**소비자/외부 입력 2건**)

- **✅ GA 게이트 실행 완료** — [결과 매트릭스](./analysis/2026-07-13/ga-gate-result.md): 헌장 C1~C9 전건 `present`(C6 일부 descoped-ok CAP-29)·빈 행 0·요건1/2/3 충족. 전 게이트 green(2394u·E2E32·surface 49/55·61/120·188/190·attw/publint/headless zero-React/codemod 4/4). cold-start=GA 결과 + [헌장](./prd/concept-charter.md) + [브리프](./plans/ga-gate-charter-brief.md).
- **⚠ 최종 GA 봉인 = HOLD 2건(코드 아님·§Open Questions)**: ① **R7 GJCU-shape unverified** — 실 GJCU/edustack list-endpoint 페이로드 부재(리포는 mock만)·manyToOne/xref/address 컬럼 평면 vs 중첩 판정 불가·Do-NOT: 추정 금지(실페이로드 확인 시 중첩이면 `/excel` TIER2 후속·평면이면 무해). ② **P0/P1 publish 외부 승인**. → 사용자/외부 입력 대기.
- **Do-NOT(계승)**: 스펙 §를 인용 못하는 설계 판단 발명 금지(§10 게이트 4)·구 src/ 삭제 금지(오라클)·**dts `experimentalDts`+api-extractor 재시도 금지**(빈 스텁 방출→소비자 tsc `check:headless`가 실 게이트, [선례](./progress-archive/phase-eg-api-redesign.md#w7-1))·0.2(GJCU) shape primary 채택 금지(폴백만)·`search-form.ts` addAndFilter 시맨틱 변경 금지·GX-6 전역싱글턴 기전 커밋 금지(G-1 context-스코프로 재설계 완료).
- **이미 SOUND(유지·재작성 금지)**: store 값 모델(ADR-0002)·schema-core 순수성(ADR-0003)·FormMutator seam·EF1-7 파이프라인·필드24+주소+Xref·권한 배선. 재설계는 공개 표면 — 엔진 재작성 아님. 규범 docs: [스펙 r2](./plans/entityform-public-api-spec.md)(CAP-01~29)·[ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md).
- **작업 규율**: 완료=logic 커밋→PROGRESS 커밋→push(전부 push). active-session marker=이 PROGRESS. 완료 페이즈 상세=[progress-archive](./progress-archive/)(RV=phase-rv-tasks.md·EG·GX·E-track).

---

## Tasks

완료: H·E-트랙·EG(공개 API 재설계 W1~W7)·GX(프레임워크 정합)·RV(중간점검 개선)·**GA 게이트(헌장 C1~C9 대조·실행 완료)**. **현 상태 = GA 실행 완료 → 최종 봉인 HOLD 2건(소비자/외부 입력·§Handoff·§Open Questions).** 페이즈 상세 → [progress-archive](./progress-archive/).

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

**완료 W1~W7** (전 commit·CAP·상세 → [archive](./progress-archive/phase-eg-api-redesign.md)):
- **EG1/2** 권한 배선 `a1f3deb`(isPermitted end-to-end) · **EG-D** 설계 pass(ADR-0009+스펙 r2+waves·4렌즈 22건)
- **W1** 표면정비 `599a3f3..4c04906`(CAP-12) · **W2** 훅+FormRuntime/Controller `005b4a3..ed77ecf`(8훅)
- **W3** 권한·능력·액션 `4d30159..b4ecda3`(CAP 7종·4버그) · **W4** 폼완결 `3b3518f..44edfae`(CAP-05·07·10·13·23·4버그)
- **D1** async save-gating(스펙 §5.3/§6.2 개정) · **D2** §Needs Review 9건 처분(2026-07-12·§Open Q 0)
- **W5** list-track(entry+W5-1~4 · `2223f35` 등)(CAP-18·19·20)·계수 47/57/184·E2E28
- **W6** data-transfer(entry+W6-1~4 · `@listgrid/excel`)(CAP-16·17)·**full gate+E2E 30/30**·계수 49/57/186
- **W7** 패키징+마이그레이션(마지막 wave·CAP-24/25·entry+W7-1~5)·**Phase EG 종료**·full gate+E2E30·계수 49/57/186 · [archive](./progress-archive/phase-eg-api-redesign.md#w7-1)

#### Phase GX — 0.4 프레임워크 정합 + parity (봉인 후 조사 2026-07-12 · **GX-1~5 ✅ 완료 2026-07-13**) → 다음=GA 게이트

**완료 GX-1~5** (0.4 프레임워크 정합 · 상세 → [archive](./progress-archive/phase-gx-tasks.md) · 규범=[gap analysis](./analysis/2026-07-12/w7-post-seal-gap-analysis.md)):
- wire 정합·mock 정합·`/utils` 이식·프록시 seam=[ADR-0005 부록A](./adr/ADR-0005-backend-adapter-contract.md)·문서정정+descope · 2368u·E2E32·49/57/188

#### Phase RV — 중간 점검 개선 트랙 ✅ 완료 (2026-07-13 · CRIT reload+HIGH 고급검색+MED 6+LOW 4 + G-1~3·GA-BRIEF) · [archive](./progress-archive/phase-rv-tasks.md)

- [x] **RV-R1~R12 + G-1~3 + GA-BRIEF ✅** 2026-07-13 · `3c41ebf`..`7ffb60d` · 무결정 실행계획→sonnet 위임·판별검증 · 트랙엔드 green(2394u·E2E32·surface 무변경) · [archive](./progress-archive/phase-rv-tasks.md)

#### Phase GA — 헌장 C1~C9 대조 게이트 (CAP-28) ✅ 실행 완료 (2026-07-13 · 순수검증 pass) · [결과](./analysis/2026-07-13/ga-gate-result.md)

- [x] **GA 게이트 실행 (헌장 C1~C9·요건1/2/3)** ✅ 2026-07-13 · 전건 `present`(빈 행 0)·전 게이트 green·엔진 anchor 실재 · [결과](./analysis/2026-07-13/ga-gate-result.md)
- [x] **RV-R13 R7 실 백엔드 검증 + labelField 수정** ✅ 2026-07-13 · edustack(0.3.x) 실 대조=manyToOne `{id,title}`(labelField='title')·RV-R7 가드 name→label→id가 title 놓쳐 raw id export하는 **실결함 발견→수정**(9-agent 팬아웃+opus 적대검증). `/excel`이 labelField 스레드(sonnet 위임→판별검증·surface 무변경·2399u·E2E32) · [결과 §3](./analysis/2026-07-13/ga-gate-result.md)

**Next up**: **alpha 소아킹 → GA `latest` 봉인** — 0.4.0-alpha.0 배포 완료(next). GA latest 전 선결: ① v0.4→main 플립 ② low-risk §Needs Review ack ③ alpha 소비자 피드백. 코드축 GA-READY(잔여 코드 작업 0).

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
- [x] **#W5-3 de-dup → RV-R2 해소(2026-07-13, `dcd82b2`)** — 신규 API 대신 기존 `SearchForm.withFilter`(name 교체) 재사용(공개표면 무변경)·addAndFilter 스택킹 빈결과 해소 · [R2](./plans/rv-remediation-execution-plan.md)
- [ ] **#W5-2 major/staff withList 확대** — 브리핑 3페이지 외 major/staff에도 withList(M2O/Xref 피커 target·폴백폐기 후 E2E 파손 방지) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#W5-2 EntityField 캐스트** — list-columns.ts `(field as FormField).getListConfig()`(인터페이스 미선언·후속 W5-3/W7서 EntityField 이관 검토) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#W5-2 픽스처 4파일 withList** — react 테스트 픽스처(columns prop 없는 피커)에 withList(폴백폐기 대응·§5.1 인용·행동약화 아님) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w5-2-column-derivation-cap-19)
- [ ] **#GX-1 toJSON empty AND/OR 그룹 방출** — `filters.AND`/`OR`를 빈 `[]`도 항상 wire 방출(기존 테스트 presence 어서트 때문)·NOT만 omit. **GX-2 mock서 vacuous no-op 확인**(실백엔드 수용은 GA 전 실서버 대조 권장) · risk:low · [detail](./progress-archive/phase-gx-tasks.md#gx-1)
- [ ] **#GX-2 mock filter 5/24 조건타입** — apps/sample mock이 EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE만 매칭·NOT 그룹 no-op(전 실사용 경로 커버·발명 회피). 실백엔드 필요 조건타입 확장 시 재검토 · risk:low · [detail](./progress-archive/phase-gx-tasks.md#gx-2)
- [x] **#GX-3 asset-base 배선 → 해소(2026-07-13, `9095504`)** — 사용자 결정=채택+재설계: context-스코프 3티어(전역 싱글턴 GX-6 기각·제거) · [design](./plans/asset-url-resolution-design.md)
- [ ] **#GX-3 isExternalUrl 2카피** — schema-core(private)+utils(public) byte-identical 재구현(zero-dep 하드룰·상호참조 주석) · risk:low · [detail](./progress-archive/phase-gx-tasks.md#gx-3)
- [ ] **#RV-R4 회귀 테스트 마이크로태스크 동기화 보정** — 실행계획 R4 테스트가 validateAll 루프가 'slow'에 park하기 전에 `resolveSlowCheck`를 호출(async fn이 첫 await='alias'에서 suspend)→"not a function". 메인 세션이 `slowStartedP`(slow 진입 시 fire) await 추가(최소·R4 Do-NOT 전부 보존). discriminating 확인(구소스 revert→ASSERT2 'checking' FAIL). 스펙 저자: 테스트 동기화 방식 확정 · risk:low · `f0d331c` · [R4](./plans/rv-remediation-execution-plan.md)
- [ ] **#RV-R7 doc-comment `*/` 조기종료 보정** — 실행계획 R7 exactAfter JSDoc "manyToOne/xref*/address"가 `*/`로 코멘트 조기종료→oxc PARSE_ERROR. 1-space 보정("xref* /address"·의미무변경)로 컴파일·45/45 green. 스펙 저자: 문구 정정(또는 xref/address로) · risk:low · `5190ef3` · [R7](./plans/rv-remediation-execution-plan.md)
- [x] **#W7-4 서브패스 descope 처분** — 위젯 4종=CAP-29·`/misc`=`/utils`(GX-3)·`withFilter`=복원(GX-1) · [detail](./analysis/2026-07-12/w7-post-seal-gap-analysis.md)
- [ ] **#W7-4 spec §9 #29 라벨 재조정** — spec §9는 withCreatedAndUpdatedAtFields를 codemod로 표기하나 impl=수동/이연(presets-rcm 빈 스캐폴드). spec 저자: §9 라벨 정정 or /presets/rcm 감사헬퍼 출하 후 codemod화 · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)
- [ ] **#W7-4 guide SUPERSEDED 배너** — list-page-composition-guide.md 상단에 ⛔ SUPERSEDED→MIGRATION §3 포인터 추가(원문 무삭제). 브리핑 declared 4산출물 밖 touch(관례상 정당·정보 흡수 보존) · risk:low · [detail](./progress-archive/phase-eg-api-redesign.md#w7-4)

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
