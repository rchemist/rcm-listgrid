# Phase EG 아카이브 — 공개 API first-principles 재설계 (설계 pass)

> PROGRESS 본문에서 이월된 완료 태스크 상세. 규범 산출물: [ADR-0009](../adr/ADR-0009-entityform-public-api-redesign.md) · [스펙](../plans/entityform-public-api-spec.md) · [waves 브리프](../plans/entityform-api-implementation-waves.md).

## #EG-D 재설계 설계 pass (fable, 2026-07-11)

**실행 구조**: 수집 4스카우트(sonnet 병렬, 산출물 `analysis/2026-07-11/`에 보존) → fable 설계(ADR-0009+스펙 r1) → 4렌즈 적대검증 워크플로우(wf_c55e83dc-6b1: coverage·consumer sonnet-high / feasibility opus-high / dx sonnet-med, 437k tokens) → **22건 발견 전건 수용·r2 반영** → opus 봉인 재검증 1회.

**수집 산출물 4종** (전부 배너+방법론 포함, 커밋됨):
- `v04-public-surface.md` (394줄) — 현 표면 263 심볼, EntityForm 30멤버, 관찰 10건(미수출 훅 2·동명이의 footgun·stub 패키지 2 등)
- `old-entityform-member-catalog.md` (378줄) — 구 표면 **189멤버**(추정 ~130의 1.45배), 21 concern 그룹, 결함 원장 Cross-Cutting §1~9(reload no-op·getTitle `''`·5중 값세터·shallow-Map 누수·뷰-실행 client-ext 등)
- `consumer-usage-audit.md` (401줄) — 소비자 5제품(gjcu-front 951파일 최대), 실사용 116멤버/zero 84, hack 패턴 6종(47-prop UIProvider·headless 회피·buttonGuard·40파일 래퍼·`as any` 286회)
- `eg-group-capability-maps.md` (736줄) — 계획 워크플로우 wf_8d0b6d02-1cc의 8그룹 정밀 map 저널 추출(jq 금지 규율 준수)

**설계 골자(스펙 r2)**: EntityForm 44멤버(-77%)·선언 동사군 4종(with/add/on/without)·`set*` 0개·라이프사이클 8훅 통합(client-ext 10종 흡수, 엔진 실행 L7)·FormRuntime(schema 구조적 인터페이스)+FormController(state)·messages 단일 채널·serializeValue keyed-맵 seam·withReadOnly 선언 복원(M2O 전파)·InitContext.setMeta(blocker fix)·열린 FieldType+확장 계약·단일 패키지+subpath(headless `/schema`+`/state`)·CAP-01~29 커버리지 매트릭스·116멤버 마이그레이션 전수표.

**검증 22건 내역**: blocker 1(consumer-1 InitContext 메타토글 부재 — gjcu `withHidden(name,·)` 774회 이식 불가) · major 18(계층 위반 ActionContext→FormRuntime 해소, EF6 "미출시 무비용" 허위 정정, serializeValue 모호성, setSearchForm 주입 경로, removeTab hide-다운그레이드 → without* 신설, name-키 sugar 재분류, renderType/session mutator 추가, FormAction render/className, withMeta merge, 멤버계수 불일치, 조건부 타입명 3종 혼용, withCapabilities TS 불법 시그니처, setReadOnly headless 갭 등) · minor 3. 상세는 워크플로우 저널 wf_c55e83dc-6b1.

**실행급 상향(사용자 지시 반영)**: 스펙 §8 CAP-ID·§10 발명금지 게이트·계수 규칙 + waves 브리프(W1~W4 태스크급 파일·before→after·증명·Do-NOT, W5~W7 entry-pass 규칙). 동일 규율을 harness에 제도화(팀규약·model-routing·progress-authoring/delegate·issue·codex 미러 — harness `b178fa6`).

**커밋**: (이 아카이브와 같은 번들) — analysis 4종 + ADR-0009 + 스펙 + waves + blueprint 강등 배너 + PROGRESS.

## #W1 표면 정비 (진행 중 — 실행 로그)

> 스펙 §3·§7·§10-2 · [waves §W1](../plans/entityform-api-implementation-waves.md). 실행: sonnet delegate(waves 브리프=브리핑 원문) → opus 검증(full gate)+커밋. hot-file 순차. 착수 green baseline: 1876 unit·type-check/typecheck:packages/lint(0err)/format/build 전부 ✅.

- **W1-1** `readonly`→`readOnly` 식별자 개명(행동 무변경) — 18파일(schema-core field 8·state·react 5·sample collabo·테스트 3). ViewPreset 6프리셋+`isReadonly`→`isReadOnly` 메서드+`FieldMetaOverride.readonly`+`override?.readonly` 접근 전부. **proof=tsc**(개명이 stale 참조를 깨므로 green tsc=전 참조 개명). 제외: TS `readonly` 수식어·DOM `toHaveAttribute('readonly')`·0.3 인용 주석·로컬 var·`src/listgrid/**` 레거시(스코프 밖). 검증: full gate green·1876·`git grep -nw isReadonly` empty. deviation 0.

- **W1-2** `placeHolder`→`placeholder` 개명 — 4파일(conditional/entity-field/form-field/index). **결정(opus)**: 타입 `PlaceHolderType`→`PlaceholderType`도 개명("placeholder"=1단어→PascalCase는 Placeholder. property fix의 평행. W1-1이 정상 케이싱 `ReadOnlyType`을 남긴 것과 정합 — read-only는 2단어). 소비자·렌더러 `.placeHolder` 접근 0(dormant 선언)·caller 0. 검증: full gate green·1876·grep empty. deviation 0.

- **W1-3** EntityForm 정체성 — 12파일. `fetchUrl`→`url`(prop/ctor/clone)+trailing-slash strip 정규화(root 보존, 현 입력 전부 no-op=행동무변경)·`EntityForm.getName()/getUrl()` 제거→콜러 `.name`/`.url`(13사이트). **field-vs-form 판별=tsc**: `FormField.getName()`/`field.getName()`(100+ 사이트)는 무접촉 유지(디스앰비 리뷰로 확인 — field-core.test `x.getName()` 유지·`f.name` 전환). getFetchUrl 부활 0. 검증: full gate green·1876·`getUrl()` grep 0. 에이전트 done_with_deviations(테스트파일 4종 이관)은 **false-positive**(전부 브리프 명명 사이트·검증 green) — 리뷰로 종결, Needs Review 미등록.
- **방법론(W1-4/5 승계)**: `tsc -b`(typecheck:packages)는 __tests__ 미타입체크 → EntityForm 멤버 제거/개명 시 **테스트파일 콜러는 `npm test`로만 검출**. rename 웨이브는 tsc+test 둘 다 필수.

- **W1-4** addFields `fieldGroup`→`group` — 6파일. 명명 `TabInput`/`GroupInput` 인터페이스 추출(스펙 §3.2)·`requiredPermissions?: string[] \| undefined` 타입슬롯 추가(소비 로직 0 — W3-1). 소비자 이관: sample 3(collabo/college/major)·applyFullAddressFields(AddressFieldsProps.fieldGroup→group·:217 forward)·test. **디스앰비**: 내부 `fieldGroupId`(field 배치 프로퍼티)는 무접촉(다른 개념). 검증: full gate green·1876·`grep -nw fieldGroup` 0·fieldGroupId 유지. deviation 0(it() 제목 개명은 rename-wave 정책 허용).

- **W1-5** without*/withTab/withGroup 신설 + `EntityForm.setTabHidden` 제거 — 6파일·+11 unit(1887). **4 신멤버(스펙 §3.2)**: `withoutField`(splice)·`withoutTab`(**cascade** — 탭+소속 필드 제거, orphan 방지)·`withTab`(존재→병합·미존재→**stub-create**, setTabHidden 계약 보존)·`withGroup`(groupId-keyed, tabId 예약·미사용). 명시 대입(exactOptional·조건 spread 0). TabDef.hidden `boolean`→`ConditionalBooleanValue`·+requiredPermissions·FieldGroupDef +open?/+requiredPermissions(타입슬롯, 소비 W3-1). setTabHidden 콜러 이관(major·tab-hidden 테스트 2종, 어서션 무변경)·mutator/store setTabHidden 유지. 검증: full gate green·1887·grep clean.
  - **⚠ W3-1 의존(TODO 마킹됨)**: TabDef.hidden 위닝의 **conditional 해석은 W3-1**(deriveTabs sync-근사). W1-5는 3 소비지점(form-store:240 seed·:407 default탭·ViewEntityForm deriveTabs)에 `typeof==='boolean'?x:false` 내로잉(현 값 전부 boolean=무변경). W3-1 브리핑에 "deriveTabs+seed 2곳 conditional 해석" 반드시 포함.

- **W1-6** 배럴 큐레이션(스펙 §7) — 4파일. schema 배럴 -4: `SCHEMA_CORE_VERSION`(P1잔재·const+sample 소비 제거)·`PermissionPolicy`(사용0·def+export 제거, isPermitted/extractPermissions/mergeRequiredPermissions 유지)·`isEquals`/`isEqualCollection`(re-export만 제거 — util/compare def+value.ts 내부사용 유지). react 배럴 +2: `useReferenceResolver`(adapter)·`useFieldMeta`(form-store). sample page.tsx 워크스페이스 마커 표시 제거(published-library 표시 유지·렌더 유효). 검증: full gate green·1887·grep clean.

- **W1-7** 공개 표면 계수 스크립트+CI(스펙 §10 게이트2) — 3파일(신설 `scripts/count-public-surface.mjs`·package.json `check:surface`·ci.yml quality job step). TS compiler API(5.9.3)로 atomic member 계수: EntityForm 공개멤버(method/getter/setter/prop/ctor, private/protected/#제외)·배럴 export명(named+decl, type+value dedup). **현재값(전부 PASS)**: EntityForm 31/45·root(react) 46/120·/schema 161/180. export* 방어 throw. fail-path 검증(temp copy·삭제). 임의완화 금지 명문화. **주의(W4)**: get*Handlers 등 엔진-내부 getter도 §10 리터럴로 계수됨 — W4 완료 시 45 근접 감시.

## W2 — 훅 통합 + FormRuntime/FormController (진행 — hot-file 순차·delegate sonnet→opus 검증)

> 스펙 §4·§5.2·§6 · [waves §W2](../plans/entityform-api-implementation-waves.md) · CAP-04·07(주입점)·11·14·21·25·26. 실행: sonnet delegate(waves 브리프=브리핑 원문) → opus 검증(full gate+계수+diff 발명감사)+커밋.

- **W2-1** 훅 개명+InitContext+EF7 값세터 이전 — 28파일. `withOnChanges`→`onChange`·`withOnFetchData`+`withOnInitialize`→**`onInit` 통합**(단일 배열·ctx.data 분기, spec §4.2)·`EntityForm.setValue`/`setFetchedValue` 제거→`InitContext.values.set/setFetched`(initialize-form-store closure)·`OnChangesHandler`→`ChangeHandler`(form-mutator)·`OnFetchData/OnInitializeHandler`→`InitContext`/`InitHandler`(§4.1 그대로)·`getOnChanges/OnFetchData/OnInitialize`→`getChangeHandlers`/`getInitHandlers`(엔진-내부, 배럴 비공개). **초기화 파이프 재배선**(initialize-form-store): `clone→fetch→BIND→onInit*(always)→REBIND→build` 순서 불변(EF7 회귀 없음)·1 shared ctx·precedence hook.set>fetched>default 보존·`ctx.setMeta`→`createFormStore` 신 `initialMeta` 옵션 seed(→store.getMeta 반영). onchanges 3종·form-store dispatch는 타입-개명만(change-select-options 로직 무접촉=W2-8 스코프 보존). entity-form-value.test 삭제→8 어서션 initialize-form-store.test로 이관+신규 setMeta 테스트 4. **opus 리뷰-교정 1건**: `InitContext.renderType`을 data-based(`data!==undefined?'update'`)→**id-based `ef.getRenderType()`**로 교정 — initialData 프리필 create폼이 'update'로 오보되는 latent bug(§3.1 id기반 정합·W2-2 mutator.getRenderType()과 일치·doc 코멘트 동반 수정). 검증: full gate green·**1887 unit**·계수 EntityForm 27/45·root 46/120·/schema 161/180 PASS. **봉인(구결함원장)**: §값세터 파편화(setValue/setFetchedValue 2메서드→ctx.values 1객체)·§onInitialize 이중발화(2배열 dispatch→1배열, save후 재발화 없음). 에이전트 자기보고 deviation 5건은 전부 spec-conformant(§9 반환-교체 폐기·§4.2 단일배열)/브리프-허가(테스트 이관)/무해(주석)—리뷰 종결. 커밋 `005b4a3`.

- **W2-2** FormMutator additive 확장(§6.1) — 3파일(form-mutator 인터페이스·form-store mutator 리터럴·on-changes.test). `+getRenderType(): RenderType`(→`entityForm.getRenderType()` 위임·id기반=InitContext.renderType과 동일 소스)·`+getSession(): Session|undefined`(→`opts.session`). 기존 7멤버 무변경(append-at-end, 조건 spread 0). +4 unit(**1891**): onChange 핸들러 renderType create/update 분기·getSession present/absent. 검증: full gate green·계수 27/46/161 PASS. deviation 0. 커밋 `a085e82`.

- **W2-3** messages 채널(§6.1) — 3파일+2 신규테스트. `formErrors: string[]`(inert·writer 0 확인=CAP-21 근거) → `messages: FormMessage[]`(`{key,severity:'error'|'warning'|'info',text,field?,persistent?}` §6.1 그대로)+3 액션: `addMessage`(key-dedup 교체)·`removeMessage(key)`·`clearMessages({includePersistent?})`(기본 비-persistent만 clear=clear-on-success §6.2). state 배럴 +FormMessage(계수 미게이트). ViewEntityForm 배너: messages 렌더(key/`data-severity`/text·`role=alert` 유지·empty=배너없음). +13 unit(**1904**): 액션 round-trip+배너 렌더 3. **writer 배선은 W2-5**(controller: server field-error→slice.errors, 미매핑→addMessage(error), cancel reason→addMessage, save성공→clearMessages()). 검증: full gate green·계수 27/46/161 PASS. deviation 0. 커밋 `f4bde5a`.

- **W2-4** serializeValue seam(§5.2) — 5파일. `FormField.serializeValue(value,ctx): Record<string,unknown>`(public 확장 seam·기본 `{[name]:value}`)+ManyToOne override(`{[`${name}Id`]:value[getIdField()]}` 객체값·비객체는 `{[name]:value}` fallback — 구 M2O 분기 1:1)+EntityField 인터페이스 선언(fieldDefs가 EntityField-typed·validate 패턴 미러). toSaveData 재작성: per-field serializeValue→`Object.assign` 병합→`nestDottedKeys`(dotted 키 중첩·flat 키 **strict no-op**)→EF6 submitTransform. **duck-typed getIdField 캐스트 제거**. exceptOnSave·CAP-01 권한제외 verbatim. +3 unit(**1907**): 커스텀 override·InlineMap 비충돌(Do-NOT)·dotted 중첩. **기존 toSaveData 특성화 전량 무편집 green**(M2O평탄화·submitTransform·권한제외·subColl·exceptOnSave). 리뷰: 구 `?? 'id'` fallback은 dead(모든 manyToOne=ManyToOneField)→getIdField() 직접호출 등가. EntityField 인터페이스 deviation=필요·정당(리뷰 종결·Needs Review 미등록). 검증: full gate green·계수 27/46/161. 커밋 `8554bda`.

- **W2-5** FormRuntime+createFormController+save/delete 훅+EF6 대체(§6.2) — 12파일(신설 `form-runtime.ts`[schema 구조 인터페이스]·`form-controller.ts`[state 구현]·`form-controller.test.ts`). **레이어 규칙 준수**: schema는 FormRuntime 타입만(state 미import — form-runtime.ts는 BackendError 타입만; state 유일 위반은 pre-existing 테스트 import). EntityForm +4훅(onBeforeSave/AfterSave/BeforeDelete/AfterDelete append+엔진내부 get*Handlers+clone 전파)+4 Context(§4.1). **save 플로우(§6.2 정확)**: validate→toSaveData→onBeforeSave(setData 스레드·cancel·**throw→log+skip** §4.2, 구 EF6 propagate와 divergence)→adapter.create/update(renderType)→실패 매핑(fieldErrors→setFieldErrors[**name-키**]·미매핑→addMessage·**suppress-generic**)→성공 clearMessages(clear-on-success)→onAfterSave. delete 플로우 대칭(adapter.remove **2-arg**·revision W4-4 이연). reload=initializeFormStore 재실행→`store.setState(fresh, replace)`. **capability 게이트=W3-2·revision 주입=W4-4 명시 omit**(getCapabilities/getRevisionEntityName 미존재·발명 금지). EF6 제거: withSubmitTransform/getSubmitTransform/SubmitTransformHandler/submitTransform·toSaveData transform 적용 삭제(→`return nestDottedKeys(merged)`). collabo withSubmitTransform→onBeforeSave(contracted, 자체주석 E2E-inert). 테스트: submit-transform.test→12 schema 훅등록·store.test EF6 2건 제거·form-controller.test 16(성공/검증실패/cancel/fieldErrors 매핑/suppress-generic/clear-on-success). +19 unit(**1926**)·계수 EntityForm 33/45·root 46/120·/schema 171/180 PASS. **봉인**: EF6→onBeforeSave·inert formErrors writer 배선(controller가 writer, CAP-21/04). deviation: setFieldErrors 신설(name-키 슬라이스 write)·buildMutator 로컬(9멤버, store 신표면 0)·toBackendError export·메시지 키(save-cancelled/delete-cancelled/delete-error)·**reason-less cancel→{ok:false}**(§Needs Review)·saving 미배선(W3/W7). **W3/W4 배선점**: capability=save/del 진입 step1·revision=onBeforeSave 후 adapter 전·delete E2E+버튼=ViewEntityForm(현 Delete 버튼 없음). 커밋 `3a3ff8a`.

- **W2-6** list 훅 축(§4.1) — 4파일. EntityForm +onBeforeListFetch/onAfterListFetch(append+엔진내부 getter+clone 전파, W2-5 패턴 미러)+2 Context(§4.1). list-store: 옵션 +entityForm?/+session?; **fetch() 재작성**: onBeforeListFetch*(setSearchForm→`effectiveSearch`·**per-fetch·미persist**)→adapter.list(effectiveSearch)→onAfterListFetch*(setRows→`effectiveRows`)→**postFetch 보존**(hook 후·try/catch 밖·propagate). 훅 per-handler try/catch(throw→log+skip §4.2). entityForm 없으면 no-op(무변경). SearchForm 불변(injection=새 인스턴스·store.searchForm 미변경=페이징에 sticky 안 됨). +5 unit(**1931**): setSearchForm→adapter.list body·setRows→rows·불변성·throw skip. 계수 EntityForm 37/45·root 46/120·/schema **175/180** PASS(헤드룸 얇아짐·W3/W4 감시). deviation: session? 옵션(context 필수·CreateFormControllerOptions 미러·정당). 커밋 `ef15dfb`.

- **W2-7** useEntityForm(react, §7) — 6파일(신설 use-entity-form.ts+테스트). `useEntityForm(opts)`→`{store,entityForm,controller,loading,error}`: **useEntityFormInitializer 합성**(취소안전 상속·비동기 로직 중복 0)+createFormController 동봉(memoized on store/entityForm/adapter/session·**adapter 없으면 controller undefined**). 배럴 +useEntityForm+2타입·useEntityFormInitializer **@deprecated**(1웨이브 후 제거). college new/[id] 페이지 이관→`controller?.save()`(outcome.ok→router.push·loading 가드·**onSave prop 유지**=버튼 rewire W3-3). **opus 리뷰-교정 1건**: spec §7 `validateOnChange`가 initializer 미forward로 inert였음→initializer에 passthrough 배선(`CreateFormStoreOptions['validateOnChange']` type·재실행키 제외=session/initialData 패턴)→useEntityForm forward(스펙 옵션 정상화). +3 render 테스트(**1934**): controller 유무·**취소안전**(unmount 전 미setState). 계수 EntityForm 37/45·root **49/120**·/schema 175/180 PASS. deviation: 양 college 페이지 이관(더 넓은 커버리지)·double-validate(ViewEntityForm 버튼 validateAll+controller.save 재검증, 무해·adapter 단일호출·W3-3서 해소). 커밋 `4d8e378`.

- **W2-8** changeSelectOptions 배열-clause 레이스 fix(§Needs Review #27 처분 완료) — 2파일(change-select-options.ts+on-changes.test). **버그**: 단일-pass 루프에서 동일 필드 겨냥 2 clause(matched apply+unmatched revert)가 clause 순서에 따라 settled options 상이(unmatched revert가 matched apply clobber). **fix=2-pass**: pass1 전 clause 순회→target 집합+matched applied 맵 수집; pass2 matched 필드 적용·나머지만 revert(**matched는 revert 제외**). 매치가 순서 무관 승리·필드당 setMeta 정확히 1회. 두-matched-동일필드는 last-match-wins(내재 모호성·순서안정). 빌더 시그니처 무변경. **red→green 실증**: race 테스트가 구 로직서 fail(`[Array(2)]`=apply+revert 2콜)·신 로직 pass(1콜). +2 unit(**1936**). **inline 실행**(단일 non-hot-file 알고리즘 fix·opus 직접·delegate 예외). 계수 root 49/120·/schema 175/180 PASS. 커밋 `052246f`.

## W3 — 권한·능력·액션 (진행 — hot-file 순차·delegate sonnet→opus 검증)

> 스펙 §3.2·§3.4·§6.2·§7 · [waves §W3](../plans/entityform-api-implementation-waves.md) · CAP-02·03·06·08·09·22·27. 실행: sonnet delegate(waves 브리프=브리핑 원문) → opus 검증(full gate+계수+diff 발명감사)+커밋. hot-file 순차, fan-out 금지(ViewEntityForm 대폭 수정).

- **W3-1** 탭/그룹 requiredPermissions 소비+가시성 파생(§3.2·CAP-02/03) — 11파일(logic `4d30159`). **getStaticConditionalBoolean 신설**(schema-core conditional.ts, `getConditionalBoolean`의 sync 형제·async `ValuedBoolean`→false=FieldRenderer per-field 재평가, **blueprint EG4 sync 근사 GO** 사전판정 바인딩)+배럴 export(/schema 175→176). **addFields** TabInput/GroupInput.requiredPermissions→TabDef/FieldGroupDef 전파(누락분·조건 spread). **form-store** seed(:337)+default-tab-pick(:509) `typeof===boolean` 내로잉→`getStaticConditionalBoolean(hidden, renderType)`(W1-5 TODO 3곳 중 store 2곳 마감·**권한 게이트는 뷰 전용**=seed는 정적 hidden만). **ViewEntityForm** deriveTabs/deriveGroups +isPermitted(CAP-02)+hasVisibleContent(CAP-03, 구 getViewableTabs→getViewableFieldGroups semantics=group viewable iff ∃ field `isPermitted&&!staticHidden`, tab viewable iff isPermitted&&∃viewable group·`tabHasVisibleContent=deriveGroups(...).length>0` DRY)+useSession/renderType 배선(D4 무영향=값편집 미재파생). **seed 정적화 등가성 검증**: tabHidden 소비 전부 `[id] ?? …`(presence-check 0)=absent≡false. 봉인: W1-5 TabDef.hidden conditional 해석 TODO(3곳 중 store 2 완결·ViewEntityForm 1 완결). +14 unit(**1950**)·계수 EntityForm 37/45·root 49/120·/schema **176/180** PASS·**E2E +1(tab-permission, 실브라우저 CAP-02/03: ADMIN탭 표시/SUPERADMIN탭·빈그룹 숨김, 17 green)**. deviation: E2E fixture=전용 최소 perm-demo(브리프 허용 옵션·기존 major E2E 회귀 회피). logic `4d30159`.

- **W3-2** withCapabilities/getCapabilities+해석(§3.4·CAP-06/22) — 10파일(logic `fe49c91`). **Capabilities 타입**(`{create?/update?/delete?: ConditionalBooleanValue}`)+`withCapabilities`(shallow-merge, withMeta §3.1 선례)/`getCapabilities`(raw·해석은 엔진). **구 withNeverDelete/isNeverDelete(감사 inert #3) 완전 제거**(neverDelete field/clone 교체)→`withCapabilities({delete:false})`(CAP-22 정직 의미론). 배럴 +Capabilities(/schema 176→177). **form-controller**(state) save/delete step 1 capability 게이트: async `getConditionalBoolean`·**default-true=undefined 특수처리**(getConditionalBoolean(undefined)=false 함정 회피)·capCtx(FieldEvalContext)·save=renderType별(create/update cap)·delete=delete cap(항상 update ctx). **denied=silent `{ok:false}`**(adapter 미호출·message 없음·뷰가 버튼 숨김·headless는 ok:false). **ViewEntityForm** Save 버튼 sync capability 가시성(`getStaticConditionalBoolean`·default-true, Delete 버튼은 W3-4). consumer 마이그레이션 collabo:197/major:156(.withNeverDelete()→.withCapabilities({delete:false}))+major route 주석. EntityForm 계수 -2(withNeverDelete,isNeverDelete)+2(withCapabilities,getCapabilities)=**37 유지**. +11 unit(**1961**·조건부 create/update/delete 각 게이트+adapter spy 미호출+shallow-merge+clone 독립+Save 어포던스)·계수 37/49/177·**E2E 17 green**(major/collabo 마이그레이션 무회귀). **deviation(§Needs Review)**: capability-denied `{ok:false}`=validation-fail와 형태 구별 불가(#W2-5 동류·타입상 강제). logic `fe49c91`.

- **W3-3** addAction/getActions+FormAction+액션 바+slots(§3.4·§7·CAP-09) — 10파일(logic `f6bd016`). **FormAction/ActionContext/ActionRender 타입**(§3.4 verbatim·ReactNode type-only L6)+`addAction`/`getActions`(order 정렬·`?? 0`)+clone(shallow-copy each). 배럴 +3(/schema 177→**180==ceiling**). EntityForm +2=**39/45**. **ViewEntityForm 통합 액션 바**(react): +`controller?`/`slots?` props·`buildActionCtx`(controller 有일 때만·mutator 인라인=form-controller.buildMutator 미러 15줄 중복 의도적)·**빌트인 합성**(Save order 1000·Delete order 1010 **update&&controller only**=group-cap-map:55g "delete never in create")·**replaces/id 병합**(custom replaces:'save'/'delete'→빌트인 슬롯 차지)·정적 visible/enabled(getStaticConditionalBoolean)·render 커스텀 노드·`className`→span 래핑(ui Button에 className 없음·기계적)·`runningActionId` 로컬(form-store 무변경 준수)·slots(title 치환/header additive/actions 바 치환). **Save rewire**(W2-7 인계): controller.save() 단일 validate(double-validate 해소)·성공→onSave post-save 콜백·실패→focusFirstInvalidField(a11y 보존)·controller 無=legacy. college new/[id] handleSave 제거→controller prop+onSave=네비. +17 unit(**1978**·replaces/visible/render/Delete-update-only/Save→controller/enabled)+**E2E 1**(action-demo 실브라우저 커스텀 버튼 클릭→ctx.mutator가 name='clicked' write 관찰)·계수 39/49/180·E2E 18. **deviation(§Needs Review #W3-3)**: controller-optional vs ActionContext.controller:FormRuntime(required) 불일치 — controller 부재 시 빌트인 Save(legacy)만 렌더·custom/Delete/render-slot omit(dev warn)·replaces:'save'+no-controller=Save 아예 없음(리터럴 해석). **Open Question**: /schema 180 ceiling 도달·W4 신타입 초과 예상→§10 재산정. 그 외 deviation(onSave repurpose·order·slots 의미)=브리프 사전결정. logic `f6bd016`.

- **W3-4** delete flow(§6.2·CAP-08) — 5파일(logic `69dad6e`)·hot-file=ViewEntityForm만. 빌트인 Delete(W3-3 파생·update&&controller·controller.delete)에 **confirm 게이트**: `getMessages().showConfirm(DELETE_CONFIRM_MESSAGE)`(취소=no-op·확인→delete·**fail-closed**=미설정 시 false). **sample** providers.tsx `configureMessages({showConfirm:window.confirm,showToast,showError})`(미설정 시 삭제 불가 해소·SSR 안전=window는 클로저 내부). **post-delete 네비**=college [id] `onAfterDelete(§4.1 기존 surface)→router.push('/college')`(**새 onDelete prop 발명 안 함**·onAfterDelete=구 postDelete 흡수). 백엔드 delete 경로(collection route bulk DELETE·adapter.remove·store)+form-controller.delete=W2-5/완비(무변경). +2 unit(**1980**·showConfirm true→delete 1회/false→0회·resetMessages 정리)+**E2E 1**(college-delete: 유니크명 생성→목록 확인→편집 진입→Delete 클릭→dialog accept→onAfterDelete 복귀→목록 count 0 실관찰). 계수 39/49/180 **무변경**(신 export 0)·E2E 19. deviation 0. logic `69dad6e`.

- **W3-5** withReadOnly+formReadOnly(§3.1·§6.1·CAP-27·마지막 W3) — 8파일(logic `1753aaa`). **schema-core** `withReadOnly(readOnly=true)`/`getReadOnly()`+`private formReadOnly=false`+clone 전파(선언 property). **state** FormStoreState `+formReadOnly:boolean`·createFormStore seed=`entityForm.getReadOnly()`(reload도 이 경로 재seed·런타임 setter 없음). **react** FieldRenderer `effReadOnly=formReadOnly||(meta.readOnly??field)`(**최우선 OR**·permission 하드게이트[effHidden]와 독립). ViewEntityForm `builtins=formReadOnly?[]:[saveBuiltin]`(**Save만 숨김**·스펙 §6.1 문구 그대로·Delete는 capability 소관 무변경). **M2O 렌더러 무변경**=picker(찾기 버튼)가 readOnly prop 이미 존중→formReadOnly→FieldRenderer effReadOnly→M2O readOnly 자동 전파. 계수 EntityForm 39→**41/45**(withReadOnly+getReadOnly)·/schema 180 무변경. +15 unit(**1995**·기본 false/무인자 true/false 해제/clone 보존·store seed·FieldRenderer OR·**M2O 찾기 숨김 전파**·Save-only 숨김·**save/delete 하드게이트 없음 명시**=readOnly 폼도 capability 허용 시 adapter 호출)·E2E 19. deviation: withReadOnly(undefined)=기본 param으로 true 수렴·getReadOnly 게터 보완(with*/get* 쌍 완성·스펙 §3.1 리더 누락 보완, 발명 아님). logic `1753aaa`.

- **W3-6** 액션 바 하드닝(phase-end findings·ViewEntityForm만) — 2파일(logic `b4ecda3`). W3 **phase-end 적대 리뷰**(sonnet+high·opus 검증, `git diff b6663dc..HEAD`)서 cross-sub-task 합성 버그 4 confirmed→fix: **#1** function-conditional visible/enabled/capability=항상 숨김(`getStaticConditionalBoolean(fn)→false`가 hidden엔 permissive-safe이나 restrictive-gate엔 역극성) → **hybrid**(literal/OptionalBoolean sync exact 유지·**함수 분기만 async** getConditionalBoolean 해석·FieldRenderer 패턴·pending=show·`mergedRef`로 effect dep-loop 회피·값-의존은 스냅샷 한계). **#2** actionCtx.values stale(render-time 1회·D4 미구독) → runAction 클릭시 fresh `buildActionCtx`. **#3** store.renderType('update' when fetchedData/initialData) vs entityForm.getId() 불일치→phantom Delete·`adapter.remove([undefined])` → 액션 바 CRUD는 `actionRenderType=entityForm.getRenderType()`(id-based·controller 일치)·deriveTabs는 store.renderType 유지(FieldRenderer 일치). **#4** custom id='save'+no-controller 크래시 → `a===saveBuiltin` 정체성 필터. +8 red→green unit(**2003**)·계수 41/49/180 무변경·E2E 19. deviation: render-fn ctx는 render-time 유지(display-time·저위험, run-time #2만 fix)·#5(replaces:'save'×formReadOnly)=§Needs Review. logic `b4ecda3`.

---

## W3 페이즈 완료 인계 (Handoff → W4 폼 완결)

**W3 권한·능력·액션 ✅ 완료(2026-07-11, `4d30159`..`b4ecda3` 6 sub-task+하드닝·2003 unit·E2E 19·계수 41/49/180)**. CAP-02·03·06·08·09·22·27 전건 소화(phase-end 리뷰서 CAP-coverage 대조 완료).

- **도입 표면(W4 승계)**: EntityForm에 addFields.requiredPermissions·withCapabilities/getCapabilities(Capabilities)·addAction/getActions(FormAction/ActionContext/ActionRender)·withReadOnly/getReadOnly. store에 formReadOnly. ViewEntityForm 통합 액션 바(빌트인 Save/Delete 파생+addAction 병합+replaces+visible/enabled 해석[literal sync·함수 async]+render 슬롯+slots{title,header,actions})·Save→controller.save rewire·Delete confirm(messages registry). getStaticConditionalBoolean(schema-core, sync 정적)·getConditionalBoolean(async).
- **⚠ W4 착수 전 필수(BLOCKING)**: **/schema 계수 180/180 ceiling 도달** — W4 신타입(StepDef·FieldListConfig·FieldFilterConfig·AsyncValidation·DataFieldSpec 등) 첫 export에서 초과. **W4-1 착수 전 스펙 §10 ceiling을 최종 타입 인벤토리 기준으로 재산정**(§Open Questions·임의완화 아님=초기 추정 미달). count-public-surface.mjs 임계값+CI 조정 동반.
- **W4 패턴 재사용**: withTitle/getTitle(§3.1 해석 체인·구 `''` 버그)·withSteps(StepDef·clone 무손실)·AsyncValidation(§5.3, withValidations 승차)·withRevision(§3.1·adapter.remove revision 인자)·withMeta/getMeta(shallow-merge). hot-file 순차 유지(entity-form/form-store/ViewEntityForm). delegate 기본 sonnet·opus 검증(full gate+diff 발명감사+**phase-end 적대 리뷰 필수**=W3서 4버그 검출 실증).
- **Do-NOT(W3 승계)**: 스펙 침묵 판단=구현 금지(needs_decision/§Open Q)·getStaticConditionalBoolean을 restrictive-gate(visible/enabled/capability)의 함수 분기에 쓰지 말 것(항상 숨김 버그·W3-6)·store.renderType과 entityForm.getRenderType() 혼용 주의(fetchedData flip·액션 바=id-based)·exactOptional 조건 spread.
- **미결(§Needs Review 이월)**: #W2-1·#W2-5·#W3-2(capability-denied {ok:false} 구별불가)·#W3-3(controller-optional vs ActionContext.controller required)·#W3-5b(replaces:'save'×formReadOnly). 전부 스펙 저자 판단감·비블로킹.

## W4 — 폼 완결 (진행 — hot-file 순차·delegate sonnet→opus 검증) · CAP-05·07·10·13·23

> 스펙 §3.1·§5.3 · [waves §W4](../plans/entityform-api-implementation-waves.md). **W4-0 계수 ceiling 재산정 ✅**(EntityForm 45→55·/schema 180→190·root 120 유지·스펙 §10-A 최종 인벤토리 근거·count-public-surface.mjs+waves entry-rule 반영, `3b3518f`). 실행: sonnet delegate(브리프=waves §W4+스펙 인용) → opus 검증(full gate 독립 재실행+diff intent-conformance)+커밋.

- **W4-1** getTitle 해석 체인+ViewEntityForm 기본 title (§3.1) — 4파일(logic `228e8f0`). `getTitle(values?): string` **5단계 체인**(text→`values[fromField]`→`values['name']`→`getId()`→`this.name` 폴백)·**항상 non-empty**(구 `''` 봉인 L8·`nonEmptyString`=null/undefined/''/공백만 empty·`String(0)='0'`은 유지). `withTitle(string|{text?,fromField?})` 정규화(`TitleSpec`·**replace-not-merge**=L1 기본·exactOptional 조건spread 회피=명시대입)·`clone` titleSpec 전파. **ViewEntityForm** 기본 title=`getTitle(snapshotFieldValues(store.getState()))`(D4 미구독=구조 리렌더시만·slots.title 우선 유지·L6 ReactNode는 slots 소관). +18 unit(**2021**: no-arg/empty-values non-empty·5단계 우선순위 각·empty→다음단계 폴백·숫자 String화·replace 의미·clone 독립 + react render 1)·계수 41/49/180 무변경(신 export 0)·**full gate 독립 재실행 PASS**(type-check·typecheck:packages·test 2021·lint 0err·format·build). deviation(§Needs Review): ① 5단계 폴백=`this.name`(renderType 기본문구 spec-silent) ② withTitle replace 의미(L1 기본 적용·§3.1 미명시). logic `228e8f0`.

- **W4-2** withSteps 생성 위저드 (§3.2·CAP-10) — 11파일(logic `9969914`). **StepDef**`{id,label,order?,fields:string[],description?,hidden?:ConditionalBooleanValue}`(entity-form.ts·TabDef 인접·신 조건부타입 0·L5) + 배럴 type-only export(/schema 180→**181**). **withSteps(StepDef[]|undefined)**(undefined=클리어·배열은 `cloneStepDef` deep-copy=fields 배열까지·L1 replace)·**getSteps()**(order 오름차순 안정정렬·hidden 미필터=렌더시 해석)·**clone** `steps.map(cloneStepDef)`(hidden step 포함 전건 깊은복제·**구 0.3.x 'clone drops hidden step' 버그 구조적 봉인**). EntityForm 41→**43**. **ViewEntityForm create-mode 위저드**: `wizardActive=actionRenderType==='create'&&getSteps().length>0`(id-based·W3-6 Fix#3)·step indicator(role=list·aria-current)·현 step `fields`만(멤버십 필터)·이전/다음·**마지막 step만 기존 Save/Delete/custom 액션바**·비-마지막=nav만(step-validation gating 없음=스펙 Do-NOT). **hidden 해석=W3-6 하이브리드**(literal/OptionalBoolean sync `getStaticConditionalBoolean`·**함수는 async** `getConditionalBoolean`+`stepFnHidden` state/effect·pending=미숨김·restrictive-gate 역극성 회피). **비위저드/update 무변경**(tabs/groups는 wizardActive일 때만 `[]`·D4 유지)·`clampedStepIndex`=step 중도 숨김시 graceful. +23 unit(**2044**: round-trip·order·clone hidden 보존+독립 양방향·deep-copy·wizard 렌더/nav/value 유지/hidden 제외 literal+async)·+**2 E2E**(steps-demo 전용 fixture: 3-step 실브라우저 완주+cross-step value 유지+저장·다음-no-validate, **21/21**)·full gate 독립 재실행 PASS·계수 43/49/181. deviation: ① **전 step hidden시** step content/nav 없이 액션바만(degenerate edge·spec-silent→§Needs Review) ② indicator 비클릭·마지막 step 이전 버튼 유지(브리프 "최소 위저드" 재량 내). logic `9969914`.

- **W4-3** AsyncValidation tri-state (§5.3·CAP-05·구 CheckButtonValidation 재설계) — 12파일(logic `5a17ec3`)·hot-file=form-store.ts. **AsyncValidation extends ValidationItem**(`packages/schema-core/src/validations/async-validation.ts`·constructor(check,opts?) §5.3 정확·withValidations 승차=C5 단일채널·별도 필드클래스 0)·배럴 export(/schema 181→**182**). **2채널 분리(핵심)**: sync `validate()`=**중립**(항상 `ValidateResult.success()`·check 미호출→validateAll이 조용히 네트워크 라운드트립 되는 것 방지), 실판정은 store asyncState. **FieldValueSlice.asyncState**`'unchecked'|'checking'|'valid'|'invalid'`(기존 export 타입이라 신 심볼 0). **form-store**(state): `runAsyncValidation(name)` 액션(checking→`check(value,ctx)` await→valid/invalid+errors)·`scheduleAsyncValidation` 'change' debounce(**own timer map**·validationTimers와 독립·top-level setValue만·**EF-R2 timer cleanup**=addField/removeField서 stale 타이머 clear)·explicit 호출이 pending debounce 취소(explicit wins). **FieldRenderer**(react): trigger:'button'시 확인 버튼(label=buttonLabel)→runAsyncValidation·checking="확인 중…"/valid="사용 가능"·invalid는 기존 errors 채널. trigger 기본 'change'·debounce 300·buttonLabel '확인'(spec-silent 기본·브리프 사전결정). +26 unit(**2070**: 'button' tri-state 전이·'change' debounce/취소/최신값·sync 무영향·승차·렌더/버튼 조건)·+**2 E2E**(async-demo 전용 fixture: 중복 alias→확인→invalid / 고유→valid 실브라우저, **23/23**)·full gate+E2E 독립 PASS·계수 43/49/182. **deviation(§Needs Review #W4-3a)**: **save-gating 미배선**(unchecked/invalid이 save 막는지 §5.3/§6.2 침묵)→form-controller.ts validateAll 스텝에 주석 플래그만·스펙 저자 결정 대기. minor: id 하드코딩 'AsyncValidation'(instanceof 식별·기존 관례 정합)·reset()시 asyncState 미리셋(spec-silent)·in-flight check 중 필드 제거시 phantom slice 가능(희귀·기존 async set 패턴 정합). logic `5a17ec3`.

- **W4-4** withRevision 주입 (§3.1·§6.2·CAP-07·C6 revision write-path) — 7파일(logic `e96906b`)·hot-file=entity-form.ts. **withRevision(entityName|undefined)**/**getRevisionEntityName(): string|undefined**(저장값 그대로·**menuUrl/name 폴백 제거**=구 0.3.x `||menuUrl||name` always-truthy 봉인·정직 undefined)·clone 전파(문자열=대입). EntityForm 43→**45**(=구 임계 45 정확 도달·W4-5서 초과=W4-0 재산정 필요성 실증). **BackendAdapter.remove(url, ids, revision?)** 옵셔널 추가(additive·기존 2-arg 콜러 무회귀)·backend-rcm impl body `{ids, revisionEntityName?}`(revision!==undefined시만·0.3.x `EntityForm.tsx:462-470` wire 포팅). **form-controller** save step5 un-omit(onBeforeSave 후·adapter 전·`if(rev!==undefined) data={...data,revisionEntityName}`·조건 spread 아님)·delete `adapter.remove(url, ids, getRevisionEntityName())`(미설정=undefined 통과)·헤더 주석 갱신. **side-effects**: adapter.remove 실콜러 2곳(controller delete=갱신·backend-rcm test=무변경)·mock-store .remove는 무관·0 broken. +16 unit(**2086**: withRevision round-trip/clear/**미설정 undefined**(폴백 봉인)/clone·controller save 설정/미설정 주입·delete revision 전달·backend body)·E2E 23 무회귀·full gate 독립 PASS·계수 45/49/182(/schema 무변경). **deviation 0**(backend wire=0.3.x 직접 이식·비-침묵). logic `e96906b`.

- **W4-5** withMeta/getMeta shallow-merge (§3.1·CAP-23·유일 escape hatch) — 2파일(logic `8092900`)·entity-form.ts만. `private meta: Record<string,unknown>={}` + **withMeta(patch)** shallow-merge(`next={...this.meta}`·patch 키별 `undefined`→`delete`·else 대입·**replace 아님**=프리셋 다중호출 클로버 방지 dx-6·L4 undefined=키 제거) + **getMeta(): Record**(기본 `{}`·getCapabilities 관례대로 **no defensive copy**=live 반환) + clone `{...this.meta}` shallow(독립). 구 attribute bag 9종 대체. EntityForm 45→**47**(=구 임계 45 초과=**W4-0 재산정 필요성 최종 확정**). +11 unit(**2097**: 기본{}·2회 합성 dx-6·same-key last-write·multi-key·undefined 키 제거·clone 독립 양방향·live 반환 문서화)·full gate 독립 PASS(E2E는 phase-end서)·계수 47/49/182. deviation: getMeta no-defensive-copy(getCapabilities 관례 따름·비-발명). logic `8092900`.

- **W4-6** phase-end 하드닝 (적대 리뷰 4버그 fix) — 9파일(logic `44edfae`). W4 phase-end 적대 리뷰(sonnet+high·cross-sub-task 10프로브·opus 소스 재확인)서 confirmed 5건(3 major·2 minor)→4 fix+1 §Needs Review: **#1(major)** 위저드 Save가 다른 step 필수필드 미입력시 **무피드백 dead-end**(validateAll 전체검증 fail·focus는 언마운트 필드라 getElementById 무효·배너 없음)→`jumpToInvalidStep()`(첫 invalid 필드 owning step으로 setStepIndex 후 focus·양 save 브랜치·비위저드 early-return 무영향). **#2(minor)** clone `{...this.meta}` 얕은복사→중첩값 참조공유→**treat-as-immutable 규약 문서화**(getMeta/withMeta/clone JSDoc·getCapabilities 정합·deep-clone 미채택=arbitrary 값 unsafe)+pinning 테스트(공유참조=의도). **#3(major)** `resetValue`(구 util·W4-3 미터치)가 asyncState 미리셋→stale '사용 가능'→`asyncState!==undefined시 'unchecked'`(errors clear 미러·키 없는 필드 무영향). **#4(minor)** async 확인버튼 `disabled=effReadOnly||checking`(구=checking만). **#5(minor)** step-hidden(id-based) vs 필드-hidden(store renderType) 분기→§Needs Review #W4-6a(스펙 결정·좁은 prefill edge). +6 unit(**2103**)·+1 E2E(**24**: 위저드 Save→invalid step 복귀+에러 표시)·full gate 독립 PASS·계수 47/49/182 무변경(fix는 신 멤버 0). logic `44edfae`.

## W4 페이즈 완료 인계 (Handoff → W5 list-track)

**W4 폼 완결 ✅ 완료(2026-07-11~12, `3b3518f`(W4-0)..`44edfae`(W4-6) 6 서브태스크+phase-end 하드닝·2103 unit·E2E 24·계수 47/49/182)**. CAP-05·07·10·13·23 전건 소화(대조: CAP-05=AsyncValidation W4-3·CAP-07=withRevision W4-4·CAP-10=withSteps W4-2·CAP-13=getTitle W4-1·CAP-23=withMeta W4-5+§3.6 큐레이션+§5.3).

- **도입 표면(W5 승계)**: EntityForm +withTitle/getTitle·withSteps/getSteps(**StepDef**)·withRevision/getRevisionEntityName·withMeta/getMeta(총 47멤버). FormField **AsyncValidation**(withValidations 승차·2채널). store `FieldValueSlice.asyncState` tri-state. `BackendAdapter.remove(url,ids,revision?)`. ViewEntityForm create-mode 위저드(Stepper·`jumpToInvalidStep`·W3-6 하이브리드 hidden). FieldRenderer async 확인버튼. 배럴 +StepDef·AsyncValidation(/schema 182).
- **⚠ W5 착수 전 필수(entry 브리핑 pass — waves §W5~W7 규칙)**: 태스크 표를 **먼저 추가·커밋**한 뒤 실행. W5=list-track: withList/withFilter(필드)→ViewListGrid 컬럼/정렬/필터 파생→registerListCellRenderer/registerFilterRenderer→고급검색 패널→페이지 셸 가이드(Wrapper 대응). 참조: 스펙 §5.1(withList/withFilter 신설)·§7·§2·§3.5·**§3.6**(withListConfig(199)/withFilterable(5)/withExcludeListFields(8)→withList/withFilter 이관·나머지 list 순수질의는 엔진 내부화)·[8그룹 map](../analysis/2026-07-11/eg-group-capability-maps.md) LIST-TRACK. CAP-18·19·20. **계수 재검증**: W5 신타입(FieldListConfig·FieldFilterConfig) §10-A 표 갱신·182→184 예상(190 여유)·root는 register*2+ViewListGrid 등 49→~55(120 여유).
- **W4 패턴 재사용**: hot-file 순차(entity-form/form-store/ViewEntityForm/FieldRenderer). delegate 기본 sonnet(브리프=실행급: 파일경로·before→after·기계적 수용·항목별 Do-NOT·재사용 근거 grep)·opus 검증(full gate+E2E 독립 재실행+diff intent-conformance)+커밋. **phase-end 적대 리뷰 필수**(W3 4버그·W4 4버그 검출 실증 — cross-sub-task 합성버그는 개별 게이트가 구조적으로 못 잡음). E2E는 전용 fixture(action-demo/steps-demo/async-demo 선례)로 격리.
- **Do-NOT(W4 승계)**: getStaticConditionalBoolean을 restrictive-gate(visible/enabled/capability/step-hidden) **함수 분기**에 쓰지 말 것(항상숨김 역극성·W3-6·함수는 async getConditionalBoolean)·store.renderType↔`actionRenderType`(id-based) 혼용 주의(위저드/액션바/CRUD=id-based·탭/필드=store)·**async validation은 sync validate() 중립 유지**(validateAll 네트워크화 금지)·getMeta 반환 mutate 금지(treat-as-immutable)·adapter.remove revision 옵셔널 유지·exactOptional 조건 spread·SOUND 내부 재작성 금지·store 직접 수신 금지(FormMutator 경유).
- **미결(§Needs Review 이월)**: #W4-1a(getTitle renderType 기본문구)·#W4-1b(withTitle replace)·#W4-2a(전 step hidden edge)·**#W4-3a(async save-gating**=**✅ D1서 구현·아래 참조**)·#W4-6a(step vs 필드 hidden renderType 분기). 나머지 4건 스펙 저자 판단감·비블로킹(D2 처분).

## D-pass — W4→W5 사이 미결 처분 (사용자 지시 2026-07-12: 일괄 결정+결함 수정)

### #D1 async save-gating 구현 (#W4-3a 확정 → CAP-05 완결)

**결정(사용자 2026-07-12)**: AsyncValidation = 일반 validation → 미완료/실패 async 필드는 save 차단. **shipped W4-3 결함 수정**: `validate()`가 중립이라 validateAll이 asyncState를 무시하고 통과시키던 갭. 스펙 §5.3(save-gating 블록)·§6.2(save 플로우 validateAll 스텝) 개정 반영.

**구현(Model A — dirty-gate, opus 인라인·hot-file form-store.ts):**
- **validateAll 게이트**(`form-store.ts` validateAll): `findAsyncValidation(field) && slice.dirty===true && asyncState!=='valid'` → invalid + `asyncGateMessage(state)`. **네트워크 없음**(sync validate() 중립 유지·저장된 tri-state만 read). **dirty 게이트**가 핵심: update 폼 미터치(persisted) 값=재확인 불요·resetValue→'unchecked'(W4-6 FIX#3)+dirty=false=비차단 — seed-'valid'-on-update 대신 dirty 조건으로 update-baseline·revert 문제 동시 해결(기존 resetValue 동작과 무충돌).
- **reset-on-edit**(`writeValue`): 값 변경 시(`prev.asyncState!==undefined && !Object.is(prev.current,value)`) asyncState→'unchecked'. **확인 후 값 변경으로 게이트 우회하던 구멍 봉인**(button 트리거는 재확인 전까지 차단·change 트리거는 debounce 재확인). 키 없는 필드엔 추가 안 함(resetValue 불변식 미러).
- **stale in-flight 가드**(`runAsyncValidationNow`): check 진행 중 값이 바뀌면(`!Object.is(현재값, 캡처값)`) 결과 폐기 — stale valid 부활 방지(button 트리거 race).
- **게이트 메시지**: state별 결정적 문구(unchecked='확인이 필요합니다.'·checking='확인이 진행 중…'·invalid='확인에 실패했습니다…'). check 고유 메시지(예 '이미 사용 중')는 확인 시점 노출·저장 시점엔 generic(단일 errors 채널의 sync/async commingling·idempotency 문제 회피 — 별도 asyncMessage 필드 신설=기존 "no separate message field" 설계 반전이라 미채택).

**doc 동기화**: form-store `runAsyncValidation` SCOPE 노트(OUT→SAVE-GATING)·form-controller 헤더 save-flow NOTE·schema-core `FieldValueSlice.asyncState` JSDoc·`async-validation.ts` 2채널 헤더(validate() 중립이나 validateAll이 저장 tri-state 별도 게이트).

**검증**: +11 unit(**2114**: dirty unchecked/invalid/checking→validateAll false·valid→true·untouched-update(initializeFormStore) 면제·reset-on-edit·same-value no-reset·stale-guard·controller.save 차단/valid통과/skipValidation 우회)·+3 E2E(**27**: async-demo Save 차단 unverified/edited-stale/invalid). full gate 독립 PASS(type-check·2114·lint 0err·format·build·계수 47/49/182 무변경=신 export 0). 파일: form-store.ts·form-controller.ts·types.ts·async-validation.ts(schema)·async-validation.test.ts·async-validation.spec.ts·async-demo.ts·async-demo/new/page.tsx·스펙 §5.3/§6.2.

### #D2 잔여 §Needs Review 9건 일괄 처분 (스펙 저자·발명금지 해제)

전건 처분표 = [needs-review-dispositions-2026-07-12.md](./needs-review-dispositions-2026-07-12.md). 요약: **코드 2 + 문서 7 · §Open Q 이월 0**.

**코드 변경**:
- **#W2-5 + #W3-2 (동류)** — `SaveOutcome`에 **`reason: 'validation'|'cancelled'|'capability'|'error'` 판별자 추가**(인라인 union 확장·신 export 0·계수 무변경). bare `{ok:false}`로 붕괴하던 3 blocked 결과(validation/reason-less cancel/capability)를 구별 가능하게. reason-less cancel도 `reason:'cancelled'`(exactOptional `cancelled:undefined` 갭 #W2-5 봉인)·capability=`reason:'capability'`(#W3-2). 근거=재설계 정직-타이핑 가치·headless C7 분기. 파일: form-runtime.ts·form-controller.ts(9 site+헤더)·entity-form.ts(cancel JSDoc)·스펙 §6.2. 테스트: form-controller.test.ts assertion+reason-less cancel 신규·async-validation.test.ts·form-actions.test.tsx.
- **#W3-5b** — `formReadOnly`일 때 `replaces:'save'` 커스텀 액션도 드롭(merge 전 `custom` 필터). Save 어포던스=빌트인+교체 액션 슬롯. 파일: ViewEntityForm.tsx·스펙 §3.1. 테스트: form-read-only.test.tsx +2.

**문서 결정(현 구현=의도·코드 변경 없음)**: #W3-3(controller 타입 불변·controller-less 뷰는 액션 omit=정직, 스펙 §3.4)·#W4-1a(getTitle 폴백=this.name·카피 미발명, §3.1)·#W4-1b(withTitle replace, §3.1)·#W4-2a(전 step hidden=graceful 액션바만, §3.2)·#W4-6a(step id-based vs 필드 renderType 분기=의도, §3.2)·#W2-1(onInit 설계확정=기존 §4.2/§9·잔여는 W7 gjcu 마이그레이션 검증으로 전환).

**검증**: +6 unit(**2117**: reason-less cancel 구별·formReadOnly가 replaces:'save' 숨김+일반 커스텀 잔류)·E2E 27 무회귀·full gate 독립 PASS(type-check·2117·lint 0err·format·build·계수 47/49/182 무변경).

## #W5-1 substrate (2026-07-12 · CAP-18)

**순수 additive 필드 선언 substrate**(스펙 §5.1) — 소비 로직 0(파생·정렬·필터패널은 W5-2/W5-3). 위임(sonnet)→메인 authoritative 검증.

**변경(4파일)**:
- 신규 `field/list-config.ts`: `FieldListConfig {order?, label?, align?('left'|'center'|'right'), width?(number|string), sortable?}` · `FieldFilterConfig {operator?, order?, label?}` — 전 프로퍼티 `p?: T | undefined`(L4·exactOptionalPropertyTypes-safe).
- `field/form-field.ts`: private `listConfig`/`filterConfig` 인스턴스 필드 + `withList(config: FieldListConfig|false = {}): this`/`getListConfig()`/`withFilter(...)`/`getFilterConfig()` (in-place mutate+return this, §5.2 관용구). tri-state: undefined=미선언·`{}`=옵트인 기본·`false`=명시제외. **clone() 전파**(:253-)=object일 때만 `{...}` 새 참조(validations/requiredPermissions 패턴 동일), false/undefined는 Object.assign 안전 — L8 clone 무손실.
- `index.ts`: `export type { FieldListConfig, FieldFilterConfig }` (배럴 +2 → /schema 184).
- `__tests__/field-core.test.ts`: +7(round-trip·tri-state 2·chainable·clone 무손실+참조 비공유·clone false/undefined 보존).

**검증(메인 authoritative)**: full gate 독립 PASS — type-check·typecheck:packages·test **2124**(+7)·lint 0err·format·build · 계수 **47/49/184**(EntityForm·root 무변경·/schema +2). manifest=선언 4파일만·HEAD 불변·M2O/react 미변경 확인.

**deviations(2)**: ① 에이전트가 검증용 read-only `git status/diff` 실행(명시 "no git" 위반이나 read-only·무영향 — 처분: trivial, 조치 없음). ② `FieldFilterConfig.operator`=`string`(QueryConditionType union 미채택) — 스펙 §10-A "필터 operator 유니온 미분해" 근거의 보수적 정답(브리핑도 string 지시). **W5-3에서 operator 타입 확정**(후보=`search-form.ts` QueryConditionType) → §Needs Review 등재.

## #W5-2 column-derivation (CAP-19)

**ViewListGrid 컬럼 파생을 getListConfig() 기반으로 전환·마법폴백 폐기·list-cell 레지스트리 신설·ManyToOne showInList 흡수**(스펙 §5.1/§7 CAP-19). 위임(sonnet)→메인 full gate+E2E authoritative.

**변경(17파일)**:
- 신규 `packages/react/src/registry/list-cell-renderer-registry.tsx`: `Map<string, ListCellRendererComponent>` + `registerListCellRenderer(type, comp)`/`getListCellRenderer(type)` — `field-renderer-registry.tsx:28-38` 패턴 복제, string 키(§7 열린 타입). props `{value, row, field?}`.
- 신규 `packages/react/src/components/list-columns.ts`(내부 헬퍼·배럴 미노출): `deriveListFields(entityForm)`=getListConfig() truthy 필드 수집(sub-collection 제외·`config.order ?? field.getOrder()` 안정정렬·0-truthy→[]) + `deriveListFieldNames` + `getFieldDisplayValue`(§5.2 seam 방어적 조회). ViewListGrid·xref 양쪽이 import(단일 소스, 두 duck-typed 소비처 일원화).
- `ViewListGrid.tsx`: `hasShowInList`/`deriveDefaultColumnNames`(마법폴백) 제거 → `deriveColumns()`(0-truthy=빈 컬럼+`console.warn` 스펙인용 메시지). 셀 체인 `getListCellRenderer(type)`→`getDisplayValue`→`String`. align/width→inline style, sortable 헤더→raw `<th onClick=store.setSort(name, toggle)>`+`aria-sort`(ui-default `Table.Th/Td`가 children/colSpan만 포워딩 → 스타일/sortable 컬럼만 raw 엘리먼트, 무스타일 컬럼은 byte-identical `Table.Th/Td` 유지). `columns` prop escape hatch 유지(non-empty=파생 미실행).
- `many-to-one-field.ts`: `showInList = false` 필드 제거 · `useListField(): this`→`this.withList()` 위임(공개 메서드명 유지, 스펙 §5.1 "useListField 대체").
- `xref-prefer-mapping-renderer.tsx`: 자체 `defaultColumnNames`(duck-typed showInList) 제거 → `deriveListFieldNames(target)` 공유.
- `react/src/index.ts`: 배럴 +4(registerListCellRenderer·getListCellRenderer·ListCellRendererComponent·ListCellRendererComponentProps) — field-renderer 블록 병렬.
- apps/sample 이행: `college/subject/professor`(explicit columns 없이 폴백 의존 → withList 선언 필수)+`major/staff`(ManyToOne 피커 target으로 렌더 → deviation 1). College `name.withList({label:'대학명', sortable})`·`englishName.withList({align,width})`·`active.withList({align:'center'})`로 FieldListConfig 오버라이드 실증.
- 테스트: schema-core +2(useListField⟹getListConfig truthy) · react +5(order/label/align/width 파생·false 제외·0-truthy+warn·columns escape·sortable click ASC↔DESC·registry 우선순위) = **2131**(+7) · e2e/college.spec.ts +1 assertion(withList label '대학명' columnheader — 폴백은 '명칭' 표시했을 것, 판별적).

**검증(메인 authoritative)**: full gate 독립 PASS — type-check·typecheck:packages·test **2131**·lint 0err·format·build. 계수 **47/53/184**(EntityForm 무변경·root 49→53[+4]·/schema 184 무변경, 전부 임계 내). **E2E 27/27 green**(college/subject/major XrefMapping/collabo M2O/professor 포함). HEAD 불변·manifest 17파일 선언과 정확 일치·ViewEntityForm/entity-form/form-store 미관통 확인.

**deviations(3·전건 risk:low·E2E로 실증)**:
1. **major.ts+staff.ts withList 추가**(브리핑 directive 8은 college/subject/professor 3개만 명시). MajorEntityForm=parentMajor 자기참조 M2O 피커 target·StaffEntityForm=Collabo.staff M2O+Major.staffs Xref 피커 target(둘 다 columns prop 없음) → 폴백 폐기 후 withList 없으면 major/collabo E2E 파손. directive 8 "unless needed" 여지 충족. **→ §Needs Review**.
2. **`(field as FormField).getListConfig()` 구조적 캐스트**(list-columns.ts). `EntityField` 인터페이스(getFields() 반환형)가 getListConfig/getDisplayValue 미선언(W5-1이 FormField 클래스에만 추가) → frozen 파일 미관통 위해 캐스트+존재체크. 전 concrete field가 FormField extends라 런타임 안전. **후속 정리 후보: W5-3(동일 getFilterConfig 패턴)/W7에서 EntityField 인터페이스에 선언 이관**. **→ §Needs Review**.
3. **기존 픽스처 4파일 withList 추가**(view-list-grid·xref-prefer-mapping·xref-mapping·many-to-one-filter test). columns prop 없는 ViewListGrid/피커 픽스처 → 폴백 폐기 시 파손. 팀규약 "기존 테스트 수정 허용·기대값 변경은 스펙 §인용"(§5.1 폐기)·행동 약화 아님. **→ §Needs Review**.

## #W5-3 advanced-search (CAP-20)

**ViewListGrid 내장 고급검색 패널 + filter-renderer 레지스트리 + withFilter 파생 + list-store setSearchForm 액션**(스펙 §5.1/§7 CAP-20). 위임(sonnet)→메인 full gate+E2E authoritative. logic 커밋 `2223f35`.

**변경(9파일)**:
- 신규 `packages/react/src/registry/filter-renderer-registry.tsx`: `Map<string, FilterRendererComponent>` + `registerFilterRenderer(type, comp)`/`getFilterRenderer(type)` — `list-cell-renderer-registry.tsx`(W5-2) 형 복제, string 키(§7 열린 타입). props `{field, value, onChange}`(controlled 필터 입력·row 컨텍스트 없음).
- `list-columns.ts`: `deriveFilterFields(entityForm)`=`deriveListFields` 자매(`filterConfigOf=(field as FormField).getFilterConfig()` truthy 수집·sub-collection 제외·`config.order ?? field.getOrder()` 안정정렬·0-truthy→[]) + `DerivedFilterField {field, config}` + `filterConfigOf` 헬퍼(listConfigOf 동형 캐스트).
- `ViewListGrid.tsx`: 고급검색 패널 내장(별도 export 아님·§7 결정 3-내장). `deriveFilterFields` 0건→토글/패널 미렌더. 토글 Button "고급검색"→패널; 필드별 `getFilterRenderer(field.type)` 폴백 useUI `TextInput`(label htmlFor 연결); apply Button "검색"→비어있지 않은 값만 `store.searchForm.addAndFilter({name, value, ...(operator?{queryConditionType: operator as QueryConditionType}:{})})` 폴딩→`setSearchForm`. operator=FieldFilterConfig.operator(open string, §10-A) 있을 때만 캐스트·없으면 omit(발명 기본 금지·exactOptional 조건대입).
- `list-store.ts`: `setSearchForm(next: SearchForm): Promise<void>` 액션 신설 — `set({searchForm: next.withPage(0)}); await get().fetch()`(quickSearch page-reset 선례·**fetch 계약 무변경**·기존 액션 무변경). ListStoreState 인터페이스 +1.
- `react/src/index.ts`: 배럴 +4(registerFilterRenderer·getFilterRenderer·FilterRendererComponent·FilterRendererComponentProps) — list-cell 블록 병렬(W5-2와 동형).
- apps/sample `college.ts`: `name.withFilter({label:'대학명', operator:'LIKE'})` — operator passthrough 실증('LIKE'=유효 QueryConditionType).
- 테스트: 신규 `list-columns.test.ts` +2(deriveFilterFields order/label/false·undeclared 제외·subCollection 제외) · `view-list-grid.test.tsx` +5(빈-파생 무패널·토글 라벨입력·apply AND-필터+operator+page-reset·operator 부재 시 queryConditionType 키 부재 단언·등록 렌더러 우선) = **2138**(+7) · `e2e/college.spec.ts` +1(고급검색 토글→대학명='공과'→검색→공과대학 visible·인문대학 not).

**검증(메인 authoritative)**: full gate 독립 PASS — type-check·test **2138**·lint 0err·format·build. 계수 **47/57/184**(EntityForm 무변경·root 53→57[+4]·/schema 184 무변경, 전부 임계 55/120/190 내). **E2E 28/28 green**(신규 college 고급검색 #14 포함·타 리스트 페이지 무회귀). HEAD 불변(ef7070b→logic)·manifest 9파일 정확 일치·entity-form/form-store/ViewEntityForm 미관통.

**§Needs Review #W5-1 operator 타입 확정(해소)**: FieldFilterConfig.operator=**open `string` 유지**(스펙 §10-A "operator 유니온 미분해"·list-config.ts:26 주석). FilterItem.queryConditionType(12-값 UPPERCASE 유니온) 캐스트는 addAndFilter 빌드 지점에서만·operator 부재 시 omit. QueryConditionType 채택(후보) 기각 — 스펙이 open 유지 결정.

**deviations(재확인 후 §Needs Review)**:
1. **재적용(re-apply) de-dup 미구현**(risk: low-med — 브리프가 미리 표시한 fork). `applyAdvancedSearch`는 매 클릭 `store.searchForm.addAndFilter` 폴딩 → 단일 apply(태스크 수용 기준·E2E 유일 시나리오)는 정확하나, 같은 필드에 다른 값으로 재검색 시 AND 절 2개 누적(둘 다 매칭 강제→0행 가능). SearchForm에 "이름별 제거" 프리미티브가 W5-3 파일 스코프 밖(search-form.ts 미포함) → 브리프 Do-NOT("search-form.ts API 확장 금지·단일 apply 정확+재적용 flag") 준수해 미구현·flag. **→ §Needs Review**.
2. root 계수 +4(브리프 개념표기 "+1"): 배럴이 4 심볼(register/get + 2 타입) 리터럴 export — W5-2 registerListCellRenderer 블록과 동형(그것도 +4). count 스크립트는 named export 리터럴 계수·waves "+1/+2"는 API 개념 약칭. 57/120 대폭 여유·임계 무위험(정보성·intent-drift 아님).
3. mock-backend AND-필터: `apps/sample/lib/mock-backend/store.ts` `matchesFilterGroup`가 이미 `AND.every(...)`+`LIKE`(대소문자 무시 substring) 구현(Major XrefMapping IN/NOT_IN용 선재) → W5-3 무변경. E2E로 실증(발견·departure 아님).
4. Playwright `{name:'검색', exact:true}`(risk:none·test-only): 기본 substring 매칭이 "고급검색" 토글도 매칭(strict 위반) → exact. testing-library getByRole는 기본 exact라 unit 무영향.
5. 폴백 TextInput `ariaLabel` 대신 `<label htmlFor>/id`(FieldRenderer 관례) — accname 중복 회피·코드품질 선택·스펙 deviation 아님.

## #W5-4 + W5 wave-end (CAP list-track 완료)

**W5-4 페이지 컴포지션 가이드(문서·컴포넌트 아님)** — waves §W5 결정1(스펙 §7 react 표에 페이지-셸 컴포넌트 없음·§9 "호스트 셸 MIGRATION 전용 절"·헌장 C7). 신규 `documents/plans/list-page-composition-guide.md`: ① 원칙(페이지 chrome=호스트 소유·엔진은 ViewListGrid 한 조각) ② 프로바이더 배선(루트 1회·providers.tsx 정준·ListGridProvider 편의형) ③ 정준 리스트 페이지 컴포지션(college/page.tsx 해부 표·useMemo entityForm+store→main→헤더행+새로만들기→ViewListGrid) ④ ViewListGrid 표면 요약(컬럼 파생 CAP-19·columns escape·고급검색 CAP-20·커스텀 렌더러) ⑤ CAP-18/19/20 소비자 접점 대조 ⑥ 한계(재적용 de-dup §Needs Review #W5-3). apps/sample 6 리스트 페이지(college·subject·student·major·professor·collabo)가 이미 이 bare 컴포지션으로 동작 → 신규 컴포넌트 발명 없음(§10 게이트 4). W7 MIGRATION 전용 절이 흡수 예정.

**W5 wave-end 게이트(2026-07-12)**: **CAP-18**(withList/withFilter substrate·W5-1)·**CAP-19**(deriveListFields+registerListCellRenderer·W5-2)·**CAP-20**(deriveFilterFields+registerFilterRenderer·W5-3) 전건 착지 대조(빈 행 0). **계수 47/57/184**(EntityForm/root/schema·임계 55/120/190 전부 내·root W5 +8=list-cell 4+filter 4 레지스트리 export). **full gate+E2E 28** green(last code `2223f35`·W5-4 docs-only·전 리스트 페이지 무회귀). W5(list-track) 완료 → 다음 W6 data-transfer는 entry-brief pass 선행.

## #EG1+EG2 권한 배선 (2026-07-11, `a1f3deb`)

**LIVE 보안갭 fix** — 재설계(W1~)와 무관하게 유지되는 실배선. `isPermitted`를 end-to-end로 연결:
- **toSaveData 제외**: 비허가 필드는 저장 페이로드에서 배제(우회 저장 차단).
- **FieldRenderer 하드게이트**: 렌더 계층에서 비허가 필드를 강제 차단 — EF1 파이프라인으로 우회 불가.
- **규모**: +10 테스트(누계 1876 unit) · 16 E2E green. 재설계 스펙(CAP-02·03 권한군)이 이 배선을 상위 개념으로 흡수하나, 구현 자체는 SOUND로 유지(§세션 인계 Do-NOT: SOUND 내부 재작성 금지).

## Progress notes (본문 이월 — W1~W3 방법론·검증, 2026-07-11 slim)

- **W1 방법론**: `tsc -b`(typecheck:packages)는 __tests__ 미타입체크 → EntityForm 멤버 제거/개명 시 테스트파일 콜러는 `npm test`로만 검출. rename 웨이브 검증은 tsc+test 둘 다 필수(W1-3 발견, W1-4/5 승계).
- **EG-D 검증**: 4렌즈 적대검증(wf_c55e83dc-6b1) 22건(blocker 1·major 18·minor 3) 전건 수용·r2 반영 — blocker=InitContext.setMeta 부재(gjcu 774+118 콜사이트 이식 불가). opus 봉인 재검증 1회.
- **교차리포(harness)**: 실행급 스펙 규율을 harness에 제도화(팀규약·model-routing·progress-authoring/delegate·issue·codex 미러 — harness `b178fa6` push+install). 사용자 지시: opus-only 모드에서도 균질 실행.
- **W2 착수**: 8 sub-task(W2-1~8) hot-file 순차·delegate 기본 sonnet(waves §W2 브리핑 원문)·opus 검증/커밋.
- **W3 착수**: 5 sub-task(W3-1~5) hot-file 순차·fan-out 금지·delegate 기본 sonnet(waves §W3=브리핑 원문)·opus 검증(full gate+diff 발명감사)/커밋. **W3-1 발명게이트 1건**(sync ConditionalBoolean 해석=async resolver뿐)→[blueprint EG4 sync 근사 GO](../plans/eg-entityform-full-parity.md) 사전판정 바인딩으로 해소(getStaticConditionalBoolean 신설·발명 아님).
- **W4-0 계수 재산정 방법론(2026-07-11, 본문 이월 2026-07-12 slim)**: `scripts/count-public-surface.mjs`의 EntityForm 계수는 public `get*Handlers`(훅당 1, §3.3 "엔진 내부"이나 cross-package라 public 필수)+getReadOnly까지 포함 → 최종 53. 스펙 "44 소비자 멤버"와 기계 계수(53)의 갭을 §10-A 표로 명문화. 계수 **규칙**은 무변경(임계값만 재산정). 대안(get*Handlers 계수 제외 규칙)은 채택 안 함 — cross-package public 불가피·규칙 예외 추가는 invention 리스크. W5/W6는 entry pass에서 §10-A 표 갱신+임계 재검증(waves 규칙 반영).

## #W6-1 schema surface (CAP-16)

✅ 2026-07-12 · sonnet 위임(brief=waves W6-1 행)→메인 authoritative 검증(full gate 독립 재실행+diff 리뷰). 순수 additive(schema-core·React/런타임 0).

**변경(4파일)**: 신규 `packages/schema-core/src/data-transfer.ts`(타입 `DataFieldSpec{name,label?,type?}`·`DataTransferSpec`(반환·fields 필수)·`DataTransferInput`(입력·fields 옵셔널=auto-derive 트리거·**미배럴**) + 순수함수 `deriveDataFields`/`resolveTransferFields`/`resolveDataTransferSpec`) · `entity-form.ts`(private `dataTransfer` + `withDataTransfer(config):this` 저장(replace 의미) + `getDataTransfer():DataTransferSpec|undefined` **동기**·query-time 파생(this.getFields()) + clone 얕은복사) · `index.ts`(배럴 +2 type-only) · `__tests__/entity-form-data-transfer.test.ts`(18).

**:448 구조적 fix**: `resolveTransferFields(declaredFields, deriveFields)` = export/import 공유 대칭 헬퍼 — 시그니처에 **상대편 fields 도달 경로가 없음** → "import 폴백이 export.fields 검사"가 관례 회피가 아니라 **표현 불가능**. getDataTransfer가 export.fields·import.fields 각각 자기쪽만 닫힌 채 1회씩 호출. 회귀 테스트 3건(`:448 regression` describe — export SET+import EMPTY→import이 선언필드 auto-derive·명시 빈배열·대칭 export쪽).

**검증(메인 authoritative)**: full gate 독립 PASS — type-check·typecheck:packages·test **2156**(신 18/18·+18 from 2138)·lint 0err(258 pre-existing warn·legacy)·format·build. 계수 **49/57/186**(EntityForm 47→49·root 57 무변경·/schema 184→186, 전부 임계 55/120/190 내). HEAD 불변(04edb12→logic)·hot-file form-store/ViewEntityForm 미관통.

**deviations(전건 spec-conformant·§Needs Review 불요)**: ① brief 인용 line# stale(neverDelete/submitTransform=HEAD서 제거·W2/W3서 withCapabilities/onBeforeSave로 대체)→withRevision/getRevisionEntityName 동형 패턴 미러(HEAD-relative 재확인 지시대로) ② 복합타입 auto-derive 필터링 미구현=결정5 "W6-2서 확정" 준수(schema는 전 필드 포함·순수 선언·/excel이 export시 제외+warn — 스펙 §3.5 계층 확정 반영) ③ prettier 재포맷(공백만).

## #W6-2a /excel foundation (CAP-17)

✅ 2026-07-12 · sonnet 위임(brief=waves W6-2 착수 노트)→메인 authoritative 검증(full gate 독립 재실행). 신규 `@listgrid/excel` 패키지 foundation(registry DI + 값변환 — React 컴포넌트 없음, 2b 소관).

**변경**: 신규 `packages/excel/`(`package.json`=@listgrid/react shape·xlsx-js-style/file-saver **optional peer**+devDep·`tsconfig.json`=state 클론·ref schema-core) · `registry.ts`(DI seam 이식 구 `transfer/registry.ts` — configureDataTransfer/getDataTransfer·type-only react import·props=`Record<string,unknown>`(no-explicit-any 게이트 회피·2b 정제)) · `value-transform.ts`(exportValue/importValue/isAutoDeriveExcluded/warnAutoDeriveExcluded — 구 `Type.ts:531-620`+helper 이식) · `index.ts`(배럴 5+1type) · `__tests__`(registry 4+value-transform 41=45) · root `tsconfig.json`(+1 ref `./packages/excel`=tsc-b 픽업) · `package-lock.json`(npm i 워크스페이스 링크).

**값변환 tiers(결정5 확정)**: TIER1 transform(select/multiselect(`|||`)/date/datetime(range `~`)/boolean(예/아니오)/html·markdown(strip)) · TIER2 passthrough(String·그 외 전 primitive) · TIER3 auto-derive 제외+warn(subCollection/contentAsset/multipleAsset/file/image/inlineMap/mappedJoin 7종·`export.fields` 명시 시 포함). date fmt=hand-roll 포트(new-engine no-date-fns 선례 datetime-renderer.tsx 따름·구 misc/index.ts:49-65 default fmt만).

**검증(메인 authoritative)**: full gate 독립 PASS — type-check·tsc-b(packages/excel dist 빌드=root ref 작동)·test **2201**(신 45)·lint 0err·format·build. 계수 49/57/186 무변경(/excel=신 subpath·3-예산 밖). vitest 기존 glob으로 packages/excel 테스트 발견(config 무변경).

**deviations(3·§Needs Review 등재)**: ① importValue +optional `options` 3번째 인자(brief는 2-arg이나 select/multiselect label→value=option 필수·round-trip 테스트 불가능 → 기계적 필연·exportValue 대칭·발명 아님) ② multiselect `|||` 양방향(구 Type.ts import 분기 latent bug=`,` 검사후 `|||` split → brief 명시대로 양방향 `|||`·L8 구결함 봉인·round-trip green) ③ fDate/fDateTime = `new Date()` UTC파싱+local getter → 음수-UTC-offset 브라우저서 date-range export 하루 밀림 가능(구 date-fns fDate 동작 계승=회귀 아님·테스트는 TZ=UTC 고정·**실 GJCU 데이터 소비자 검증 필요**). multiselect 런타임값=신엔진 `string[]` ↔ `|||` 문자열 브리징은 export/import CORE(2b) 소관(value-transform 주석 명시).

## #W6-2b /excel export/import core (CAP-17)

✅ 2026-07-12 · sonnet 위임(brief=waves W6-2 착수 노트+W6-2a foundation)→메인 authoritative 검증(full gate 독립 재실행+로직 리뷰). W6-2a foundation 위 export/import 런타임 코어+thin 모달.

**변경**: `package.json`(+`@listgrid/react` dep·+`react` peer·devDep) · `tsconfig.json`(+ref `../react`) · 신규 `field-resolution.ts`(filterFlatFields TIER3 필터+warn 공유·getFieldSelectOptions duck-cast) · `export-core.ts`(resolveExportConfig/buildExportAoa/buildExportWorksheet/downloadExportWorkbook — 구 `ExcelProvider.ts:71-219` 이식·header `${label}\n[${name}]`·text-format 셀·헤더 스타일·XLSX.write+FileSaver·**password/history/skipHeader 제외**) · `import-core.ts`(parseWorkbookArrayBuffer/matchImportColumns/resolveImportFields/buildImportRows — 구 `DataImporter.tsx:113-387` 이식·`[name]` 헤더매칭·per-cell importValue·blank-row drop·**preview/result/sample 제외**) · `DataExporter.tsx`/`DataImporter.tsx`(thin 모달·useUI Modal/Button 재사용 C7·file input=native) · `registry.ts`(props 타입 정제) · `index.ts`(+DataExporter/DataImporter/registerExcelDataTransfer) · 6 test(45)+package-lock.

**결정 배선**: 결정6 import upload=**호스트 공급 `onSubmit:(rows)=>Promise<void>|void` prop**(어댑터 메서드/endpoint 하드코딩 없음·W6-3 sample이 POST 소유) · 결정4 UI=ViewListGrid toolbar seam에서만 렌더(useUI 안전) · 결정7 미이관(officecrypto/history/Sample/Result/Dynamic) 준수 · multiselect `string[]`↔`|||` 브리징=export/import core 경계(bridgeExport/ImportValue).

**결정5 TIER3 필터 uniform 확정(W6-2b)**: `getDataTransfer()`가 명시/파생 discriminator 미보유(schema 순수 선언) → /excel이 반환 필드 전체에 **uniform** TIER3 필터. flat cell 무의미(String=garbage)라 명시여도 제외가 정답(스칼라 평탄화가 소비자 경로). spec §3.5·waves W6-2 노트 동반 개정(구 "명시 시 포함" 폐기).

**검증(메인 authoritative)**: full gate 독립 PASS — tsc-b(packages/excel dist)·test **2235**(신 34·excel 79 누계)·lint 0err·format·build. 계수 49/57/186 무변경. deviation 1(결정5 uniform 해석·문서 개정으로 해소).

## #W6-3 toolbar + sample + E2E (CAP-16/17 UI)

✅ 2026-07-12 · sonnet 위임(survey+구현+E2E)→메인 authoritative 검증(**E2E 독립 재실행 관찰**). /excel 런타임을 apps/sample College에 실배선해 export/import "작동" 실증.

**변경**: `apps/sample/app/providers.tsx`(+`registerExcelDataTransfer()` 모듈스코프·registerDefaultRenderers 선례) · `lib/entities/college.ts`(+`.withDataTransfer({export:{},import:{}})` auto-derive) · `app/college/page.tsx`(**toolbar render-prop** Export/Import 버튼+getDataTransfer() 모달·신규 ViewListGrid prop 없음·decision4/C7) · 신규 `app/api/college/excel-upload/route.ts`(POST bulk-create·collegeStore().create·decision6 호스트 소유) · 신규 `e2e/college-excel.spec.ts`(export+import) · `apps/sample/package.json`(+@listgrid/excel·xlsx-js-style·file-saver·zustand)+lock.

**배선**: export=`useStore(store,s=>s.rows)` 현 페이지 행→`Exporter rows={rows}`(클라 100%·백엔드 불요) · import=`Importer onSubmit={handleImportSubmit}`→`fetch('/api/college/excel-upload',POST)`→`store.getState().fetch()` 재조회→모달 닫기(decision6).

**검증(메인 authoritative — E2E 독립 관찰)**: full gate PASS·계수 49/57/186 무변경. **E2E 28→30·30/30 green**(독립 재실행 `npm run test:e2e -- e2e/college-excel.spec.ts` → 2 passed: export .xlsx 다운로드·import fixture 업로드→행 출현). 실 export-core.ts 경로를 브라우저(Next 번들)서 실행=진짜 작동 실증.

**deviations**: ① E2E 스펙의 Node-side fixture 생성 코드가 `import * as XLSX`→Node ESM(type:module)서 named export 미노출(CJS 번들 `.default`만)로 실패 → 스펙만 `import XLSX from`(default) fix. **export-core.ts의 `import * as XLSX`는 무영향**(tsup/Next 번들러 처리·구엔진 동일 패턴). **→ W7 published 패키지서 소비자 번들러 xlsx interop 확인 필요**(waves W7 노트). ② College `{}` auto-derive가 `dean`(manyToOne·TIER2 passthrough) 포함 → seed 무값이라 빈 컬럼(무해)·기존 TIER3 경계 §Needs Review에 포함.

<a id="w7-entry"></a>
## #W7 entry-brief pass (2026-07-12 · opus · 콜드리더 통과)

**결과**: W7(마지막 wave) 착수 전 entry-brief pass — waves §W7 표(W7-1~5)를 execution-grade로 확정하고 8개 wave-entry 결정을 소진. 콜드리더(신선 에이전트·문서 체인만) 프로브 1결함 검출·fix.

**결정 8건(wave-entry)**: ① 빌드 기전 = tsup 멀티엔트리 + code splitting(공유 청크) ② 구 `src/` = 특성화 오라클로 **존치**(삭제 금지·W7 범위 아님) ③ CAP-24 adapter headers 함수형 = W7-3 ④ headless fixture(CAP-25) = W7-2 상시 회귀 게이트 ⑤ codemod 범위 = §9 codemod/준-기계 행만(수동 행 제외) ⑥ 페이지셸 = list-page-composition-guide를 MIGRATION.md에 흡수 ⑦ presets-rcm·backend-rest(빈 스캐폴드) = exports/entry **omit-if-empty** ⑧ `build:styles` 소스 = 현 `src/listgrid/styles/*.css` 유지.

**스코프 정정(핵심)**: published `@rchemist/listgrid`가 아직 구 `src/` 전체를 번들 중 → W7이 `packages/*`를 스펙 §2 subpath 맵으로 **처음** published화(단순 패키징 정비가 아니라 진입점 전환).

**콜드리더 1결함 fix**: `build:styles` 관련 문서 체인 갭 — 그 자리에서 앵커 수정.

<a id="w7-1"></a>
## #W7-1 패키징 코어 (2026-07-12 · published 진입점 src/→packages/*)

**결과**: published `@rchemist/listgrid`가 이제 v0.4 `packages/*` 엔진을 §2 subpath 맵으로 번들(구 `src/` 엔진 아님). full gate 전건 green·유효 publishable 패키지(publint/attw).

**변경 파일**:
- `tsup.config.ts`: entry 객체형 7키(`index`→react·`schema`→schema-core·`state`→state·`ui-default`·`backend-rcm`·`next`·`excel`) — 빈 스캐폴드 backend-rest·presets-rcm omit(결정 7). `external` 26→8(peer 실사용분·charter C7). `dts`→`experimentalDts`(아래).
- `package.json`: exports 구 11 subpath(`/form/*`·`/api`·`/misc`·`/qr`·`/address`·`/api-spec`·`/xref-price`·구 `/headless`) 제거 → §2 신 맵 7 subpath+styles 6. typesVersions 재작성. **peerDependencies 26→6**(required react·react-dom; optional next·xlsx-js-style·file-saver·react-daum-postcode) — 구 UI peer(@headlessui·react-select·@tabler·sortablejs·qrcode·kakao·sweetalert·date-fns·nuqs·iconify)는 packages/* 미import(C7 호스트 제공)라 제거. `build:styles` 소스=현 `src/listgrid/styles/*.css` 유지(결정 8).
- `tsconfig.json`: `exclude`에 `tests/headless` 추가(headless fixture는 published 이름 self-import이라 메인 프로그램서 제외·W7-2 격리 tsconfig서만 컴파일).

**dts 해소(엔지니어링 노트 — 최종·다음 세션 참조)**: packages/* 엔트리에서 tsup 기본 `dts`(rollup-plugin-dts)가 `@listgrid/*` cross-package 타입을 해소 못해 parse 실패 → **`dts.compilerOptions.paths`로 `@listgrid/* → packages/*/src/index.ts` 매핑**해 해소(최종 채택). **버린 경로(Do-NOT 재시도)**: ① `experimentalDts`(+`@microsoft/api-extractor`)는 per-entry `.d.ts`를 **`export {}` 빈 스텁**으로 방출(내용은 `_tsup-dts-rollup.d.ts`에만·per-entry 재수출 깨짐) — **published 타입 전무**. attw/publint는 "타입 resolve"만 검사·빈 export 미검출이라 **거짓 green**(W7-1 초판 결함). **W7-2 headless fixture의 tsc가 이 결함을 검출**(`dist/schema.d.ts`=`export {}` → `has no exported member 'EntityForm'`). ② api-extractor는 eslint `ajv@6` hoist와 `ajv@8` 충돌(per-subtree override로 봉합했으나 empty-types 결함으로 폐기). **교훈**: dts 검증은 attw/publint로 부족 — **소비자 tsc(headless fixture)가 실 게이트**. 최종 dist: 7 subpath×(js/cjs/d.ts/d.cts)·타입 비어있지 않음(schema.d.ts 1153줄)·rollup-plugin-dts 공유 청크(`entity-form-*.d.ts` 등).

<a id="w7-2"></a>
## #W7-2 headless fixture (2026-07-12 · CAP-25)

**결과**: `/schema`+`/state`만 소비하는 fixture가 React **런타임** 0으로 tsc+node(cjs+esm) green. 결정 1 청크-누수 리스크의 상시 회귀 게이트.

- 신규 `tests/headless/consumer.ts`(EntityForm+StringField+createFormStore·타입 소스)·`scripts/headless-check.sh`(pack→react 미설치 temp 프로젝트 install→tsc+node cjs/esm)·`package.json` `check:headless` 스크립트.
- **검증**: schema.js/state.js+공유 청크 런타임 react import **0**(실측)·node run react 부재서 green.
- **@types/react 해석(§Needs Review·비크리티컬)**: `/schema`(및 shared chunk 경유 `/state`) `.d.ts`가 ReactNode 기반 조건 타입(OptionalReactNode/ValuedReactNode/ConditionalReactNodeValue) 노출 → headless tsc는 `@types/react`(dev type-only) 필요. **런타임 peer는 아님**(react 런타임 0=계약 충족). 해석: 헤드리스=런타임 React 0(killer feature)·타입레벨 @types/react는 dev 양보. 스펙 §2 "React peer 0"=런타임 peer 0으로 해석. 스펙 저자 확인 대상.

<a id="w7-3"></a>
## #W7-3 adapter headers 함수형 (2026-07-12 · CAP-24 · sonnet 위임→메인 검증)

**결과**: `RcmAdapterOptions.headers`가 함수형 지원+요청시 지연평가. 멀티테넌트 토큰 회전 1급.

- `packages/backend-rcm/src/adapter.ts:21`(타입 `Record<string,string> | (() => Record<string,string>)`)·`:118-119`(`resolveHeaders()`=`typeof opts.headers==='function'?opts.headers():(opts.headers??{})`)·`:126`(요청 조립서 `...resolveHeaders()` — 5 메서드 전부 단일 `request()` 경유라 1지점). backend-rest 빈 스캐폴드=미변경(결정 3).
- **검증(메인)**: `adapter.test.ts:162` 함수형 헤더 요청마다 재평가(token-A→token-B) + 정적 헤더 무회귀 · backend-rcm 14 tests green · tsc -b 0 · 계수 미영향(비계수 배럴).

**검증(메인 authoritative)**: `npm run build`(JS+dts) green·dist 7 subpath×(js/cjs/d.ts/d.cts)+styles.css. `check:surface` **49/57/186 PASS**(§10-A W7 schema+0 확정). `check:publint` All good. `check:exports`(attw) 전 subpath 🟢(node10/node16-CJS/node16-ESM/bundler). type-check·typecheck:packages·lint(0 err)·format green. **test 2235 pass**(1 todo). 

**미결(W7 후속)**: ① `smoke:load`는 구 subpath 대상이라 현재 실패 예상 → W7-4가 신 맵으로 갱신 후 W7-5서 실증. ② node 26.4.0서 검증(.nvmrc=22) — CI(22)서 W7-5 재확인. ③ peer 축소는 실사용 import 근거·smoke:load(W7-5 real install)가 최종 검증.

<a id="w7-4"></a>
## #W7-4 MIGRATION.md + codemod (2026-07-12 · CAP-25 migration · sonnet 위임→메인 검증)

**결과**: 0.3→0.4 마이그레이션 문서+기계적 codemod 착지. sonnet 위임, 메인 authoritative 검증(6 게이트 green). 신규 공개 심볼 0(문서/스크립트/package.json files·devDep만).

**변경 파일**:
- `docs/MIGRATION.md`: 기존 0.2→0.3 문서에 최상단 `## v0.3.x → v0.4.0` 절 신설(기존 내용 보존). 4개 하위절 — **①§9 전수 대응표**(spec §9 line 332–373 **42행 1:1 전수**·빈 행 0·`#42 기타 34종`은 27행 부표로 전개·방식 라벨 무변경/codemod/준-기계/수동 보존) **②서브패스 제거 절**(제거 9 subpath 각 신 대응을 코드 추적 `file:line` 근거로 문서화) **③페이지 셸 컴포지션**(`list-page-composition-guide.md` 전문 흡수 3.0~3.6·CAP-18/19/20 대조·§Needs Review 3.6 연동) **④data-transfer 미이관 목록**(5기능·charter C6).
- `scripts/codemod/v0.4.cjs`(jscodeshift·기계 10규칙만: useListField/withListConfig→withList·withPlaceHolder→withPlaceholder·addCollections→addFields+fieldGroup→group·getName/getUrl→.name/.url·withShouldReload 제거·removeField/removeTabs→withoutField/withoutTab·withSortable/withFilterable→withList/withFilter·withCreateStep→withSteps·withFieldToLayout 제거·withDataTransferConfig→withDataTransfer[export/import 보존·타 키 TODO 주석]) + `run-tests.cjs`(jscodeshift testUtils.applyTransform 실행·바이트 대조) + `__fixtures__/*.{before,after}.ts`(4쌍: basic/data-transfer/removal/remove-tabs-array·standalone `declare …:any`라 tsc 무영향).
- `scripts/smoke-load.sh`: 신 맵 재작성 — peers 26→6(required react/react-dom·optional next/xlsx-js-style/file-saver/react-daum-postcode)·assert `.`(cjs+esm)·`/schema`(cjs+esm)·`/state`(cjs+esm)·`/excel`(cjs). **실측 정정 2건(스크립트 주석)**: 루트 `.` ESM `import` 이제 성공(react-sortablejs peer 제거)→assert 편입 · `/excel` ESM은 file-saver CJS-only interop 실패(실행 확인)→CJS만 assert.
- `package.json`: `files`에 `docs/MIGRATION.md`·`scripts/codemod` 추가 · devDep `jscodeshift@^17.3.0`+`@types/jscodeshift` · script `codemod:test`. (+`package-lock.json` devDep 부수 변경.)
- `documents/plans/list-page-composition-guide.md`: 상단 `⛔ SUPERSEDED`→MIGRATION §3 포인터(원문 무삭제·team-conv 상류 폐기 스탬프 관례). **브리핑 declared 4산출물 밖 touch**(§Needs Review 기록).

**검증(메인 authoritative — 위임 verification은 advisory)**: `codemod:test` 4/4 PASS(jscodeshift 실행·바이트대조) · `type-check`(tsc --noEmit·scripts/ 는 include 밖·fixture=any 무영향) · `typecheck:packages`(tsc -b) · `format:check`(scripts/·docs/ glob 밖) · `lint` 0 err·258 warn=**베이스라인 무변**(stash 대조·codemod .cjs는 lint 스코프 밖) · **`smoke:load` green**(build→npm pack→temp install→real Node resolve: `.`/`/schema`/`/state` cjs+esm·`/excel` cjs). **full 2235u/E2E30은 W7-4 무관(src/packages 무변경)→W7-5 wave-end 게이트**.

**코드 추적 판정(MIGRATION §2·근거 file:line 문서화)**: `/form/SearchForm`→`/schema`(SearchForm 클래스 존치·헬퍼 3종 미재수출) · `/form/Type`→`/schema`(SelectOption/MinMaxLimit 이관·PageResult 클래스→BackendAdapter 인터페이스 필드명 변경·EntityWithId 폐기) · `/api`→아키텍처 대체(ApiClient/configureApiClient→BackendAdapter+AdapterProvider DI·HTTP 유틸 미이관) · `/misc`→대부분 비공개화(정규식 4/12만·isExternalUrl만 공개·날짜포맷터는 /excel 내부 재구현) · `/qr`·`/api-spec`·`/xref-price`→0.4 대응 무(grep 0) · `/address`→부분(AddressField 이관·KakaoMap 지도뷰 미이관·peer 제거) · 구`/headless`→신 `/schema`+`/state`.

**deviations/review flags(§Needs Review 3건)**: ① guide SUPERSEDED 배너=declared 파일 밖 touch(low·관례상 정당) ② spec §9 #29 라벨=codemod이나 impl=수동/이연(presets-rcm 빈 스캐폴드)→spec 저자 §9 라벨 재조정 or presets 감사헬퍼 출하(low) ③ 서브패스 제거로 다수 0.3 공개 심볼 미이관/축소(/qr·/api-spec·/xref-price 전체·/misc 대부분·KakaoMap·SearchForm 헬퍼·EntityWithId·/api HTTP 유틸)→의도 descope(CAP-29)인지 GJCU gap인지 소비자 확인(low-med).

<a id="w7-5"></a>
## #W7-5 wave-end 최종 봉인 (2026-07-12 · 마지막 wave · Phase EG 종료)

**결과**: W7(패키징+마이그레이션) 종료 게이트 전건 green — Phase EG(공개 API first-principles 재설계, W1~W7) **완료**. 신규 공개 심볼 0. 다음=GA 게이트(CAP-28 헌장 C1~C9 대조표·별도 pass).

**게이트 증거(메인 authoritative·실측)**:
- full gate exit 0: `type-check`(tsc --noEmit)·`typecheck:packages`(tsc -b)·**test 2236 pass+1 todo**(174 files)·`lint` 0 err(258 warn=베이스라인)·`format:check`·`build`(dts 실타입).
- **E2E 30 passed**(playwright·43.5s·독립 실행 exit 0).
- **smoke:load green**(신 §2 맵 real-Node resolve: `.`/schema/state cjs+esm·excel cjs — W7-4 착지분 재확인).
- **check:headless green**(/schema+/state tsc+node cjs/esm·React 런타임 0).
- **check:exports(attw)** 전 subpath 🟢(node10/node16-CJS/node16-ESM/bundler)·**check:publint** All good.
- **check:surface 실측 = 49/57/186 PASS**(EntityForm 49/55·root 57/120·/schema 186/190) — §10-A W7 행 +0 확정(신 subpath 미계수). count-public-surface.mjs.

**CAP 대조(§8 빈행 0)**: CAP-24(adapter 함수형 헤더=W7-3)·CAP-25(headless=W7-2 + migration=W7-4) 착지 ✅. CAP-01·15=회귀 green(2236u/E2E30). CAP-02~23·26·27=W1~W6 착지. **CAP-28=GA 헌장 대조표(W7 밖 별도 pass·미착수·은닉 아님)**. CAP-29=명시 descope(자동저장·RuleField/XrefPrice/ContentAsset·구현대상 0) — **W7-4 서브패스 제거로 확장 필요**(/qr·/api-spec·/xref-price·/misc 대부분·KakaoMap → §Needs Review#W7-4 descope로 소비자 확인 후 CAP-29 편입).

**구 결함 원장 §1~9 최종 봉인표**(카탈로그 Cross-Cutting §1~9·"신 표면서 불가능한 이유"·재현금지 L8):

| # | 구 결함 | 신 표면서 불가능(증거) |
|---|---|---|
| 1 | surface 189≫추정130 | 계수 CI(count-public-surface.mjs) EntityForm 49/55·root 57/120·/schema 186/190 상한 강제 — §10-A 최종 인벤토리 도출·under-scope 불가 |
| 2 | dead `instanceof EntityForm` 가드 | packages/*/src `instanceof EntityForm` **0건**(grep·이번 실측) — schema-core 순수 클래스, 자기-instanceof 부재 |
| 3 | 값세터 5중 파편화 | EntityForm 공개 fluent 값세터 **0**(계수 49·L8) — 값 변이=단일 FormMutator/ctx.values seam(setValue/setFetched·명시 시맨틱) |
| 4 | shallow-Map `clientExtensions` 누수 | packages/*/src `clientExtensions` **0건**(grep·이번 실측) — Map 자체 폐기, onBefore/After 훅으로 대체 |
| 5 | with*/set* 명명 분열 | L2/L8 — EntityForm fluent set* 0·with/set 동명쌍 0(계수 게이트) |
| 6 | onInitialize 이중 발화(init+save) | FormRuntime 라이프사이클 onInit 1회(save 재발화 없음)·W2/W4 FormRuntime 테스트(2236u 포함 green) |
| 7 | client-ext 모델등록·뷰실행(헤드리스 미발화) | CAP-25: onBefore/After{Save,Delete,ListFetch} 8훅을 FormRuntime/Controller가 실행(L7)·check:headless React 0 green — 비-React 소비자 훅 발화 |
| 8 | 이중 정렬 스킴(listableOrder+viewOrder) | 단일 order 파생(list-columns·W5)·별도 스케일 상수 부재 |
| 9 | `getTitle()` 기본 `''` | `getTitle(values?)` 단일 해석 진입점(entity-form.ts:923·§3.1 resolution chain)·private getTitlePostfix/appendPostfix 게이트 폐기·W4-1 테스트 |

**§Needs Review 9건(전건 open·비차단·surfacing)**: 소비자/스펙저자/사용자 입력 필요분이라 자율 [x] 불가 — GA로 이월. 소비자(GJCU) 확인: #W6-2b TIER3·#W7-4 descope. 스펙저자: #W7-2 @types/react(check:headless 게이트로 실증됨)·#W7-4 §9#29 라벨. 저순위 follow-up: #W5-3 de-dup·#W5-2 ×3. 관례정당: #W7-4 guide 배너.

## Next Phase Handoff (Phase EG → GA 게이트)

- **Phase EG(W1~W7) ✅ 완료**: 공개 API first-principles 재설계 착지. 계수 49/57/186(임계 55/120/190)·CAP-01~27 소화·구 결함 §1~9 봉인·full gate+E2E30+smoke:load+headless+attw/publint green. published `@rchemist/listgrid`=packages/* §2 맵(구 src/ 오라클 존치).
- **다음 = GA 게이트(별도 pass·미착수)**: CAP-28 **헌장 C1~C9 대조표** 작성·검증([스펙 §8 CAP-28 행·헌장](../prd/concept-charter.md)). C1 선언=화면·C2 조건부(L5)·C3 관계·C4 카탈로그+확장(§5)·C5 검증 단일채널·C6 탭/그룹/스텝/엑셀/리비전·C7 주입·C8 어댑터·C9 리스트세트. **W7 안으로 끌어오지 않았음**(waves §W7-5 Do-NOT 준수).
- **GA 전 선결(critical-path 결정·사용자/소비자)**: ① §Needs Review descope 2건(#W6-2b TIER3·#W7-4 서브패스 제거) = GJCU 소비자 확인 → CAP-29 descope 원장 확정 ② P0/P1 publish 외부 승인 대기(0.4.0 GA 배포 전) ③ spec §9#29 라벨(presets-rcm 감사헬퍼 출하 여부).
- **Do-NOT(계승)**: 구 src/ 삭제 금지(오라클·GA 후속 정리) · 스펙 침묵 판단 발명 금지(§10 게이트 4) · dts=`dts:paths`(experimentalDts 빈타입 재시도 금지) · CAP-28을 개별 wave에 분산 금지(단일 GA pass).
- **세션 정책**: **새 세션 권장** — GA 게이트는 헌장 대조라는 distinct pass(신선 컨텍스트 이점)·선결 소비자 결정 대기. 재개는 `/progress`(이 archive Handoff + 스펙 §8 CAP-28 + 헌장만 읽으면 충분).
