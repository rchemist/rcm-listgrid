# PROGRESS — 이슈 #7 barrel이 optional:true peer를 static import → consumer 빌드 실패

**작성**: 2026-06-16
**상태**: in_progress
**Source Plan**: [fix-plan.md](./fix-plan.md)
**GitHub 이슈**: #7
**Push**: manual
**다음 세션 정책**: Continue current session — 단일 라이브러리, phase 간 결합 강함
<!-- polling: idle -->
**Last updated**: 2026-06-16 08:55 (Phase 3 완료 — 전송 주입화, barrel서 모든 optional/heavy peer 도달 0, 923 tests green)

## Goal
`@rchemist/listgrid` main barrel이 optional peer를 static import해 consumer `next build`가 강제 실패하는 문제 해결. peer를 **코어=필수 / leaf=subpath opt-in / 코어내장=주입** 3분류로 명시 선언. 완료 시: 필수 peer만 설치한 consumer가 main barrel import로 `next build` 성공.

## Context
- **Source Plan**: [fix-plan.md](./fix-plan.md) (불변 spec) · **GitHub 이슈**: #7
- **확정 전략**: 하이브리드 + qrcode.react v3 peer 고정 (사용자 확정 2026-06-16)
- **메타**: `package.json` (exports/peerDependencies/peerDependenciesMeta/sideEffects), `tsconfig.build.json`
- **Barrel**: `src/index.ts`, `src/listgrid/index.ts`
- **코어 도달 peer(필수화)**: ManyToOneField→react-select, ViewListGrid→react-sortablejs(+sortablejs), FieldRenderer→@iconify/react, misc→date-fns
- **leaf(subpath)**: QrField→qrcode.react / address→react-kakao-maps-sdk·react-daum-postcode / api-spec·xref-price→sweetalert2(+-react-content)
- **코어내장(주입)**: ViewListGrid→ListGridHeader→DataTransferModal→DataExporter/DataImporter→xlsx-js-style·file-saver
- **기존 DI 패턴 참고**: `configureMessages`(message), `configureApiClient`(api), `UIProvider`(ui), `registerMenuPermissionChecker`(menu)
- **Context Hub 미등록** → codebase-search 미사용, Grep/Read fallback
- 검증 핵심 게이트: 빌드 후 `grep -REn "qrcode.react|sweetalert2|xlsx-js-style|file-saver|react-kakao-maps-sdk|react-daum-postcode" dist/index.js dist/listgrid/index.js` = 0건

## Progress State

| Phase | Status | Summary | Detail |
|-------|--------|---------|--------|
| 1: peer 재분류 & qrcode 고정 (package.json 계약) | ✅ | #1 완료 (build green) | 본 문서 §Phase 1 |
| 2: leaf optional subpath 추출 | ✅ | qr/address/api-spec/xref-price 분리, gate PASS | [archive](progress-archive/phase-2-tasks.md) |
| 3: Excel 전송 주입 격리 | ✅ | configureDataTransfer 도입, gate PASS(모든 peer 도달 0) | [archive](progress-archive/phase-3-tasks.md) |
| 4: 빌드/문서/최종 검증 | [~] In progress | README·CHANGELOG·0.4.0 + acceptance | §Phase 4 |

## Phase 1 — peer 재분류 & qrcode 고정 (package.json 계약) ✅

- [x] **#1 peer 3분류 재선언** ✅ 2026-06-16 · `package.json` · @iconify/react·react-select·react-sortablejs→optional:false, sortablejs^1.15.0 추가, qrcode.react→^3.0.0, sideEffects 추가 · type-check+build green

**Handoff(P2)**: barrel은 아직 leaf/전송 export를 전부 보유 → build green 상태. P2는 leaf를 barrel에서 빼고 subpath로 옮긴다. exports map에 추가할 dist 경로는 tsc가 src/*.ts를 dist/*.js로 평면 출력함(현 dist/index.js 구조 참고).

## Phase 2 — leaf optional subpath 추출 ✅

- [x] **#2 leaf subpath 추출** ✅ 2026-06-16 · 4 신규 엔트리(qr/address/api-spec/xref-price) + barrel 8라인 제거 + exports 4개 · gate: barrel서 qr/kakao/daum/sweetalert 도달 0 · [detail](progress-archive/phase-2-tasks.md#2-leaf-subpath-추출--2026-06-16)

**Handoff(P3)**: barrel서 xlsx/file-saver만 남음(3 edge: `transfer/Provider/ExcelProvider`×2, `transfer/DataImporter`×1). 도달 경로 = ViewListGrid→ListGridHeader(`src/listgrid/components/list/ListGridHeader.tsx:9,49`)→`list/ui/DataTransferModal.tsx`(DataExporter/DataImporter static import). 기존 DI 참고: `src/listgrid/message.ts`·`api/index.ts`·`ui` (configure*/get* 쌍). `utils/lazy.ts`+`DynamicDataImporter`는 빌드 resolve 못 피함 → 주입으로 해결. 검증: `node documents/issues/7/.gate-trace.cjs` 가 xlsx/file-saver도 0 되어야 PASS(스크립트의 leaf 필터 확장 필요).

## Phase 3 — Excel 전송 주입 격리 ✅

- [x] **#3.1 전송 레지스트리 신규** ✅ `a6239bc` · configureDataTransfer/getDataTransfer · [detail](progress-archive/phase-3-tasks.md#31-전송-레지스트리-신규--2026-06-16)
- [x] **#3.2 DataTransferModal 주입화 + barrel 정리** ✅ `025c423` · 모달 주입화 + carrier 제거 · gate PASS(263모듈, 모든 peer 0) · [detail](progress-archive/phase-3-tasks.md#32-datatransfermodal-주입화--barrel-정리--2026-06-16)
- [x] **#3.3 /excel 엔트리 + export** ✅ 2026-06-16 · `src/excel.ts` + exports `./excel` + `registerExcelDataTransfer()` · dist/excel.js 생성, gate PASS, 923 tests green · [detail](progress-archive/phase-3-tasks.md#33-excel-엔트리--export--2026-06-16)

**Handoff(P4)**: 코드 변경 끝. barrel에서 모든 optional/heavy peer 도달 0(`node documents/issues/7/.gate-trace.cjs`), 923 tests·lint 0err·format clean. P4는 문서/버전/최종 acceptance만. 신규 공개 subpath: `/qr`,`/address`,`/api-spec`,`/xref-price`,`/excel`. breaking: 해당 컴포넌트들을 main barrel서 import하던 host는 subpath로, 전송은 `registerExcelDataTransfer()` 등록 필요. 마무리=main 직접 병합+v0.4.0 태그(사용자 결정).

## Phase 4 — 빌드/문서/최종 검증 (진행 중)

목표: 사용자 대면 문서 + 버전 + acceptance 마무리. (실제 consumer next build는 별도 repo 필요 → 라이브러리 측 gate로 대체 검증 + 문서화.)

- [x] **#4.1 버전 0.4.0 + CHANGELOG** ✅ 2026-06-16 · package.json 0.3.20→0.4.0, CHANGELOG [0.4.0]에 BREAKING(peer 재분류/subpath 이전/qrcode v3) + import 매핑표 + Migration
- [x] **#4.2 README peer 매트릭스 + subpath 사용법** ✅ 2026-06-16 · 필수 vs opt-in subpath 표 + qr import 예시 + registerExcelDataTransfer 예시로 교체
- [ ] **#4.3 최종 acceptance + fix-plan 구현결과 주입** — 전체 검증
  - **Changed files**: `documents/issues/7/fix-plan.md`(## 구현 결과)
  - **What**: `npm run type-check && npm run lint && npm run format:check && npm test && npm run build` 전부 green + gate PASS 재확인. fix-plan에 구현 결과 섹션 주입.
  - **Verification**: 위 명령 전부 green; gate exit 0
  - [Plan detail](./fix-plan.md#step-5--빌드문서)

## Phase 3 — Excel 전송 주입 격리
(진입 시 확장) Step 3: transfer 레지스트리(`configureDataTransfer`/`getDataTransfer`) 도입(기존 DI 패턴 모델), DataTransferModal에서 DataExporter/DataImporter static import 제거→레지스트리 사용(미등록 시 graceful), barrel에서 xlsx/file-saver 경유 transfer export 제거(주입 API는 export), src/excel.ts(+`registerExcelDataTransfer`) + `/excel` export. [Plan detail](./fix-plan.md#step-3--전송excel-을-주입injection-으로-격리)

## Phase 4 — 빌드/문서/최종 검증
(진입 시 확장) Step 5: README peer 매트릭스+subpath 예시+전송 등록 예시, CHANGELOG + version 0.4.0, 최종 `npm run build && npm test` + acceptance grep 게이트(#5). [Plan detail](./fix-plan.md#step-5--빌드문서)

## Open Questions
(없음 — 전략/qrcode 결정 완료)

## Progress notes
- 2026-06-16: 4 phase로 분해 — package.json 계약(P1) → leaf subpath(P2) → 전송 주입(P3) → 문서/검증(P4). 각 phase 독립 빌드 검증 가능하도록 배치.
- 2026-06-16 (사용자 결정): 마무리 = **이 브랜치를 main에 직접 병합**(PR 생략) 후 `package.json` 0.4.0 → **`v0.4.0` 태그 push**로 배포. 배포는 `.github/workflows/publish.yml`(태그 `v*` → npm publish, dist-tag latest, Trusted Publishing OIDC). 태그/푸시는 Phase 4 완료+확인 후.

## Completion Summary
(종결 시 작성)
