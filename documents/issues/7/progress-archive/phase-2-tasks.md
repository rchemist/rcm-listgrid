# Phase 2 — Task Detail Log

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)

## #2 leaf subpath 추출 ✅ 2026-06-16

**Changed files**:
- `src/qr.ts` (new) — `QrField` re-export (qrcode.react)
- `src/address.ts` (new) — AddressFieldView/AddressMapField/PostCodeSelector/KakaoMap + `ApplyFullAddressFields`(+`export *`) (react-kakao-maps-sdk, react-daum-postcode)
- `src/api-spec.ts` (new) — ViewApiSpecification/ApiSpecificationButton + `components/api/Type` (sweetalert2, sweetalert2-react-content)
- `src/xref-price.ts` (new) — XrefPriceMappingField + `XrefPriceMappingView as XrefPiceMappingView` (sweetalert2)
- `src/listgrid/index.ts` — removed 8 export lines (replaced with pointer comments): XrefPriceMappingField(239), QrField(247), ApplyFullAddressFields alias(254), Address block(261-264), XrefPiceMappingView(280), ApiSpecificationButton/ViewApiSpecification(312-313), ApplyFullAddressFields wildcard(393)
- `package.json` — `exports` += `./qr`,`./address`,`./api-spec`,`./xref-price`
- `documents/issues/7/.gate-trace.cjs` (new) — transitive barrel→peer reachability gate (reused in P3/P4)

**Verification**: `npm run build` green; `.gate-trace.cjs` → 255 modules scanned, qr/kakao/daum/sweetalert **unreachable** from main barrel; only xlsx/file-saver remain (3 edges: ExcelProvider×2, DataImporter×1) → Phase 3.

**Invariant / Decision**:
- **ApplyFullAddressFields coupling** (not in original fix-plan): `ApplyFullAddressFields` statically does `new AddressMapField(...)` → transitively pulls kakao/daum. It is **only barrel-referenced** (no core consumer), so it was moved to `/address` too. If it ever returns to the main barrel, the address peers come back into the core graph — keep it in `/address`.
- Only `XrefPiceMappingView` among Xref views uses sweetalert2; the other Xref fields/views are peer-free and stay in the main barrel.
- `components/api/Type` is peer-free → stays in main barrel AND re-exported from `/api-spec` for self-containedness.
- Subpath entries are top-level `src/*.ts` → tsc (rootDir=src) emits `dist/*.js` + `.d.ts`. Confirmed all 4 emitted.
- `QrField` is a true leaf (no transitive importer besides barrel).
