# PROGRESS — 이슈 #7 barrel이 optional:true peer를 static import → consumer 빌드 실패

**작성**: 2026-06-16
**상태**: in_progress
**Source Plan**: [fix-plan.md](./fix-plan.md)
**GitHub 이슈**: #7
**Push**: manual
**다음 세션 정책**: Continue current session — 단일 라이브러리, phase 간 결합 강함
<!-- polling: idle -->
**Last updated**: 2026-06-16 08:20 (PROGRESS 생성, 브랜치 fix/issue-7-optional-peer-barrel, MCP 등록 8a19c6f23fb6)

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
| 1: peer 재분류 & qrcode 고정 (package.json 계약) | [~] In progress | — | 본 문서 §Phase 1 |
| 2: leaf optional subpath 추출 | [ ] | QrField/address/api-spec/xref-price를 barrel에서 분리 | §Phase 2 |
| 3: Excel 전송 주입 격리 | [ ] | configureDataTransfer 도입, DataTransferModal 리팩터 | §Phase 3 |
| 4: 빌드/문서/최종 검증 | [ ] | README·CHANGELOG·0.4.0 + acceptance grep 게이트 | §Phase 4 |

## Phase 1 — peer 재분류 & qrcode 고정 (package.json 계약)

목표: peer 계약을 정직하게 재선언. 이 단계만으로는 barrel에 leaf/전송 export가 남아 있어도 build green (계약만 변경).

- [ ] **#1 peer 3분류 재선언** — `package.json` peerDependencies/Meta + sideEffects
  - **Changed files**: `package.json`
  - **What**: `@iconify/react`·`react-select`·`react-sortablejs` → `optional:false`; `sortablejs:^1.15.0` 필수 peer 신규 추가; `qrcode.react` range를 `^3.0.0`로 축소(v4 차단); `qrcode.react`·`react-kakao-maps-sdk`·`react-daum-postcode`·`xlsx-js-style`·`file-saver`·`sweetalert2`·`sweetalert2-react-content`·`next`·`nuqs`는 `optional:true` 유지; `"sideEffects": ["**/*.css","*.css"]` 추가
  - **Verification**: `npm run type-check && npm run build` green; `node -e "const p=require('./package.json'); console.log(p.peerDependencies['qrcode.react'], p.peerDependencies.sortablejs, p.peerDependenciesMeta['react-select'].optional, p.sideEffects)"` 기대값 확인
  - [Plan detail](./fix-plan.md#step-1--peer-3분류-재선언-packagejson)

## Phase 2 — leaf optional subpath 추출
(진입 시 확장) Step 2: QrField→`/qr`, address(AddressFieldView/AddressMapField/KakaoMap/PostCodeSelector)→`/address`, ViewApiSpecification/ApiSpecificationButton→`/api-spec`, XrefPriceMappingField/View→`/xref-price`. barrel에서 제거 + 신규 엔트리 src/{qr,address,api-spec,xref-price}.ts + package.json exports. 다른 Xref 필드는 barrel 유지. [Plan detail](./fix-plan.md#step-2--leaf-optional-을-main-barrel-에서-제거--subpath-신설)

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
