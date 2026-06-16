# Phase 3 — Task Detail Log

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)

## #3.1 전송 레지스트리 신규 ✅ 2026-06-16
**commit**: `a6239bc`
**Changed files**: `src/listgrid/transfer/registry.ts` (new)
**What**: `configureDataTransfer(components)` / `getDataTransfer()` 모듈-스코프 레지스트리 + `DataTransferComponents { Exporter: ComponentType<any>; Importer: ComponentType<any> }`. 기존 DI(`configureApiClient`/`UIProvider`의 `ComponentType<any>`) 패턴 모방 — peer-free.
**Verification**: `npm run type-check` green.

## #3.2 DataTransferModal 주입화 + barrel 정리 ✅ 2026-06-16
**commit**: `025c423`
**Changed files**:
- `src/listgrid/components/list/ui/DataTransferModal.tsx` — `DataExporter`/`DataImporter` static import 제거 → `getDataTransfer()` 조회. 미등록 시 `return null`(graceful).
- `src/listgrid/index.ts` — barrel서 carrier export 제거: DataExporter, DataImporter, DataExportProcessor, DataImportSample, `default as DynamicDataImporter`, `export * DynamicDataImporter`, `export * Provider/ExcelProvider`. `configureDataTransfer`/`getDataTransfer`/`DataTransferComponents` 추가.
- `documents/issues/7/.gate-trace.cjs` — 동적 `import()` edge 추적 + xlsx/file-saver도 실패 대상으로 확장.
**What**: 코어 리스트 헤더 내장 전송 모달의 정적 carrier 의존을 주입 seam으로 대체. peer-free 컴포넌트(DataImportResultView/DataImportDescription/DataImportProcessor, DataExportService, ExcelPasswordField, Type)는 barrel 유지로 breaking 최소화.
**Verification**: build green; `.gate-trace.cjs` → 263 모듈, qr/kakao/daum/sweetalert/xlsx/file-saver 도달 **0** (동적 import 포함).
**Invariant**: `transfer/Type`은 EntityFormBase/EntityFormTypes/EntityFormActions/useListGridLogic/ListGridHeader.types/DataTransferModal이 쓰는 core-coupled peer-free 타입 → 반드시 barrel 유지. DataTransferModal은 `getDataTransfer()`만 의존(carrier 직접 import 금지).

## #3.3 /excel 엔트리 + export ✅ 2026-06-16
**commit**: (this)
**Changed files**: `src/excel.ts` (new), `package.json` (exports `./excel`)
**What**: DataExporter/DataImporter/DataExportProcessor/DataImportSample/DynamicDataImporter/ExcelProvider re-export + `registerExcelDataTransfer()` = `configureDataTransfer({Exporter:DataExporter,Importer:DataImporter})`. host 1줄 등록으로 전송 활성화(xlsx/file-saver 설치 전제).
**Verification**: build green; `dist/excel.{js,d.ts}` 생성; barrel gate 여전히 PASS(263); excel.js가 ExcelProvider/DataImporter 참조(정상); 전체 `npm test` 923 passed; lint 0 error; format clean.
