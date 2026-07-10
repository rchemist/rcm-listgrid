# E-트랙 계획 — 필드 전수 이식 + 라이프사이클 패리티 (onInitialize/onChanges/state)

**작성**: 2026-07-11 · **근거**: `e-track-understand` 워크플로우(2 리포 병렬 분석, 5 에이전트) — 원자료 [../analysis/2026-07-11/e-track-understand-workflow.md](../analysis/2026-07-11/e-track-understand-workflow.md)
**부모**: [../PROGRESS.md](../PROGRESS.md) · **사용자 확정(2026-07-11)**: 구엔진 전 필드 이식 + EntityForm 사용예 창작 + **동작(onInitialize/onChanges/state)이 실제로 작동**해야 함(렌더만으론 불충분) + 주소는 Daum 우편번호 API(무료).

## 핵심 발견 — 왜 "필드 이식"보다 "라이프사이클 기반"이 먼저인가

신 엔진은 **선언적(declarative)** 라이프사이클은 갖췄다: 값 슬라이스 스토어, `dependsOn` 교차필드 cascade, async `isHidden/isRequired/isReadonly` 술어, create/update renderType. 그러나 **명령형(imperative)** 계층이 **전무**하다:

| 능력 | 구엔진 근거 | 신 엔진 | 영향 |
|---|---|---|---|
| **META 반응성**(required/hidden/readonly/options/validations 런타임 변경→리렌더) | onChanges가 field meta mutate 후 setEntityForm 리렌더 | **없음** — 렌더러가 **frozen field 인스턴스**에서 meta 읽음(FieldRenderer.tsx:44-74 술어, default-renderers.tsx:150 field.options). mutate해도 리렌더 0 | **FOUNDATION-1 — 모든 것을 막음.** 이거 없으면 onChanges/onInitialize 편집이 화면에 안 보이고 하위 태스크 검증 불가 |
| **onChanges** 명령형 cascade(타 필드 값 set·옵션 swap·검증 파생·reload 요청) | changeValue→executeOnChanges(EntityForm.tsx:122) · OnChangeEntityForm.ts:76-361 빌더 카탈로그 | **부분** — dependsOn은 순수 hidden/required/readonly 술어만. 형제 값 set/옵션 swap/검증 파생 **불가** | 대량 필드가 의존 |
| **onInitialize** async 후처리(필드 동적 추가/변형·옵션 fetch·fetched 재바인딩) | EntityForm.tsx:162-306 initialize() → onInitialize 루프(256-266) → 동적필드 재바인딩(268-302); OnInitializeFunc Config.ts:463 | **없음** — createFormStore는 **frozen 필드셋**에서 동기 seed(form-store.ts:58-67), init 단계 없음 | 77/178 GJCU 폼이 사용 |
| validate-on-change(편집 즉시 검증) | FieldRenderer.tsx:97-101 onChange→validate | **없음** — setValue는 값+dirty만, 검증은 save시에만 | 인라인 피드백 |
| shouldReload / structure-version(cascade 후 폼 재구성) | EntityFormBase.tsx:75-76 · useEntityFormLogic.ts:263-273 | **없음** | 동적 구조 변경 |
| 런타임 필드 add/remove | EntityForm.initialize 동적필드 추가 | **없음** — store 스냅샷 1회 | onInitialize 의존 |
| onFetchData(fetch 후 render 전 폼 mutate) | EntityFormBase.tsx:113 · Config.ts:459 | **없음** | init 파이프 stage |

**결론**: 필드 렌더만 이식하면 onInitialize/onChanges에 의존하는 동작이 **조용히 no-op**한다(사용자가 우려한 그것). 따라서 **Phase EF(기반) 먼저 → Phase EA(필드 대량 이식)**.

## Phase EF — 명령형 라이프사이클 기반 (필드 대량 이식 전 필수) **[O 감리, 깊은 설계]**

순서 = 의존 순서. 각 태스크는 P2 오라클(신·구 특성화 green) 또는 신규 단위테스트로 검증.

- **EF1 (모든 것을 막음)** — 필드 META 반응화: mutable per-field override(required/hidden/readonly/options/validations)를 **store meta-slice**로 이동, 렌더러가 구독. 오늘 렌더러는 frozen field에서 meta를 읽음(FieldRenderer.tsx:44-74·default-renderers.tsx:150). 대상: `@listgrid/state`(meta-override slice+구독) + `@listgrid/react`(렌더러가 store meta 구독). 검증: onChanges 없이도 store.setMeta로 required/options 바꾸면 리렌더되는 단위테스트.
- **EF2** — onChanges cascade: `setValue`(form-store.ts:93-100)가 슬라이스 쓴 뒤 ordered `onChanges(store, fieldName)` 훅 체인 dispatch(형제 setValue·meta mutate 가능), loop-guard. 구엔진 `OnChangeEntityForm.ts:76-361` 빌더 카탈로그(changeHidden/changeRequired/changeSelectOptions/derivedValidations) 이식(EF1 meta-slice 위에). 대상: state + schema-core.
- **EF3** — async initializeFormStore 파이프라인: fetch → onFetchData → onInitialize(순차, EntityForm clone 변형) → build store → hydrate → init추가 필드에 fetched 재바인딩. EntityForm에 onInitialize/onFetchData 훅 리스트+빌더(withOnInitialize/withOnFetchData) 추가, react `useEntityFormInitializer` 훅. 구엔진 EntityForm.tsx:162-306 이식. 대상: state+schema-core+react.
- **EF4** — 런타임 필드 add/remove + structure-version 카운터: store.addField/removeField(슬라이스 생성/삭제) + late-added 필드 fetched 재바인딩(EntityForm.tsx:268-302). ViewEntityForm이 version 변경 시 tabs/groups 재도출(구 shouldReload 대체). EF3 onInitialize가 의존.
- **EF5** — validate-on-change(opt-in): setValue 후 debounce `validateField(name)`(이미 존재 form-store.ts:123-134) + touched 게이팅. 낮은 위험, cascade 뒤.
- **EF-gate**: EF1~EF4 착지 후에만 대량 필드 이식 시작. onChanges/onInitialize 의존 필드는 특성화 오라클로 구·신 대조.

## Phase EA — 필드 전수 이식 (EF1~4 후, wave별) **[S 실행, 복잡건 O]**

빈도(GJCU 178폼): String243·M2O215·Select214·Number207·Bool111·Date58·SubColl55·Textarea48·**Datetime40**·**Xref26**·**File21**·**CustomOption17**·Tag11·Markdown11·Phone9·Password7·Month5·Email4·롱테일. **이미 이식(11)**: String/Number/Boolean/Textarea/Markdown/Select/Date/Email/Phone/M2O/SubColl.

전개 규칙: wave 착수 시 필드별 `[ ]` 체크박스 생성(1필드=1커밋+테스트+구 특성화 or 신규 렌더 테스트). 필드별 이식 상세·함정은 아래 §필드 인벤토리. 기반 클래스 체인(FormField→ListableFormField→OptionalField→MultipleOptionalField / CheckButtonValidationField / AbstractDateField)도 필요 시 이식.

- **EA-A 트리비얼/고빈도**: Checkbox, MultiSelect, Password, Month, Year, Time, Link, Tag, ColorPreset, MessageView, Profile, MappedJoin
- **EA-B 모더릿/고빈도**: **Datetime**(sentinel 'today' 라이브 기본값·range·3-branch list), **CustomOption**(alias async 옵션+module 캐시+prefetch bulk·4-branch), Html(sanitize fail-closed), Birthday(라이브 마스킹), TelephoneNumber(≠Phone), Color(⚠ dynamic Tailwind class 금지→inline-style)
- **EA-C 업로드**: **File**(FileFieldValue·외부URL 바이패스·isDirty 오버라이드), Image(FileFieldValue 공유·썸네일), MultipleAsset(named slots+modal), ContentAsset(서브패키지 통째) — **업로드 backend seam 결정 필요**(§Open Q)
- **EA-D xref/도메인(복잡)**: **XrefMapping**(supportPriority 2-view·static/async filters·excludeId·add), XrefPrefer, XrefPrice(initPrice async), XrefAvailableDate, Rule(rule/ 서브트리 통째), InlineMap(⚠ pendingRef side-channel·clone 공유참조)

## Phase EB — 주소(Daum 우편번호, 무료) **[S]**

`react-daum-postcode`(무키·무료, root package.json ^3.1.3 이미 존재). 계획(원자료 daum §reimplPlan 상세):
- schema-core: FieldType에 `'address'` 추가 · `AddressField extends FormField<Address>`(Address{state?,city?,address1,address2,postalCode,longitude?,latitude?}), **`exceptOnSave=true`**(가상 그룹 핸들 — 서버는 flat 컬럼 저장, toSaveData가 이미 exceptOnSave skip→form-store 무변경) · `applyFullAddressFields(entityForm, props)` 헬퍼(AddressField 1 + flat StringField/NumberField 형제 N, required는 **형제(address1/postalCode)에** 부여→기존 Validation 기계 재사용). hydrate가 flat 필드를 `data[name]`/`data['user.state']`에서 이미 seed→onFetchData 불요.
- react: `AddressRenderer` 등록(registerDefaultRenderers) — 형제 슬라이스를 `useFieldValue`로 읽어 표시, `useUI()` Button/Modal/TextInput로 2단 모달(외부: 우편번호/주소1 readonly/상세주소 editable, 내부: `<DaumPostcode onComplete>`), onComplete가 형제별 `store.setValue` fan-out(구 withOnChanges push-cascade의 렌더러-레벨 대체, ManyToOneRenderer의 setValue와 동형). `react-daum-postcode`는 useUI seam 밖 직접 import(구엔진 PostCodeSelector 선례). peerDep 추가.
- 데이터: onComplete → zonecode(우편)/roadAddress(주소1)/sido(state)/sigungu(city); 상세주소(address2)는 Daum 미반환→사용자 입력. Kakao 지도(showMap)는 **선택·연기**(Kakao 키 필요, 무료 요건과 무관).

## Phase EC — EntityForm 사용예 + E2E (동작 실증)

sample에 실 GJCU 폼 재현 → onInitialize/onChanges/address/file/xref가 **실브라우저에서 작동**함을 Playwright로 증명. 후보(빈도·커버리지):
- **StudentAddressEntityForm** (최저위험 주소 데모 — onInit/onChanges 0, EB 검증용 baseline)
- **CollaboEntityForm** (최고 cost/coverage — dynamic options·조건부 required/hidden·M2O nested 자동채움·file·address·submit transform·symmetric onInit/onChanges → EF2/EF3 실증)
- **MajorEntityForm** (TAB-level hidden·self-ref tree M2O 상호배제·xref M2M)
- **GraduationReviewEntityForm** (custom withOnSave endpoint·role-gated readonly·동적 옵션 pruning — 확장성 상한, 비용 높음/후순위)
게이트: 각 폼의 대표 동작이 E2E green + onInitialize/onChanges 파생상태가 신·구 동일.

## 필드 인벤토리 (30종 미이식 — 이식 시 함정 주의)

> 값형태·카테고리·복잡도·**핵심동작(반드시 작동)** — 상세 원자료 [../analysis/2026-07-11/e-track-understand-workflow.md](../analysis/2026-07-11/e-track-understand-workflow.md).

**트리비얼**: CheckboxField(array·MultipleOptionalField 위임) · MappedJoinField(hidden always·join key 운반) · MessageViewField(display-only ReactNode) · MonthField(native month·YYYY-MM 사전식비교) · ProfileField(readonly UserView).

**모더릿**: BirthdayField(라이브 마스킹·commit=false/true·검증은 UI-only) · ColorField(⚠ `!bg-[${v}]` dynamic Tailwind 금지→inline·onChangeEnd) · ColorPresetField(popover swatch·static class lookup) · HtmlField(≠Markdown·sanitize fail-closed·empty 정규화 isDirty) · LinkField(CheckButtonValidation·외부링크 stopPropagation) · MultiSelectField(3-branch chip/box·status-change config는 dead?) · PasswordField(strength→validations mutate side-effect) · QrField(qrcode.react·findValue 콜백·값 없음) · TagField(TagsInput·multi-word substring 필터) · TelephoneNumberField(≠Phone·hyphen strip/format·getSave digits-only) · TimeField(sentinel 'now' 라이브) · YearField(min..max range·list IN 강제).

**복잡**: CustomOptionField(alias GET async+module 캐시+prefetch bulk·4-branch·sortable false) · DatetimeField(sentinel 'today'·range·FlatPickr·3-branch list) · FileField(FileFieldValue·외부URL 바이패스·isDirty/isBlank 오버라이드) · ImageField(FileFieldValue 공유·썸네일 모달·near-dup File→공유 base) · InlineMapField(⚠ pendingRef side-channel·isDirty/getSave/isBlank 오버라이드·clone 참조공유) · MultipleAssetField(named slots·modal·정규식 검증·deepCopy) · RuleField(rule/ 서브트리 통째·N entityForm·AND/OR 트리) · Xref{Mapping,Prefer,Price,AvailableDate}(view/ 서브뷰·static/async filters·supportPriority·initPrice async·entityForm 생성자 필수) · AddressMapField(Phase EB) · ContentAssetField(contentasset/ 서브패키지 통째·validateContentAssets).

**기반 클래스 체인**(이식 시 필요): FormField(value{current,default,fetched}·clone·isDirty·validate·getCurrentValue·getSaveValue) → ListableFormField(listConfig·renderListItem) → OptionalField(options·combo·changeOptions/revertOptions) → MultipleOptionalField(limit·min/max count) · CheckButtonValidationField(중복확인 UX) · AbstractDateField(limit·range).

## 리스크/동시처리 (규율4 고정 목록 외 금지)

- ⚠ **ColorField dynamic Tailwind**(`!bg-[${v}]`) 그대로 이식 금지 → inline-style/safelist.
- ⚠ **InlineMapField pendingRef** side-channel + clone 참조공유 — 미이식군 최난. 단독 테스트 선행.
- 업로드 4종(File/Image/MultipleAsset/ContentAsset) — backend 업로드 seam 결정(§Open Q) 후 EA-C.
- Kakao 지도는 EB 필수 아님(키 필요) — 연기.
- FlatPickrDateField/ColorInput 내부 UI 실제 lib 미확인 — ui 패키지 대조 후 이식.
