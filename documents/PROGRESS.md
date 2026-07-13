# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · EF-SP EntityForm 설정 전수·영속 CRUD 샘플 증명 대기
**Next up**: #EFSP-0 스펙 query 복구 + SQLite proof lab/AST 게이트
**Last updated**: 2026-07-13 21:11
**Push**: auto
**Engine**: claude/codex 중립
**Next session policy**: 새 세션 권장. `$harness:progress`는 EFSP-0부터 즉시 실행한다.

## Goal

`v0.4`의 EntityForm 공개 설정을 `apps/sample` 소비자 선언과 실제 브라우저·HTTP·SQLite 관찰로
전부 봉인한다. `npm run dev`에서 사람이 모든 case와 재시작 영속 CRUD를 반복한 뒤 0.4.0 GA에 도달한다.

## Context

- 브랜치: `v0.4`. `main`은 0.3.x 유지보수이며 GA-L3 전까지 0.4 부분 반영 금지.
- 현재 배포: npm `next=0.4.0-alpha.0`, `latest=0.3.26`.
- 최신 게이트: 2509 unit, 71 E2E, Next 43 pages, coverage 45.30/39.64/48.01/44.92.
- 공개 표면 기준선: 구현 EntityForm 49/55, root 61/120, `/schema` 188/190.
- 스펙 §3.2 누락: `hasField`, `getTab`, `hasTab`, `getTabFields`; 복구 후 EntityForm 목표 53/55.
- 현재 sample backend는 `globalThis` 메모리 store라 서버 재시작 시 초기화된다. EFSP-0에서 공용 SQLite로 교체한다.
- 규범: [EntityForm 스펙](./plans/entityform-public-api-spec.md),
  [EF-SP 실행계획](./plans/entityform-sample-proof-plan.md), [sample 명세](./prd/sample-site-spec.md).

## 불변 규율

1. 완료는 sample 선언 + 실제 Playwright 관찰이다. unit-only는 EF-SP 완료로 세지 않는다.
2. 스펙 누락 query 복구 후 53 public member exact manifest와 22 setting branch matrix에 빈 행을 허용하지 않는다.
3. 스펙이 정한 원자 분기와 필수 pairwise 조합은 전부 증명하되 무의미한 Cartesian product는 만들지 않는다.
4. CRUD는 Next Node.js Route Handler→SQLite transaction이며 새로고침/서버 재시작 뒤에도 유지되어야 한다.
5. Playwright DB와 개발 DB를 격리한다. reset은 hidden backdoor가 아니라 proof hub의 visible sample control이다.
6. sample 증명 중 결함을 발견하면 red E2E를 먼저 남기고 소스 수정은 별도 논리 커밋으로 한다.
7. 매 태스크 종료: diff 리뷰 → 논리 커밋 → PROGRESS 커밋 → push.

## Do-NOT

- 엔진을 sample 테스트에 맞춰 재설계하지 않는다. 확정 스펙 누락 query 4개 외 공개 API를 넓히지 않는다.
- manifest를 실제 class에서 런타임 자동 생성하지 않는다. 새 API와 누락이 함께 통과할 수 있다.
- private state나 mock 함수 호출만 읽고 “sample 증명”으로 판정하지 않는다.
- 기존 CRUD route factory/검색 의미를 복제·변경하지 않는다. `EntityStore` 계약을 유지하고 backing만 SQLite로 확장한다.
- client component에서 SQLite를 import하거나 E2E가 개발 DB를 reset하지 않는다. process restart를 module reload로 대체하지 않는다.
- `SearchForm.addAndFilter` 시맨틱, store 모델, schema-core 순수성, address optional peer 계약을 바꾸지 않는다.
- 0.2.x `release/0.2`를 선제 수정하지 않는다. 실 에러 리포트가 있을 때만 대응한다.

## Progress State

| Phase | Branch | Status | Detail |
|---|---|---|---|
| P0~P2 + V0~V2 | main/v0.4 | ✅ 완료 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| H + E | v0.4 | ✅ 완료 | [H](./progress-archive/phase-hardening-H.md) · [E](./progress-archive/phase-e-track-tasks.md) |
| EG + GX + RV | v0.4 | ✅ 완료 | [EG](./progress-archive/phase-eg-api-redesign.md) · [RV](./progress-archive/phase-rv-tasks.md) |
| GA gate + RV-R14 | v0.4 | ✅ 완료 | [GA](./analysis/2026-07-13/ga-gate-result.md) · [R14](./progress-archive/phase-rv-r14.md) |
| TB backend full set | v0.4 | ✅ 완료 | [archive](./progress-archive/phase-tb-tasks.md) |
| **EF-SP sample proof** | v0.4 | **⬜ Next** | [plan](./plans/entityform-sample-proof-plan.md) · 이 문서 §Phase EF-SP |
| GA-L latest seal | v0.4→main | ⏸ EF-SP + 사용자 go 대기 | [pending](./progress-archive/phase-ga-l-pending.md) |

## 세션 인계 (Handoff)

- **현재 활성 task**: `[ ] #EFSP-0` — query 4개 복구, 53-member gate, SQLite proof hub와 restart E2E를 만든다.
- **왜 먼저인가**: 기존 71 E2E는 C1~C9 대표 흐름이며 EntityForm 설정 전수 원장이 아니다.
- **Do NOT**: 기존 E2E 이름만 manifest에 연결하지 말고 해당 assertion이 같은 원자 동작을 실제 관찰하는지 확인한다.
- **Do NOT**: getter diagnostics만으로 설정 동작을 증명하지 않는다. 설정은 DOM·request·response까지 단언한다.
- **Hot 파일**: `packages/schema-core/src/entity-form.ts` — 현재 49와 스펙 누락 query 4개의 권위 원본.
- **Hot 파일**: `documents/plans/entityform-sample-proof-plan.md` — EFS-01~24/P-01~14·SQLite 실행 계약.
- **Hot 파일**: `apps/sample/lib/mock-backend/store.ts` — API를 유지하고 공용 SQLite backing으로 확장할 대상.
- **Invariant**: id가 있을 때만 update, readOnly와 capability는 다른 계약, hook은 등록 순서대로 엔진이 실행한다.
- **Invariant**: manifest 행은 sample/e2e anchor와 관찰 assertion이 모두 있어야 green이다.
- **Invariant**: `cd apps/sample && npm run dev`→`/entityform-proof`에서 모든 case/CRUD/reset을 직접 실행할 수 있다.
- **미룬 결정**: GA-L3/L4는 EF-SP closure 후에도 사용자 `GA-latest go`가 필요하다(OQ-GA-L).
- **첫 확인**: `git status -sb`, `node -v`, `npm run check:surface` baseline 49/61/188, plan K-EFSP-1~5.

---

## Phase EF-SP — EntityForm 설정 전수 샘플 증명

**계획**: [entityform-sample-proof-plan.md](./plans/entityform-sample-proof-plan.md)
**완료 판정**: EntityForm 53/53 manifest + EFS-01~24 + P-01~14 빈 행 0 + restart SQLite CRUD + full gate green.

- [ ] **#EFSP-0 스펙 query 복구 + SQLite proof lab/AST 게이트**
  - Files: EntityForm+unit, spec, manifest/entity, SQLite store/routes/hub, persistence runner, package/Next config/CI.
  - Verify: 4 query red→green, AST 53 exact, baseline, restart E2E, production `next start` Chromium CRUD.
  - IDs: P-13. EFS-24 inventory scaffold; 행동 완료는 EFSP-1 소유.
- [ ] **#EFSP-1 identity/read/meta/clone/query 증명**
  - Files: proof entity/pages, `e2e/entityform-proof-identity.spec.ts`, manifest.
  - Verify: identity spec + AST gate. IDs EFS-01/03/05/20/23/24, P-01/02/03/12.
- [ ] **#EFSP-2 field/tab/group/step 구조 증명**
  - Files: proof entity/pages, `e2e/entityform-proof-structure.spec.ts`, manifest.
  - Verify: structure spec + request payload assertions. IDs EFS-14~19, P-05/06.
- [ ] **#EFSP-3 form lifecycle/revision 증명**
  - Files: proof entity/pages, `e2e/entityform-proof-lifecycle.spec.ts`, manifest.
  - Verify: lifecycle CRUD/hook order + field/global plural validation. IDs EFS-06~11/21, P-04/07/08/10/14.
- [ ] **#EFSP-4 capabilities/actions/list lifecycle 증명**
  - Files: proof list/action cases, `e2e/entityform-proof-actions-list.spec.ts`, manifest.
  - Verify: action/list spec의 DOM·search request·rows. IDs EFS-02/04/12/13, P-09.
- [ ] **#EFSP-5 data transfer와 전수 closure**
  - Files: transfer cases/spec, manifest, sample-site spec.
  - Verify: 실제 xlsx→SQLite 왕복 + AST 53/53 + EFS/P 빈 행 0. IDs EFS-22/P-11.
- [ ] **#EFSP-6 최종 적대 감사와 GA 재봉인**
  - Files: 결과 문서/PROGRESS; 결함 발견 시 source+red E2E 별도 commit.
  - Verify: unit/coverage/lint/format/build/Next/E2E/surface/attw/publint/smoke/headless 전 게이트.

## Needs Review

- [ ] **#TB-1 vitest include 확장 승인** — 이미 `apps/**/*.test`가 CI에 진입. 문서상 사용자 ack만 미완료.
- [ ] **#TB-7 staff.organization wire transform 부재** — picker-only라 create/update 실트래픽은 현재 0. risk low.

## Progress notes

- **Reorder 2026-07-13**: 사용자 지시로 EF-SP를 GA-L3/L4보다 앞선 새 GA 선결 게이트로 승격했다.
- **Baseline audit**: sample+e2e 직접 참조는 react 9/61, schema 27/188, state 2/12다. 전수 증명으로 간주하지 않는다.
- **Scope add 2026-07-13**: `npm run dev` UI 전수 탐색, Next server CRUD, 재시작 영속 저장을 완료 조건으로 확정했다.
- **Spec fidelity**: G1 inline type/prefix·문장부호 false-positive를 분류했고, fresh cold-reader+재감사의 blocker 7+10건을 전부 처분해 최종 PASS(새 blocker 0).
- **Slim**: 이전 세션 상세는 각 phase archive와 [RV-R14](./progress-archive/phase-rv-r14.md)로 이동했다.

## Backlog

- xref Excel export는 `{mapped,deleted}`를 빈 셀로 만들고 경고하지 않는다. 현 소비자 트래픽은 0이며 GA 후 경고화/TIER1을 검토한다.
- `presets-rcm` auditFields 출하와 `EntityField` list/filter/display 인터페이스 정리는 GA 후 저위험 후속이다.
- EC4 GraduationReview는 EF-SP와 GA-latest 후 별도 수행한다.

## Open Questions

- [ ] **OQ-GA-L** — EF-SP 완료 후 `v0.4`→`main` 플립과 npm `0.4.0 latest` 배포 승인. 승인 문구: `GA-latest go`.
