# Issue #7: barrel(index.js)이 optional:true peer를 static import → consumer 빌드 강제 실패

## GitHub Issue Information

- **ID**: 7
- **Title**: barrel(index.js)이 optional:true peer를 static import → consumer 빌드 강제 실패
- **Created**: 2026-06-16T06:57:39Z
- **Labels**: (none)
- **Status**: CLOSED (구현 완료 — v0.3.21 릴리스 반영)
- **Assignee**: @greatkunner (self-assigned)
- **확정 전략**: 하이브리드 + qrcode.react v3 peer 고정 (사용자 확정, 2026-06-16)

## Issue Content (요약)

`@rchemist/listgrid` 를 쓰는 Next.js consumer(edustack 5 SPA)에서 `npm ci` 후 `next build` 시 다음이 연쇄로 발생:

```
Module not found: Can't resolve 'date-fns/locale'
Module not found: Can't resolve 'sweetalert2'
Module not found: Can't resolve 'qrcode.react'
Module not found: Can't resolve 'react-kakao-maps-sdk'
Module not found: Can't resolve 'react-daum-postcode'
Module not found: Can't resolve 'react-select'
Module not found: Can't resolve 'sortablejs'
```

`peerDependenciesMeta` 에서 `optional: true` 로 선언된 peer 들을 barrel 이 **static import** 하므로, consumer 가 미설치 시 webpack 이 resolve 하지 못해 빌드가 강제 실패. optional 의 의미(미설치 허용)와 모순.

추가로 `qrcode.react` peer range 가 `^3 || ^4` 인데 코드는 default export(`import QRCode from 'qrcode.react'`)를 사용 → v4(named export `QRCodeSVG`/`QRCodeCanvas`) 설치 시 깨짐. 실질 v3 만 호환.

---

## Problem Analysis

- **Symptoms**: consumer(`transpilePackages: ['@rchemist/listgrid']`) 의 `next build` 가 미설치 optional peer 들에 대해 `Module not found` 로 강제 실패.
- **Scope of Impact**: `@rchemist/listgrid` 를 import 하는 **모든** consumer. main barrel(`@rchemist/listgrid`)에서 무엇 하나라도 import 하면 barrel 전체 static import 그래프가 resolve 대상이 됨.
- **Severity**: **HIGH** — 라이브러리를 정상 설치한 consumer 가 빌드 자체를 못 함. optional 선언이 사실상 거짓.

## Root Cause (검증 완료)

공개 진입점은 **단일 barrel**: `src/index.ts` → `export * from './listgrid'` → `src/listgrid/index.ts`. consumer 가 barrel 에서 1개라도 import 하면 번들러는 barrel 의 모든 `export ... from` 그래프를 **resolve** 해야 한다. 그 그래프 안에 optional peer 를 static import 하는 모듈이 박혀 있어, 미설치 peer 에서 즉시 `Module not found`.

- tree-shaking 은 "resolve → 부작용 판정 → drop" 순서라, resolve 단계에서 이미 실패 → tree-shaking 무력.
- `package.json` 에 `sideEffects` 필드도 없어 번들러가 보수적으로 전부 유지.
- `React.lazy`/`next/dynamic` 동적 import(`utils/lazy.ts` 의 `dynamic`) 도 webpack 이 **빌드 타임에 동일하게 resolve** 하므로 lazy 만으로는 "미설치 허용"이 되지 않음 → 동적 import 는 해결책이 아님.

### optional peer 별 실제 정적 import 위치 & barrel/core 도달 경로

| peer (현재 optional:true) | static import 위치 | barrel/core 도달 경로 | 격리 가능성 |
|---|---|---|---|
| `react-select` | `components/fields/view/SelectBoxManyToOneView.tsx` | **`ManyToOneField`(코어 필드)** → barrel | ❌ 코어 (필수화) |
| `react-sortablejs` (+`sortablejs`) | `components/list/RowItem.tsx` | **`ViewListGrid`(메인 리스트)** → barrel | ❌ 코어 (필수화) |
| `@iconify/react` | `FieldRenderer.tsx`, `list/ui/CardFieldSection.tsx`, `list/ui/ViewRows.tsx` | **코어 렌더러** → barrel | ❌ 코어 (필수화) |
| `date-fns` (+`/locale`) | `misc/index.ts` | barrel (코어 유틸 `fDate` 등) | ❌ 코어 (이미 필수, 유지) |
| `xlsx-js-style` + `file-saver` | `transfer/DataImporter.tsx`, `transfer/Provider/ExcelProvider.ts` | **`ViewListGrid` → `ListGridHeader` → `DataTransferModals` → `DataExporter`/`DataImporter`** | ⚠️ 코어 내장 → **주입(injection)으로 격리** |
| `qrcode.react` | `components/fields/QrField.tsx` | barrel export (leaf, host 인스턴스화) | ✅ subpath |
| `react-kakao-maps-sdk` | `components/fields/address/KakaoMap.tsx` | `AddressFieldView`/`AddressMapField` → barrel (leaf) | ✅ subpath |
| `react-daum-postcode` | `components/fields/address/PostCodeSelector.tsx` | `AddressFieldView` → barrel (leaf) | ✅ subpath |
| `sweetalert2` (+`-react-content`) | `components/api/ViewApiSpecification.tsx`, `components/fields/view/XrefPiceMappingView.tsx` | barrel export(`ViewApiSpecification`/`ApiSpecificationButton`) + `XrefPriceMappingField` (leaf) | ✅ subpath |

**핵심 통찰 1**: `react-select`·`react-sortablejs`·`@iconify/react` 는 코어 컴포넌트(`ManyToOneField`/`ViewListGrid`/`FieldRenderer`)가 직접 사용 → 단순 subpath 분리 불가 → **필수 peer 로 재분류(optional:false)** 가 정직한 해법.

**핵심 통찰 2 (이슈 미언급)**: `xlsx`/`file-saver` 는 리스트 헤더에 **내장된** 데이터 전송 모달(`DataTransferModals`)이 `DataExporter`/`DataImporter` 를 static import 하므로 코어 그래프에 포함됨. host 가 인스턴스화하는 leaf 가 아니므로 subpath 만으로 못 뺀다 → **DI/주입 패턴(`configureDataTransfer`)** 으로 격리해야 함. (코드에 이미 존재하는 미사용 `LazyDataImporter`/`utils/lazy` 는 빌드 resolve 를 못 피하므로 단독 해법 아님.)

**핵심 통찰 3 (부수 문제 검증)**: `QrField` 는 `import QRCode from 'qrcode.react'`(default). v4 는 default 제거 → range `^3 || ^4` 거짓. v3 로 고정.

---

## Code Analysis

### Frontend (이 저장소 자체가 라이브러리)

- **Barrel**: `src/index.ts`, `src/listgrid/index.ts` (모든 공개 export 의 단일 통로)
- **코어-도달 optional (필수화 대상)**:
  - `src/listgrid/components/fields/ManyToOneField.tsx` → `view/SelectBoxManyToOneView.tsx`(`react-select`)
  - `src/listgrid/components/list/ViewListGrid.tsx` → `RowItem.tsx`(`react-sortablejs`)
  - `src/listgrid/components/form/FieldRenderer.tsx` / `list/ui/CardFieldSection.tsx` / `list/ui/ViewRows.tsx`(`@iconify/react`)
  - `src/listgrid/misc/index.ts`(`date-fns`, `date-fns/locale`)
- **코어-내장 전송(주입화 대상)**:
  - `src/listgrid/components/list/ListGridHeader.tsx` → `list/ui/DataTransferModal.tsx` → `transfer/DataExporter.tsx` / `transfer/DataImporter.tsx`
  - `src/listgrid/transfer/Provider/ExcelProvider.ts`(`file-saver`, `xlsx-js-style`), `transfer/DataImporter.tsx`(`xlsx-js-style`)
  - 기존 보조물: `src/listgrid/transfer/DynamicDataImporter.tsx`, `src/listgrid/utils/lazy.ts`
- **leaf optional(subpath 대상)**:
  - `src/listgrid/components/fields/QrField.tsx`(`qrcode.react`)
  - `src/listgrid/components/fields/address/{AddressFieldView,AddressMapField,KakaoMap,PostCodeSelector}.tsx`(`react-kakao-maps-sdk`,`react-daum-postcode`)
  - `src/listgrid/components/api/{ViewApiSpecification,ApiSpecificationButton}.tsx`(`sweetalert2`)
  - `src/listgrid/components/fields/XrefPriceMappingField.tsx` + `view/XrefPiceMappingView.tsx`(`sweetalert2`)
- **메타**: `package.json`(`exports`/`peerDependencies`/`peerDependenciesMeta`/`sideEffects`), `tsconfig.build.json`

---

## Feature Surface Map

| Layer | What changes | How verified | Shared/Hot? |
|-------|--------------|--------------|-------------|
| `package.json` peer 재분류 | `@iconify/react`·`react-select`·`react-sortablejs` → optional:false, `sortablejs` 필수 추가, `qrcode.react`→`^3.0.0` | `npm pack` 후 메타 검증 + consumer 빌드 | **YES — 계약 변경** |
| `package.json` exports | `./qr`,`./address`,`./excel`,`./api-spec`(±`./xref-price`) subpath 추가, `sideEffects` 명시 | `npm run build` 산출 + import 해소 | **YES — 공개 API** |
| main barrel `src/listgrid/index.ts` | leaf optional / 전송 export 제거 | 빌드 후 `dist/index.js` 에 해당 peer 문자열 부재 확인 | **YES — hot, 모든 consumer** |
| 신규 subpath 엔트리 | `src/qr.ts`,`src/address.ts`,`src/api-spec.ts`(±`src/xref-price.ts`) | `dist/*.js` 생성 + 개별 import 빌드 | no |
| 전송 주입점 | `src/listgrid/transfer/` 에 `configureDataTransfer`/레지스트리, `ListGridHeader`→레지스트리 렌더 | 미등록 시 export/import UI 숨김, 등록 시 동작 | **YES — 코어 리스트 hot-path** |
| `@rchemist/listgrid/excel` 엔트리 | `DataExporter`/`DataImporter` + `registerDataTransfer()` re-export | host 등록 후 export/import 동작 | no |
| ManyToOneField / ViewListGrid / FieldRenderer | 코드 변경 없음(필수 peer 유지) | 회귀: 리스트 drag·M:1 select·아이콘 렌더 | **YES — 코어** |
| 문서/마이그레이션 | README·CHANGELOG·MIGRATION 작성, 버전 0.3.21 | 리뷰 | no |
| consumer(edustack 5) | 필수 peer 설치 + 사용하는 subpath peer 설치 + 전송 등록 | **실제 `next build` green** | **YES — 정의상 DoD** |

---

## Concrete Fix Plan

> **설계 노트 — explicit over inference**: peer 를 "코어 도달이면 필수 / leaf 면 subpath / 코어 내장이면 주입"으로 **명시적 3분류**한다. "barrel 에 두되 번들러가 알아서 떼주겠지(tree-shaking 추론)"에 의존하지 않는다 — resolve 단계에서 깨지므로 추론은 신뢰 불가. 각 peer 의 분류를 `peerDependenciesMeta` 와 `exports` 에 **선언으로 고정**한다.

### Step 1 — peer 3분류 재선언 (`package.json`)

#### Current
```jsonc
"peerDependencies": {
  "@iconify/react": "^4.0.0 || ^5.0.0",
  "qrcode.react": "^3.0.0 || ^4.0.0",
  "react-select": "^5.0.0",
  "react-sortablejs": "^6.0.0 || ^7.0.0",
  // ... sortablejs 없음
},
"peerDependenciesMeta": {
  "@iconify/react": { "optional": true },
  "react-select": { "optional": true },
  "react-sortablejs": { "optional": true },
  "qrcode.react": { "optional": true },
  // ...
}
// sideEffects 필드 없음
```

#### After
```jsonc
"peerDependencies": {
  "@iconify/react": "^4.0.0 || ^5.0.0",
  "qrcode.react": "^3.0.0",            // v3 고정 (default export 호환)
  "react-select": "^5.0.0",
  "react-sortablejs": "^6.0.0 || ^7.0.0",
  "sortablejs": "^1.15.0",             // 신규: react-sortablejs 의 peer, 코어 필수
  // ... 나머지 동일
},
"peerDependenciesMeta": {
  // 코어 도달 → 필수(항목 제거 또는 optional:false)
  "@iconify/react": { "optional": false },
  "react-select": { "optional": false },
  "react-sortablejs": { "optional": false },
  // sortablejs 는 meta 미기재 → 기본 필수
  // leaf/주입 → optional 유지
  "qrcode.react": { "optional": true },
  "react-kakao-maps-sdk": { "optional": true },
  "react-daum-postcode": { "optional": true },
  "xlsx-js-style": { "optional": true },
  "file-saver": { "optional": true },
  "sweetalert2": { "optional": true },
  "sweetalert2-react-content": { "optional": true },
  "next": { "optional": true },
  "nuqs": { "optional": true }
},
"sideEffects": ["**/*.css", "*.css"]   // tree-shaking 방어선
```

### Step 2 — leaf optional 을 main barrel 에서 제거 + subpath 신설

`src/listgrid/index.ts` 에서 아래 export 라인 **제거**:
- `QrField`
- `AddressFieldView`, `AddressMapField`, `KakaoMap`, `PostCodeSelector`
- `ViewApiSpecification`, `ApiSpecificationButton`
- `XrefPriceMappingField`, `XrefPriceMappingView as XrefPiceMappingView`, `view/XrefPiceMappingView` re-export

신규 엔트리 파일:
```ts
// src/qr.ts
export { QrField } from './listgrid/components/fields/QrField';

// src/address.ts
export { AddressFieldView } from './listgrid/components/fields/address/AddressFieldView';
export { AddressMapField } from './listgrid/components/fields/address/AddressMapField';
export { KakaoMap } from './listgrid/components/fields/address/KakaoMap';
export { PostCodeSelector } from './listgrid/components/fields/address/PostCodeSelector';

// src/api-spec.ts
export { ViewApiSpecification } from './listgrid/components/api/ViewApiSpecification';
export { ApiSpecificationButton } from './listgrid/components/api/ApiSpecificationButton';
export * from './listgrid/components/api/Type';

// src/xref-price.ts  (sweetalert2 사용 — 나머지 Xref 필드는 main barrel 유지)
export { XrefPriceMappingField } from './listgrid/components/fields/XrefPriceMappingField';
export { XrefPriceMappingView as XrefPiceMappingView } from './listgrid/components/fields/view/XrefPiceMappingView';
```

`package.json` `exports` 추가:
```jsonc
"./qr":        { "types": "./dist/qr.d.ts",        "default": "./dist/qr.js" },
"./address":   { "types": "./dist/address.d.ts",   "default": "./dist/address.js" },
"./api-spec":  { "types": "./dist/api-spec.d.ts",  "default": "./dist/api-spec.js" },
"./xref-price":{ "types": "./dist/xref-price.d.ts","default": "./dist/xref-price.js" },
"./excel":     { "types": "./dist/excel.d.ts",     "default": "./dist/excel.js" }
```

> 구현 시 결정: 다른 Xref 필드(`XrefMappingField`/`XrefPreferMappingField`/`XrefAvailableDateMappingField`)는 sweetalert2 미사용이므로 main barrel 유지. price 만 분리할지, 응집을 위해 전체 xref 를 `/xref` 로 옮길지 implementation 단계에서 확정(영향 최소화 우선 → price 만 분리 권장).

### Step 3 — 전송(Excel) 을 주입(injection) 으로 격리

기존 DI 패턴(`UIProvider`/`configureMessages`/`configureApiClient`/`registerMenuPermissionChecker`)과 동일하게:

1. `src/listgrid/transfer/` 에 레지스트리 추가:
   ```ts
   // configureDataTransfer({ Exporter, Importer }) 로 host 가 주입.
   // 미등록 시 getDataTransfer() === null.
   export function configureDataTransfer(impl: DataTransferComponents): void
   export function getDataTransfer(): DataTransferComponents | null
   ```
2. `list/ui/DataTransferModal.tsx`: `DataExporter`/`DataImporter` **static import 제거** → `getDataTransfer()` 로 주입된 컴포넌트 사용. 미등록이면 export/import 모달을 렌더하지 않거나 "전송 기능 미설정" 안내.
3. main barrel `src/listgrid/index.ts` 에서 xlsx/file-saver 를 끌어오는 전송 export 제거:
   - `DataExporter`, `DataImporter`, `DataExportProcessor`, `DynamicDataImporter`, `DataImporter`(transfer), `export * from './transfer/DataExportService'`, `export * from './transfer/Provider/ExcelProvider'`, `DataImportProcessor` 등 xlsx/file-saver 경유 항목.
   - peer-free 타입(`transfer/Type` 등)은 잔류 가능 여부 확인 후 유지/이전.
   - `configureDataTransfer`/`getDataTransfer` 와 전송 타입은 main barrel 에서 export(주입 API 는 peer-free).
4. `src/excel.ts` 엔트리:
   ```ts
   export { DataExporter } from './listgrid/transfer/DataExporter';
   export { DataImporter } from './listgrid/transfer/DataImporter';
   export { DataExportService } from './listgrid/transfer/DataExportService';
   export * from './listgrid/transfer/Provider/ExcelProvider';
   import { configureDataTransfer } from './listgrid/transfer';
   import { DataExporter } from './listgrid/transfer/DataExporter';
   import { DataImporter } from './listgrid/transfer/DataImporter';
   /** host 가 1줄로 전송 기능 활성화 */
   export function registerExcelDataTransfer(): void {
     configureDataTransfer({ Exporter: DataExporter, Importer: DataImporter });
   }
   ```
   host 사용: `import { registerExcelDataTransfer } from '@rchemist/listgrid/excel'; registerExcelDataTransfer();` (xlsx/file-saver 설치 전제).

### Step 4 — qrcode.react v3 고정

- `QrField.tsx` 코드 변경 없음(`import QRCode from 'qrcode.react'` 유지).
- Step 1 의 peer range `^3.0.0` 로 v4 차단. README 에 "QR 기능은 qrcode.react v3 필요" 명시.

### Step 5 — 빌드/문서

- `tsconfig.build.json`: `src/**` 전체 컴파일이면 신규 엔트리 자동 포함. include 범위 확인.
- `README.md`: peer 설치 매트릭스(필수 vs 기능별 opt-in), subpath import 예시, 전송 등록 예시.
- `CHANGELOG.md` + `documents/issues/7/`: breaking change(QR/주소/api-spec/xref-price/전송 import 경로 변경) 명시, **0.3.x patch 0.3.21** (프로젝트 컨벤션상 0.3.x 라인 유지).

---

## Acceptance Scenario (executable — definition of done)

깨끗한 Next.js 15 / React 19 consumer(`transpilePackages: ['@rchemist/listgrid']`, npm workspaces, `legacy-peer-deps=true`)에서:

1. `@rchemist/listgrid` + **필수 peer 만** 설치 (react, react-dom, @headlessui/react, @tabler/icons-react, @iconify/react, react-select, react-sortablejs, sortablejs, date-fns, next, nuqs). qrcode.react·sweetalert2·xlsx-js-style·file-saver·react-kakao-maps-sdk·react-daum-postcode **미설치**. → `import { ViewListGrid, ViewEntityForm } from '@rchemist/listgrid'` 사용 → **`next build` 성공 (Module not found 0건)**.
2. `import { QrField } from '@rchemist/listgrid/qr'` 추가, qrcode.react 미설치 → `next build` 가 `qrcode.react` 미해소로 실패(= opt-in 계약대로 기대된 실패). `qrcode.react@^3` 설치 → **빌드 성공**, QR 렌더.
3. `/address`(react-kakao-maps-sdk + react-daum-postcode), `/api-spec`(sweetalert2 + -react-content), `/xref-price`(sweetalert2) 각각 동일 패턴으로 "미설치→실패 / 설치→성공" 확인.
4. 전송: 미등록 상태에서 리스트 export/import 버튼이 숨김/안내 처리되고 **빌드 성공**(xlsx/file-saver 미설치). `@rchemist/listgrid/excel` 의 `registerExcelDataTransfer()` 호출 + xlsx-js-style·file-saver 설치 → **export/import 모달 동작**.
5. 라이브러리 측 산출 검증 (이 저장소): `npm run build` 후
   ```
   grep -REn "qrcode\.react|sweetalert2|xlsx-js-style|file-saver|react-kakao-maps-sdk|react-daum-postcode" dist/index.js dist/listgrid/index.js
   ```
   → **매치 0건** (main barrel 그래프에서 leaf/전송 optional peer 가 사라짐). 단, `dist/qr.js`·`dist/address.js`·`dist/api-spec.js`·`dist/excel.js` 에는 해당 import 존재.

## Environment & Temporal Preconditions

- **Test data needed**: 별도 DB 불필요(빌드/번들 차원 문제). consumer 재현용 최소 Next.js 앱 1개 + 위 peer 설치 매트릭스.
- **Temporal**: 날짜 의존 없음.
- **Needs restart/redeploy to take effect**: 라이브러리 재빌드(`npm run build`) → `npm publish`(0.3.21) → consumer `npm i @rchemist/listgrid@0.3.21` + peer 재설치 후 재빌드. 캐시(`.next`, node_modules) 정리 권장.
- **Target env / DB**: consumer = edustack 5 SPA(Next.js 15/React 19). DB 무관.

## Validation and Test Plan

1. **Compilation**: `npm run type-check && npm run build` (이 저장소).
2. **Unit/기존 테스트**: `npm test` (vitest) 회귀 확인 — 특히 misc(date-fns), 필드 렌더.
3. **산출 검증**: Acceptance #5 grep 가드.
4. **회귀(코어)**: 리스트 drag(react-sortablejs), M:1 select(react-select), 아이콘(@iconify/react) 정상.
5. **Acceptance Scenario #1~#4 를 실제 consumer 에서 green** (필수 성공 기준).

## Risk Factors and Mitigation

- **Risk**: breaking change — 기존 consumer 가 main barrel 에서 QR/주소/api-spec/xref-price/전송 컴포넌트를 import 중. **Mitigation**: 명시적 MIGRATION 문서 + 0.3.21(0.3.x 유지) + 명확한 import 매핑표. 가능하면 deprecation 안내.
- **Risk**: 전송 주입 전환으로 리스트 헤더의 export/import 버튼 동작 회귀. **Mitigation**: 미등록 시 graceful(숨김/안내), 등록 시 기존과 동일 props. DataTransferModal 회귀 테스트.
- **Risk**: `sideEffects` 오설정으로 CSS 누락. **Mitigation**: `**/*.css` 명시 + 빌드 후 `dist/styles.css` 및 import 확인.
- **Risk**: `sortablejs` peer 신규 추가로 기존 정상 consumer 가 미설치 경고. **Mitigation**: README 필수 peer 목록에 포함, react-sortablejs 사용자는 사실상 이미 보유.
- **Risk**: qrcode.react v4 사용 중인 consumer 가 v3 로 다운그레이드 필요. **Mitigation**: CHANGELOG 명시; 추후 v4 named export 지원은 별도 이슈로.

## Success Criteria

1. 필수 peer 만 설치한 consumer 가 main barrel import 로 `next build` **성공** (Acceptance #1).
2. 각 subpath(`/qr`,`/address`,`/api-spec`,`/xref-price`,`/excel`)가 해당 peer 설치 시에만 동작하고, 미설치 시 main barrel 빌드에 영향 없음 (Acceptance #2~#4).
3. `dist/index.js`/`dist/listgrid/index.js` 그래프에 leaf/전송 optional peer 문자열 부재 (Acceptance #5 grep 0건).
4. `npm run build` + `npm test` 통과, 코어 기능(drag/select/icon/전송 등록 후 export) 회귀 없음.
5. 위 Acceptance Scenario 가 실제 환경에서 green (필수).

---

## 구현 결과

### 구현 완료일
2026-06-16

### 진행 방식
PROGRESS 기반 (4 phase / 8 task / 8 commits, 브랜치 `fix/issue-7-optional-peer-barrel`) — [PROGRESS.md](./PROGRESS.md)

### 수정된 파일
| 파일 | 수정 내용 |
|------|----------|
| `package.json` | peer 3분류(@iconify/react·react-select·react-sortablejs→optional:false, sortablejs 필수 추가), qrcode.react→^3.0.0, sideEffects 추가, exports에 `./qr`·`./address`·`./api-spec`·`./xref-price`·`./excel` 추가, version 0.3.21 |
| `src/listgrid/index.ts` | leaf 컴포넌트(QR/주소/api-spec/xref-price) + 전송 carrier export 제거, `configureDataTransfer`/`getDataTransfer` export 추가 |
| `src/qr.ts`·`src/address.ts`·`src/api-spec.ts`·`src/xref-price.ts`·`src/excel.ts` | 신규 subpath opt-in 엔트리 (+`/excel`에 `registerExcelDataTransfer()`) |
| `src/listgrid/transfer/registry.ts` | 신규 전송 주입 seam(`configureDataTransfer`/`getDataTransfer`/`DataTransferComponents`) |
| `src/listgrid/components/list/ui/DataTransferModal.tsx` | DataExporter/DataImporter static import → `getDataTransfer()` 주입(미등록 시 graceful no-render) |
| `CHANGELOG.md` | [0.3.21] BREAKING + import 매핑표 + Migration |
| `README.md` | peer 섹션을 필수 vs opt-in subpath 표 + 전송 등록 예시로 갱신 |

### 검증 결과
- [x] 성공 기준 3 — main barrel 그래프(263 모듈, 동적 import 포함)에서 leaf/전송 optional peer 도달 **0** (`documents/issues/7/.gate-trace.cjs`)
- [x] 성공 기준 2 — `/qr`·`/address`·`/api-spec`·`/xref-price`·`/excel` 엔트리 산출(`dist/*.js`+`.d.ts`), 모든 exports 타깃 존재, barrel 영향 없음
- [x] 성공 기준 4 — `npm test` 923 passed, 코어 회귀 없음
- [x] type-check / lint(0 errors) / format:check / build / test:coverage(임계 충족) 전부 green + ci.yml build-output 파일 확인
- [ ] 성공 기준 1·5 — **실제 consumer(edustack 5) `next build` green**: npm publish(v0.3.21) 후 consumer 업그레이드 시 확인 필요 (라이브러리 측은 module-graph 게이트로 동등 검증 완료)

---
**구현 완료**: 2026-06-16 (배포 전 — main 병합 + `v0.3.21` 태그 push 대기)
