# Changelog

이 파일은 `@rchemist/listgrid` 의 공개된 변경 이력을 기록합니다.

## [0.2.30] - 2026-07-30

### Fixed

- `DatetimeFilter` 의 기간 프리셋(오늘/1주일/1개월/3개월/6개월/1년)이 `Date` 객체를
  그대로 `onChange` 에 넘겨, `SearchForm` 이 `String(v)` 로 직렬화하면서
  `'Wed Jul 29 2026 00:00:00 GMT+0900 (…)'` 형태가 백엔드로 전송되던 문제를 수정
  (gjcu-academic-backend #1716). 백엔드는 이 문자열을 `Instant` 로 파싱하지 못해
  조회가 실패했고, 같은 값이 화면으로 되돌아오면 flatpickr 가 `Y-m-d` 포맷으로
  재파싱하면서 시각(`00:00:00` / `23:59:59`)을 월·일로 오독해 어떤 프리셋을 눌러도
  `2025-11-30 ~ 2027-12-29` 처럼 고정된 엉뚱한 범위가 입력창에 표시됐다. 이제 달력
  경로와 동일하게 `'yyyy-MM-dd'` 로 직렬화한다 (백엔드가 시작/종료일의 00:00~23:59:59
  보정을 수행하므로 범위 의미는 유지).
- `urlStateParsers` 가 파이프(`|`) 분해를 `IN`/`NOT_IN` 에만 적용해
  `BETWEEN`/`NOT_BETWEEN` 이 새로고침·링크 공유 시 `'start|end'` 통짜 문자열로
  붕괴하던 것을 `values` 배열로 복원하도록 수정.

(backport of #11 / `f61c3ae` — main 0.3.26 기준. 0.3.x 릴리스는 별도)

## [0.2.24] - 2026-05-29

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

(v0.3.10 backport from main — cherry-pick 66a8d4c)

## [0.2.21] - 2026-05-20

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

(v0.3.7 backport)

## [0.2.20] - 2026-05-19

### Fixed

- `CustomOptionField` 의 alias 캐시 키를 `trim + uppercase` 로 정규화. v0.2.19
  에서 `lowercase` 로 두었으나 백엔드 (`OptionService.normalizeAlias`) 가 프로젝트
  컨벤션 (EnumType / 옵션 값 키 모두 대문자) 과 맞추기 위해 `uppercase` 로 재정의
  되었으므로 (gjcu-academic-backend #1416), 프론트 캐시 키도 동일 규칙으로 통일.
  URL 에는 여전히 `trim` 된 원본 case 가 실리고 백엔드는 `findByAliasIgnoreCase`
  로 매칭합니다.

(v0.3.6 backport)

## [0.2.19] - 2026-05-17

### Fixed

- `CustomOptionField` 의 alias 캐시 키를 `trim + lowercase` 로 정규화. 백엔드
  (`OptionService.normalizeAlias`) 와 동일한 규칙으로 동작하여, 동일 alias 를 다른
  대소문자 / 공백 표기로 호출해도 같은 캐시 슬롯에 hit 합니다. 사용자 입력 표기는
  보존되어 URL 에는 `trim` 된 원본 case 가 그대로 실리고, 백엔드가 ignore-case 로
  매칭합니다 (`OptionRepository.findByAliasIgnoreCase`).

(v0.3.5 backport)

## [0.2.18] - 2026-05-15

### Fixed

- `ListGrid` / SubCollection 셀의 가운데/오른쪽 정렬이 시각적으로 적용되지 않던
  회귀를 수정. `ViewColumn` / `HeaderField` 는 `getListFieldAlignType()` 결과를
  토대로 `<td>` / `<th>` 에 `.text-center` / `.text-right` utility 를 정상적으로
  부여하고 있었으나, `components.css` 의 base reset 규칙
  `.rcm-table th, .rcm-table td { text-align: left }` (specificity 0,1,1) 이
  utility (specificity 0,1,0) 보다 강해 항상 left 로 렌더링되었음.
  - 수정: `.rcm-table` 셀의 default `text-align: left` 를 제거. 브라우저 기본
    th/td 가 이미 left 라 명시 정렬 클래스 없는 셀의 동작은 변화 없음.
  - 영향: `v0.2.16` 의 "center-align non-text cells by default" 변경이 의도대로
    동작. SelectField / BooleanField / Date\*Field / NumberField 등 텍스트가 아닌
    필드의 셀 내용이 컬럼 너비 안에서 가운데 정렬됩니다.

(v0.3.4 backport)

## [0.2.17] - 2026-05-14

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

(v0.3.3 backport)

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
