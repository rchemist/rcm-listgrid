# @rcm/listgrid — 현재 상태

마지막 업데이트: 2026-04-19 (v0.2.0 major bump 구현 완료 — **6 breaking change (A-1 attributes Map<string, unknown>, A-2 headerButtons slot 제거, A-3 InlineSubCollectionField.rowActions deprecated API 제거, B-4 ViewEntityFormTheme deprecated slot 5개 제거, B-5 AlertStyles bg/hoverBg/text 제거, B-6 useAlertManager.getColorIndicator 제거) + CHANGELOG.md v0.2.0 섹션 추가**. Task F (alpha.48) + Task G (alpha.49) 통합 major. any 280 → 278 (−2). tests 900 → 884 (deprecated rowActions/rowActionsConfig 케이스 의도적 삭제, −16). 전 품질 게이트 PASS (type-check / lint / format / build). gjcu overlay type-check **0 errors** (migration 후속 수정 없이 즉시 통과). 배포는 메인 판단 (deploy.sh + v0.2.0 tag + gjcu package.json bump).)

이 문서는 **작업 재개용 단일 진입점**입니다. 아키텍처 결정과 과거 맥락은 `DECISIONS.md`에 있고, 이 문서는 **지금 어디에 있고 다음에 뭘 해야 하는지**만 정리합니다.

---

## 0. 지금 당장 알아야 할 것

**배포된 현재 버전**: `v0.1.0-alpha.47` (gjcu 실측 호환성 보완 — 공개 API export 확장 + Session.getUser optional 화 + SearchForm.handleAndFilter 시그니처 확장). **Task F + Task G + v0.2.0 major bump 통합 배포 대기 중** (메인 판단 예정. v0.2.0 tag 하나로 alpha.48/49 대체).

**이번 세션 성과 (v0.2.0 major bump — 6 breaking + Task F/G 통합 마일스톤)**:
- Phase 1 (A-1 attributes Map<string, unknown>): `EntityField.attributes`, `FormField.attributes`, `FormFieldProps.attributes`, `EntityForm(Base).attributes` + `getAttributes / withAttributes / putAttribute / addAttributeToField / getFieldAttributes / removeAttributeToField` 시그니처 + `ConditionalProps.attributes` (Config.ts). value 타입 `any` → `unknown`. EntityForm.clone Map 리터럴 + FormField.test Map 리터럴 동반. gjcu 실측 영향: `as` cast 이미 자리잡은 관용 + `unknown === 'literal'` 비교 허용 → 0 errors (migration 불필요)
- Phase 2 (A-2 headerButtons slot 제거): `ViewListGridClassNames.headerButtons?` (+ 11 sub-slot) 인터페이스 삭제 + `defaultListGridTheme.headerButtons` 엔트리 삭제. DECISIONS #61 유예 사항 실행 — HeaderActionButtons JSX 가 이미 rcm-button + data-variant primitive 사용
- Phase 3 (A-3 InlineSubCollectionField deprecated 제거): InlineRowActionsConfig interface, inlineRowActions/inlineRowActionsConfig 필드, withRowActions/withRowActionsConfig 메소드, constructor props.rowActions/rowActionsConfig, rowActions → rowActionColumns 변환 로직, InlineSubCollectionViewProps.rowActions/rowActionsConfig 전부 삭제. 관련 테스트 케이스 의도적 삭제 (900 → 884, −16). rowActionColumns / withRowActionColumns / InlineRowActionColumn 만 잔존
- Phase 4 (B-4 ViewEntityFormTheme 5 deprecated slot 제거): TabPanelStyles.container/emptyMessage (→ panel/empty), FieldGroupStyles.headerWrapper/icons/collapseIcon (→ header/actions/collapseToggle). defaultTheme.ts 키 전환. 소비 JSX (ViewFieldGroup.tsx / ViewTabPanel.tsx) 는 이미 new 이름 사용 중
- Phase 5 (B-5 AlertStyles legacy 정리): bg/hoverBg/text 필드 삭제 + getAlertStyles base object `{ className: 'rcm-notice' }` 만 반환. className + dataTone 조합으로 통일
- Phase 6 (B-6 getColorIndicator 제거): useAlertManager 에서 함수 삭제 + ViewEntityFormAlerts.tsx import/JSX 리팩터 (`rcm-alerts-indicator ${getColorIndicator(color)}` → className="rcm-alerts-indicator" data-tone=...)
- Phase 7 (docs + gjcu 실측): CHANGELOG.md v0.2.0 섹션 (BREAKING CHANGES 6 + Task F/G NEW FEATURES + Migration Path). STATUS.md / DECISIONS 업데이트. **gjcu overlay type-check 0 errors** (attributes 호출 패턴 cast 없이도 TS 5.x `unknown === literal` 통과)
- any count: 280 → 278 (−2 표면 grep — `putAttribute value: any` + `addAttributeToField value: any` → `unknown`. Map<string, any> → Map<string, unknown> 변환은 grep 패턴과 불일치)
- 전 품질 게이트 PASS: type-check / 884 tests + 1 todo / lint 0 errors / format:check / build
- commits: `a723e4b` (A-1), `5a1450c` (A-2), `7290aaf` (A-3), `96a58bc` (B-4), `973419e` (B-5), `6bc8aac` (B-6)
- **gjcu 수정 없음** (uncommitted 변경 0, migration 불필요)
- 주의: package.json version bump 는 실행하지 않음 — 배포 시 deploy.sh 가 처리

**이전 세션 성과 (v0.3 Task G 세션 2 — parse<T=unknown> + ViewRenderProps<TForm> 제네릭화)**:
- Phase 1 (parse foundation + jsonUtils 일원화):
  - `misc/index.ts:298` `parse(str): any` → `parse<T = unknown>(str): T` 승격 (primary). 기본값 unknown 으로 호출자 opt-in narrow
  - `utils/jsonUtils.ts:88` duplicate `parse` 구현 제거, `export { parse } from '../misc'` re-export 로 축소 — 기존 import 경로 100% 호환 유지
  - misc 내부 storage helper 4 호출처 narrow: `getLocalStorageItem` / `getSessionStorageItem` 의 spread 엣지는 `parse<{value, expiry?}>`, `getLocalStorageObject` / `getSessionStorageObject` 는 `parse<T>` 간결화 (`as T` 제거)
- Phase 2 (parse 내부 소비자 narrow, 11 개소):
  - `config/EntityForm.tsx:741` / `config/EntityFormMethod.ts:102` / `components/fields/SelectFieldRenderer.tsx:285`: `parse<{ error?: unknown } & Record<string, unknown>>(response.error)` 에러 파싱
  - `components/list/hooks/useListGridLogic.ts:162`: `parse<{ error: { message?, fieldError? } }>(message)` 스키마 narrow
  - `config/AdvancedSearchOpenCache.ts:14` / `config/ListGridViewFieldCache.ts:16`: `parse<{ data: Record<string, ...> }>(value)` 캐시 스키마 narrow
  - `components/form/ui/buttons/DeleteButton.tsx:131`: `parse<{ error?: unknown }>(error)` narrow
  - `components/fields/rule/Type.ts:38`: `parse(data) as RuleConditionValue` → `parse<RuleConditionValue>(data)` 간결화
  - `form/SearchForm.ts:311`: `parse<Record<string, unknown>>(data)` — createByObject 시그니처 맞춤
- Phase 3 (ViewRenderProps / ViewValueProps 제네릭화):
  - `components/fields/abstract/FormField.tsx`: `ViewRenderProps<TForm extends object = any>` (item: TForm, entityForm?: EntityForm<TForm>, compact? 유지). `renderViewInstance(props: ViewRenderProps<TForm>)` / `viewValue(props: ViewRenderProps<TForm>)` 시그니처에 TForm 전파. 내부 `props.item[this.name]` 접근은 `(props.item as Record<string, unknown>)[this.name]` narrow — TForm default any 호환 유지하면서 명시 TForm 일 때 타입-안전
  - `config/EntityField.ts`: `ViewValueProps<TForm extends object = any>` (item: TForm, entityForm?: EntityForm<TForm>) + **`compact?: boolean` 추가** — CardFieldSection/CardFieldRenderer 가 이미 `compact: true` 를 넘기던 선행 버그 fix (DECISIONS #74)
- Phase 4 (concrete 필드 무수정 호환 검증): 9 서브클래스 (StringField / NumberField / SelectField / BooleanField / DateField / HtmlField / ManyToOneField / ListableFormField / abstract/index 재export) 의 `renderViewInstance(props: ViewRenderProps)` bare 오버라이드 무수정 (ViewRenderProps<any> 해석으로 TForm=any default 전파)
- any count (표면 grep `: any` src 내 비테스트): 284 → 280 (−4). 4 감축 위치: `misc/parse`, `jsonUtils/parse`, `ViewRenderProps.item`, `ViewValueProps.item`. 논리적 narrow 효과는 호출처 11 + renderViewInstance TForm opt-in (33+ 서브클래스 가능) 범위에서 축적
- gjcu-academic-front overlay type-check: **0 errors 유지** (baseline alpha.47 대비 회귀 0). parse default 변경 (`any` → `unknown`) 의 실측 영향 0 — gjcu 에 `parse(json).foo` 같은 직접 dereference 패턴 없음
- 소비자 영향: 타입 레벨 semi-breaking (parse default 변경) — 런타임 무변경. ViewRenderProps/ViewValueProps 는 default = any 로 backward-compat. 소비자 마이그레이션 경로: `parse<T>(...)` 또는 `as T` 캐스트
- 모든 품질 게이트 PASS: type-check / 900 tests + 1 todo / lint 0 errors / format / build
- commits: `a5fdb91` (Phase 1), `4ef46b6` (Phase 2), `65cf8ba` (Phase 3)

**이전 세션 성과 (v0.3 Task F 세션 2 — FieldRenderParameters<T, TValue> 제네릭 전파)**:
- Phase 1 (foundation, `config/EntityField.ts`): 3 인터페이스 제네릭화
  - `FieldRenderParameters<T extends object = any, TValue = any>`: `entityForm: EntityForm<T>`, `onChange: (value: TValue, propagation?) => void`, `updateEntityForm?` 콜백 `EntityForm<T>` 전파
  - `FilterRenderParameters<T extends object = any, TValue = any>`: `entityForm: EntityForm<T>`, `onChange: (value: TValue, op?) => void`, `value?: Promise<TValue>`
  - `FieldInfoParameters<T extends object = any>`: `entityForm?: EntityForm<T> | undefined`
  - `EntityField` 인터페이스 무수정 (default = any 자동 호환)
- Phase 2 (FormField chain): 6 abstract (FormField / ListableFormField / OptionalField / MultipleOptionalField / CheckButtonValidationField / AbstractManyToOneField / AbstractDateField) 의 render / filter / info 메소드 시그니처 `<TForm, TValue>` 전파
  - FormField: `renderInstance` / `render` / `view` / `overrideRender` / `withOverrideRender` + `isRequired` / `isHidden` / `isReadonly` / `getPlaceHolder` / `getTooltip` / `getHelpText` + `toConditionalValue` 헬퍼 / `validate` 내부 infoParams
  - ListableFormField: `renderListFilter` / `renderListFilterInstance` / `renderListFilterOriginal` / `viewListFilter` / `overrideRenderListFilter` / `withOverrideRenderListFilter`
  - CheckButtonValidationField: `renderCheckButtonValidationField` / `isRequired` 전파 + `onValid/onClear` 내부 `params.onChange(value as TValue)` 명시 캐스트 (string → TValue)
  - AbstractManyToOneField / AbstractDateField: 독자 render 메소드 없음 — 수정 불필요
- Phase 3 (concrete 필드 검증): 33+ concrete 필드 서브클래스 `renderInstance(params: FieldRenderParameters)` 전부 default = any 경로로 **무수정 동작** 확인 (type-check PASS)
- Phase 4 (helper 전파): `FieldRendererHelper.getInputRendererParameters` 를 제네릭 함수 `<TForm = any, TValue = any>(field: FormField<any, TValue, TForm>, params: FieldRenderParameters<TForm, TValue>)` 로 승격. `FieldRenderer` / `ViewEntityForm` / `RuleFieldRenderer` 무수정 (설계 § 2.7 / § 5.4)
- any count (표면 grep): 286 → 284 (−2). 실질적 narrow 효과는 간접적 (renderInstance 내부 params.onChange 가 TValue 로 narrow, params.entityForm 이 EntityForm<TForm> 으로 narrow)
- gjcu-academic-front overlay type-check: **0 errors 유지** (baseline alpha.47 대비 회귀 0)
- 소비자 영향: breaking 0. default `= any` 경로로 모든 기존 소비자 무수정 호환. Opt-in narrow 기회 제공 (`renderInstance(params: FieldRenderParameters<Post, string>)` 패턴)
- 모든 품질 게이트 PASS: type-check / 900 tests + 1 todo / lint 0 errors / format / build
- commits: `d6831f9` (Phase 1), `5bed342` (Phase 2), `b0d63b7` (Phase 4)

**이전 세션 성과 (v0.3 Task E 세션 3 — alpha.46/47 배포 + gjcu 실측 0 errors)**:
- **alpha.46 배포 + 회귀 검증** (release commit `5ab160e`, tag `v0.1.0-alpha.46`):
  - gjcu-academic-front 에 dist overlay → `apps/admin` type-check. alpha.45 / alpha.46 둘 다 760 errors, **고유 위치 diff = 0** (Task E 로 인한 peer 회귀 0 확인). 차이 39 건은 TS compiler 의 에러 메시지 포맷 변화만 (`FormFieldProps` → `FormFieldProps<any, any>`)
  - 결론: Task E 설계 § 3.3 "무수정 호환" 전제 실측 통과. 760 errors 는 alpha.45 부터 있던 선행 상태
- **gjcu 760 에러 분류**:
  - 41 `TS2305 has no exported member` (FormFieldProps 39 + ViewEntityFormClassNames 2)
  - 25 `TS2307 Cannot find module` (gjcu 의 packages/ui/listgrid 디렉토리 삭제된 후 상대경로 `../listgrid/*` 가 남음 — swap 브랜치 미완)
  - 3 `TS2724 Did you mean` (XrefMappingValue / AbstractManyToOneFieldProps)
  - 나머지는 위 누락의 연쇄 (TS2339/TS2322/TS2345)
- **양방향 수정으로 0 errors 달성 → alpha.47 배포** (release tag `v0.1.0-alpha.47`):
  - 라이브러리: `index.ts` 공개 API 확장 (FormFieldProps / SearchForm / PageResult / XrefMappingValue / ViewEntityFormClassNames 등 wildcard + 명시 export), `auth/types.ts` Session.getUser optional 화 + 호출부 3 건 옵셔널 체이닝, `form/SearchForm.ts` handleAndFilter 에 `number[] | boolean[]` 허용
  - gjcu (별도 repo, uncommitted — 유저 확인 후 커밋): 상대경로 치환 21 파일 + SearchForm/Type barrel 단순화 + apps/admin 2 파일 + `.getUser?.()` 7 파일 + 개별 타입 fix 4 파일
- **gjcu main merge**: 작업 중 origin/main 4 commits 를 swap 브랜치에 merge (local `871effbd`). conflict 1 건 (`SemesterEntityForm.tsx` import 경로) 은 swap 쪽 `@rcm/listgrid` 채택으로 해결. `f55acc88` (PasswordStrength focus 유실 fix) 은 gjcu UIProvider 내부 구현만 — 라이브러리 반영 불필요
- 모든 품질 게이트 PASS: type-check PASS, 900 tests PASS, lint 0 errors, build PASS, gjcu type-check 0 errors

**이전 세션 성과 (v0.3 Task E 세션 2 — Generic refactor 구현)**:
- Phase 1 (foundation): `FieldValue<TValue = any>`, `ModifyEntityFormFunc<T = any>` / `ModifyFetchedEntityFormFunc<T>` / `OnInitializeFunc<T>` 제네릭화
- Phase 2 (abstract chain): EntityFormBase → Validation → Data → Actions → Extensions → EntityForm 6 클래스에 `<T extends object = any>` 전파. clone/cloneWithEntityForm/merge 반환타입 `EntityForm<T>` 로 승격. onChanges/onFetchData/onInitialize/onSave/postDelete/overrideFetchData/buttons/headerArea 등 callback 시그니처 `EntityForm<T>` 승격
- Phase 3 (keyof T overloads): getField / getValue / setValue / changeValue / setFetchedValue 에 `<K extends keyof T & string>` overload 추가. 구체→일반 순서로 유지해 T=any 일 때 기존 string 경로 그대로 매칭
- Phase 4 (FormField chain): F-bounded 셀프 타입 `T` → `TSelf` 로 rename + `TValue = any, TForm extends object = any` append. 6 abstract (FormField / ListableFormField / OptionalField / MultipleOptionalField / CheckButtonValidationField / AbstractManyToOneField / AbstractDateField) 동일 패턴. 33+ concrete 서브클래스 무수정 호환. FormFieldProps/displayFunc/saveValue/maskedValueFunc/getCurrentValue/getSaveValue/getFetchedValue 반환타입 `TValue | undefined` 로 승격
- Phase 4b (추가 승격): fetchedEntity / getFetchedEntity / getValues / initialize fetchedEntity 지역변수 `T` 로 승격
- 소비자 영향 0 (default all `= any`, 런타임 동일)
- 모든 품질 게이트 PASS: type-check / 900+1 tests / lint 0 errors / format:check / build
- commits: `a0af52e` (Phase 1-2), `4d6cfec` (Phase 3), `72f303b` (Phase 4), `0da1b68` (Phase 4b)

**이전 세션 성과 (v0.3 Task E 세션 1 — Generic refactor 설계)**:
- `docs/GENERIC_DESIGN.md` 작성 (11 섹션, 세션 2 구현용 단일 진입점)
- 핵심 결정:
  - `EntityForm<T extends object = any>` — 키 narrowing (`getValue<K extends keyof T & string>(name: K): Promise<T[K]>`). 기본값 any 로 `new EntityForm(...)` 무수정 호환
  - `FormField` 의 기존 F-bounded 셀프 타입을 `TSelf` 로 rename + `TValue = any, TForm extends object = any` append. 33+ concrete 서브클래스 무수정
  - `FieldValue<TValue = any>` — current/fetched/default 승격
  - Inheritance chain (EntityFormBase → ... → EntityForm 6 클래스) 전부 `<T>` 전파
  - `FieldRenderParameters<T, TValue>` 는 phase 2 (세션 2 스코프 외 — UI 컴포넌트 층 영향 폭증)
  - UIProvider `ComponentType<any>` 유지 (의도된 any, DECISIONS #21)
- gjcu 호스트 사용 패턴 측정: `new EntityForm(...)` 13 개소, `extends FormField<Self>` 1 개소 (RelatedMemoField), `entityForm.getValue('x')` 10+ 개소, cast 패턴 1 개소. **무수정 컴파일 예상**
- 예상 any 감축: 306 → ~200~230 (승격 가능 70~90 건 목록화). UIProvider wrapper / parse() / attributes 는 유지
- Breaking change 판정: 타입/런타임 모두 호환. **alpha.46 minor bump 권고**. v0.2.0 major 불필요
- 구현은 **세션 2** (1 에이전트로 충분. 5 phase 순서 엄수)

**이전 세션 성과 (v0.3 Task D — exactOpt 승격)**:
- `exactOptionalPropertyTypes: true` 승격. 430 errors → 0 (3 병렬 에이전트 + 1 재개)
  - D-1 (config/transfer/form): 151 → 0. EntityForm 29, InlineSubCollectionField 18, SubCollectionField 15, EntityFormBase 14, transfer/Type 17 등
  - D-2 (components/fields): 190 → 0 (2 분할: 101 + 89). FormField 25, SelectField 14, OptionalField 12, ManyToOneField 11 등 + abstract/ 베이스 + Xref/Address/ContentAsset 계열
  - D-3 (list+form+revision+validations+ui+adapters): 89 → 0. ViewListGrid, FieldRenderer, useEntityFormLogic 등
- 수정 패턴: TS2412 (201) — interface 옵셔널 필드에 `| undefined` 명시 / TS2375 (122) — 객체 리터럴 undefined 제거 또는 조건부 스프레드 / TS2379 (94) — 함수 인자 undefined 제거 / TS2532 (8) — narrow
- 의도된 any (DECISIONS #21/#65/Task E 대상) 는 유지. ComponentType<any> wrapper, entity 스키마 any 는 Task E generic refactor 에서 해소
- tsconfig strict 옵션 **5/5 전부 true**: strict + noImplicitAny + noImplicitReturns + noFallthroughCasesInSwitch + noUncheckedIndexedAccess + exactOptionalPropertyTypes
- 116 파일 수정 (타입 annotation only, 런타임 동작 무변경). 3 commit 블록 (D-1/D-2/D-3) + meta commit
- 모든 품질 게이트 PASS (type-check / test 900+1 / lint 0 errs / format:check / coverage 17.13% / build)

**이전 세션 성과 (v0.3 Task C — coverage 상향)**:
- **테스트**: 375 → **900 passing** + 1 todo (525 개 추가, 43 files, 3 병렬 에이전트)
  - C-1 (config/): 164 tests (Config 55, OnChangeEntityForm 22, EntityFormMethod 23, EntityTab 15, EntityFieldGroup 13 등 9 파일)
  - C-2 (form/misc/store/message/menu/router/urlState): 202 tests (misc 70, SearchForm 69, store 17, 나머지 6 영역)
  - C-3 (components/fields/abstract/): 159 tests + 1 todo (FormField 68, ListableFormField 28, OptionalField 28 등)
- **Coverage**: 8.1% → **16.9%** statements / 6.46% → 14.98% branches / 6.46% → 17.97% functions / 8.19% → 16.81% lines
  - config: 11.7% → **34.22%**
  - form: 6.97% → **94.5%** (SearchForm 96.4%)
  - misc: 6.78% → **92.4%**
  - fields/abstract: 1.18% → **60.86%**
  - store, menu, router, urlState: **100%**
- **vitest.config.ts thresholds** 상향: 8/6/6/8 → **16/14/17/16** (baseline 바로 아래)
- 모든 품질 게이트 PASS (lint 0 errors, type-check PASS, format:check 통과)

**이전 세션 (alpha.45 + 후속 정비) 성과 요약**:
- 테스트 포팅 (33 → 133), utils/common 유닛 242 추가 (→ 375), strict 옵션 4 개 승격 (noImplicitAny/Returns/Fallthrough/UncheckedIndexedAccess), ESLint v10 flat config, Prettier CI 강제, coverage 임계치 (8/6/6/8)
- 미승격: `exactOptionalPropertyTypes` (430 errs, v0.3 Task D)

**다음 세션 후보 (v0.3 잔여)**:
- **alpha.48 배포**: Task F 구현 완료 (minor bump 권고, 설계 § 6.3). 메인 판단 후 배포 (deploy.sh + gjcu package.json bump)
- **gjcu 커밋 확인**: experiment/rcm-listgrid-swap 브랜치에 uncommitted 변경 다수 (상대경로 swap 완성 + 라이브러리 변경 대응). 유저 검토 후 커밋
- **Task G 후보**: `parse()` → `unknown` 전환 (런타임 검증 도구 결합 시 의미) / `attributes: Map<string, any>` → `Map<string, unknown>` (v0.2.0 major bump 후보) / ViewRenderProps / ViewListProps 제네릭화
- **gjcu 장기 cleanup**: `packages/ui/form/SearchForm.ts` 재export barrel 삭제 (host 가 `@rcm/listgrid` 직접 import), `packages/ui/api/types/ResponseData.ts` 중복 정리
- 시각 회귀 수동 검증 + Playwright 스냅샷 regression suite (DECISIONS #63 권고)

**alpha.37~40 하이라이트**:
- alpha.37: ManyToOneView 찾기 버튼 색상 + SearchBarActions 우측 정렬 fix
- alpha.38: `--rcm-color-secondary` (#805dca 보라) 토큰 추가 + ManyToOne addon 전용 rcm-* 클래스 + modal searchbar 레이아웃 fix
- alpha.39: AdvancedSearch 그리드를 container query 로 전환 (모달 2 cols cap, 풀스크린 3 cols)
- alpha.40: **Tailwind/gjcu-custom 하드코딩 전량 제거** — 3 병렬 에이전트로 list/form/fields 블록 분담, 메인이 fallback 정리. 최종 grep 검증 0건.

**CSS 최종 파일 구조** (alpha.36):
- `tokens.css` 110줄 (디자인 토큰)
- `primitives.css` 1,259줄 (22 primitive + data-attr)
- `layouts.css` 2,912줄 (구조적 composite, 377 classes) **신규**
- `components.css` 1,386줄 (component-specific 최소, 190 classes) **신규**
- `base.css` 100줄 (root/utilities/reset, 15 classes) **대폭 축소**
- 합계 5,767줄 (alpha.28 시점 ~6,200줄 대비 정돈됨, base.css 단독은 4,960 → 100)

**다음 작업**: **시각 수동 검증 필요** — HTTP 303 만으로는 시각 회귀 검출 불가. gjcu-experiment dev 서버 `localhost:9261` 에서 직접 확인:
- CardManyToOneView (alpha.35 이전과 selected/default/hover 정확도)
- RevisionField diff-indicator (warning 도트 변경됨)
- FieldSelector chip selected 색 강도
- AlertItem external link underline
- button variant (save/delete/list/close) 시각 일관성

회귀 발견 시 해당 commit 만 선택적 rollback 가능 (commit 구조: Phase 6 aggregate / Phase 7 split / Phase 8 theme 독립).

**설계 문서 3종 (다음 세션 시작 시 이것부터 읽기)**:
- `docs/REFACTOR_CURRENT_STATE.md` — 현재 CSS 인벤토리 + 문제 진단
- `docs/REFACTOR_DESIGN.md` — primitive 22종 + variant 규약 + 호스트 override 계약
- `docs/REFACTOR_PLAN.md` — Phase 0~9 단계별 계획 + **§ 다음 세션 시작 프롬프트** (맨 아래)

**alpha.20~27 세션 요약**: 라이브러리 JSX 내 Tailwind 하드코딩 413줄 → 0줄. `defaultTheme.ts` 전면 비움 (중복 클래스 적용 제거). 필드그룹 라벨/required 아이콘/탭 글자 색상/패널 좌우 패딩 등 시각 회귀 다수 수정. 하지만 그 과정에서 만들어진 627개 클래스가 다음 리팩터 대상.

---

## 1. 프로젝트 개요

**목표**: 납품 프로젝트(gjcu-academic-front)의 `packages/ui/listgrid/`를 다른 프로젝트에서도 쓸 수 있는 범용 라이브러리 `@rcm/listgrid`로 추출.

**핵심 원칙 (재확인)**:
- React 전용 (Vue/Svelte 지원 안 함)
- Next.js는 선택적 (어댑터로 분리)
- **UI 프레임워크 독립** — 라이브러리 JSX는 Tailwind utility 쓰지 않음. `rcm-*` scoped 클래스 전용.
- 호스트는 `@rcm/listgrid/styles.css` 한 줄 import로 완전 동작. Tailwind 설치/설정 필수 아님.
- 브랜드 override는 CSS 변수 (`--rcm-color-primary` 등)

---

## 2. 리포지토리 / 워크트리 구조

| 역할 | 경로 | 브랜치 |
|---|---|---|
| **라이브러리 소스** | `~/dev/rcm-listgrid` | `main` |
| **릴리즈 repo** | `~/dev/rchemist-rcm-listgrid-release` | `main` |
| **private 저장소** | github.com/rchemist/rcm-listgrid | `main` |
| **실험용 호스트** | `~/IdeaProjects/gjcu-experiment/gjcu-academic-front` | `experiment/rcm-listgrid-swap` |
| **원본 참조** | `~/IdeaProjects/gjcu-academic-backend/gjcu-academic-front` | 수정 금지 |

**실험 워크트리 dev 서버**: `localhost:9261` (env.local의 PORT=9261)

**로그인**: admin / Asdf4567!@#$ (메모리의 `reference_gjcu_dev_credentials.md`)

---

## 3. 배포 이력

| 버전 | 내용 | 현재 상태 |
|---|---|---|
| 0.1.0-alpha.15 | rcm-* 작업 진행 중, 필드그룹 타이틀/라벨/helpText 등 교체 완료 | 직전 안정 |
| 0.1.0-alpha.16 | ❌ Tailwind CLI 시도 — 호스트 CSS 전부 깨먹음 | revert됨 |
| 0.1.0-alpha.17 | ❌ Tailwind utilities-only — cascade 충돌 여전, login 페이지 레이아웃 깨짐 | revert됨 |
| 0.1.0-alpha.18 | revert: Tailwind CLI 제거, alpha.15 상태로 복귀 | 안정 |
| 0.1.0-alpha.19 | Top offender rank 1,2: TableSubCollectionView + CardSubCollectionView rcm-subcollection-* 전환 | ✅ 안정 |
| 0.1.0-alpha.20~27 | 라이브러리 JSX Tailwind 하드코딩 413줄 → 0줄. defaultTheme 전면 비움. 필드그룹/required/탭 등 회귀 수정 | ✅ 안정 |
| 0.1.0-alpha.28 | CSS 리팩터 Phase 1 — `styles/primitives.css` 신규 (~1,250줄, 22 primitive + data-attr variants). JSX/TS 무변경. dormant | ✅ 안정 |
| 0.1.0-alpha.29 | CSS 리팩터 Phase 2 — Button / Icon-button JSX 를 data-attr primitive 로 전환. 18 파일 | ✅ 안정 |
| 0.1.0-alpha.30 | CSS 리팩터 Phase 3 — Input/Textarea/Select JSX → primitive | ✅ 안정 |
| 0.1.0-alpha.31 | CSS 리팩터 Phase 4 부분 — icon-frame + notice JSX 전환 | ✅ 안정 |
| 0.1.0-alpha.32 | CSS 리팩터 Phase 5 부분 — ViewTab data-state 전환 | ✅ 안정 |
| 0.1.0-alpha.33 | CSS 리팩터 Phase 6 1차 — dead CSS 삭제. base.css 4,960 → 4,896 (−64) | ✅ 안정 |
| 0.1.0-alpha.34 | CSS 리팩터 Phase 6 2차 — icon-btn 전환 묶음 (FilterDropdown/AlertItem/Alerts/PhoneNumber/Copy) | ✅ 안정 |
| 0.1.0-alpha.35 | CSS 리팩터 Phase 6 3차 — ContentAssetItem remove 버튼 → rcm-icon-btn data-color="error". RevisionField badges/chips → rcm-badge + rcm-tag data-color. base.css ~4,780 → ~4,740 | ✅ 안정 |
| 0.1.0-alpha.36 | 한 턴 대규모 완료 — Phase 6 잔여 8 블록 병렬 + Phase 7 파일 분리 + Phase 8 theme cleanup | ✅ 안정 |
| 0.1.0-alpha.37 | 시각 회귀 1차 fix — ManyToOneView 찾기 버튼 색/크기 + SearchBarActions 우측 정렬 | ✅ 안정 |
| 0.1.0-alpha.38 | 시각 회귀 2차 fix — --rcm-color-secondary 토큰 (#805dca 보라) + ManyToOne addon 재구현 + modal searchbar 레이아웃 | ✅ 안정 |
| 0.1.0-alpha.39 | AdvancedSearch 그리드 container query 전환 (모달 2 cols cap) | ✅ 안정 |
| 0.1.0-alpha.40 | **framework-free 달성** — JSX 잔여 Tailwind/gjcu-custom 하드코딩 전량 제거. 3 병렬 에이전트 (list/form/fields). 최종 grep 0건. 신규 rcm-* 규칙 ~30개 추가. | ✅ 안정 |
| 0.1.0-alpha.41 | rcm-button:disabled 를 opacity 기반으로 변경 (variant 색 유지) | ✅ 안정 |
| 0.1.0-alpha.42 | components.css 의 중복 .rcm-button 블록 제거 — primitives 단일 소스 | ✅ 안정 |
| 0.1.0-alpha.43 | CSS 중복 3 개 제거 + indigo 토큰화 + 다크 모드 토큰 + docs/PRIMITIVES.md (272줄) | ✅ 안정 |
| 0.1.0-alpha.44 | **OSS 공개 준비 완료** — Apache-2 LICENSE, vitest/@testing-library 설치 + 33 tests pass + jest→vi 포팅, GitHub Actions CI (type-check/lint/test/build/dist 검증), ESLint + Prettier 구성, 소비자용 README 재작성 + 내부 로드맵은 docs/ROADMAP.md 로 분리, console.log/debug 69 → 9, @ts-ignore 3 → 0, 루트 아티팩트 정리 + gitignore 보강, package.json license/private/description/keywords 정리. | ✅ 안정 |
| **0.1.0-alpha.45** | **v0.2 backlog 소진** — (1) 테스트 포팅 5 파일 완성 (33 → 133 tests pass, vitest.config.ts exclude 0) (2) `any` 정리 459 → 328 (B-1/B-2/B-3 3 병렬 에이전트, 영역별 분담) (3) `tsconfig.json` `noImplicitAny: true` 승격 + 40 개 TS7006/TS7031 에러 수정 (20 파일). 블록별 commit 분리 (test / refactor-any / feat-types / bump). | ✅ **현재 설치 대상** |

---

## 4. 이미 완료된 rcm-* 전환 (유지되어 있음)

### 테마 파일 (중립화 완료)
- `src/listgrid/components/list/themes/defaultListGridTheme.ts` — ListGrid 기본 테마 전면 rcm-*
- `src/listgrid/components/list/themes/variants/{main,modal,subCollection}Theme.ts` — variant 3종
- `src/listgrid/components/form/themes/defaultTheme.ts` — EntityForm 기본 테마

### 개별 컴포넌트 완료
- `InlineSubCollectionField` / `CardSubCollectionField` / `TableSubCollectionField` 로딩 스피너
- `DataExporter` / `ExcelPasswordField` / `DynamicDataImporter`
- `ViewEntityFormSkeleton` / `ViewListGridSkeleton` (rcm-skeleton 시스템)
- `ViewFieldGroup` 타이틀/description/collapse
- `FieldRenderer` 라벨/required/dirty/tooltip/value
- `ViewHelpText` / `ViewHelpIcon` / `ViewFieldError`
- `ViewEntityFormButtons` 우측 정렬
- `ViewEntityForm` panel 구조 (rcm-form-panel/inner)
- `PhoneNumberFieldView` copy/SMS 버튼
- `SaveButton` / `DeleteButton` / `ListButton` / `ClosePopupButton` 스타일

### CSS 시스템 완성
- `src/listgrid/styles/tokens.css` — 디자인 토큰 (색/폰트/간격/radius/shadow/z-index)
- `src/listgrid/styles/primitives.css` — **alpha.28 신규** — 22 primitive + data-attr variants (~1,253줄, dormant)
- `src/listgrid/styles/base.css` — scoped `rcm-*` 클래스 + @layer 제거 + form/fieldgroup/tab/notice/skeleton/button/input-group 등 (4,960줄, Phase 6~7 에서 대폭 슬림화 예정)
- `utils/classNames.ts` — mergeSlot/resolveSlots 헬퍼

### CSS 리팩터 진행 (docs/REFACTOR_*.md)
- ✅ Phase 0 — Phase 0 의 4개 결정 확정 (icon size xs=12/sm=14/md=16/lg=20/xl=24 ; `rcm-input-group` 과 `rcm-button-group` 둘 다 primitive 유지 ; Skeleton primitive + subcollection 쉘 layouts.css 분리 ; breakpoint 768 주 사용)
- ✅ Phase 1 (alpha.28) — `primitives.css` 작성 + `index.css` 에 import + `build:styles` 에 concat 추가. JSX 한 줄도 변경 없음. 기존 base.css 와 선택자 중복 시 cat 순서(tokens → primitives → base) 상 base 가 이기도록 설계 → 시각 회귀 없음.
- ✅ Phase 2 (alpha.29) — 18 JSX 파일의 `rcm-button-{primary,outline,outline-danger,danger,secondary,sm,icon}` → `rcm-button data-variant=... data-color=... data-size=...` 전환. `rcm-card-item-action-btn*` → `rcm-icon-btn data-size="sm" data-color="error"`. 테마 파일은 Phase 8 유예.
- ✅ Phase 3 (alpha.30) — JSX 의 `rcm-field-input` / `rcm-field-select` / `rcm-field-textarea` / `rcm-quick-search-input` → `rcm-input` / `rcm-select` / `rcm-textarea` primitive. 5 파일. primitives.css `rcm-input/textarea/select` 디폴트 font-size → sm, focus border-color → primary (현재 시각에 맞춤). Input group 내부 버튼 (addon) 은 Phase 5 에서 처리.
- ✅ Phase 4 (alpha.31, 부분) — icon-frame + notice JSX 전환. Bool/Num/Date/Select/String/ManyToOne 필드의 `rcm-bool-icon-frame*` / `rcm-num-icon-frame*` / `rcm-date-icon-frame*` → `rcm-icon-frame [data-color]`. `rcm-bool-icon*` / `rcm-num-icon-*` / `rcm-date-icon` → `rcm-icon [data-size][data-tone][data-color]`. `rcm-bool-label*` → `rcm-text [data-weight][data-color][data-tone]`. DataExporter notice → data-tone. primitives.css 의 `rcm-icon-frame` 디폴트 shape → rounded + bg surface-muted, `rcm-text` 디폴트 → inherit (font-size/color 등). 테마 파일 / AlertItem / fieldgroup card 등 잔여 composite 은 Phase 5~6 에서.
- ✅ Phase 5 (alpha.32, 부분) — `ViewTab.tsx` 에서 `rcm-tab-selected` / `rcm-tab-disabled` 하드코딩 제거 → `data-state="selected"|"disabled"`. 나머지 dropdown/card-item-tab 은 composite 제거와 동반 처리 예정.
- ✅ Phase 6 1차 (alpha.33) — FormField.tsx `rcm-bool-icon` 잔여 JSX 수정 + dead CSS 삭제. base.css 4,960 → 4,896.
- ✅ Phase 6 2차 (alpha.34) — icon-btn 전환 묶음. base.css −116.
- ✅ Phase 6 3차 (alpha.35) — ContentAsset remove + Revision badge/tag. base.css −40.
- ✅ **Phase 6 잔여 병렬 (alpha.36)** — 8 블록 병렬 에이전트 dispatch 로 CardM2O/CardItem/AdvSearch/Revision/FieldSelector/DataImport/ContentAsset/Alerts 잔여 composite → primitive. base.css −360.
- ✅ **Phase 7 (alpha.36)** — base.css 를 `layouts.css` + `components.css` + `base.css(utilities only)` 3개 파일로 분리. cascade 순서 `tokens → primitives → layouts → components → base`. rule-level diff 0 (645 selector+body multiset match).
- ✅ **Phase 8 (alpha.36)** — theme 파일의 legacy button variant string("rcm-button rcm-button-primary" 등) → "rcm-button". JSX consumers 에 data-attr 직접 적용. components.css 의 .rcm-button-* variant 규칙 완전 삭제 (−70). grep 검증 0 references.
- ⏳ Phase 9 — 시각 수동 검증 + v0.2 major bump 준비 (deprecated theme slot 제거, primitives 튜닝 제안 반영)

### GlobalModalManager 포팅
- `src/listgrid/ui/GlobalModalManager.tsx` — ManyToOneField 모달 렌더러

### FileFieldValue 완전 포팅
- `src/listgrid/ui/UIProvider.tsx` — 원본 메서드 전부 (isDirty/clone/addNewValue/...)

### 테마 신호: blue primary
- `--rcm-color-primary: #2563eb` (Mantine/MUI/Chakra 스타일)

---

## 5. 남은 작업 — rcm-* 전수 마이그레이션

### 통계
- 비-rcm className 현재 **~409줄 / 61 파일** (실측 명령어는 섹션 9 참조)
- 이 중 상당수는 `className={cn('하드코딩-tailwind', classNames.X)}` 패턴 — 하드코딩 Tailwind 부분 제거해야 함

### 전체 대상 파일 (Top offenders, 수작업 순서)

| Rank | 파일 | 스타일 줄 수 |
|---|---|---|
| ~~1~~ | ~~`components/list/ui/TableSubCollectionView.tsx`~~ | ✅ alpha.19 |
| ~~2~~ | ~~`components/list/ui/CardSubCollectionView.tsx`~~ | ✅ alpha.19 |
| 3 | `components/fields/view/CardManyToOneView.tsx` | 38 |
| 4 | `components/list/AdvancedSearchFormV2.tsx` | 29 |
| 5 | `components/list/ui/CardItem.tsx` | 28 |
| 6 | `components/fields/contentasset/components/ContentAssetItemUI.tsx` | 21 |
| 7 | `components/revision/RevisionField.tsx` | 20 |
| 8 | `components/list/ui/FieldSelector.tsx` | 19 |
| 9 | `transfer/DataImportSample.tsx` | 15 |
| 10 | `components/list/ui/CardFieldSection.tsx` | 14 |
| 11 | `components/fields/view/SmsModal.tsx` | 13 |
| 12 | `components/fields/view/ManyToOneView.tsx` | 11 |
| 13 | `components/form/ViewEntityForm.tsx` | 10 (잔여) |
| 14 | `components/fields/view/ManyToOneMultiFilterView.tsx` | 10 |
| 15 | `components/fields/view/PhoneNumberListView.tsx` | 8 |
| 16 | `components/fields/view/LinkFieldView.tsx` | 8 |
| 17 | `components/fields/contentasset/components/AddContentDialog.tsx` | 8 |
| 18 | `components/list/ui/FilterDropdown.tsx` | 7 |
| 19 | `components/form/ui/AlertItem.tsx` | 7 |
| 20 | `components/fields/BooleanField.tsx` | 7 |
| ... | (추가 43 파일, 각 1~6 줄) | ~245 |

### 접근 방법

**각 파일당 수행**:
1. 파일 열고 `className=` 모든 줄 확인
2. Tailwind utility → rcm-* 시맨틱 또는 레이아웃 클래스로 교체
3. 필요한 rcm-* 클래스가 base.css에 없으면 추가
4. `cn('tailwind 하드코딩', classNames.X)` 패턴의 Tailwind 부분 제거
5. 복잡한 커스텀 스타일(`bg-[#fafafa]`, `h-[30px]` 같은 arbitrary)은 inline style로 옮기거나 신규 rcm-* 클래스 생성

**주의 포인트**:
- `lg:col-start-1`, `col-span-full` 같은 grid 관련: 이미 `rcm-col-span-full`, `rcm-col-start-1-lg` 존재
- `md:flex`, `md:justify-end`: 이미 `rcm-form-buttons-row` 같은 시맨틱 클래스에 흡수됨
- `panel`, `btn btn-primary`, `btn-outline-primary` (gjcu 커스텀): rcm-fieldgroup, rcm-button 시리즈로 교체

---

## 6. 자주 쓰는 명령어

### 라이브러리 개발 (`~/dev/rcm-listgrid`)
```bash
npm run type-check          # tsc --noEmit
npm run build               # tsc + copy CSS → dist/
echo "0.1.0-alpha.X" | ./deploy.sh   # 버전 bump + release repo push
git push origin main        # private repo에 소스 push
```

### 실험 워크트리 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front`)
```bash
# alpha.X 재설치 (lockfile 리셋 필수)
sed -i '' 's|v0.1.0-alpha.OLD|v0.1.0-alpha.NEW|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

# dev 서버 재시작 (9261 포트)
lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin && NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261
```

### 남은 Tailwind 줄 수 체크
```bash
cd ~/dev/rcm-listgrid/src && \
  grep -rEc 'className="[^"]*\b(bg-|text-|flex|grid|p-[0-9]|m-[0-9]|w-|h-|rounded|border|shadow)[^"]*"' \
  --include="*.tsx" 2>/dev/null | awk -F: 'BEGIN{c=0} {if($2>0) c+=$2} END{print c}'
```

### Playwright 시각 검증
1. MCP 도구 로드: `ToolSearch "select:mcp__playwright__browser_navigate,..."`
2. 로그인 페이지 캡처 (변경 전후 비교용)
3. `/academic/course`, `/academic/admission/homepage/notice`, detail 페이지 각각 확인

---

## 7. 사용자와의 합의된 설계 원칙 (중요!)

1. **절대 호스트에게 Tailwind 강요 금지**. alpha.16/17의 Tailwind CLI 방향은 **잘못된 시도**로 판명되어 revert됨. 다시 시도하지 말 것.
2. **Library JSX는 Tailwind utility 쓰지 않음**. 모든 스타일은 `rcm-*` scoped 클래스.
3. **cascade 충돌 원천 차단**: 호스트와 같은 namespace(`flex`, `hidden` 등) 절대 재정의 안 함.
4. **느리더라도 수작업 전수 마이그레이션이 유일 정답**. 지름길 없음.

---

## 8. 재개 시 체크리스트

1. 이 STATUS.md 끝까지 읽기
2. `~/dev/rcm-listgrid`: `git log --oneline -10` 로 최근 작업 확인
3. 실험 워크트리에 alpha.18 설치되어 있는지 확인:
   ```bash
   grep version ~/IdeaProjects/gjcu-experiment/gjcu-academic-front/node_modules/@rcm/listgrid/package.json
   ```
4. dev 서버 상태: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9261`
5. 서버 안 뜨면 섹션 6의 "dev 서버 재시작" 실행
6. **본 작업 시작**: 섹션 5의 Top offenders 중 rank 1번 파일부터 순차 rcm-* 교체

---

## 9. 참고 자료

- `DECISIONS.md` — 설계 결정 이력 #1~#58
- 메모리: `~/.claude/projects/.../memory/`
  - `project_rcm_listgrid_extraction.md`
  - `feedback_long_session_style.md` — "끝까지 밀어붙이기"
  - `reference_gjcu_dev_credentials.md` — 로그인
- 이전 세션 전체 transcript: `~/.claude/projects/.../{session-id}.jsonl`
