# @rchemist/listgrid 소비자(consumer) 실사용 감사 — 공개 API 큐레이션 근거

> **generated-by**: consumer-usage scout (sonnet, 2026-07-11, read-only) — 어떤 리포도 수정하지 않음, 산출물은 본 문서 1개.
> **method**: `/Users/kunner/dev/*/package.json` (+ 모노레포 워크스페이스) 를 `@rchemist/listgrid` 의존성으로 grep → 소비자 리포 확정 → 각 소비자 소스에서 `@rchemist/listgrid`(서브패스 포함) import 파일만 추출 → 그 파일 집합 위에서 `.method(` / `new XField(` / JSX 컴포넌트 태그를 grep-집계 → `packages/schema-core` 및 `src/listgrid/config/**` 실제 소스에서 뽑은 공개 멤버 allowlist(약 200개)로 교차 필터링. `node_modules`/`dist`/`.next`/`.turbo` 전부 제외.
> **caveat**: grep 근사치다 — 문자열 매치이므로 (a) 주석 처리된 호출도 카운트에 섞일 수 있음(예: §5의 `withCheckDuplicate` 는 실제로 비활성 주석), (b) 동명이인 메서드(다른 클래스의 같은 이름)를 구분하지 못함, (c) prop 객체로 전달된 콜백 이름(`props={{ onInitialize: ... }}`)은 `.withOnInitialize(` 패턴에 잡히지 않아 일부 언더카운트 가능. **API 삭제/축소 결정 전에는 반드시 해당 멤버를 직접 재검색해 재확인할 것.**

---

## 0. 요약 (TL;DR)

- **실사용 소비자 5개 제품**, package.json 13곳에서 `@rchemist/listgrid` 의존— 버전은 `^0.2.28` ~ `^0.3.25` (전부 legacy `src/listgrid/config/**` API 세대. `packages/schema-core` v0.4 재설계 API는 **아직 어떤 소비자도 쓸 수 없음** — 구조적으로 0회).
- **GJCU 학사시스템**(gjcu-academic-front)이 압도적 1위 소비자 — listgrid import 파일 951개, 커스텀 도메인 Field 서브클래스 80종+, 라이브러리 공개 API 거의 전 표면을 실사용.
- **후보로 지목됐던 corp-management / cms / corporation / gjcu-old-lms 는 소비자가 아님** — corp-management·cms는 package.json에 의존성 자체가 없고, corporation은 코드 없는 문서 폴더, gjcu-old-lms는 무관한 Java/Spring 레거시(현재 리포와 이름만 유사).
- 사용 멤버(allowlist 200개 중) 116개 실사용, **84개 zero-usage** (§6). 단 그중 5개(`withSubmitTransform`/`getSubmitTransform`/`getFieldGroups`/`getGroupFields`/`setTabHidden`)는 legacy 소스에 없는 **schema-core(v0.4) 전용 신규 API** — "소비자 무관심"이 아니라 "출시 전이라 호출 불가"임을 구분해야 함.
- **가장 창의적/편법적 발견**: edustack이 `UIProvider`의 47개 prop 요구를 자체 주석으로 "XI-D 발견"이라 명명하고 `rcm-listgrid#2` 이슈 해결 시 "폐기 예정"이라고 못박은 래퍼 파일을 유지 중(§6-1). egov-cms는 아예 `listgrid-host`라는 40+ 파일짜리 전용 패키지를 만들어 19개 중복 화면 스캐폴드를 흡수(§6-4). rcm-backend-framework showcase는 peerDependency 12+ 무게 때문에 컴포넌트 레이어 자체를 마운트하지 않기로 **의도적으로 결정**(§6-2).

---

## 1. 소비자 리포 인벤토리 (STEP 1)

| # | 리포 / 워크스페이스 | pin 버전 | listgrid import 파일 수 | 비고 |
|---|---|---|---|---|
| 1 | `gjcu-academic-backend/gjcu-academic-front` (root) | `^0.2.29` | — | GJCU 대학 학사관리 모노레포 루트 |
| 1a | └ `apps/admission` | `^0.2.28` | 951 (모노레포 전체 합산) | 입학 지원 SPA |
| 1b | └ `apps/student` | `^0.2.28` | ″ | 재학생 SPA |
| 1c | └ `apps/admin` | `^0.2.28` | ″ | 행정 admin SPA — `packages/entities/**` 공유 도메인 폼이 파일수 대부분 차지 |
| 2 | `edustack` (모노레포) `frontend/shared` | `*` (workspace, hoist) | 102 | 공유 UI/런타임 래퍼 |
| 2a | └ `lcms/frontend/admin` | `^0.3.22` | ″ | |
| 2b | └ `lcms/frontend/user` | `^0.3.22` | ″ | |
| 2c | └ `lms/frontend/student` | `^0.3.22` | ″ | |
| 2d | └ `lms/frontend/admin` | `^0.3.22` | ″ | |
| 2e | └ `lms/frontend/teacher` | `^0.3.22` | ″ | 6 SPA 중 5곳이 listgrid 직접 사용 |
| 3 | `egov-cms/frontend/apps/tenant-admin` | `^0.3.25` | 78 (모노레포 합산) | 전자정부 CMS, 멀티테넌트 |
| 3a | └ `apps/admin` | `^0.3.25` | ″ | |
| 3b | └ `packages/listgrid-host` | `^0.3.25` (peer+dev) | ″ | **전용 래퍼 패키지** — §6-4 |
| 4 | `project-manager/frontend` | `^0.3.25` | 70 | 내부 PM 툴 |
| 5 | `rcm-backend-framework/showcase/frontend` | `^0.3.2` | 3 | rchemist 자사 백엔드 프레임워크의 wire-format 검증용 showcase (제3자 프로덕션 아님) — §6-2 |

**소비자 아님으로 확인(제외 근거)**:
| 후보 | 확인 결과 |
|---|---|
| `corp-management` | package.json에 `@rchemist/listgrid` 의존성 없음 |
| `cms/frontend` | 〃 |
| `corporation` | 코드 저장소가 아님(회사 문서/회의록 폴더, `.git`은 있으나 소스 없음) |
| `gjcu-old-lms` | Java/Spring MVC 레거시 LMS(`pom.xml`+JSP), Node 프로젝트 아님. package.json은 vendored `swiper` 라이브러리 것 하나뿐. gjcu-academic-front(신규)와는 별개 시스템 |

---

## 2. Evidence Table — 멤버별 총 호출 카운트 (allowlist 교차, 총량 desc)

allowlist는 `packages/schema-core/src/entity-form.ts` + `src/listgrid/config/{EntityForm.tsx,EntityField.ts,form/EntityFormBase.tsx,form/EntityFormActions.tsx,form/EntityFormExtensions.tsx}` + `components/fields/abstract/{FormField,OptionalField,ListableFormField,AbstractDateField,AbstractManyToOneField,CheckButtonValidationField}.tsx` + `config/ListGrid.ts` + `form/SearchForm.ts` 에서 실제 선언부를 grep해 만든 약 200개 공개 멤버 목록.

| 멤버 | 총 | edustack | gjcu | pm | showcase | egov | 대표 예시 (file:line) |
|---|--:|--:|--:|--:|--:|--:|---|
| `withLabel` | 2946 | 805 | 1823 | 25 | 0 | 293 | `edustack/lcms/frontend/admin/lib/forms/brand-asset.ts:39` |
| `withRequired` | 1914 | 447 | 1377 | 3 | 0 | 87 | 〃 |
| `withHidden` | 1184 | 0 | 1169 | 14 | 0 | 1 | `gjcu.../packages/shared/permission/buttonGuard.tsx:44` `button.withHidden(async (props) => {...})` |
| `useListField` | 985 | 0 | 846 | 134 | 0 | 5 | `gjcu.../UserAddressEntityForm.tsx:22` |
| `addFields` | 891 | 93 | 718 | 37 | 0 | 43 | `edustack/lcms/.../brand-asset.ts:37` |
| `getValue` | 802 | 0 | 783 | 19 | 0 | 0 | `gjcu.../PasswordStrength.tsx:62` `entityForm?.getValue(matchFieldName)` |
| `withReadOnly` | 749 | 0 | 710 | 3 | 0 | 36 | `gjcu.../UserAddressEntityForm.tsx:22` |
| `withHelpText` | 512 | 0 | 486 | 3 | 0 | 23 | `gjcu.../RoleEntityForm.tsx:23` |
| `withModifyOnly` | 323 | 0 | 315 | 0 | 0 | 8 | `gjcu.../RoleEntityForm.tsx:22` |
| `withDefaultValue` | 315 | 1 | 313 | 1 | 0 | 0 | `edustack/lms/.../enrollments/page.tsx:30` |
| `withShouldReload` | 224 | 0 | 224 | 0 | 0 | 0 | `gjcu.../RoleEntityForm.tsx:47` |
| `withTitle` | 210 | 0 | 176 | 0 | 0 | 34 | `gjcu.../RoleEntityForm.tsx:17` |
| `getField` | 209 | 1 | 206 | 0 | 0 | 2 | `edustack/lms/.../enrollments/page.tsx:30` |
| `withListConfig` | 199 | 0 | 195 | 4 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:151` |
| `getRenderType` | 197 | 0 | 192 | 1 | 0 | 4 | `gjcu.../RoleEntityForm.tsx:40` |
| `withAddOnly` | 175 | 2 | 147 | 1 | 0 | 25 | `edustack/lms/.../forms/user.ts:49` |
| `withViewPreset` | 172 | 0 | 172 | 0 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:75` |
| `setValue` | 165 | 0 | 156 | 0 | 0 | 9 | `gjcu.../UserEntityForm.tsx:117` |
| `withId` | 160 | 3 | 140 | 15 | 0 | 2 | `edustack/lcms/.../brand-assets/[id]/page.tsx:16` |
| `withReadonly`†† | 148 | 0 | 148 | 0 | 0 | 0 | `gjcu.../RoleEntityForm.tsx:44` `entityForm.withReadonly('name', true)` |
| `withOnInitialize` | 132 | 0 | 132 | 0 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:238` |
| `withOnChanges` | 100 | 0 | 100 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:109` |
| `withMin` | 82 | 0 | 56 | 0 | 0 | 26 | `gjcu.../EvaluationConfigEntityForm.tsx:74` |
| `addCollections` | 73 | 0 | 73 | 0 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:198` |
| `withOptions` | 49 | 0 | 33 | 16 | 0 | 0 | `gjcu.../LectureEvaluationResultImportConfig.ts:16` |
| `withViewHidden` | 41 | 0 | 37 | 0 | 0 | 4 | `gjcu.../GraduationConvergenceEntityForm.tsx:29` |
| `withMax` | 40 | 0 | 40 | 0 | 0 | 0 | `gjcu.../EvaluationConfigEntityForm.tsx:75` |
| `withSearchForm` | 37 | 0 | 37 | 0 | 0 | 0 | `gjcu.../UserView.tsx:444` `new ListGrid(entityForm).withSearchForm(searchForm!)` |
| `getCurrentValue` | 32 | 0 | 31 | 0 | 0 | 1 | `gjcu.../UserAuthorizeField.tsx:105` |
| `withCreatedAndUpdatedAtFields` | 30 | 0 | 30 | 0 | 0 | 0 | `gjcu.../GraduationEntityForm.tsx:104` |
| `withOverrideRenderListItem` | 30 | 0 | 24 | 6 | 0 | 0 | `gjcu.../GraduationMajorEntityForm.tsx:63` |
| `withHideLabel` | 28 | 0 | 28 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:192` |
| `setReadOnly` | 26 | 0 | 26 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:209` |
| `withButtons` | 26 | 0 | 19 | 0 | 0 | 7 | `gjcu.../AdminUserEntityForm.tsx:212` |
| `withRange` | 25 | 0 | 25 | 0 | 0 | 0 | `gjcu.../TuitionEntityForm.tsx:51` |
| `withPageSize` | 25 | 0 | 25 | 0 | 0 | 0 | `gjcu.../PreInquiryTypeField.tsx:96` |
| `withValidations` | 24 | 0 | 24 | 0 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:77` |
| `setFetchedValue` | 23 | 0 | 23 | 0 | 0 | 0 | `gjcu.../SubjectEntityForm.tsx:203` |
| `getName` | 22 | 0 | 21 | 1 | 0 | 0 | `gjcu.../GraduationExcelDownloadButton.tsx:45` |
| `withStatusCreatedAndUpdatedAtField` | 21 | 0 | 21 | 0 | 0 | 0 | `gjcu.../LectureClassEntityForm.tsx:14` |
| `withNeverDelete` | 21 | 0 | 18 | 0 | 0 | 3 | `gjcu.../AbstractScholarship.tsx:278` |
| `withFilter`(SearchForm) | 20 | 1 | 19 | 0 | 0 | 0 | `edustack/lms/.../enrollments/page.tsx:19` `grid.getSearchForm().withFilter('AND', {...})` |
| `isRequired` | 19 | 0 | 19 | 0 | 0 | 0 | `gjcu.../GraduationSimulationField.tsx:181` |
| `getAttributes` | 18 | 0 | 18 | 0 | 0 | 0 | `gjcu.../ConvertToAdmissionFormWrapper.tsx:359` |
| `withLayout` | 17 | 0 | 17 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:278` |
| `withCheckButtonValidation` | 17 | 0 | 17 | 0 | 0 | 0 | `gjcu.../AdminUserEntityForm.tsx:68` |
| `withPage` | 16 | 0 | 16 | 0 | 0 | 0 | `gjcu.../TuitionExportButton.tsx:168` |
| `getSession` | 16 | 0 | 16 | 0 | 0 | 0 | `gjcu.../AdmissionScholarshipEntityForm.tsx:49` |
| `withDataTransferConfig` | 15 | 0 | 15 | 0 | 0 | 0 | `gjcu.../DelayEntityForm.tsx:53` (엑셀 export 필드 매핑 15건 전부 이 패턴) |
| `withPlaceHolder` | 15 | 0 | 14 | 0 | 0 | 1 | `gjcu.../AdminUserEntityForm.tsx:154` |
| `isDirty` | 14 | 0 | 10 | 4 | 0 | 0 | `gjcu.../LectureScoresField.tsx:50` `super.isDirty()` |
| `removeField` | 13 | 0 | 13 | 0 | 0 | 0 | `gjcu.../ConvertToAdmissionFormWrapper.tsx:265` |
| `withOrder` | 11 | 0 | 11 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:406` |
| `withOverrideSubmitData` | 11 | 0 | 10 | 0 | 0 | 1 | `gjcu.../AbstractScholarship.tsx:356` |
| `withListOnly` | 11 | 0 | 5 | 0 | 0 | 6 | `gjcu.../StudentEvaluationAnswerEntityForm.tsx:35` |
| `getFetchedEntity` | 10 | 0 | 10 | 0 | 0 | 0 | `gjcu.../GraduationReviewEntityForm.tsx:169` |
| `withDisplayFunc` | 10 | 0 | 4 | 5 | 0 | 1 | `gjcu.../TuitionScholarshipEntityForm.tsx:59` |
| `withExcludeListFields` | 8 | 0 | 0 | 0 | 0 | 8 | `egov-cms/.../listgrid-host/src/tree-entity-form.ts:101` |
| `withAlertMessages` | 7 | 0 | 7 | 0 | 0 | 0 | `gjcu.../PreInquiryApplicationEntityForm.tsx:196` |
| `getId` | 7 | 0 | 7 | 0 | 0 | 0 | `gjcu.../PreInquiryConsultEntityForm.tsx:99` |
| `withSortable` | 6 | 0 | 6 | 0 | 0 | 0 | `gjcu.../TuitionRefundConfigEntityForm.tsx:27` |
| `withOnFetchData` | 6 | 0 | 6 | 0 | 0 | 0 | `gjcu.../AdmissionContentEntityForm.tsx:210` |
| `withFieldToLayout` | 6 | 0 | 6 | 0 | 0 | 0 | `gjcu.../AdmissionScholarshipCreateModal.tsx:253` |
| `withTooltip` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../UserEntityForm.tsx:411` |
| `withSort`(SearchForm) | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../UniversityFieldModal.tsx:56` |
| `withOverrideRender` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../AdminAdmissionEntityForm.tsx:275` |
| `withLineBreak` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../MajorCurriculumEntityForm.tsx:44` |
| `withFilterable` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../LectureEntityForm.tsx:163` |
| `withComboType` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../etcInfoFields.tsx:106` |
| `getTabFields` | 5 | 0 | 5 | 0 | 0 | 0 | `gjcu.../ApplicationFormLayout.tsx:682` |
| `withSession` | 4 | 0 | 4 | 0 | 0 | 0 | `gjcu.../AdmissionScholarshipEditModal.tsx:110` |
| `withPostSave` | 4 | 0 | 4 | 0 | 0 | 0 | `gjcu.../ConvertToAdmissionFormWrapper.tsx:405` |
| `withOnSave` | 4 | 0 | 4 | 0 | 0 | 0 | `gjcu.../EvaluationConfigEntityForm.tsx:110` |
| `getSaveValue` | 4 | 0 | 4 | 0 | 0 | 0 | `gjcu.../LectureScoresField.tsx:57` |
| `withValue` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../SubjectEntityForm.tsx:325` |
| `withOnPostFetchListData` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../ImpersonationOtpEntityForm.tsx:67` |
| `withCheckButtonLabel` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../PersonalCodeField.ts:38` |
| `useChip` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../AdminAdmissionEntityForm.tsx:272` |
| `removeTabs` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../ContractedStudentEntityForm.tsx:120` |
| `getTabs` | 3 | 0 | 3 | 0 | 0 | 0 | 〃 |
| `getFetchUrl` | 3 | 0 | 3 | 0 | 0 | 0 | `gjcu.../ConvertToAdmissionFormWrapper.tsx:421` |
| `getLabel` | 3 | 0 | 1 | 1 | 0 | 1 | `gjcu.../GraduationExcelDownloadButton.tsx:45` |
| (그 외 34개, 각 1~2회) | ≤2 | | | | | | `withSaveValue`/`withParentId`/`withMenuUrl`/`withMaskedValue`/`withLimit`/`withHeaderArea`/`withCreatedAtField`/`withAttributes`/`isBlank`/`getUrl`/`getTab`/`getFields`/`getFieldGroup`/`getDisplayValue`/`getSearchForm`/`withUrl`/`withTabId`/`withStatusCreatedAtField`/`withSingleFilter`/`withPostDelete`/`withFieldGroupId`/`withCreateStep`/`hasAttribute`/`getListConfig`/`getCollection`/`withCheckDuplicate`(§5, 실제로는 주석 처리돼 사실상 0)/client-extension 8종(§4) |

†† `withReadonly`(소문자 only, **EntityForm** 레벨: `withReadonly(name, bool)`)와 `withReadOnly`(대문자 O, **Field** 레벨: `withReadOnly(bool)`)는 **철자만 다른 별개의 실재 메서드**다. 148 vs 749회 모두 실사용 — 오타 유발 가능성이 높은 네이밍 충돌로 §6-6 참고.

전체 116개 멤버의 원본 카운트는 재현 가능(허용목록·grep 스크립트를 함께 보존하지 않았으므로, 재검증 시 본 문서의 방법론을 그대로 재적용).

---

## 3. 카테고리별 세부 표

### 3-1. Lifecycle hooks

| Hook | 총 호출 | 소비자 |
|---|--:|---|
| `withOnInitialize` | 132 | gjcu만 |
| `withOnChanges` | 100 | gjcu만 |
| `withOnFetchData` | 6 | gjcu만 |
| `withOnPostFetchListData` | 3 | gjcu만 |
| `withOnSave` | 4 | gjcu만 |
| `withPostSave` | 4 | gjcu만 |
| `withPostDelete` | 1 | gjcu만 |
| `withOverrideSubmitData` | 11 | gjcu 10 + egov 1 |
| hook 내부 `setValue`/`setFetchedValue` 패턴 | 165 / 23 | 대부분 `withOnChanges`/`withOnInitialize` 콜백 본문 안 |

→ **lifecycle hook은 사실상 gjcu 전용 기능**이다. edustack/pm/egov/showcase 어디도 `onInitialize`/`onChanges`/`onFetchData`를 직접 호출하지 않음(egov는 `withOverrideSubmitData` 1건만).

### 3-2. Client-extension 시스템 (`withClientPre*`/`withClientPost*`)

소스 실측: `EntityFormExtensions.tsx` 에 정의된 변이는 **10개**(5개 CRUD-유사 지점 × pre/post) — `FetchList`/`Create`/`Read`/`Update`/`Delete`. 작업 지시의 "14 variants" 가정은 실제 소스와 불일치(과대 추정)했음, 수치 정정.

| Extension point | 사용 횟수 | 소비자 |
|---|--:|---|
| `withClientPreFetchList` | 1 | gjcu |
| `withClientPostFetchList` | **0** | — |
| `withClientPreCreate` | 1 | gjcu |
| `withClientPostCreate` | 1 | gjcu |
| `withClientPreRead` | 1 | gjcu |
| `withClientPostRead` | **0** | — |
| `withClientPreUpdate` | 1 | gjcu |
| `withClientPostUpdate` | 1 | gjcu |
| `withClientPreDelete` | 1 | gjcu |
| `withClientPostDelete` | 1 | gjcu |

전 소비자 통틀어 **단 1개 파일**(`gjcu-academic-front/packages/entities/Academic/Admission/applicant/FreshmanEntityForm.ts`, 8개 지점 모두 여기 몰림)만 이 시스템을 사용한다. `PostFetchList`/`PostRead`는 어디서도 안 쓰임 — 10종 중 2종은 zero-usage.

### 3-3. Escape hatch류 (attribute bag / alert / buttons / headerArea)

| 멤버 | 총 | 대표 예 |
|---|--:|---|
| `withAttributes`(entity) | 2 | `gjcu.../BadgeEntityForm.tsx:83` `.withAttributes(new Map([['rows', 10]]))` |
| `getAttributes` | 18 | `gjcu.../ConvertToAdmissionFormWrapper.tsx:359` `bypass = entityForm.getAttributes().get('bypassSyllabusFilter')` — **동적 플래그 저장소로 활용** |
| `hasAttribute` | 1 | `gjcu.../AdmissionStatTotalEntityForm.tsx:253` |
| `withAttribute`(field, 별칭 없음) / `getAttribute` / `addAttributeToField` / `removeAttribute*` | **0** | — |
| `withAlertMessages` | 7 | `gjcu.../PreInquiryApplicationEntityForm.tsx:196` |
| `getAlertMessages` / `removeAlertMessage` | 0 | — |
| `withButtons` | 26 | `gjcu.../AdminUserEntityForm.tsx:212` (버튼 배열을 동적 조립 — 커스텀 permission guard와 결합, §6-3) |
| `withHeaderArea` | 2 | `gjcu.../AdmissionEntityForm.tsx:155` |

→ attribute bag은 "필드별 attribute 세팅"(`addAttributeToField` 등)은 전혀 안 쓰이고 **entity 레벨 attribute map을 임시 플래그/컨텍스트 전달 채널**로만 쓰는 패턴(`getAttributes().get('bypassSyllabusFilter')`)이 우세 — 사실상 "타입 없는 사이드채널"로 전용.

### 3-4. Wizard / Revision / Data-transfer(Excel)

| 멤버 | 총 | 비고 |
|---|--:|---|
| `withCreateStep` | 1 | `gjcu.../ApplicationFormLayout.tsx:688` — 입학지원서 3단계 마법사(유일한 실사용처, `getCreateStep`/`setCreateStep`은 0) |
| `withRevisionEntityName` / `getRevisionEntityName` / `setRevisionEntityNameIfBlank` | **0 / 0 / 0** | revision 기능 자체가 어떤 소비자도 켠 적 없음 |
| `withDataTransferConfig` | 15 | 전부 gjcu — 엑셀 export 필드 매핑(`DataField.create({...})`) 전용, `importable: false` 로 export-only 사용이 압도적(예시 파일 기준) |
| `ExcelPasswordField` / `DataImportResultView` (텍스트 참조) | 15개 파일 | export 버튼 컴포넌트들이 이 이름을 참조(직접 export 로직은 각 버튼이 자체 구현, 라이브러리 컴포넌트를 그대로 마운트하는 곳은 소수) |

### 3-5. List-track / Advanced Search API

| 멤버 | 총 | 비고 |
|---|--:|---|
| `withListConfig` | 199 | 필드별 리스트 표시 설정 |
| `withFilterable`(field) | 5 | `gjcu.../LectureEntityForm.tsx:163` |
| `withSearchForm` | 37 | `new ListGrid(entityForm).withSearchForm(searchForm)` 패턴 |
| `withFilter`(SearchForm) | 20 | |
| `withSort` | 5 | |
| `withPage`/`withPageSize` | 16 / 25 | |
| `getSearchForm` | 1(edustack) | `grid.getSearchForm().withFilter('AND', {...})` — **ListGrid 인스턴스에서 직접 SearchForm을 꺼내 명령형으로 조작** |
| `getListFields` / `getFilterableFields` / `getListableFieldOrder` / `getAdvancedSearchFields` / `withAppendAdvancedSearchFields` | **0 (전부)** | 소비자가 직접 호출하는 사례 없음 — 전부 `ViewListGrid`/`AdvancedSearchForm` 컴포넌트 내부에서만 쓰이는 **프레임워크 내부 배관**으로 추정(컴포넌트 prop 조합만으로 충분해 소비자가 수동 호출할 필요가 없었을 가능성 — zero-usage ≠ 불필요, §6 참고) |

### 3-6. Field 클래스 인스턴스화 (라이브러리 export 클래스만)

`new XField(` 패턴 합산 (5개 소비자 전체):

| 클래스 | 총 인스턴스화 | 최대 소비자 |
|---|--:|---|
| `StringField` | 845 | gjcu 388 |
| `SelectField` | 473 | gjcu 269 |
| `NumberField` | 407 | gjcu 238 |
| `ManyToOneField` | 280 | gjcu 245 |
| `BooleanField` | 213 | gjcu 169 |
| `TextareaField` | 166 | edustack 78 |
| `SubCollectionField` | 65 | gjcu 64 |
| `DateField` | 93 | gjcu 62 |
| `DatetimeField` | 91 | gjcu 48 |
| `XrefMappingField` | 29 | gjcu만 |
| `FileField` / `CustomOptionField` | 23 / 23 | gjcu만 |
| `MarkdownField` | 24 | gjcu 22 + pm 2 |
| `TagField` | 23 | gjcu 21 + pm 2 |
| `PhoneNumberField` | 13 | gjcu만 |
| `PasswordField` | 11 | 3개 소비자에 분산(적지만 폭넓음) |
| `InlineMapField` / `EmailField` / `CardSubCollectionField` | 8 / 9 / 8 | 소수 |
| `ImageField` / `MultiSelectField` / `MonthField` / `HtmlField` | ≤7 | 소수 |
| `YearField` / `XrefPreferMappingField` / `MultipleAssetField` / `MessageViewField` / `ColorField`(3) / `TimeField` / `LinkField` / `InlineSubCollectionField` / `ColorPresetField` | ≤3 | 희귀 |
| **zero**: `MappedJoinField`, `XrefAvailableDateMappingField`, `XrefPriceMappingField`(옵트인 서브패스), `BirthdayField`(1회만, 사실상 zero), `CheckboxField`, `RuleField`, `ContentAssetField`, `TableSubCollectionField`, `RevisionField`(2, 거의 zero), `ProfileField`, `AddressField`/`AddressMapField`(옵트인, 2회만), `TelephoneNumberField`, `QrField`(옵트인) | 0(또는 ≤2) | — |

**커스텀 Field 서브클래스 현상** (§6-5 참고): gjcu-academic-front는 라이브러리 export 클래스 외에 **80개 이상의 자체 도메인 Field 클래스**(`AdmissionTuitionField`, `StudentLicenseField`, `PrideWelcomeField`, `SyllabusCandidateStatDataField` 등)를 `FormField`/`OptionalField`/`ListableFormField`/`AbstractManyToOneField`/`CheckButtonValidationField` 를 상속해 직접 만든다. 라이브러리가 제거한 `UserField`도 `AbstractManyToOneField`를 상속해 자체 재구현(§6-3). → **"추상 Field 확장 API"가 사실상 이 라이브러리의 진짜 핵심 계약**이며, export된 구체 필드 클래스 목록보다 더 중요할 수 있음.

### 3-7. 컴포넌트 사용

| 컴포넌트 | edustack | gjcu | pm | showcase | egov |
|---|--:|--:|--:|--:|--:|
| `ViewEntityForm`(raw) | 18 | 10 | 0 | 0 | 0 |
| `ViewListGrid`(raw) | 12 | 10 | 4 | 0 | 0 |
| `ViewEntityFormWrapper` | 0 | **249** | 17 | 0 | 4 |
| `ViewListGridWrapper` | 0 | **138** | 19 | 0 | **33** |

→ gjcu/pm/egov 3개 소비자 전부 **raw 컴포넌트가 아니라 `*Wrapper` 변형이 압도적 주력**. edustack만 raw를 씀. "실제로 제일 많이 쓰이는 진입점은 `ViewListGridWrapper`/`ViewEntityFormWrapper`"라는 사실은 API 재설계 시 우선순위에 반영할 가치가 있음 — `props={{...}}` 로 옵션을 한 겹 감싸는 현재 Wrapper 시그니처(§2 예시 참고)가 표준 사용법으로 굳어져 있다.

---

## 4. (a) TOP-USED 멤버 — "쉽게 유지해야 할" 필수 집합

총 호출 기준 상위 10 (전부 §2 표에서 발췌):

1. `withLabel` — 2946
2. `withRequired` — 1914
3. `withHidden` — 1184
4. `useListField` — 985
5. `addFields` — 891
6. `getValue` — 802
7. `withReadOnly` — 749
8. `withHelpText` — 512
9. `withModifyOnly` — 323
10. `withDefaultValue` — 315

11~20위(근소): `withShouldReload`(224) · `withTitle`(210) · `getField`(209) · `withListConfig`(199) · `getRenderType`(197) · `withAddOnly`(175) · `withViewPreset`(172) · `setValue`(165) · `withId`(160) · `withReadonly`(148).

이 20개만으로 전체 실사용 호출량(약 12,500회 추정)의 **90% 이상**을 차지한다 — 필드 빌더 체이닝(label/required/readOnly/helpText/defaultValue/hidden) + `useListField`/`addFields` 골격이 이 라이브러리의 "실제 제품"이다.

---

## 5. (b) ZERO-USAGE 멤버 — 삭제/재설계 후보 (84개)

전체 목록(allowlist 200개 중 84개, 5개 소비자 어디서도 호출 0):

```
addAttributeToField, getAdvancedSearchFields, getAlertMessages, getAllClientExtensions,
getAttribute, getCacheKey, getClientExtensions, getCreateStep, getEntityForm,
getFetchedValue, getFieldAttributes, getFieldGroups*, getFilter, getFilterOperator,
getFilterableFields, getFilters, getFiltersByCondition, getGroupFields*, getHelpText,
getIdFieldName, getListFieldAlignType, getListFields, getListableFieldOrder,
getOnChanges, getOnFetchData, getOnInitialize, getOrder, getPage, getPageSize,
getPlaceHolder, getPreservedFilters, getQuickSearchFields, getQuickSearchProperty,
getQuickSearchValue, getRevisionEntityName, getSearchValue, getSearchValueFromAnyCondition,
getSortDirection, getSorts, getSubmitTransform*, getTitle, getViewOrder,
hasClientExtensions, hasConfig, hasField, hasFilters, hasPreservedFilters, hasTab,
isAbleFetch, isFilterable, isFilteredOrSorted, isNeverDelete, isPermitted,
isSessionRequired, isShouldReturnEmpty, isSortable, isSupportList, removeAlertMessage,
removeAttribute, removeAttributeToField, removeFilter, removeTab, setCreateStep,
setRevisionEntityNameIfBlank, setTabHidden*, withAppendAdvancedSearchFields,
withAttribute, withCardIcon, withClientPostFetchList, withClientPostRead,
withFieldGroupConfig, withFilterIgnoreDuplicate, withForm, withIgnoreCache,
withOverrideFetch, withOverrideFetchResult, withOverrideRenderListFilter,
withPreservedFilters, withPreservedOptions, withRequiredPermissions,
withRevisionEntityName, withShouldReturnEmpty, withSubmitTransform*, withViewDetail
```

**중요 주석 — 위 목록을 그대로 "가치 없음"으로 읽으면 안 됨:**

1. `*` 표시 5개(`getFieldGroups`/`getGroupFields`/`getSubmitTransform`/`withSubmitTransform`/`setTabHidden`)는 **legacy `src/listgrid/config/**` 어디에도 없는, `packages/schema-core`(v0.4 재설계)에만 있는 신규 API**다. 소비자는 전부 `^0.2.x`/`^0.3.x`를 pin — 이 버전엔 해당 API가 아예 존재하지 않으므로 **구조적으로 호출 불가능**했을 뿐, "필요 없어서 안 씀"이 아니다. v0.4 GA 이후 재조사 필요.
2. `isPermitted`, `getListFields`, `getFilterableFields`, `getAdvancedSearchFields` 등 다수는 `ViewListGrid`/`ViewEntityForm`/`AdvancedSearchForm` 컴포넌트가 **내부적으로** 호출하는 배관(plumbing)일 가능성이 높다 — 소비자가 컴포넌트에 prop만 넘기면 되므로 수동 호출이 애초에 필요 없는 구조일 수 있음. 이 경우 "소비자 접점에서는 불필요"이지 "라이브러리 내부에서도 불필요"는 아니다.
3. `isPermitted`가 zero인 반면, gjcu는 `withHidden` + 자체 `permissionStore`를 조합한 **자체 permission-guard 유틸리티**(`buttonGuard.tsx`)를 따로 만들어 씀(§3-3, §6-3) — `isPermitted`가 실전에서 원하는 조합(버튼 단위 + 전역 권한 스토어 연동)을 못 주기 때문일 가능성이 있다. 단순 삭제보다 "왜 다들 이걸 우회하는가"를 먼저 물어야 함.
4. `withCheckDuplicate`는 §2 각주대로 **호출 시도 흔적은 있으나 주석 처리되어 비활성**(`StaffEntityForm.tsx:124`) — "써봤는데 포기"에 해당해 zero보다 더 강한 재설계 신호.

---

## 6. (c) 창의적/편법적 사용 패턴 — 누락된 1급 API의 증거

### 6-1. edustack: `UIProvider` 47-prop 문제를 스스로 문서화하고 "폐기 대기 중"이라 명시

`edustack/frontend/shared/src/ui-components.tsx:3-5`:
```
// 5 SPA 공통 minimal UI primitives — `@rchemist/listgrid` 의 UIProvider 가 47 prop 요구 (XI-D 발견).
// sibling Issue rcm-listgrid#2 (default UI 셋 노출) 도착 시 폐기 영역. *zero-styling* primitive —
```
실측 확인: 현재 소스 `src/listgrid/ui/UIProvider.tsx`의 `UIComponents` 인터페이스는 정확히 **47개**의 `ComponentType<any>` 슬롯을 요구(코멘트 수치 그대로 재현됨, 아직 미해결). 소비자가 이 47-prop 계약 전체를 채우기 위해 `stripLibraryProps`(19회 사용, `readonly`→`readOnly`/`placeHolder`→`placeholder` 리네임 포함) 같은 어댑터 레이어를 직접 구현·유지 중이며, 소비자 자신이 이를 "라이브러리가 default UI set을 노출하면 없앨 코드"라고 명시적으로 라벨링했다. → **"headless UI 계약이 너무 큼 + default 구현 미노출"이 명확한 1급 API 공백.**

### 6-2. rcm-backend-framework/showcase: EntityForm/ListGrid 컴포넌트를 아예 마운트하지 않기로 결정

`showcase/frontend/app/admin/articles/page.tsx:8-12`:
```
본 페이지는 listgrid 의 EntityForm / ListGrid 컴포넌트 자체를 마운트하지는 않는다 — listgrid
가 sweetalert2 / react-select 등 12+ peerDependencies 와 결합되어있어 showcase 의 경량
setup 에 강제 import 하면 bundle 폭발. 대신 showcase 는 *동일 wire format* 으로 동작하는
가벼운 admin UI 를 두고, listgrid runtime / api-client / fieldError 처리 패턴을 검증한다
```
`SearchForm.create()` + `PageResult.fetchListData()` (wire-format 레이어)만 가져다 쓰고, React 컴포넌트/필드 빌더 계층은 자체 구현으로 완전히 대체. → **"헤드리스 wire-format-only 서브패스"가 1급으로 분리돼 있지 않다는 신호** — peerDependency 무게(12+) 때문에 컴포넌트를 통째로 피해야 하는 상황 자체가 API 설계 문제.

### 6-3. gjcu: `withHidden` 재래핑으로 자체 permission-guard 시스템 구축 + 제거된 `UserField` 재구현

`gjcu-academic-front/packages/shared/permission/buttonGuard.tsx:33-44`:
```ts
export function applyMutationGuard(button: EntityFormButton, options = {}): EntityFormButton {
  if (options.allowedWhenReadonly) return button;
  const originalHidden = button.hidden;               // private-ish 필드 직접 읽기
  return button.withHidden(async (props) => {
    if (originalHidden && (await originalHidden(props))) return true;
    return usePermissionStore.getState().permission === 'READ';
  });
}
```
버튼의 기존 `hidden` 판정 함수를 꺼내 자체 전역 권한 스토어 조건과 합성하는 방식으로 "권한 인지 버튼"을 수작업 구현 — `isPermitted`(zero-usage, §5-3)가 이 조합을 못 주는 정황.

또한 `packages/entities/User/fields/UserField.tsx`는 라이브러리에서 이미 제거된(`index.ts` 주석: `// UserField removed from this library`) `UserField`를 `AbstractManyToOneField`를 상속해 **완전히 재구현**해 쓰고 있음 — 제거 결정이 실사용 소비자와 조율되지 않았을 가능성.

### 6-4. egov-cms: `@egov-cms/listgrid-host`라는 전용 40+ 파일 래퍼 패키지, 19개 화면 스캐폴드 중복 제거용 셸

`egov-cms/frontend/packages/listgrid-host/src/TenantScopedListGridPage.tsx:1-4`:
```
// T1-DEDUP W6.1 — admin 멀티테넌트 listgrid list-client 공통 셸.
//   19개 admin list-client 가 동일 스캐폴드(테넌트 select → setRcmTenantId → ViewListGridWrapper + EntityForm)를
//   복제하던 것을 하나의 셸로 통합.
```
`ViewListGridWrapper` + `EntityForm` 마운트에 필요한 "테넌트 선택 → X-Tenant-Id 헤더 갱신" 보일러플레이트를 19개 화면이 각자 복붙하고 있었다는 것 자체가, **멀티테넌트 헤더 주입이 컴포넌트 레벨에서 1급으로 지원되지 않는다**는 강한 신호. `listgrid-host` 패키지 전체(`adapters.ts`, `use-form-builder.ts`, `permission-matrix-view.tsx` 등 40여 파일)가 라이브러리와 실제 도메인 코드 사이의 완충 계층 역할을 하고 있다.

### 6-5. gjcu: 직접 property 주입 + `withMin/withMax(undefined as any)` + 필드-타입 위장 캐스팅

- `packages/entities/Academic/Admission/applicant/PartTimeEntityForm.tsx:187`
  ```ts
  (practiceAreaField as any)._filterVersion = Date.now();
  ```
  필드 인스턴스에 언더스코어-프리픽스 비공개 프로퍼티를 직접 주입해 캐시/필터 무효화를 강제 — "필드 재계산을 트리거하는 1급 API"가 없어서 생긴 우회.

- `packages/entities/Academic/Scholarship/AbstractScholarship.tsx:168,259`
  ```ts
  amountField.withMin(undefined as any).withMax(undefined as any);
  ```
  제약을 "해제"하려는 의도인데 `withMin`/`withMax` 시그니처가 `undefined`를 받지 않아 `as any`로 강제 통과 — optional-unset 경로 부재.

- `packages/entities/Academic/Admission/applicant/AdminAdmissionEntityForm.tsx:1062`
  ```ts
  (f as any).withTabId(adminApplicationTab.id).withFieldGroupId(appStatusGroup.id);
  ```
  fluent 체인 중간에 타입이 좁혀져(혹은 유니온 필드 타입이라) `this` 체이닝이 깨지는 지점에서 `as any` 탈출.

- `packages/entities/Academic/Lecture/fields/StudentEvaluationAnswerField.tsx:20`
  ```ts
  super(name, order, 'studentEvaluationAnswer' as any);
  ```
  커스텀 필드 서브클래스 생성자에서 필드-타입 유니온이 닫혀 있어 자기 타입 이름조차 `as any`로 위장해야 통과.

- gjcu 전체 listgrid-touching 파일에서 `as any` **286회**, `@ts-ignore`/`@ts-expect-error` 3회 — 타입 마찰 밀도가 상당히 높음(egov는 4회, 나머지는 0회).

### 6-6. `withReadonly` vs `withReadOnly` 대소문자 충돌

`EntityForm.withReadonly(name, bool)`(148회) 과 `FormField.withReadOnly(bool)`(749회)가 **대문자 O 하나 차이**로 공존 — 둘 다 실사용되는 별개 메서드이며, 오토컴플리트/오타로 잘못된 레벨을 호출해도 타입에러 없이 통과할 위험이 있다(둘 다 `this`/`boolean` 반환).

---

## 7. 참고 — schema-core(v0.4) vs legacy API 세대 구분

이번 감사는 legacy `src/listgrid/config/**` 세대만 관측했다(소비자가 그것만 pin하고 있으므로). `packages/schema-core/src/entity-form.ts` 는 이름이 겹치는 것도 있지만(`withTitle`/`withId`/`addFields`/`getField`/`getFields`/`getTabs` 등) 다른 것도 있다(`withSubmitTransform`/`getSubmitTransform`/`setTabHidden`/`getFieldGroups`/`getGroupFields`, EntityFormExtensions·EntityFormActions에 해당하는 client-extension/버튼/데이터전송 기능은 schema-core에 아직 이식 전으로 보임). **v0.4 공개 API 재설계 시 이 문서의 카운트를 "legacy 세대에서 검증된 실사용 빈도"로 참조하되, schema-core 쪽 기능 커버리지(특히 §3-2·3-3·3-4·3-5의 legacy 전용 기능들이 schema-core에 이식됐는지)를 별도로 대조해야 한다.**
