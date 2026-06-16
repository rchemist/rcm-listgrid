# PROGRESS — 이슈 #7 barrel이 optional:true peer를 static import → consumer 빌드 실패

**작성**: 2026-06-16
**상태**: in_progress
**Source Plan**: [fix-plan.md](./fix-plan.md)
**GitHub 이슈**: #7
**Push**: manual
**다음 세션 정책**: Continue current session — 단일 라이브러리, phase 간 결합 강함
<!-- polling: idle -->
**Last updated**: 2026-06-16 08:40 (#2 leaf subpath 추출 완료 — barrel서 qr/kakao/daum/sweetalert 도달 0, gate PASS)

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
| 3: Excel 전송 주입 격리 | [~] In progress | configureDataTransfer 도입, DataTransferModal 리팩터 | §Phase 3 |
| 4: 빌드/문서/최종 검증 | [ ] | README·CHANGELOG·0.4.0 + acceptance grep 게이트 | §Phase 4 |

## Phase 1 — peer 재분류 & qrcode 고정 (package.json 계약) ✅

- [x] **#1 peer 3분류 재선언** ✅ 2026-06-16 · `package.json` · @iconify/react·react-select·react-sortablejs→optional:false, sortablejs^1.15.0 추가, qrcode.react→^3.0.0, sideEffects 추가 · type-check+build green

**Handoff(P2)**: barrel은 아직 leaf/전송 export를 전부 보유 → build green 상태. P2는 leaf를 barrel에서 빼고 subpath로 옮긴다. exports map에 추가할 dist 경로는 tsc가 src/*.ts를 dist/*.js로 평면 출력함(현 dist/index.js 구조 참고).

## Phase 2 — leaf optional subpath 추출 ✅

- [x] **#2 leaf subpath 추출** ✅ 2026-06-16 · 4 신규 엔트리(qr/address/api-spec/xref-price) + barrel 8라인 제거 + exports 4개 · gate: barrel서 qr/kakao/daum/sweetalert 도달 0 · [detail](progress-archive/phase-2-tasks.md#2-leaf-subpath-추출--2026-06-16)

**Handoff(P3)**: barrel서 xlsx/file-saver만 남음(3 edge: `transfer/Provider/ExcelProvider`×2, `transfer/DataImporter`×1). 도달 경로 = ViewListGrid→ListGridHeader(`src/listgrid/components/list/ListGridHeader.tsx:9,49`)→`list/ui/DataTransferModal.tsx`(DataExporter/DataImporter static import). 기존 DI 참고: `src/listgrid/message.ts`·`api/index.ts`·`ui` (configure*/get* 쌍). `utils/lazy.ts`+`DynamicDataImporter`는 빌드 resolve 못 피함 → 주입으로 해결. 검증: `node documents/issues/7/.gate-trace.cjs` 가 xlsx/file-saver도 0 되어야 PASS(스크립트의 leaf 필터 확장 필요).

## Phase 3 — Excel 전송 주입 격리 (진행 중)

목표: 리스트 헤더 내장 전송 모달이 `DataExporter`/`DataImporter`를 static import하는 것을 끊고, host가 `@rchemist/listgrid/excel`에서 주입하도록 전환. 완료 시 barrel 그래프에서 xlsx/file-saver 사라짐.

- [x] **#3.1 전송 레지스트리 신규** ✅ 2026-06-16 · `src/listgrid/transfer/registry.ts` · configureDataTransfer/getDataTransfer + DataTransferComponents(ComponentType<any>, UIComponents 패턴) · type-check green
- [ ] **#3.2 DataTransferModal 주입화 + barrel 정리** — static import 제거
  - **Changed files**: `src/listgrid/components/list/ui/DataTransferModal.tsx`, `src/listgrid/index.ts`
  - **What**: DataExporter/DataImporter static import → `getDataTransfer()` 사용, 미등록 시 graceful(모달 미렌더/안내). barrel에서 xlsx/file-saver 경유 transfer export 제거(DataExporter/DataImporter/DataExportProcessor/DynamicDataImporter/DataImportProcessor/DataImportResultView/DataImportDescription/DataImportSample, `export * DataExportService`, `export * Provider/ExcelProvider`). 주입 API(`configureDataTransfer`/타입)와 peer-free `transfer/Type`은 barrel 유지.
  - **Verification**: `npm run build` green; gate-trace에 xlsx/file-saver 추가 → barrel 도달 0
- [ ] **#3.3 /excel 엔트리 + export** — `registerExcelDataTransfer`
  - **Changed files**: 신규 `src/excel.ts`, `package.json`(exports `./excel`)
  - **What**: DataExporter/DataImporter/DataExportService/ExcelProvider re-export + `registerExcelDataTransfer()` = `configureDataTransfer({Exporter:DataExporter,Importer:DataImporter})`.
  - **Reuse review**: 단순 re-export+register 헬퍼 — P2 엔트리 패턴 모방.
  - **Verification**: `npm run build` green; `ls dist/excel.js`; gate-trace 최종 PASS(모든 leaf+heavy peer 도달 0)
  - [Plan detail](./fix-plan.md#step-3--전송excel-을-주입injection-으로-격리)

## Phase 3 — Excel 전송 주입 격리
(진입 시 확장) Step 3: transfer 레지스트리(`configureDataTransfer`/`getDataTransfer`) 도입(기존 DI 패턴 모델), DataTransferModal에서 DataExporter/DataImporter static import 제거→레지스트리 사용(미등록 시 graceful), barrel에서 xlsx/file-saver 경유 transfer export 제거(주입 API는 export), src/excel.ts(+`registerExcelDataTransfer`) + `/excel` export. [Plan detail](./fix-plan.md#step-3--전송excel-을-주입injection-으로-격리)

## Phase 4 — 빌드/문서/최종 검증
(진입 시 확장) Step 5: README peer 매트릭스+subpath 예시+전송 등록 예시, CHANGELOG + version 0.4.0, 최종 `npm run build && npm test` + acceptance grep 게이트(#5). [Plan detail](./fix-plan.md#step-5--빌드문서)

## Open Questions
(없음 — 전략/qrcode 결정 완료)

## Progress notes
- 2026-06-16: 4 phase로 분해 — package.json 계약(P1) → leaf subpath(P2) → 전송 주입(P3) → 문서/검증(P4). 각 phase 독립 빌드 검증 가능하도록 배치.

## Completion Summary
(종결 시 작성)
