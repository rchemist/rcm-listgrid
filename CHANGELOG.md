# Changelog

이 파일은 `@rchemist/listgrid` 의 공개된 변경 이력을 기록합니다.

## [0.5.4] - 2026-08-05

### Added

- `ViewListGrid`에 호스트가 컬럼 표시 설정을 저장할 수 있는 controlled
  `hiddenColumns`/`onHiddenColumnsChange` props를 추가했다.
- 페이지네이션 이전/다음 문구를 `configureLabels`의 `paginationPrev`/`paginationNext`로
  재정의할 수 있고, 기본 `Pagination`에도 `prevLabel`/`nextLabel` props를 추가했다.

## [0.5.3] - 2026-08-05

### Added

- React 내장 UI 문구를 앱 부트스트랩에서 재정의하는 `configureLabels` 카탈로그를 추가했다.
- `FieldListConfig.format` 문자열 포맷터, 필터 선언 컬럼의 헤더 필터, opt-in
  `ViewListGrid.columnSettings` 로컬 컬럼 표시 설정을 추가했다.

## [0.5.2] - 2026-08-03

### Fixed

- update 성공 뒤 현재 필드 값을 새 fetched 기준선으로 커밋해, 같은 폼의 다음 저장에서 이미
  저장된 필드가 `modifiedFields`에 다시 포함되어 stale 값을 재적용하던 문제를 고쳤다.

## [0.5.1] - 2026-08-03

### Fixed

- EntityForm update payload 최상단의 `modifiedFields` 배열을 복원했다. 각 필드의 current와
  fetched를 비교해 실제로 바뀐 선언 필드명만 담으므로, `ManyToOneField`의 `site` 값이
  `siteId`로 평탄화돼도 `site`로 등재된다. 소비 백엔드는 다시 명시적으로 비운 값과 건드리지
  않은 값을 구분할 수 있으며, create payload는 변경되지 않는다.
- 변경 필드 비교 중 한쪽만 null/undefined이고 다른 쪽이 객체일 때 null을 WeakMap/WeakSet 키로
  사용해 `TypeError`가 발생하던 문제를 고쳐 관계를 비우는 update가 정상 저장되도록 했다.

## [0.5.0] - 2026-08-03

### Added

- `SubCollectionField`에 opt-in `persistence: 'child-resource'` 모드를 추가했다. 기본값
  `'embedded'`는 기존처럼 부모 payload에 배열을 포함하며 동작이 바뀌지 않는다.
- child-resource 모드는 `mappedBy` 관계 필터로 자식 목록을 초기화하고, 기존 부모 화면의
  자식 추가·수정·삭제를 `BackendAdapter`의 child endpoint CRUD로 영속화한다.
- 부모 id가 없는 create 화면에서는 자식 행을 클라이언트에 버퍼링하고 부모 저장 성공 뒤
  flush한다. 일부 자식 저장이 실패하면 성공한 부모 id와 실패 건수를 persistent 오류로
  표시하고 실패 행만 재시도 버퍼에 유지한다.

### Changed

- child-resource 모드의 sub-collection 배열은 부모 create/update payload에서 제외된다.

## [0.4.3] - 2026-07-30

### Fixed

- `FieldEvalContext.entityId`를 필드 검증·비동기 검증·저장 직렬화와
  create/update/delete capability 조건식에도 일관되게 전달한다.
- `MessageViewField` 함수형 메시지에도 사용자 필드와 분리된 EntityForm 식별자를 전달한다.
- 모든 경로에서 ID 필드를 선언하지 않고도 EntityForm 식별자를 사용할 수 있음을 회귀 테스트로
  고정한다.

## [0.4.2] - 2026-07-30

### Fixed

- 폼 액션·액션 조건식·커스텀 필드 렌더러가 `EntityForm.withId(...)`로 선언한
  레코드 식별자를 `entityId` 컨텍스트로 직접 받도록 했다.
- 레코드 식별자를 읽기 위해 사용자 폼에 가짜 `StringField("id")`를 선언해야 했던
  0.4 계약 결함을 제거했다. `entityId`는 필드 값과 명확히 분리된다.

## [0.4.1] - 2026-07-30

### Fixed

- 0.4 마이그레이션 계약에서 무변경으로 명시한 0.3.x 필드 빌더
  (`withAddOnly`, `withModifyOnly`, `withViewHidden`, `withListOnly`,
  숫자 필드 `withMin`/`withMax`/`withLimit`, textarea `withLimit`)를 복원했다.
- 공식 코드모드의 `useListFields(...)` 출력이 실제 0.4 API로 동작하도록, 전달한 필드만
  목록 열로 명시 선택하는 `EntityForm.withList(...fieldNames)` 호환 표면을 추가했다.
- 호환 빌더와 폼 단위 목록 선언, 코드모드 fixture 회귀 테스트를 추가했다.

## [0.4.0] - 2026-07-30

**0.4 재기초의 첫 stable 릴리스.** `0.4.0-alpha.0` 이후 EntityForm 공개 계약·상태 엔진·
호스트 UI 주입·RCM backend adapter·Excel/data-transfer 표면을 실소비자 시나리오로 완결하고
`latest` 승격 게이트를 통과했다.

### Breaking

- root import는 React 공개 표면이며, 선언/필드는 `/schema`, store/controller는 `/state`,
  기본 프리미티브는 `/ui-default`, RCM 전송은 `/backend-rcm`에서 가져온다.
- `ListGrid` 클래스는 `createListStore`, 폼 저장 런타임은 `createFormController`로 교체됐다.
- `ViewEntityFormWrapper`/`ViewListGridWrapper`는 제거됐다. 페이지 chrome은 호스트가 소유하고
  `ViewEntityForm`/`ViewListGrid`를 조립한다.
- 제거 subpath 9종과 빌더/라이프사이클 before→after 전체표는
  [`docs/MIGRATION.md`](docs/MIGRATION.md)를 따른다.

### Added

- zustand 기반 폼 store 직접 갱신과 `structureVersion` 기반 구조 파생으로 값 커밋과 구조 변경을
  분리했다.
- egov-cms #70의 blur→즉시 저장, 연속 blur, 액션 순서, 포커스/DOM identity, 검증 실패 입력 보존
  회귀 테스트를 stable 게이트에 추가했다.

### Verification

- `npm run type-check`, `npm test`(195 files, 2,533 pass, 1 todo), `npm run build`.
- production `packages/*` TODO/미구현 0건, 제거 subpath 실소비 감사 완료.

## [0.4.0-alpha.0] - 2026-07-13

**0.4 재기초(re-foundation) 첫 프리릴리스** — dist-tag `next` (opt-in). `npm i @rchemist/listgrid@next`.
0.3.x 유지보수 라인(`latest`)에는 영향 없음. API는 GA 전까지 변동 가능(alpha).

0.3.x의 검증된 로직을 특성화 테스트 오라클 아래 **이식**하여 4계층 모노레포로 신축한 재기초 릴리스.
공개 표면(EntityForm 공개 API)은 first-principles 재설계했으나 엔진 동작은 이식(재작성 아님).
헌장 C1~C9 보존은 GA 게이트에서 실 소비자(edustack) 데이터로 대조 검증됨.

### 주요 변경 (0.3.x → 0.4)

- **헤드리스 코어**: `@rchemist/listgrid/schema` · `/state` 서브패스가 **React 런타임 의존 0** — 프리미티브/라우터/HTTP/세션/메시지는 전부 호스트 주입(charter C7).
- **서브패스 패키징**: 코어 배럴 + `./schema` · `./state` · `./excel`(엑셀 왕복) · `./utils` · `./next` opt-in 서브패스. peer 26→코어 필수 6 + leaf subpath opt-in(#7 3분류 선례).
- **EntityForm 공개 API 재설계**: 체이너블 `withXxx` 선언 → 리스트+폼 동시 파생 · 명령형 라이프사이클(onInitialize/onChanges) · 훅 + FormRuntime/Controller · 조건부 정책(ALWAYS/HIDDEN/VIEW_ONLY/…)·권한(`withRequiredPermissions`).
- **BackendAdapter 계약**: CRUD URL조립·응답해석·오류의미를 어댑터 뒤로 격리(RCM 1급 기본). ProblemDetail(RFC7807)·SearchResponse 표준화.
- **관계 1급**: ManyToOne(검색+팝업) · SubCollection(격리 자식 폼) · 40+ 필드 타입(입력·셀·필터·엑셀·검증 5문맥) · 주소(composite→flat).

마이그레이션 how-to: `docs/MIGRATION.md` + codemod. 상세 설계 근거: ADR-0008/0009 · 개념 헌장.

## [0.3.26] - 2026-07-10

0.4 재기초에 앞서 **확정 버그 9건 + 안전 기본값**을 고친 하드닝 릴리스. 여기서
고쳐진 로직이 0.4 이식의 원본이 된다(버그째 이식 방지). 보안 기본값 3종은 동작이
바뀌므로 아래 **Breaking** 을 반드시 확인할 것. 0.4 로의 마이그레이션 how-to 는
`documents/plans/migration-0.3-to-0.4.md`(리빙 문서)에 누적된다.

### Breaking

- **`simpleCrypt` cryptKey 필수화**: 공유 하드코딩 폴백 키(`'rcm-token-secret'`)를
  제거했다. `configureRuntime({ cryptKey })` 로 키를 주입하지 않은 채 `encrypt` /
  `decrypt` 를 호출하면 이제 명확한 에러를 던진다(모든 소비자가 같은 기본 키로 서로의
  데이터를 복호화할 수 있던 문제 차단). 호스트는 부트스트랩에서 cryptKey 를 설정해야 한다.
- **HTML 싱크 안전 기본값**: `HtmlField` · `ShowNotifications` · `ViewHelpIcon` 이
  이전에는 host 제공 문자열을 `dangerouslySetInnerHTML` 로 그대로 렌더했다. 이제
  `configureHtmlSanitizer((html) => sanitized)` 를 설정하기 전에는 **이스케이프된
  텍스트로 렌더**하고 1회 경고한다. 기존처럼 HTML 로 렌더하려면 부트스트랩에서 새니타이저
  (예: `configureHtmlSanitizer(DOMPurify.sanitize)`)를 주입한다.
- **`ASSET_SERVER_URL` 폴백 제거**: 미설정 시 `http://127.0.0.1:8320` 으로 폴백하던
  동작을 제거하고 빈 문자열 + 1회 경고로 바꿨다. `NEXT_PUBLIC_ASSET_SERVER` 또는
  `configureAssetServerUrl()` 로 자산 서버를 설정하지 않던 host 는 자산 경로가 바뀔 수 있다.

### Fixed

- **(P0-1) min/max 검증 무력화**: `getValueAsNumber` / `getValueAsBoolean` 이 연산자
  우선순위 버그로 `(current ?? renderType==='update') ? fetched : default` 로 평가돼
  `current` 를 직접 쓰지 못하고 falsy(0/false) current 가 조용히 fetched/default 로
  대체됐다. `getValueAsString` 과 동일하게 삼항을 괄호로 묶어 정정 —
  `current ?? (renderType==='update' ? fetched : default)`. `MinMaxNumber` 검증이
  다시 동작한다.
- **(P0-2) DatetimeField 타입 오등록**: 필드 타입을 `'date'` 대신 `'datetime'` 으로
  등록해 Excel export/import 왕복에서 **시간 성분이 보존**된다(기존엔 datetime 분기가
  죽은 코드였음). 필터 UI 크기는 두 타입을 모두 처리하므로 무회귀.
- **(P0-3) FieldRenderer onChange 에러 삼킴**: 축자 중복된 두 onChange IIFE 에 `.catch`
  가 없어 `validate()` / `getManyToOneLink()` 가 throw 하면 unhandled rejection 으로
  값·에러가 조용히 유실됐다. 공통 `applyFieldChange()` 로 추출하고 두 진입점을 try/catch
  로 감싸 실패를 `setErrors()` 로 사용자에게 표시한다.
- **(P0-4) pageSize 우선순위 역전**: 리스트별 `options.defaultPageSize` 가 마운트 시
  전역 저장값으로 덮어써지던 문제. 명시 지정 > 전역 저장값 > 라이브러리 기본 순으로 정정.
- **(P0-5) useLoadingStore 비반응성**: 훅 이름이지만 구독이 없어 로딩 상태가 바뀌어도
  리렌더되지 않았다. zustand store 로 교체(반응성 확보). `configureLoading` 호스트 교체
  계약은 유지.
- **(P0-6) clone 권한 aliasing**: `EntityForm.clone()` 이 `manageEntityForm` 을 참조로
  공유해 클론 변경이 원본에 누수됐다. 얕은 복사로 격리.

### Added

- **`configureHtmlSanitizer(sanitizer)`** — raw-HTML 싱크에 host 새니타이저를 주입하는
  확장점(미설정 시 이스케이프 텍스트 + 1회 경고).

### Changed

- **`MenuPermissionChecker`**: 미등록 상태 첫 호출 시 1회 경고(여전히 관대한 `'ALL'`
  기본값). 헤더 주석의 `'WRITE'` → `'ALL'` 오기 정정.
- **환경 고정 / 릴리스 게이트 (P0-8)**: `engines.node >= 20`, `.nvmrc`(22 LTS),
  CI Node 20/22 매트릭스 + `v0.4` 트리거, `scripts/check-release-docs.mjs`(CHANGELOG
  최상단 == package.json 버전) publish 게이트, `@typescript-eslint/no-explicit-any`
  를 error 로 승격(기존 135파일은 동결, 신규 유입만 차단). jsdom `localStorage` 셋업
  폴리필로 Node 20+ 의 inert `localStorage` 전역 문제 해소.

### Deprecated

- **`AdvancedSearchForm`** (v1) — `AdvancedSearchFormV2` 로 대체 예정. 내부 사용처 0.

## [0.3.25] - 2026-06-20

### Fixed

- **(#10) `options.filtersKey` 재적용 시 행 선택 desync**: 0.3.24 의 `filtersKey` 재적용은
  필터/정렬/페이지만 리셋하고 `checkedItems`(행 선택)는 그대로 남겨, 새 결과셋에 이전
  선택행이 그대로 있으면 체크박스는 켜졌는데 host 선택 상태는 비어 있는 desync 가
  발생했다. remount 였다면 선택도 함께 초기화됐을 것이므로 `setCheckedItems([])` 를
  추가해 remount 와 동일한 동작을 보장한다(동형 완성).

## [0.3.24] - 2026-06-20

`options.filtersKey` 를 추가해, host 가 자체 FilterBar/URL 로 필터 상태를 소유하고
`options.filters` 로 주입하는 구성에서 **컴포넌트 remount 없이** 필터 재적용이 가능해졌다.

### Added

- **(#10) `options.filtersKey?: string | number`** — `ViewListGridWrapper` 의 새 공개 옵션.
  host 가 필터 상태 파생값(JSON/hash)을 넘기면, 값이 바뀔 때 엔진이 기존 필터/정렬을
  비우고(`clearFilterAndSort`) `options.filters` 를 재적용한 뒤 첫 페이지부터 재조회한다
  (기존 `onChangeSearchForm` reset 경로 재사용). 지금까지는 반영을 위해
  `<ViewListGridWrapper key={…}>` 로 컴포넌트를 remount 해야 했다(상태 teardown + cold
  re-init + react-query 캐시구독 브리지 유발) — 이제 컴포넌트 마운트/상태가 보존된다.
  `filtersKey` 미지정 시 완전 no-op 이라 기존 소비자 동작은 변하지 않는다.

## [0.3.23] - 2026-06-19

### Fixed

- `.rcm-textarea[readonly]` 가 `--rcm-color-text-disabled`(gray-400)을 disabled 배경
  위에 써 2.3:1 대비로 WCAG 2 AA(4.5:1) 기준을 실패하던 문제를 수정. `.rcm-input[readonly]`
  가 이미 적용한 동일 원칙(본문 색 유지 + disabled 배경)으로 readonly 를 disabled 와
  분리했다. readonly 값은 사용자가 읽는 데이터이므로 가독성이 필수다.

## [0.3.22] - 2026-06-17

nullable 값에서 발생하던 두 건의 런타임 크래시(#8, #9)를 수정. 둘 다 회피 불가한
렌더/초기화 throw 였고, 패치 레벨 수정입니다(0.3.x 유지).

### Fixed

- **(#8) `NumberField` nullable 셀 크래시**: list 셀 렌더러(`renderListItemInstance`)가
  `!== undefined` 가드로 `null` 을 통과시켜 `formatPrice(null)` → `null.toLocaleString()` 가
  throw 하던 문제. `formatPrice` 에 nullish 가드(`value == null → ''`)를 추가하고(공유 util/public
  API 보강, `0` 은 유효값으로 보존), 호출부 가드를 `!= null` 로 정정해 상세/뷰 렌더러와 일관화.
  nullable number 컬럼에 `null` 행이 있어도 list 가 빈 셀로 렌더됩니다.
- **(#9) `EntityForm.initialize()` 단건 fetch 언랩 깊이 정정**: 기존 엔티티 수정/상세 폼이
  초기 fetch 직후 `undefined.manageEntityForm` 로 크래시하던 문제. 단건 GET 응답을
  `response.data.data`(2-depth) 로 읽던 것을 save/list/delete 및 `ApiClient` 봉투 계약과 동일하게
  `response.data`(1-depth) 로 통일. `setFetchedValues` 에 nullish 방어선 추가.
  rcm-framework 0.1.0 `AbstractCrudController`(봉투 없는 bare-entity GET) 정합을 완성합니다.

  > ⚠️ **컨슈머 주의**: 이 버그를 우회하려고 어댑터의 `callExternalHttpRequest` 에서 GET 응답을
  > double-wrap(`{ data: { data: json } }`) 하던 임시 코드가 있다면 0.3.22 업그레이드 시 **반드시
  > 제거**해야 합니다. 제거하지 않으면 `response.data === { data: entity }` 가 되어 폼이 빈 값으로
  > 뜹니다. 표준 어댑터(`{ data: json }`, 1-depth)만 유지하면 됩니다.

## [0.3.21] - 2026-06-16

optional peer 들을 main barrel 이 **static import** 해, consumer(Next.js)가 해당 peer 를
설치하지 않으면 `next build` 가 `Module not found` 로 강제 실패하던 문제(#7)를 해결.
peer 를 **코어=필수 / leaf=subpath opt-in / 코어내장=주입** 으로 명시 재분류했습니다.
이제 **필수 peer 만 설치한 consumer 도 main barrel import 로 빌드가 통과**합니다.

### Changed (BREAKING)

- **peer 재분류**: 코어 그래프가 항상 사용하는 peer 를 `optional: false`(필수)로 전환 —
  `@iconify/react`, `react-select`, `react-sortablejs`. 추가로 `react-sortablejs` 의
  peer 인 `sortablejs`(`^1.15.0`)를 필수 peer 로 명시. 이들을 설치하지 않으면 빌드 실패가
  정상 동작입니다(계약을 정직하게 만든 것). `date-fns` 는 기존대로 필수.
- **`qrcode.react` peer range 를 `^3.0.0` 으로 고정** (기존 `^3 || ^4`). `QrField` 는
  default export(`import QRCode from 'qrcode.react'`)를 쓰는데 v4 는 default 를 제거해
  실질적으로 v3 만 호환했습니다. v4 를 쓰던 consumer 는 v3 로 다운그레이드가 필요합니다.
- **leaf optional 컴포넌트를 main barrel 에서 제거 → subpath opt-in 으로 이전**. 아래
  컴포넌트를 `@rchemist/listgrid` 에서 직접 import 하던 host 는 import 경로를 바꿔야 합니다:

  | 이전 (main barrel) | 변경 후 (subpath) | 필요한 optional peer |
  |---|---|---|
  | `QrField` | `@rchemist/listgrid/qr` | `qrcode.react@^3` |
  | `AddressFieldView`, `AddressMapField`, `KakaoMap`, `PostCodeSelector`, `ApplyFullAddressFields` | `@rchemist/listgrid/address` | `react-kakao-maps-sdk`, `react-daum-postcode` |
  | `ViewApiSpecification`, `ApiSpecificationButton` | `@rchemist/listgrid/api-spec` | `sweetalert2`, `sweetalert2-react-content` |
  | `XrefPriceMappingField`, `XrefPiceMappingView` | `@rchemist/listgrid/xref-price` | `sweetalert2`, `sweetalert2-react-content` |
  | `DataExporter`, `DataImporter`, `DataExportProcessor`, `DataImportSample`, `DynamicDataImporter`, `ExcelDownload`(Provider) | `@rchemist/listgrid/excel` | `xlsx-js-style`, `file-saver` |

  (다른 Xref 필드 `XrefMappingField`/`XrefPreferMappingField`/`XrefAvailableDateMappingField`,
  그리고 peer-free 인 `DataImportResultView`/`DataImportDescription`/`DataImportProcessor`/
  `DataExportService`/`ExcelPasswordField`/transfer `Type` 은 그대로 main barrel 에 남습니다.)

- **데이터 전송(export/import) 은 주입 방식으로 전환**. 리스트 헤더 내장 전송 모달은 더 이상
  `xlsx`/`file-saver` 를 강제로 끌어오지 않습니다. host 가 부트스트랩에서 한 번 등록해야
  export/import UI 가 동작합니다(미등록 시 해당 모달은 렌더되지 않음):

  ```ts
  import { registerExcelDataTransfer } from '@rchemist/listgrid/excel';
  registerExcelDataTransfer(); // xlsx-js-style + file-saver 설치 전제
  // 또는 직접: configureDataTransfer({ Exporter, Importer })
  ```

### Added

- subpath exports: `./qr`, `./address`, `./api-spec`, `./xref-price`, `./excel`.
- `configureDataTransfer` / `getDataTransfer` (전송 주입 seam, main barrel export) + `DataTransferComponents` 타입.
- `@rchemist/listgrid/excel` 의 `registerExcelDataTransfer()` 헬퍼.
- `package.json` 에 `sideEffects: ["**/*.css", "*.css"]` 추가 (tree-shaking 방어선).

### Migration

- 필수 peer 설치 확인: `react`, `react-dom`, `@headlessui/react`, `@tabler/icons-react`,
  `@iconify/react`, `react-select`, `react-sortablejs`, `sortablejs`, `date-fns`(, `next`/`nuqs` 사용 시).
- 위 표의 컴포넌트를 쓰던 곳은 해당 subpath 로 import 변경 + 그 기능의 optional peer 설치.
- 전송 기능을 쓰면 부트스트랩에 `registerExcelDataTransfer()` 추가.
- `qrcode.react` 는 v3 로 맞춤.

## [0.3.19] - 2026-06-03

### Fixed

- `OptionalField.validate` 가 `getCurrentValue()`(async) 를 `await` 하지 않아, 값이
  Promise 로 `validateWithLimit` 에 전달되던 문제를 수정. `Array.isArray(value)` 가
  항상 false 가 되어, `limit.min` 이 정의된 복수 옵션 필드(`TagField` 의 기본
  `{ min: 0, ... }` 포함)는 실제 값과 무관하게 **항상 "최소 N개 이상" 검증 실패**를
  반환했고, 그 결과 해당 필드를 포함한 EntityForm 의 detail/create **저장이 영구
  차단**되었다 (검증 에러가 빈 채로 반환되어 저장 버튼이 조용히 무동작). `limit` 이
  없는 `CustomOptionField` 는 영향이 없어 잠복해 있었다. 이제 resolved 값(배열)으로
  limit 을 검사한다. 회귀 테스트 3건 추가 (`OptionalField.test.ts`).

## [0.3.10] - 2026-05-29

### Fixed

- `DataImporter` 가 엑셀 업로드 시 사용자가 삭제한 빈 행을 미리보기/전송에 그대로
  노출하던 문제를 수정 (gjcu-academic-backend #1478). 엑셀에서 행을 삭제해도 시트
  dimension(`!ref`)이 원래 행 수를 유지해 `sheet_to_json` 이 빈 행을 반환하는데,
  `onFileUpload` 이 이를 빈 행 검사 없이 모두 `sheetData` 에 push 했음. 이제 매핑된
  모든 셀이 blank 인 행은 제외한다. 행 파싱을 `buildSheetData` 헬퍼로 통합하면서
  기존 `cells.forEach(async)` 의 비동기 push 어긋남(값 resolve 전 push)도 함께 정상화.

### Added

- `DataImporter` 업로드 진행 상태 표시 (gjcu-academic-backend #1479). 미리보기
  "업로드" 버튼이 처리 중 `disabled` + 스피너 + "업로드 중..." 라벨로 전환되고,
  처리 중에는 결과 모달이 닫히지 않는다. 대량 업로드 시 무반응처럼 보이거나 버튼이
  중복 클릭되던 문제를 방지.

## [0.3.7] - 2026-05-20

### Fixed

- `ImageField` 의 폼 미리보기가 외부 절대 URL(`http(s)://`) 값에 대해 unsized
  `<img>` 로 렌더되어 자연 크기 (수백~수천 px) 그대로 노출되던 문제를 수정.
  외부 URL 분기에서 사용하던 `.rcm-image-field-external-img` 클래스에 CSS 룰이
  전혀 없어, asset 서버가 절대 URL 을 반환하는 환경에서 학생/사용자 프로필 등
  이미지 값이 화면을 가득 채우는 회귀가 발생했음.

### Added

- `ImageField` 의 폼 뷰 전용 썸네일 미리보기 + 클릭 시 모달 확대 보기.
  - 외부 절대 URL / 자체 asset URL 모두 동일한 미리보기 컴포넌트
    (`ImageFieldFormPreview`) 를 거치며, 기본 한 변 8rem (128px) 정사각형
    썸네일로 렌더됩니다.
  - 썸네일 클릭 시 인앱 모달 (`.rcm-image-field-zoom-backdrop` /
    `.rcm-image-field-zoom-image`) 이 열려 원본을 90vw / 90vh 안에서
    contain 으로 보여주며, 배경 클릭 또는 `ESC` 로 닫힙니다.
  - `ImageField#withPreviewSize(size)` 빌더 추가. `size` 는 `number` (px) 또는
    `string` (`'6rem'`, `'120px'` 등 CSS 길이값) 으로 한 변 크기를 지정합니다.
    호스트가 도메인별로 더 작은/큰 미리보기를 원할 때 선언부에서 직접 제어
    가능합니다.

## [0.3.6] - 2026-05-19

### Fixed

- `CustomOptionField` 의 alias 캐시 키를 `trim + uppercase` 로 정규화. v0.3.5
  에서 `lowercase` 로 두었으나 백엔드 (`OptionService.normalizeAlias`) 가 프로젝트
  컨벤션 (EnumType / 옵션 값 키 모두 대문자) 과 맞추기 위해 `uppercase` 로 재정의
  되었으므로 (gjcu-academic-backend #1416), 프론트 캐시 키도 동일 규칙으로 통일.
  URL 에는 여전히 `trim` 된 원본 case 가 실리고 백엔드는 `findByAliasIgnoreCase`
  로 매칭합니다.

(v0.2.20 backport from `release/0.2` — cherry-pick `3f23059`)

## [0.3.5] - 2026-05-17

### Fixed

- `CustomOptionField` 의 alias 캐시 키를 `trim + lowercase` 로 정규화. 백엔드
  (`OptionService.normalizeAlias`) 와 동일한 규칙으로 동작하여, 동일 alias 를 다른
  대소문자 / 공백 표기로 호출해도 같은 캐시 슬롯에 hit 합니다. 사용자 입력 표기는
  보존되어 URL 에는 `trim` 된 원본 case 가 그대로 실리고, 백엔드가 ignore-case 로
  매칭합니다 (`OptionRepository.findByAliasIgnoreCase`).

## [0.3.4] - 2026-05-15

### Fixed

- `ListGrid` / SubCollection 셀의 가운데/오른쪽 정렬이 시각적으로 적용되지 않던
  회귀를 수정. `ViewColumn` / `HeaderField` 는 `getListFieldAlignType()` 결과를
  토대로 `<td>` / `<th>` 에 `.text-center` / `.text-right` utility 를 정상적으로
  부여하고 있었으나, `components.css` 의 base reset 규칙
  `.rcm-table th, .rcm-table td { text-align: left }` (specificity 0,1,1) 이
  utility (specificity 0,1,0) 보다 강해 항상 left 로 렌더링되었음.
  - 수정: `.rcm-table` 셀의 default `text-align: left` 를 제거. 브라우저 기본
    th/td 가 이미 left 라 명시 정렬 클래스 없는 셀의 동작은 변화 없음.
  - 영향: `v0.3.2` 의 "center-align non-text cells by default" 변경이 의도대로
    동작. SelectField / BooleanField / Date\*Field / NumberField 등 텍스트가 아닌
    필드의 셀 내용이 컬럼 너비 안에서 가운데 정렬됩니다.

## [0.3.3] - 2026-05-14

### Fixed

- `ImageField` / `FileField` 가 외부 절대 URL(`http(s)://`) 값을 자체 asset 서버 prefix 로
  감싸 `https://.../static-resource/https%3A//...` 와 같이 깨뜨리던 문제를 수정.
  값이 외부 URL 이면 폼 입력 모드와 리스트 셀 모두 host `FileUploadInput` 을 거치지 않고
  그대로 `<img>` / 다운로드 링크로 표시. 확장자가 없는 동적 파일 엔드포인트
  (예: `.../FileView.do?gbn=...`) 도 동일하게 처리.
- `getAccessableAssetUrl` 이 외부 URL 의 스킴 콜론(`:`) 을 URL-encode 해버려
  `https%3A//...` 형태로 망가뜨리던 quirk 를 근본 수정. 외부 URL 은 그대로 통과되며,
  자체 asset 서버 host 인 경우에만 prefix 정규화를 수행.

### Added

- `isExternalUrl(url)` helper export — 다른 컨슈머에서도 `http(s)://` 절대 URL 분기를
  동일한 의미로 사용할 수 있게 공개.

## [0.3.1] - 2026-05-05

### BREAKING — rcm-framework 0.1.0 endpoint 표준 정합 (Decision #31)

`rcm-backend-framework` v0.1.0 GA 의 새 endpoint 매트릭스에 맞춰 **list / search / create / bulk-delete URL 형태를 변경**합니다. 0.0.5 line backend 와는 더 이상 호환되지 않으므로 `0.2.x` 를 사용하는 프로젝트는 backend 도 함께 업그레이드해야 합니다.

#### Endpoint 변경 매트릭스

| 영역 | 0.2.x (0.0.5 backend) | 0.3.x (0.1.0 backend) |
|---|---|---|
| 검색 / 목록 | `POST {url}` (RequestBody SearchForm) | `POST {url}/search` (RequestBody SearchRequest) |
| Create | `POST {url}/add` (RequestBody Form) | `POST {url}` (RequestBody CreateForm) |
| Update | `PUT {url}/{id}` | `PUT {url}/{id}` (변경 없음) |
| Single delete | `DELETE {url}/{id}` 또는 deleteAll([id]) → `POST {url}/delete` | `DELETE {url}/{id}` 또는 bulk |
| Bulk delete | `POST {url}/delete` (body { ids, revisionEntityName? }) | `DELETE {url}` + body `BulkDeleteRequest{ids, revisionEntityName?}` |
| Schema | `POST {url}/_search/schema` | `GET {url}/search/schema` |
| Underscore prefix | `/_search` / `/_count` 일부 사용 | **영구 거부** (REST 표준 정합) |

`underscore prefix` 영역은 listgrid 자체가 hardcode 하지 않으므로 별도 변경 없음. host app 의 `endpoints` 설정만 정합 (예: schema URL 을 `/search/schema` 로).

#### 응답 wire format 호환 흡수

framework 0.1.0 의 `SearchResponse<T>` (Spring Data `Page<T>` superset) 를 흡수하면서 0.0.5 line `ResponseListWrapper` 도 fallback 으로 유지합니다 — 한 라이브러리 코드로 양쪽 dual 흡수.

| 필드 | 0.0.5 line | 0.1.0 line |
|---|---|---|
| 결과 list | `data.list` | `data.content` |
| total | `data.totalCount` | `data.totalElements` |
| total pages | `data.totalPage` | `data.totalPages` |
| 원본 form echo | `data.searchForm` | `data.searchRequest` (SearchResponse) — 없으면 client 원본 보존 |

에러 응답은 호스트 `ApiClient` 가 RFC 7807 ProblemDetail 을 listgrid 의 `entityError` shape 으로 정규화해야 합니다 (gjcu 의 `AxiosClient.ts` 참고).

#### Migration

```ts
// 0.2.x — backend 가 0.0.5 line 인 경우 그대로 유지
"@rchemist/listgrid": "^0.2.15"

// 0.3.x — backend 가 rcm-framework 0.1.0 GA 인 경우
"@rchemist/listgrid": "^0.3.1"
```

라이브러리 사용 코드 (EntityForm 정의 / ListGrid 인스턴스화 / ViewListGridWrapper 등) 는 변경이 필요하지 않습니다.

#### 변경 파일

- `src/listgrid/form/Type.ts` — `PageResult.fetchListData` 가 `${url}/search` 로 POST. `data.list || data.content` / `data.totalCount || data.totalElements` / `data.totalPage || data.totalPages` / `data.searchForm || data.searchRequest` dual 흡수.
- `src/listgrid/config/EntityForm.tsx` — Create 가 `${url}` (suffix 제거). Bulk delete 가 `DELETE ${url}` + body `{ids, revisionEntityName?}`.

## [0.2.15] - 2026-05-01

### Fixed

- `ExcelDownload` 로 다운로드한 샘플 파일에서 `text` / `select` / `multiselect` / `phone` 타입 필드의 셀 서식이 "텍스트(@)" 로 지정되지 않아, 사용자가 `01234` 같이 0 으로 시작하는 값을 붙여넣을 때 Excel 이 자동으로 숫자로 변환하던 문제를 수정합니다.
  - 원인: `props.fields` 기반의 셀 타입/서식 지정 (`cell.t = 's'`, `cell.z = '@'`) 을 워크시트에 적용한 직후, `!skipHeader` 분기에서 `XLSX.utils.sheet_to_json(...)` → `XLSX.utils.aoa_to_sheet(...)` 라운드트립으로 워크시트를 재생성하면서 방금 적용한 셀 메타데이터가 모두 손실되었습니다.
  - 수정: 필드 기반 셀 서식 지정 블록을 워크시트 재생성 **이후** 로 이동하여, 최종 워크시트에 텍스트 서식이 보존되도록 합니다.
  - 영향: `lectureCode`, `studentNumber`, `phone` 등 `text` / `select` / `multiselect` / `phone` 타입으로 선언된 모든 필드가 텍스트 서식으로 정상 동작합니다. 호스트 앱 코드 변경은 불필요합니다.

## [0.2.14] - 2026-04-30

### Fixed

- `InlineMapField` 가 required 인 경우, 사용자가 UI 에 값을 입력했음에도 "필수 값입니다" 검증 에러로 저장이 차단되던 문제를 수정합니다.
  - 원인: `InlineMap` UI 의 사용자 입력은 `pendingRef.current.value` 에 누적되고 `getSaveValue` 시점에서야 form value 로 반영되는데, 검증 단계의 `FormField.isBlank` 는 `this.value.current` (= 비어있는 객체) 만 보아 사용자 입력 여부를 인지하지 못했습니다.
  - 수정: `InlineMapField.isBlank` 를 override 하여 `pendingRef.current.modified === true` 인 경우 pendingRef 값을 보고 빈 값 여부를 판단합니다 (기존 `isDirty` / `getSaveValue` 와 동일한 우선순위).
  - 회귀 테스트: `src/listgrid/components/fields/__tests__/InlineMapField.test.ts`

## [0.2.13] - 2026-04-27

### Fixed

- `EntityFormButton.withOnClick` 으로 정의한 커스텀 save-overwrite 버튼이 반환한 `EntityForm` 인스턴스가 `ViewEntityForm` 내부 상태로 전파되지 않아, `entityForm.getErrorMap()` 기반의 필드별 에러 UI 가 표시되지 않던 문제를 수정합니다.
  - `getEntityFormButtons` 가 buttonProps 에 `setEntityForm` 을 전달합니다.
  - 커스텀 onClick 이 `form.errors` 가 채워진 form 을 반환하면 framework 가 `setEntityForm(form)` 으로 ViewEntityForm 상태를 갱신합니다.
  - 매핑 가능한 필드 에러가 하나라도 있으면 상단 string 띠(`setErrors`) 는 자동으로 비웁니다 — `ViewEntityFormErrors` 가 `entityErrorMap` 으로 필드별 표시를 담당하므로 이중 표시를 막기 위함입니다.

### Added

- `EntityFormButtonProps` 에 `setEntityForm?: Dispatch<SetStateAction<EntityForm | undefined>>` 옵션을 추가했습니다. 호스트 앱이 직접 `setEntityForm` 을 호출해야 하는 경우 (예: 사전 검증 후 entityForm 인스턴스 변경) 활용할 수 있습니다. 기존 시그니처와 호환됩니다.

## [0.2.12] - 2026-04-24

### Host coupling detox

이 라이브러리에서 GJCU 학사 시스템 고유의 role 문자열, API 엔드포인트 경로, 기능 자동 주입 결정이 하드코딩되어 있던 지점들을 모두 호스트 앱이 주입할 수 있는 **registry / predicate 모델** 로 전환합니다. 자세한 설계 배경과 영향 범위는 `docs/REFACTOR_HOST_COUPLING.md` 를 참고해 주십시오.

해상도 우선순위는 모든 지점에서 동일합니다: **field 단위 오버라이드 > 전역 registry > 라이브러리 기본값**.

#### 신규 공개 API

- `configureRuntime({ endpoints, permissions })` — 기존 `configureRuntime` 에 `endpoints` / `permissions` 섹션 추가. 두 섹션 모두 부분 오버라이드가 가능합니다.
- `getEndpoint(name)`, `getPermission(name)` — 내부 구성요소가 registry 값을 조회하는 helper.
- `PhoneNumberField.withSmsPermission((session) => boolean)` — 필드 단위 SMS 발송 권한 오버라이드.
- `CustomOptionField.withFetchUrl(url)`, `CustomOptionField.withBulkFetchUrl(url)` — 필드 단위 엔드포인트 오버라이드.
- `RevisionField.withApiUrl(url)` — 필드 단위 엔드포인트 오버라이드.
- `registerPhoneNumberSmsHistoryInject({ enabled, permission, tabLabel, tabId, tabOrderOffset })` — SMS 이력 탭 자동 주입 opt-in. 미등록 또는 `enabled: false` 인 경우 라이브러리는 탭을 주입하지 않습니다 (이전 버전은 기본적으로 주입).

#### 제거된 라이브러리 내부 하드코딩

- Role 문자열 `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_STAFF` 제거. 아래 4 지점은 predicate 주입으로 교체됨:
  - `EntityForm` 의 SMS 이력 탭 자동 주입 조건
  - `ViewListGrid` 의 "새 창 열기" 버튼 표시 조건
  - `PhoneNumberFieldView` / `PhoneNumberListView` 의 SMS 발송 버튼 표시 조건
- URL 리터럴 제거 (모두 `ListGridEndpoints` 에 기본값 유지):
  - `/excel-upload`, `/excel-download-history/add`
  - `/option/by-alias`, `/option/by-aliases`
  - `/asset/upload-file`, `/static-resource/`
  - `/api/v1/sms-sender/list`, `/notification/send`
  - `/revision`
  - `/assets/images/no-image.png`
- GJCU 도메인을 언급하던 주석 정리 (`academic/system/option`, `menu.academic.admission.notice`, `academic-system`).

#### 호환성 및 마이그레이션

- **URL 기본값**: 라이브러리 기본값이 기존 하드코딩 값과 동일합니다. URL 을 바꾸지 않는 호스트는 추가 설정 없이 동일하게 동작합니다.
- **권한 기본값**: `canSendSms`, `canOpenInNewWindow` 의 라이브러리 기본값은 `() => true` (항상 표시) 로, 이전 버전처럼 관리자만 보이게 하시려면 `configureRuntime({ permissions: { canSendSms: ..., canOpenInNewWindow: ... } })` 를 부트스트랩에서 호출해 주십시오.
- **SMS 이력 탭 자동 주입**: 이전에 자동 동작하던 기능입니다. 0.3.0 부터는 `registerPhoneNumberSmsHistoryInject({ enabled: true, permission: ... })` 를 호출해야 주입됩니다.
- **공개 API 제거 없음**: `hasAnyRole`, `registerSmsHistoryField`, `withRequiredPermissions`, `ManyToOneView.modifiable` 등 기존 API 는 모두 유지됩니다.

## [0.2.11] - 2026-04-23

### Bug fixes

#### `XrefPreferMappingView` / `XrefAvailableDateMappingView`: 불러오기 후 전체 목록 표시 + 저장 실패

두 뷰의 "불러오기" 모달에서 내부 `ManyToOneField('mapping', ...)` 서브폼을 띄우고 사용자가 선택한 대상을 `form.getSubmitFormData()` 결과에서 꺼내 쓰는 구조였으나, `EntityForm.getSubmitFormData()` 내부의 `processManyToOneField` 헬퍼는 모든 `AbstractManyToOneField` 값을 `${fieldName}Id` 키로 저장한다. 즉 이 두 파일은 `'mapping'` 키로 값을 읽고 있어 항상 `undefined` 를 얻었고, 결과적으로 `mappingValue.mapped` 에 `{ id: undefined, preferred: false }` 가 push 되어 다음 증상으로 이어졌다:

1. 재렌더 시 `idList = [undefined].filter(Boolean)` 로 빈 배열이 되어 `viewSearchForm` 에 `IN values=[]` 필터가 걸리고, 서버는 빈 `IN` 을 "필터 없음" 으로 취급해 **전체 교수/학과 목록** 을 반환한다 (`XrefPreferMappingField` 기준 "담당 교수 불러오기 후 모든 교수가 리스트에 표시됨").
2. 상위 엔티티 저장 시 페이로드의 `mapped` 가 `[{ id: undefined }]` 로 직렬화되어 서버에서 무시되고, UI 는 "저장되었습니다" 메시지를 띄우나 실제 매핑은 저장되지 않는다.

두 뷰의 키를 `'mappingId'` 로 수정한다. 자매 파일 `XrefPiceMappingView.tsx` 는 이미 `formData.data['mappingId']` 를 올바르게 쓰고 있어, 이 파일이 기준 패턴임을 교차 확인했다. `XrefMappingView` / `XrefPriorityMappingView` 는 모달에서 `ManyToOneField` 서브폼이 아니라 `ListGrid` 를 직접 띄우고 `onSelect: (item) => onChange(item.id)` 로 id 를 바로 받는 다른 아키텍처라 영향 없음.

**영향 파일**:
- `src/listgrid/components/fields/view/XrefPreferMappingView.tsx`
- `src/listgrid/components/fields/view/XrefAvailableDateMappingView.tsx`

### Compatibility

공개 API 변경 없음. `^0.2.10` 범위 소비자는 `npm install` 로 자동 업그레이드.

## [0.2.10] - 2026-04-23

### Bug fixes

#### `PostCodeSelector` 주소 검색 모달 UI 깨짐

지난 `0.2.9` 릴리스의 `[props] → [open]` 수정은 `useEffect` 의 재초기화 문제만 다뤘으나, 실제 사용 환경에서는 (1) 모달 내부 레이아웃 CSS 가 전혀 적용되지 않고 (2) 상세주소 타이핑 시 여전히 포커스가 매 글자마다 유실되는 문제가 남아 있었다. 본 릴리스에서 두 문제를 모두 정리한다.

- **CSS 누락 수정**: `PostCodeSelector.tsx` 에서 `const classes = {}` 로 인해 모든 `className={classes.xxx}` 가 `undefined` 로 렌더되어 모달 내부에 정렬/간격 스타일이 전무했던 문제를 수정. `rcm-postcode-form`, `rcm-postcode-row`, `rcm-postcode-input-row`, `rcm-postcode-submit-row` 등 명시적 클래스로 대체하고 `components.css` 에 해당 규칙을 추가. 결과: "주소 검색" 버튼이 두 줄로 깨지는 현상, 각 입력 행의 좌측 치우침, "주소 입력" 버튼 중앙 정렬 부재 등이 해소된다.
- **상세주소 타이핑 포커스 유실 근본 수정**: 모달 본문을 별도 `PostCodeSelectorForm` 컴포넌트로 분리하고 `React.memo(Component, () => true)` 로 외부 재렌더를 완전히 차단. 내부 state 는 lazy initializer 로 최초 1회만 `initialAddress` 에서 복사하며, `props.onSubmit` 은 "주소 입력" 버튼 클릭 시점에만 호출된다. 부모 `PostCodeSelector` 는 모달 open 시점에 `sessionKey` 를 증가시켜 세션마다 새 Form 인스턴스를 마운트하고, `onSubmit` 은 ref 패턴으로 안정된 참조로 래핑한다. 결과: 상위 `useEntityFormLogic` / `FieldRenderer` 가 어떤 이유로든 재렌더되어도 모달 내부 입력은 재렌더되지 않으며 포커스가 유지된다.
- **controlled input 고정**: `address2` 의 초기값을 `useState<string>()` 에서 `useState<string>(() => ... ?? '')` 로 변경해 첫 타이핑 시 uncontrolled → controlled 전이가 일어나지 않도록 한다.

**영향 파일**:
- `src/listgrid/components/fields/address/PostCodeSelector.tsx`
- `src/listgrid/styles/components.css`

### Compatibility

공개 API 변경 없음. `^0.2.9` 범위 소비자는 `npm install` 로 자동 업그레이드.

## [0.2.9] - 2026-04-22

### CI/CD

GitHub Actions `publish.yml` 에서 Trusted Publishing 을 쓰려면 npm CLI >= 11.5.1 이 필요하나 Node 22 번들 npm 은 10.x. Node 24 로 상향하여 npm 11.x 번들을 확보 (in-place `npm install -g npm@latest` 는 Node 22 에서 모듈 링크가 깨지는 알려진 이슈).

0.2.7 / 0.2.8 은 위 CI 문제로 npm 레지스트리에 게시되지 못하였고, 본 릴리스(0.2.9)가 동일한 버그 픽스를 포함하여 실제 배포되는 첫 버전이다.

### Bug fixes

#### `PostCodeSelector`: 상세주소 입력 중 포커스·입력값 유실

`PostCodeSelector` 의 `useEffect` 가 의존성 배열에 `props` 전체를 받아, 부모(`AddressFieldView`)가 재렌더될 때마다 `initializeData()` 가 재실행되면서 사용자가 타이핑한 `address2` 로컬 state 가 fetched 값으로 되돌아가던 버그를 수정.

- 초기화 시점을 모달 open 토글로 한정 (`[props]` → `[open]`)
- 편집 중(open=true) 부모 재렌더에도 내부 state 유지 → 포커스/입력 보존
- 모달이 닫혔다가 다시 열리면 최신 `props.address` 로 재초기화되어 외부 변경 반영에도 문제 없음

**영향 파일**: `src/listgrid/components/fields/address/PostCodeSelector.tsx`

#### `CardManyToOneView` 검색 입력: 돋보기 아이콘이 placeholder 텍스트를 가림

`.rcm-card-m2o-search-input` (특이도 `0,1,0`) 규칙이 `primitives.css` 의 `.rcm-input[data-size='sm']` (특이도 `0,2,0`) 에 눌려 left padding 이 리셋되며, 절대 배치된 돋보기 아이콘(`left: 0.75rem`)이 placeholder 를 가리던 버그를 수정.

- 셀렉터를 `.rcm-card-m2o-search-input.rcm-input` 로 변경하여 특이도 `0,2,0` 동률 확보
- 번들 순서(`primitives → layouts`)상 `layouts.css` 규칙이 tie-break 승리 → 아이콘 공간용 left padding(2.5rem) 유지
- `:focus` 상태 규칙도 동일 셀렉터로 맞춤

**영향 파일**: `src/listgrid/styles/layouts.css`

### Compatibility

공개 API 변경 없음. `^0.2.6` 범위 소비자는 `npm install` 로 자동 업그레이드.

## [0.2.0] - 2026-04-XX

### Summary

"의도된 any 중 공개 API 청소 완료" 마일스톤. 이전 알파 라인의 누적 리팩터(framework-free + CSS primitive + exactOptionalPropertyTypes + TSelf/TForm/TValue 제네릭 + parse unknown)를 공식화하고, 누적된 `@deprecated` / "TODO: remove in v0.2" 항목을 정리.

### BREAKING CHANGES (6)

#### 1. `attributes: Map<string, any>` → `Map<string, unknown>` (A-1)

`EntityField.attributes`, `FormField.attributes` / `FormFieldProps.attributes`, `EntityForm.getAttributes()` 반환값, `EntityForm.putAttribute / addAttributeToField / getFieldAttributes`, `ConditionalProps.attributes` (Config.ts) 의 value type 이 `any` → `unknown`.

**Before:**

```ts
const mode = entityForm.getAttributes().get('collaboMode');
if (mode === 'custom') { ... } // any — dereference 자유
```

**After:**

```ts
const mode = entityForm.getAttributes().get('collaboMode') as string | undefined;
if (mode === 'custom') { ... } // cast 또는 narrow 필요
```

또는 narrow:

```ts
const raw = entityForm.getAttributes().get('collaboMode');
const mode = typeof raw === 'string' ? raw : undefined;
```

TS 5.x 는 `unknown === 'literal'` 비교 자체는 컴파일 OK — 단 narrow 는 안 됨. property dereference 시 cast 필요.

#### 2. `ViewListGridTheme.headerButtons` slot 제거 (A-2)

`HeaderActionButtons` JSX 가 이미 `rcm-button` + `data-variant`/`data-color` primitive 를 직접 사용하므로 slot 은 이미 비활성 상태였음. 이 릴리스에서 죽은 슬롯을 정리.

**Before:**

```ts
const theme: ViewListGridClassNames = {
 headerButtons: { primary: 'my-primary', ... },
};
```

**After:**

```ts
// headerButtons 필드 삭제. 커스터마이즈 필요 시 CSS 로:
// .rcm-button[data-variant="primary"] { ... }
const theme: ViewListGridClassNames = { /* headerButtons 제거 */ };
```

#### 3. `InlineSubCollectionField.rowActions*` deprecated API 제거 (A-3)

제거 대상:

- `InlineRowActionsConfig` interface
- `inlineRowActions`, `inlineRowActionsConfig` 필드
- `withRowActions`, `withRowActionsConfig` 메소드
- constructor props.rowActions / props.rowActionsConfig
- 호환 변환 로직 (rowActions → rowActionColumns)
- `InlineSubCollectionViewProps.rowActions / rowActionsConfig`

**Before:**

```ts
field.withRowActions(action1, action2).withRowActionsConfig({ order: 1 });
```

**After:**

```ts
field.withRowActionColumns(
 new InlineRowActionColumn({ id: 'default', order: 1, actions: [action1, action2] }),
);
```

#### 4. `ViewEntityFormTheme` deprecated slot 제거 (B-4)

5 deprecated slot 제거:

- `ViewEntityFormTabPanelStyles.container` → `panel`
- `ViewEntityFormTabPanelStyles.emptyMessage` → `empty`
- `ViewFieldGroupStyles.headerWrapper` → `header`
- `ViewFieldGroupStyles.icons` → `actions`
- `ViewFieldGroupStyles.collapseIcon` → `collapseToggle`

`defaultTheme.ts` 도 new 이름으로 전환. 소비 JSX (`ViewFieldGroup.tsx`, `ViewTabPanel.tsx`) 는 이미 new 이름 사용 중 — 추가 수정 없음.

#### 5. `AlertStyles` legacy 필드 제거 (B-5)

`AlertStyles` 인터페이스에서 삭제:

- `bg` (deprecated — 'rcm-notice' 반환)
- `hoverBg` (미사용)
- `text` (미사용)

`className` + `dataTone` 만 사용.

**Before:**

```tsx
const style = getAlertStyles(color);
<div className={style.bg}>...</div>
```

**After:**

```tsx
const style = getAlertStyles(color);
<div className={style.className} data-tone={style.dataTone}>...</div>
```

#### 6. `useAlertManager.getColorIndicator` 제거 (B-6)

class-name legacy mapping 제거. `getIndicatorTone` + `data-tone` 로 통일.

**Before:**

```tsx
import { getColorIndicator, getIndicatorTone } from '@rchemist/listgrid';

<div className={`rcm-alerts-indicator ${getColorIndicator(color)}`} data-tone={getIndicatorTone(color)} />
```

**After:**

```tsx
import { getIndicatorTone } from '@rchemist/listgrid';

<div className="rcm-alerts-indicator" data-tone={getIndicatorTone(color)} />
```

### NEW FEATURES (제네릭 확장)

#### FieldRenderParameters 제네릭화 (non-breaking, default = any)

`FieldRenderParameters<T extends object = any, TValue = any>` — 필드 render 파라미터의 엔티티/필드값 narrowing.

```ts
class SlugField extends FormField<SlugField, string, Post> {
 protected renderInstance(
 params: FieldRenderParameters<Post, string>,
 ): Promise<React.ReactNode | null> {
 params.onChange('new-slug'); // (value: string) => void
 const author = await params.entityForm.getValue('author'); // Promise<Post['author']>
 ...
 }
}
```

같은 패턴으로 `FilterRenderParameters<T, TValue>` / `FieldInfoParameters<T>` 도 제네릭화.

#### parse 제네릭 + ViewRenderProps 제네릭

`parse<T = unknown>(str): T` — default `any` → `unknown`. 호출자는 `parse<User>(s)` 또는 `parse(s) as User` 로 narrow.

**Before:**

```ts
const data = parse(json);
console.log(data.message); // any
```

**After:**

```ts
const data = parse<{ message: string }>(json);
console.log(data.message); // narrow
```

`ViewRenderProps<TForm extends object = any>` / `ViewValueProps<TForm>` — `item: TForm`, `entityForm?: EntityForm<TForm>`. default `= any` 라 기존 코드 무수정.

### Migration Path

v0.1.0-alpha.47 → v0.2.0 업그레이드:

1. `npm install @rchemist/listgrid@0.2.0`
2. `npm run type-check` 실행 — breaking 관련 에러 확인
3. 에러별 수정:
 - `unknown` 관련 → `attributes` (BREAKING CHANGES 1)
 - `Property 'headerButtons' does not exist on type 'ViewListGridClassNames'` → BREAKING CHANGES 2
 - `Property 'withRowActions' does not exist` → BREAKING CHANGES 3
 - `Property 'container' does not exist on type 'ViewEntityFormTabPanelStyles'` → BREAKING CHANGES 4
 - `Property 'bg' does not exist on type 'AlertStyles'` → BREAKING CHANGES 5
 - `getColorIndicator is not exported` → BREAKING CHANGES 6
4. `npm run build` 확인

**실측 영향**:

- A-1 attributes: `as` cast 이미 자리잡은 패턴 + `unknown === 'literal'` 비교는 TS 5.x 허용 → **0 errors**
- A-2/A-3/B-4/B-5/B-6: **0 errors**

### generics expansion alpha tag 상태

- alpha.48 / alpha.49 는 v0.2.0 의 구성 요소 (interim releases).
- v0.2.0 은 alpha.48/49 + 6 breaking 을 **통합 major bump** 로 제공.
