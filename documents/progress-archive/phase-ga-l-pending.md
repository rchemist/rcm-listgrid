# Phase GA-L — GA latest 봉인 트랙 (Paused)

**Status**: 🟡 Partial · GA-L1/L2 complete, GA-L3/L4 paused
**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)

## 상태

- [x] **GA-L1** low-risk Needs Review 처분 — 2026-07-13, 9건 확정·3건 GA-L2 재앵커.
- [x] **GA-L2** 실백엔드 검증 — Phase TB로 #GX-1/#GX-2/#W6-2b 종결.
- [ ] **GA-L3** `v0.4`→`main` 플립.
- [ ] **GA-L4** root version 0.4.0 + CHANGELOG + `v0.4.0` tag push로 npm `latest` 배포.
- [ ] **EC4** GraduationReview(custom onSave·role readonly·options pruning), GA 후 후순위.

GA-L3/L4는 사용자 `GA-latest go` 결정이 있어야 실행한다. 2026-07-13 사용자 지시로
EntityForm sample 전수 증명(EF-SP)이 GA-L3보다 먼저 수행되는 새 선결 게이트가 됐다.

## 릴리스 기전

1. `v0.4` 전체 게이트와 EF-SP closure가 green인지 확인.
2. `v0.4`→`main` 플립.
3. root `package.json` 0.3.26→0.4.0, CHANGELOG top `## [0.4.0]` 일치.
4. `v0.4.0` tag push → `publish.yml`이 Node 24 prepublish gate 후 npm `latest` 출하.

## Resume Conditions

- EF-SP 전수 matrix 53/53와 EFS-01~24/P-01~14 전건 및 SQLite restart CRUD green.
- 사용자 `GA-latest go`.

## 다음 Phase 인계 (Handoff)

- `latest=0.3.26`, `next=0.4.0-alpha.0` 상태를 플립 전 확인한다.
- publish 전에 CHANGELOG/version gate와 tarball 소비자 smoke를 다시 실행한다.
- `main`에 0.4 코드를 부분 반영하지 않는다. 플립은 전 작업과 검증 완료 후 한 번에 한다.
