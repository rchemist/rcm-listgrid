# Phase EG — EntityForm 공개 API 완전 parity (이식 계획) — **강등: capability 체크리스트로만 유효**

> **(2026-07-11 PIVOT)** "충실 이식" 접근은 폐기됨([ADR-0009](../adr/ADR-0009-entityform-public-api-redesign.md)). 이 문서는 "무엇이 존재해야 하나"의 체크리스트로만 사용 — 규범은 [공개 API 스펙](./entityform-public-api-spec.md), 실행은 [waves 브리프](./entityform-api-implementation-waves.md). EG 태스크 ID는 스펙 §8 CAP-ID로 매핑됨.

> **근거**: 사용자 지시(2026-07-11) "EntityForm 제공 API 전부 정상 동작 + 미이식 전부 이식". [API 감사](../analysis/2026-07-11/entityform-api-audit.md) → 8-그룹 병렬 계획 워크플로우(wf_8d0b6d02-1cc, 9 agents) → opus 종합. 구엔진 소스가 리포 내(`src/listgrid/`)라 전 항목 충실 이식 가능. dead code만 증거와 함께 예외(ContentAsset/Rule 선례).
> **규모 정직성**: 24 태스크. list-track(EG21-24)+Excel(EG20)은 구 list 생태계 ~10,300 LOC 대비 현 ViewListGrid 273 LOC — **별도 phase 급(EG/EH-scale)**, EA-wave 슬라이스 아님. 다중 세션 소요.
> **선행 완료 의존**: EF1(META override)·EF2(FormMutator)·EF3(init pipe)·EF7(값 override)·EC3-0(TabDef.hidden)·permission.ts(canonical, index export)·AuthProvider — 전부 완료. **EF8은 EG1/EG2(isPermitted)+EG5(formErrors)+EG9(neverDelete)로 해소** → EF8 단독 태스크 폐기(EG로 흡수).

## 태스크 매트릭스 (24, 의존성 8-wave)

| id | sz | 태스크 | covers(구 소스) | deps | proof |
|----|----|--------|------|------|-------|
| EG1 | S | Permission save-payload gate | toSaveData가 unpermitted 필드 제외(EntityForm.tsx:909-916) | — | state permission.test: toSaveData drops unpermitted |
| EG2 | S | Permission render 하드게이트 | FieldRenderer isPermitted(EF1 override 불가 순서) | EF1 | react field-permission: unpermitted→null·setMeta 우회 불가 |
| EG3 | S | Tab/FieldGroup requiredPermissions 선언 | TabDef/FieldGroupDef.requiredPermissions+addFields(EntityTab/Group withRequiredPermissions) | EC3-0 | schema-core addFields 권한 선언 |
| EG4 | L | ViewEntityForm 권한+hasVisibleContent 가시성 | getViewableTabs/FieldGroups/VisibleFields(EntityFormBase:349-625)→deriveTabs/Groups·**SubColl C2 게이트(신)** | EG3 | tab-group-permission: 탭/그룹/빈그룹 숨김 |
| EG5 | M | 서버에러→필드+formErrors 배너 | withErrors/getErrorMap/mergeError(Validation:37-119)·suppress-generic·clear-on-success | EG4 | server-error-map: fieldErrors 매핑+배너 |
| EG6 | L | CheckButtonValidation(중복확인) | withCheckDuplicate·CheckButtonValidationField·tri-state·Alias/ExternalId/Slug | EG5 | 중복확인 priority/enabled·Alias E2E |
| EG7 | M | manageEntityForm CRUD 플래그 | withCreatable/Updatable/Deletable·isX·MANAGE_ENTITY 프리셋 | — | manageEntityForm.test: 기본=ALL·deep-clone |
| EG8 | M | revisionEntityName write-path | withRevisionEntityName·toSaveData 주입·remove(url,ids,rev?) 시그니처 | EG1 | getRevisionEntityName fallback |
| EG9 | L | Delete flow + Save/Delete 게이팅 | delete/deleteAll·postDelete·hasEditableFields·canShowSave·neverDelete 변형 | EG7,EG8 | Delete E2E(College/Major create→delete→removed) |
| EG10 | M | 커스텀 액션+헤더 슬롯 | withButtons(isOverwrite)·withHeaderArea | EG9 | 커스텀 버튼이 빌트인 replace |
| EG11 | L | 생성 스텝 위저드 | withCreateStep·CreateStepDef·getTabFields·createStepFields·Stepper UI | EG4,EG9 | E2E vs gjcu ApplicationFormLayout 4-step |
| EG12 | M | Client-extension 훅 축(schema-core) | ExtensionPoint·10 withClientPre/Post*·execute/has/get·priority/enabled/continueOnError | EF2,EF3 | priority-sort·enabled skip·continueOnError |
| EG13 | M | FETCH_LIST 확장 dispatch(list-store) | PRE/POST_FETCH_LIST·CreateListStoreOptions.entityForm/session | EG12 | PRE의 SearchForm이 adapter.list 도달 |
| EG14 | M | CREATE/UPDATE/DELETE 확장 dispatch | PRE/POST_CREATE/UPDATE(handleSave)·PRE/POST_DELETE | EG12,EG9 | PRE before onSave·POST after non-throw |
| EG15 | M | 폼 sugar + dead-code 원장 | withMenuUrl·hasField/hasTab·getLabel · DEAD: removeTab/s·withFieldToLayout·merge·attr bag·form 2-arg helpText·withUrl/ParentId | — | withMenuUrl 외부링크·hasField parity |
| EG16 | M | withTitle 동적 {title,field,view} async | withTitle 동적·getTitle/Postfix async | EG11 | async view()/field() 해석 |
| EG17 | M | AlertMessages 배너 | withAlertMessages/clear/remove/get·store 슬라이스·배너 | EG5 | add/persistent/clear round-trip |
| EG18 | M | helpText/tooltip 렌더러 resolver + getHelpText | getHelpText delegate·렌더러 helpText/tooltip 렌더 | EG5 | useFieldHelpText 해석+FieldRenderer 렌더 |
| EG19 | L | DataTransfer config 표면(schema-core) | withDataTransferConfig·getExportable/Importable·getDataFields·DataTransferConfig 포트 | — | field-resolution fallback(:448 버그 **fix**) |
| EG20 | XL | Excel runtime | DataExporter/Importer/ExcelProvider·DI·@listgrid/*/excel subpath·ViewListGrid 툴바 | EG19,EG23 | xlsx export→re-import round-trip |
| EG21 | L | 필드별 IListConfig substrate | ListableFormField 상당·IListConfig·isSupport/Filter/Sort·withListConfig 필드별 | — | 필드별 listConfig round-trip |
| EG22 | L | EntityForm 12 list 메서드(순수) | getListFields/FilterableFields/Order·withListConfig/Filterable/Exclude·onFetchListData | EG21 | getListFields ordering characterization |
| EG23 | XL | ViewListGrid 컬럼 파생 + list-cell 레지스트리 | getListFields()→컬럼·per-type list-cell·quickSearch | EG22 | E2E: getListFields가 컬럼 구동 |
| EG24 | XL | Advanced-search UI + list-filter 레지스트리 | getFilterableFields()→검색폼·withAppendAdvancedSearch·getViewOrder·M2O synthetic filter | EG23,EG22 | E2E: advanced-search 적용 |

## Wave 순서 (의존성)
1. **권한/보안(EG1-4)** — front-load. EG1/EG2 LIVE 보안갭(shipped), 상호독립 소형. EG3(선언)→EG4(소비).
2. **검증/에러(EG5-6)** — formErrors→서버에러 매핑→CheckButtonValidation.
3. **CRUD(EG7-10)** — 플래그·revision→delete flow→버튼슬롯.
4. **위저드(EG11)** + **title(EG16)**.
5. **client-ext(EG12-14)**.
6. **sugar(EG15,17,18)**.
7. **data-transfer(EG19-20)**.
8. **list-track(EG21-24)** — 최대 규모, 사실상 별도 phase.

## Conductor 사전 판정 (decision gate — delegate 차단 방지, 근거는 impl 시 재확인)
- **EG4 sync hasVisibleContent 근사**: static hidden+isPermitted만 체크(async predicate는 FieldRenderer가 최종 재평가). 근거: ViewListGrid deriveDefaultColumnNames 선례. 전 필드 async-hidden 탭이 빈 패널로 뜰 수 있으나 필드는 null 렌더(오작동 아님). **GO**.
- **EG6 descope 되돌림**: EA "decision ⑧"의 Link CheckButtonValidation descope를 full-parity로 **되돌려** 정식 이식(String/Email Alias/ExternalId/Slug 포함). **GO**.
- **EG14 CRUD 확장 데이터 계약**: 구는 return 폐기·context 참조 mutate. schema-core 순수성 위해 **FormMutator seam 경유**(EF2 동형)로 "폼 변형" 의도 충실+순수 유지. impl 정밀 결정.
- **EG19 getImportableFields:448 copy-paste 버그**: **fix**(명백 버그)·divergence 문서화.
- **EG11 clone hidden-step-drop**: 충실 포트 우선, quirk 플래그. 명백 버그면 fix.
- **EG20/EG21-24**: full-parity 지시로 audit의 prior "defer-documented" 무효화 — **in scope**. XL 정직 사이징.
- **의도적 divergence(regression 아님, 커밋 명시)**: EG4 SubColl C2 게이트(신 동작·구 무권한체크)·EG5 tab-ID 키잉(구 label-키잉은 latent bug)·EG12 deep-copy clone(구 shallow-Map bug)·EG8 menuUrl tier 제거.

## 교차 리스크 (매 태스크 유의)
1. **inert 트랩 재발 금지**: EG5/17/18 얕은 배선 금지(Set-union dedup·suppress-generic·clear-on-success·persistent-filter 등 구 semantics 완비). EG18은 렌더러 resolver를 form-delegate보다 먼저.
2. **hot-file 직렬화**: entity-form.ts·form-store.ts(toSaveData)·ViewEntityForm.tsx는 ~십수 태스크가 건드림 — dependsOn 순서로 직렬(EG1/EG8 두 toSaveData writer, EG5/9/11 ViewEntityForm 클러스터가 최대 충돌점). 병렬 금지, 순차 rebase.
3. **schema-core 순수성(ADR-0003)**: EG6 async checkButton·EG16 title.view ReactNode는 seam/react-hook 경유(FormField 직결 금지).
4. **blocked-but-plumbed 정직 보고**(✅ 금지): EG8 delete-body는 EG9까지 미검증·bulk-delete(deleteAll idList>1 from ViewListGrid selection)는 EG9 단건 onDelete 미포함(별도 sub-slice).
5. **grep 위생**: EG15/19 dead-code 판정은 in-repo grep only — GJCU/edustack 소비자 grep으로 최종 제거 전 확인(getExportable/Importable·form sugar). EG22 인용 오타 정정(withAppendAdvancedSearchFields=EntityForm.tsx, clearOnPostFetchListData=EntityFormData.tsx).

## 세부(그룹별 newInsertion/oldSource)
계획 워크플로우 저널 `subagents/workflows/wf_8d0b6d02-1cc/journal.jsonl` 의 `map:*` 8 결과에 그룹별 정밀 이식 스펙(oldSource file:line, newInsertion, reuseTargets, proofNeeds) 보존. 각 EG 태스크 착수 시 해당 그룹 map을 브리핑에 인용.
