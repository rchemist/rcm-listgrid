# PROGRESS — 이슈 #7 barrel이 optional:true peer를 static import → consumer 빌드 실패

**작성**: 2026-06-16
**상태**: in_progress
**Source Plan**: [fix-plan.md](./fix-plan.md)
**GitHub 이슈**: #7
**Push**: manual
**다음 세션 정책**: Continue current session — 단일 라이브러리, phase 간 결합 강함
<!-- polling: idle -->
**Last updated**: 2026-06-16 08:25 (#1 peer 3분류 재선언 완료 — type-check+build green)

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
| 2: leaf optional subpath 추출 | [~] In progress | QrField/address/api-spec/xref-price를 barrel에서 분리 | §Phase 2 |
| 3: Excel 전송 주입 격리 | [ ] | configureDataTransfer 도입, DataTransferModal 리팩터 | §Phase 3 |
| 4: 빌드/문서/최종 검증 | [ ] | README·CHANGELOG·0.4.0 + acceptance grep 게이트 | §Phase 4 |

## Phase 1 — peer 재분류 & qrcode 고정 (package.json 계약) ✅

- [x] **#1 peer 3분류 재선언** ✅ 2026-06-16 · `package.json` · @iconify/react·react-select·react-sortablejs→optional:false, sortablejs^1.15.0 추가, qrcode.react→^3.0.0, sideEffects 추가 · type-check+build green

**Handoff(P2)**: barrel은 아직 leaf/전송 export를 전부 보유 → build green 상태. P2는 leaf를 barrel에서 빼고 subpath로 옮긴다. exports map에 추가할 dist 경로는 tsc가 src/*.ts를 dist/*.js로 평면 출력함(현 dist/index.js 구조 참고).

## Phase 2 — leaf optional subpath 추출 (진행 중)

목표: host가 인스턴스화하는 leaf 컴포넌트(QR/주소/api-spec/xref-price)를 main barrel에서 제거하고 subpath opt-in으로 격리. 완료 시 barrel 그래프에서 qrcode.react/kakao/daum/sweetalert 사라짐.

- [ ] **#2 leaf subpath 추출** — barrel 제거 + 신규 엔트리 + exports
  - **Changed files**: `src/listgrid/index.ts`, 신규 `src/qr.ts`·`src/address.ts`·`src/api-spec.ts`·`src/xref-price.ts`, `package.json`(exports)
  - **What**: (a) barrel에서 제거: QrField / AddressFieldView·AddressMapField·KakaoMap·PostCodeSelector / ViewApiSpecification·ApiSpecificationButton + `components/api/Type` re-export 위치 검토 / XrefPriceMappingField·`XrefPriceMappingView as XrefPiceMappingView`. (b) 신규 엔트리 4개. (c) exports에 `./qr`·`./address`·`./api-spec`·`./xref-price` 추가. 다른 Xref 필드(Mapping/Prefer/AvailableDate)는 barrel 유지.
  - **Reuse review**: New 엔트리는 단순 re-export barrel — 기존 `/form/SearchForm`·`/api`·`/misc` subpath 엔트리 패턴 그대로 모방(별도 추상화 불필요).
  - **Verification**: `npm run build` green; `grep -REn "qrcode.react|react-kakao-maps-sdk|react-daum-postcode" dist/index.js dist/listgrid/index.js` = 0건; `ls dist/qr.js dist/address.js dist/api-spec.js dist/xref-price.js`; sweetalert2는 P3에서 ViewApiSpecification/xref가 빠지면 barrel서 0건 되는지 확인(전송 ViewApiSpec는 barrel서 제거됨)
  - [Plan detail](./fix-plan.md#step-2--leaf-optional-을-main-barrel-에서-제거--subpath-신설)

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
