# EA-D2 + EC3(Major) 설계 브리핑 — ViewListGrid 확장 + Xref 이식

> **생성 주체**: EA-D2 스카우트(sonnet, read-only, 2026-07-11 — rcm-listgrid 신/구 + gjcu-academic-front + gjcu-academic-backend-core + rcm-framework 공유 DTO 전수). 이식 에이전트는 인용 원본 재확인 필수.
> **Conductor 확정 결정**: ① ViewListGrid 확장 = **최소형 4종**(§3 옵션 1): `selection{enabled,onConfirm,confirmLabel?}` + `toolbar(ctx:{checkedIds})=>ReactNode` + list-store `postFetch(rows)=>rows`(state 레이어 — Priority 재정렬의 페이지네이션 일관성 근거) + `columns` 유니온 확장(`string | {name,label,render(row)}`). 구 SelectionOptions 전체 이식 금지(29곳 전부 "체크→선택완료" 단일 패턴). ② **M2O filter 채널 신설**: `ManyToOneConfig.filter?: (parentEntityForm?)=>Promise<FilterItem[]>` + ManyToOneRenderer가 initialSearch로 변환 — XrefPrefer 미니폼·parentMajor self-exclude 공유 인프라. ③ Xref 이식 = **plain XrefMappingView만**(supportPriority 렌더 미구현 — Major 4개 xref 전수 미사용, 유일 실사용 UserEntityForm뿐) + XrefPreferMappingField(+`'xrefPreferMapping'` FieldType 신설). 값 wire는 pass-through(EF6 seam 불필요 — §4 확인). **degrees `filters:[fn]` 원형 복제 금지 — 단일 함수형으로 교정 포트**(§1 anomaly). ④ **TAB-자체-숨김 갭 → EC3-0 미니태스크**(TabDef.hidden/store 탭 슬롯/deriveTabs 필터/FormMutator.setTabHidden — 필드 캐스케이드는 기존 기전으로 이미 가능). ⑤ **self-ref 계층 트리 UI 연기**(`ManyToOneConfig.tree` 소비처 0 — parentMajor는 평면 M2O+NOT_EQUAL self 필터로 실증; M2O-tree는 별도 후순위 태스크). ⑥ 드래그 재정렬(XrefPriorityMappingView) 연기 재확인.

---

## 1. MajorEntityForm 해부 (gjcu-front packages/entities/Academic/University/MajorEntityForm.tsx)

**필드**(AbstractMajorEntityForm :37-76 + Major :79-190): name/englishName/type(Select DEPARTMENT|MAJOR — 캐스케이드 트리거)/majorCode/dean(:43-54) · college(M2O→College, :86, !child·required) · **parentMajor(MajorTreeField — 자기참조 트리 M2O, :87-95)** · **professors(XrefMapping, :109, 무필터)** · **staffs(XrefMapping, :121-127, async filters(assistant=true))** · **degrees(XrefMapping, :147-153, ⚠filters:[fn])** · **graduationSubjects(XrefMapping, :161-163, 무필터)** · GraduateTab의 Number 다수(:280-304) · syncNameChange(:145). majorInterviews/Movies는 주석 dead(:166-189).

**4개 xref 전부 supportPriority·excludeId·add 미사용** — plain mapped/deleted 서브셋만 요구.

⚠ **degrees filters:[fn] 타입 불일치 실버그**: props.filters는 `FilterItem[] | fn`인데 gjcu는 `[fn]`(배열 안 함수) — XrefMappingView.tsx:59의 `typeof === 'function'`이 false → 함수가 FilterItem처럼 withFilter에 섞임(:101). 교정 포트(결정 ③): `filters: async (ef) => [...]`.

**TAB hidden**(:192-266): withOnChanges 3분기 — type 변경 → college/parentMajor/majorCode required·hidden + **`withHidden({type:'TAB', hidden, tabId:'graduate'})`**(:203,212 — DEPARTMENT면 GraduateTab 숨김); college↔parentMajor 상호배제(선택 시 반대쪽 hide+reset). withOnInitialize(:248-266)가 동일 로직 첫 페인트 재현. withNeverDelete(:268).
- 구 구현: EntityForm.tsx:349-353,413-428 — 탭 객체 hidden 세팅 + 탭 내 전 필드 hidden 캐스케이드. getViewableTabs(EntityFormBase.tsx:349-382)가 탭을 탭바에서 제거.
- **신엔진 갭(확인)**: 필드 캐스케이드는 오늘 가능(핸들러가 closure로 entityForm 참조 — EC2 실증 패턴, `entityForm.getFields().filter(tabId).forEach(f=>m.setMeta(...{hidden}))`). **탭 자체 숨김은 전무**: TabDef(entity-form.ts:62-66)에 hidden 없음, FieldMetaOverride·FormStoreState.meta는 필드 keyed뿐, ViewEntityForm(:167-182)은 파생 탭 무조건 렌더. (a)만 하면 "빈 탭 패널" — 구(탭 소멸)와 가시 차이. → EC3-0.

**self-ref tree M2O**(MajorTreeField.ts): M2O config `{tree:{exceptId, leafSelectable:false, fetch:{url:'/major/tree'...}}}`(:65-113) — exceptId는 **서버 트리 프루닝 파라미터**(클라이언트 NOT_EQUAL과 다른 기전), displayFunc가 breadcrumb 조립+캐시(:18-63). **신엔진**: `ManyToOneConfig.tree?: boolean` 예약 플래그만, 렌더러 미소비(grep 0) — 트리 UI 완전 미이식. → 결정 ⑤(평면 대체+별도 과제).

## 2. Xref 뷰가 소비하는 구 ViewListGrid 표면 (ViewListGrid.types.ts:27-131 · ListGrid.ts:241-254)

| 옵션 | 구 시그니처 | Xref 사용 | 판정 |
|---|---|---|---|
| selection | {enabled, actions[{label,onClick(ef,checkedItems)}], deleteButton} | 모달 피커 체크박스 다건 → "선택 완료"(XrefMappingView:162-175) | **MUST** — 최소형으로 |
| onSelect | (item, setManagedId) | 피커 단일 클릭 즉시 추가+닫힘(:157-161) | 신 onRowClick **기존재** |
| subCollection | {add?, delete?, buttons?[]} | 표시-그리드 버튼바: delete(체크 삭제)+buttons(커스텀 "선택" 버튼 주입) — add는 Major 전수 false | **MUST** — toolbar 슬롯으로 흡수 |
| delete | {onDelete(ef,rows,checked)} | 체크 삭제 → mapped→deleted 이동(:123-130,230-246) | **MUST**(toolbar+checkedIds로 구현) |
| onFetched | (PageResult)=>Promise<PageResult> | Priority: mapped[].priority 재정렬(:106-121) / Prefer: row에 preferred 주석(:253-265) | **MUST** — `postFetch(rows)=>rows`로 협소화 |
| fields | ListableFormField[] 합성 컬럼 | Prefer만: 합성 BooleanField('preferred')(:247-252) | Prefer 이식에 필요 — columns 유니온으로 |
| onDrag | (idList) | Priority만 | **연기**(결정 ⑥) |
| filterable/sortable/hideTitle/popup | boolean | 전부 false/무관 | 신엔진 no-op |

**필터 주입**: Xref 뷰는 자기 SearchForm에 IN(표시)/NOT_IN(피커)을 직접 심어 ListGrid에 넘김(:73-103) — 신엔진 `CreateListStoreOptions.initialSearch` **기존재**(list-store.ts:24-28)로 오늘 가능. ViewListGrid 확장 필요분은 정확히 4종.

## 3. 신엔진 설계 (결정 반영)

- **selection**: ViewListGridProps에 `selection?: {enabled:boolean; onConfirm:(checkedIds:string[])=>void; confirmLabel?:string}` — useUI().CheckBox 행 체크박스+로컬 상태+확인 버튼.
- **toolbar**: `toolbar?: (ctx:{checkedIds:string[]})=>ReactNode` — add/delete/custom 3종을 호스트 조립으로 흡수(구 3-prop 분해 불요).
- **postFetch**: `CreateListStoreOptions.postFetch?: (rows)=>rows` — fetch()가 set 직전 통과(state 레이어 — store rows 자체가 바뀌어야 페이지네이션 일관, 구 동작 근접).
- **columns 유니온**: `(string | {name; label; render(row)})[]` — 신규 prop 없이 합성 컬럼 흡수.
- **M2O filter**: `ManyToOneConfig.filter?: (parentEntityForm?)=>Promise<FilterItem[]>` + ManyToOneRenderer가 resolve→SearchForm→initialSearch. (parentMajor self-exclude도 이 채널로 NOT_EQUAL.)
- XrefPrefer 미니폼은 SubCollection ChildFormModal 패턴 동형 재사용 후보. **미니폼 M2O flatten 함정**: `${name}Id`(mappingId)로 읽어야 함(구 XrefPreferMappingView:172-176 주석 — 신 renderer도 동일 flatten).

## 4. Xref 값 wire (프론트=백엔드 DTO 필드명 동일 — Jackson 직결)

| 종류 | 프론트 | 백엔드(rcm-framework common-data) |
|---|---|---|
| plain | `{mapped?: string[], deleted?: string[]}`(XrefMappingView:28-31) | `XrefMappingForm<ID>{mapped,deleted}`(XrefMappingForm.java:44-46) — MajorUpdateForm.java:56-59에 professors/staffs/degrees flat 최상위 키 |
| priority | `{mapped?: {id,priority}[]}` | XrefPriorityMappingForm — Major 미사용 |
| prefer | `{mapped?: {id,preferred}[]}` | XrefPreferMappingForm{PreferMapping{id,priority,preferred}} |

**신 toSaveData 정합 확인**: form-store.ts:491-511은 manyToOne만 flatten, xref* 타입은 **무변환 통과** → `out['professors']={mapped,deleted}` 그대로 wire 정합. Major는 withSubmitTransform 미사용 — **EF6 불필요**.

## 5. supportPriority — Major 전수 미사용 재확인. 유일 실사용 UserEntityForm.tsx:174(addresses, excludeId+add 동반) — 범위 밖. (구 센서스의 BoardEntityForm 인용은 오류 — 파일 부재 확인.)

## 6. 실행 계획 (태스크 분할)

**EA-D2-0 pre-stage**: ViewListGrid selection+toolbar / list-store postFetch / columns 유니온 / ManyToOneConfig.filter+renderer 변환. (+테스트)
**EA-D2-1 Xref 이식**: XrefMappingField(plain 뷰만 — 표시그리드 IN+피커 모달 NOT_IN+선택완료/단일클릭/체크삭제) + XrefPreferMappingField(+'xrefPreferMapping' 타입, 합성 preferred 컬럼, 미니폼 ChildFormModal 동형+mappingId 함정 방어) — 값 pass-through. degrees류 filters는 단일 함수형만 지원(교정).
**EC3-0**: TAB-자체-숨김(TabDef.hidden+store 탭 hidden 슬롯+FormMutator.setTabHidden+deriveTabs 필터+clone/초기 hidden 반영).
**EC3**: Major 재현 — type 토글(탭 숨김+college/parentMajor 상호배제+majorCode), parentMajor=평면 M2O+self NOT_EQUAL(결정 ⑤), xref 2종(professors 무필터+staffs async filter) E2E: (a) type 토글→탭/상호배제 (b) xref 다건 선택완료→표시 반영→저장 payload `{mapped:[...]}` (c) 체크 삭제→deleted 이동 (d) staffs 필터 적용 확인.

**Do-NOT**: degrees `[fn]` 원형 복제 · 드래그 UI 편입 · 트리 UI 편입 · SelectionOptions 전체 이식.
