# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: paused · EF-SP 완료, GA-L3/L4 사용자 go 대기
**Next up**: OQ-GA-L — 사용자 `GA-latest go` 후 GA-L3/L4
**Last updated**: 2026-07-13 23:12
**Push**: auto
**Engine**: claude/codex 중립
**Next session policy**: EF-SP 결과 원장을 기준선으로 유지하고 사용자 go 전 main 병합·latest 전환을 수행하지 않는다.

## Goal

`v0.4`의 EntityForm 공개 설정을 `apps/sample` 소비자 선언과 실제 브라우저·HTTP·SQLite 관찰로
전부 봉인한다. `npm run dev`에서 사람이 모든 case와 재시작 영속 CRUD를 반복한 뒤 0.4.0 GA에 도달한다.

## Context

- 브랜치: `v0.4`. `main`은 0.3.x 유지보수이며 GA-L3 전까지 0.4 부분 반영 금지.
- 현재 배포: npm `next=0.4.0-alpha.0`, `latest=0.3.26`.
- 최신 게이트: 2517 unit, 182 E2E, Next 44 pages, coverage 45.55/40.22/47.77/45.22.
- 공개 표면 기준선: EntityForm 53/55, root 61/120, `/schema` 188/190.
- proof backend는 격리 SQLite transaction을 권위 저장소로 사용하며 create/update/delete가 process restart 뒤에도 유지된다.
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
| **EF-SP sample proof** | v0.4 | ✅ 완료 | [result](./analysis/2026-07-13/entityform-sample-proof-result.md) |
| GA-L latest seal | v0.4→main | ⏸ 사용자 go 대기 | [pending](./progress-archive/phase-ga-l-pending.md) |

## 세션 인계 (Handoff)

- **현재 활성 task**: 없음 — EF-SP 0~6 완료. 다음 변경은 사용자 `GA-latest go`가 필요한 GA-L3/L4다.
- **완료 기반**: 53/53 manifest, EFS-01~24/P-01~14 빈 행 0, 163 anchors, 182 E2E, 실제 xlsx↔SQLite, restart/prod/package full gate를 봉인했다.
- **Do NOT**: 사용자 go 전 `main` 병합, npm `latest` dist-tag 변경, GA-L3/L4를 시작하지 않는다.
- **Do NOT**: packaging gate를 같은 `dist`에서 병렬 실행하지 않는다. build clean과 pack이 경합한다.
- **Hot 파일**: `packages/schema-core/src/entity-form.ts` — 현재 53-member 권위 원본; AST manifest exact gate가 봉인한다.
- **Hot 파일**: `documents/plans/entityform-sample-proof-plan.md` — EFS-01~24/P-01~14·SQLite 실행 계약.
- **Hot 파일**: `documents/analysis/2026-07-13/entityform-sample-proof-result.md` — EFSP-6 full gate와 SQLite 실측의 최종 결과 원장.
- **Invariant**: id가 있을 때만 update, readOnly와 capability는 다른 계약, action/list hook은 등록 순서와 실제 transport 경계를 보존한다.
- **Invariant**: manifest 행은 sample/e2e anchor와 관찰 assertion이 모두 있어야 green이다.
- **Invariant**: `cd apps/sample && npm run dev`→`/entityform-proof`에서 모든 case/CRUD/reset을 직접 실행할 수 있다.
- **미룬 결정**: GA-L3/L4는 EF-SP closure 후에도 사용자 `GA-latest go`가 필요하다(OQ-GA-L).
- **첫 확인**: `git status -sb`, [EF-SP 결과](./analysis/2026-07-13/entityform-sample-proof-result.md), 사용자 go 여부.

---

## Phase EF-SP — EntityForm 설정 전수 샘플 증명

**계획**: [entityform-sample-proof-plan.md](./plans/entityform-sample-proof-plan.md)
**완료 판정**: EntityForm 53/53 manifest + EFS-01~24 + P-01~14 빈 행 0 + restart SQLite CRUD + full gate green.

- [x] **#EFSP-0 query+SQLite proof** ✅ 2026-07-13 · commit `4c5de9a` · 2512u/72e2e/restart/prod green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-0)
- [x] **#EFSP-1 identity/read/meta/clone/query 증명** ✅ 2026-07-13 · commit `1c7f6b9` · 59 anchors/78e2e/44 pages green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-1)
- [x] **#EFSP-2 field/tab/group/step 구조 증명** ✅ 2026-07-13 · `2a6089c` · 31 structure/109e2e + 2 fixes green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-2)
- [x] **#EFSP-3 form lifecycle/revision 증명** ✅ 2026-07-13 · `ee4ddb7` + `051763a` · 40 lifecycle/149e2e/130 anchors green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-3)
- [x] **#EFSP-4 capabilities/actions/list lifecycle 증명** ✅ 2026-07-13 · `db90afe`+`24da750` · 27 action/list·176 E2E green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-4)
- [x] **#EFSP-5 data transfer와 전수 closure** ✅ 2026-07-13 · `ea7d7d9`+`3bd1bee` · 6 transfer/182 E2E/163 anchors green · [detail](./progress-archive/phase-efsp-tasks.md#efsp-5)
- [x] **#EFSP-6 최종 적대 감사와 GA 재봉인** ✅ 2026-07-13 · `062243f`+`a00b9b2` · full gate green · [result](./analysis/2026-07-13/entityform-sample-proof-result.md)

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
