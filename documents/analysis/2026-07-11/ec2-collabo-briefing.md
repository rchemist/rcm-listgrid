# EC2 재현 브리핑 — GJCU CollaboEntityForm → 신엔진 sample collabo

> **생성 주체**: EC2 스카우트(sonnet, read-only, 2026-07-11 — gjcu-academic-front CollaboEntityForm.tsx 330줄 전독 + 신엔진 v0.4 HEAD 대조). 이식 에이전트는 인용 원본 재확인 필수. 갭 4건은 전부 grep 확증(§6 갭 리스트). Conductor 라우팅: 갭① submit-transform → EF6 태스크 / 갭② hydrate clobber → EF7 태스크 / 갭③④ → Backlog·기록.
> (2026-07-11 정오: 최초 저장본이 추출 오류로 손상(null 229줄) — 세션이 스카우트 원문에서 재작성. 내용은 스카우트 보고 그대로.)

**Source read in full**: `~/dev/gjcu-academic-backend/gjcu-academic-front/packages/entities/Academic/Management/CollaboEntityForm.tsx` (330줄). 0.3.x 엔진 소스는 rcm-listgrid `src/listgrid/**` 참조. 신엔진 상태는 코드로 직접 확인: EF1–EF5·EA(A–D)·EB·EC1 전부 v0.4 HEAD에 커밋됨.

---

## 1. Field inventory (`CollaboEntityForm.tsx:34-113`, options `:331-358`)

| Field | Type | Options | Required/Hidden | M2O target |
|---|---|---|---|---|
| name | String(1) | — | required(declared) | — |
| representative | String(100) | — | required(declared) **+ type 캐스케이드로 override** | — |
| representativeNumber | String(200) | — | — | — |
| officer | String(300) | — | required | — |
| phoneNumber | PhoneNumber(400) | — | — | — |
| emailAddress | Email(500) | — | — | — |
| socialEnterprise | Boolean(600) | — | default false | — |
| promoterType | Select(100) | static CollaboPromoterTypes(PROFESSOR/STAFF/MANUAL, :354-358) | — | — |
| professor | ManyToOne(200) | — | hidden(true) declared·캐스케이드 구동 | ProfessorEntityForm(true) |
| staff | ManyToOne(200) | — | hidden(true) declared·캐스케이드 구동 | StaffEntityForm(true) |
| promoterName | String(200) | — | hidden(true)·캐스케이드 구동 | — |
| promoterDepartment | ManyToOne(300) | — | hidden(true)·캐스케이드 구동·**자동채움** | OrgEntityForm(true) |
| showOnApply | Boolean(100) | — | required, layout full | — |
| collaborated | Boolean(200) | — | default false, required — **캐스케이드 트리거** | — |
| contracted | Select(300) | static CollaboContractTypes 기본, **캐스케이드로 CollaboContractTypesCollaborated로 스왑**(:63,139-149,343-352) | required+readOnly 캐스케이드 구동 | — |
| type | Select(400) | static CollaboTypes(8종, :331-340) | required — **representative 캐스케이드 트리거** | — |
| collaboratedAt | Date(500) | — | hidden/required **collaborated 캐스케이드 구동** | — |
| collaboNumber | String(600) · managerName String(700) · scholarshipRate Number(750) | — | — | — |
| asset | File(800) | — | — (협약서 사본) | — |
| hasAsset | Boolean(900) | — | hidden(true), list 전용 synthetic | — |
| address1/address2/postalCode | applyFullAddressFields(:83-88) | — | required:false, 구는 3형제만 노출(fields: subset — state/city 제외) | — |
| externalId, description | preset 헬퍼 :93-94 | — | — | — |
| promotions | SubCollection(parent-only, :100-113) | — | readonly:true | PromotionEntityForm(true), mappedBy:'collaboId' |

옵션은 전부 static 배열(:331-358) — CustomOption alias-async는 이 폼에 없음.

## 2. onInitialize (`:232-308`) — 단일 핸들러, `getRenderType()==='update'` 게이트(:234, create에선 절대 미실행)

fetched 값에서, 아래 onChanges가 인터랙티브하게 파생하는 것들을 재파생:
1. `:236-259` — collaborated로부터: collaboratedAt hidden/required; contracted **옵션 스왑**(Collaborated vs [{NONE}])+readOnly+required — onChanges `:132-151`과 동일 로직.
2. `:247-252` — **값 보정**: 백엔드가 contracted를 **Boolean**으로 반환 → Select는 'CONTRACTED'/'GENERAL' 문자열 필요. `entityForm.setValue('contracted', ...)`로 fetched 덮어씀. onInitialize 전용.
3. `:261-267` — type으로부터 representative required — onChanges `:119-130`과 동일.
4. `:269-299` — promoterType으로부터 professor/staff/promoterName hidden/required + **추가로**(onChanges에 없는 비대칭) 로드 시 professor/staff에 값 있으면 promoterDepartment **required**(:276,290). **비대칭 실재 — "고치지" 말고 보존.**
5. `:302` — withShouldReload(true).

**신엔진 기전**: `withOnInitialize`(entity-form.ts:124, 타입 :24-30) — initializeFormStore step (e)(initialize-form-store.ts:99-107)에서 **store build·hydrate 전** 실행(순서: onFetchData→onInitialize→createFormStore→hydrate). 1/3/4는 EntityForm clone 위 declared-meta 변형(`withHidden/withRequired/withOptions` — pre-store라 FormMutator 아님)으로 직접 포트.

**갭(실재) — 2번은 신엔진에 깨끗한 자리 없음.** hydrate(form-store.ts:344-364)가 onInitialize **후** 실행, raw fetched로 무조건 덮어씀 → onInitialize의 값 설정 clobber. OnFetchDataHandler의 data in-place 변형은 우연히 동작하는 비지원 사이드채널(initialize-form-store.ts:75-96→:113-115 동일 참조). **EC2 권고: boolean→string 보정 모티프 재현 금지** — sample fixture가 contracted를 string enum으로 직접 저장(갭 우회). 갭 자체는 EF7 등록됨.

## 3. onChanges (`:117-230`) — 단일 `withOnChanges(async (entityForm, name) => {...})`, 5분기 self-filter

(0.3.x는 매 변경마다 전 핸들러 dispatch — Collabo는 빌더 카탈로그 미사용, hand-written 명령형.)

| 트리거 | 효과 | 인용 | 신엔진 재현 |
|---|---|---|---|
| type | representative required ETC↔기타 플립; shouldReload | :119-130 | changeRequired 빌더 또는 hand-written — `m.setMeta('representative',{required})` |
| collaborated | collaboratedAt hidden/required 플립; contracted **옵션 스왑**+readOnly+required+값 'NONE' 리셋; off 시 resetValue('collaboratedAt') | :132-151 | `m.setMeta('collaboratedAt',{hidden,required})`+`m.setMeta('contracted',{options,readonly})`(readonly는 FieldMetaOverride 키, field-meta.ts:13)+`m.setValue('contracted','NONE')` — 옵션 절반 changeSelectOptions, 나머지 hand-written 병용 |
| promoterType | 4개 promoter 필드 hidden/required 전체 리셋 후 정확히 한 분기만 un-hide+require, 나머지 3개 resetValue | :153-183 | hand-written: `m.setMeta` ×최대 8 + `m.setValue(field, undefined)` ×3. 다필드 상호배제 — 빌더 형태 아님 |
| staff | 선택 시: promoterDepartment 미설정이면 `staff.organization.id` 자동채움+un-hide. 해제 시: hide+reset | :186-207 | `m.getValue('staff')`(신엔진 sync), `m.setValue('promoterDepartment', staff.organization.id)`, `m.setMeta(...,{hidden:false})` |
| professor | 선택 시: promoterDepartment un-hide; 이미 id면 자기 재설정(:217-219 — dead-looking, 충실 포트). 해제 시: hide+reset | :210-226 | staff 분기 동형 |

loop-guard: 구엔진 무보호(단방향이라 무사고), 신엔진 sync-batch 가드로 더 안전 — 기록만. Collabo는 EF4 addField/removeField 불요.

## 4. M2O nested 자동채움 — 실제 메커니즘

**구엔진**: ManyToOneView 피커 행 선택 → `onChange(전체 row 객체, true)`(:205-206,411-455) → value.current → executeOnChanges. GJCU `/staff` 리스트 행이 organization을 embed(StaffEntityForm.tsx:169)하므로 `staff.organization.id`가 **추가 fetch 0으로** 가용. 특수 API 없음 — "리스트 행이 관계를 이미 실어옴"의 귀결.

**신엔진**: byte-for-byte 동일 — many-to-one-renderer.tsx:79-82가 행 클릭 시 `setValue(name, row)`(전체 row) → EF2 dispatch → `m.getValue('staff')` 동일 row. **재현 요건(갭 아님)**: sample staff fixture 행이 `organization:{id,name}` nested 포함(현 employee.ts:8-16은 flat — 확장/신규 엔티티, §6). crud-routes 무변경, seed shape만.

(bare-id resolve의 useReferenceResolver는 edit-로드 표시 전용 — 자동채움 무관.)

## 5. File + submit transform

**File(asset, :78)**: Collabo는 선언만(특수 처리 없음). 신 FileField는 plain string(EA-C 단순화, file-field.ts:22-32) — URL 편집 경로 무결. fixture는 asset=URL string.

**Submit transform** — `:313-325 withOverrideSubmitData`: contracted 문자열→Boolean 역변환 후 POST/PUT.
**갭 확증**: 신엔진에 해당 훅 부재(grep: entity-form.ts·form-store.ts·initialize-form-store.ts·react hooks — 0건). toSaveData(form-store.ts:490-505)는 고정 덤프(exceptOnSave drop·M2O flatten). **워크어라운드**: ViewEntityForm onSave prop이 toSaveData() 결과 수신(:149-157) → collabo 페이지 handleSave 인라인 보정(college/new/page.tsx:16-19 참조). EF6이 정식 훅. EC2 비차단.

## 6. Reproduction plan

### Sample entity
- 신규 `apps/sample/lib/entities/{org,staff,collabo}.ts`: org(name-only), staff(name·email·organization:M2O→org), collabo(아래).
- fixture(getOrCreateStore 패턴, crud-routes 무변경): orgSeed 2-3행 · staffSeed 2-3행(**각 행 organization:{id,name} nested — §4 요건**) · professorSeed 재사용(academic.ts:76-85) · collaboSeed 2행(collaborated:false 1 + collaborated:true 1, contracted는 string enum 저장 — §2 권고).
- API 라우트 org/staff/collabo — employee 4파일 패턴 클론.

### Collabo 필드셋 (§1에서 프리셋→plain String/Textarea 대체, promotions SubCollection 제외 — EF2/EF3 목표에 불요)
```
name, representative, officer, socialEnterprise
promoterType, professor(M2O→professor), staff(M2O→staff), promoterName, promoterDepartment(M2O→org)
showOnApply, collaborated, contracted(Select), type(Select), collaboratedAt(Date), asset(File)
applyFullAddressFields(entityForm, {order:900, required:false})   // 5형제 전체(갭③ 수용)
```
`.withOnChanges(...)` — §3 5분기 hand-written 1핸들러(빌더는 §3 표기 지점만). `.withOnInitialize(...)` — §2의 1/3/4 (2 드롭).

### E2E 시나리오 (e2e/collabo.spec.ts — student-address/college 패턴, 무 외부네트워크)
1. **동적 옵션 스왑 가시화** — collaborated 토글 → contracted 옵션 리스트 변화(NONE-only→GENERAL/CONTRACTED)+readonly 플립. EF2 setMeta({options,readonly})→리렌더 증명.
2. **조건부 상호배제** — promoterType=STAFF → staff visible+required, professor/promoterName hidden 유지; PROFESSOR 전환 → 역플립+staff 값 클리어. EF2 다필드 캐스케이드 증명.
3. **M2O nested 자동채움** — 피커에서 organization:{id:'2'} 실은 staff 행 선택 → promoterDepartment 표시가 **별도 선택 없이** 그 org로 갱신. §4 end-to-end.
4. **onInitialize 첫 페인트 효과(edit)** — collaborated:true seed 행 열기 → **상호작용 없이 첫 페인트에** collaboratedAt visible+required, contracted가 CONTRACTED/GENERAL 옵션셋. EF3 증명.
5. **required 플립이 save 게이트** — create: type='ETC' → representative required 해제+빈 채로 save 성공; 다른 type 복귀 → 채울 때까지 save 차단. 캐스케이드가 validateAll을 게이트함을 증명.

### 갭 리스트 (증거 확증 — EC2 비차단)
1. EntityForm-레벨 submit-transform 훅 부재(§5) → **EF6**. 2. onInitialize 값-보정 hydrate clobber(§2) → **EF7**. 3. applyFullAddressFields fields: subset 옵션 부재(address-field.ts:116-137) — Backlog. 4. ExternalIdField/DescriptionField 프리셋 미이식(grep 0) — plain 대체, P5.
