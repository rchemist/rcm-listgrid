# EntityForm 공개 API 스펙 (v0.4 — first-principles 재설계)

> **지위**: 규범(normative). [ADR-0009](../adr/ADR-0009-entityform-public-api-redesign.md)의 결정을 멤버 수준으로 구체화한 구현 계약. [eg-entityform-full-parity.md](./eg-entityform-full-parity.md)는 capability 체크리스트로만 유효하며, 구현은 [실행 wave 브리프](./entityform-api-implementation-waves.md)가 본 문서를 §단위로 인용해 수행한다.
> **작성**: 2026-07-11 (fable 설계 pass) · **개정 r2**: 4-렌즈 적대 검증(wf_c55e83dc-6b1, 22건 — blocker 1·major 18·minor 3) 전건 반영. 근거 4종: [구 189멤버 카탈로그](../analysis/2026-07-11/old-entityform-member-catalog.md) · [v0.4 현 표면](../analysis/2026-07-11/v04-public-surface.md) · [소비자 실사용 감사](../analysis/2026-07-11/consumer-usage-audit.md) · [8그룹 capability map](../analysis/2026-07-11/eg-group-capability-maps.md)
> **불변 전제**: ADR-0002 store · ADR-0003 4계층 · FormMutator seam · EF1~7 파이프라인 · 헌장 C1~C9. 이들은 재설계 대상이 아니다(공개 표면만).

## 1. 설계 법칙 (Laws — 전 표면 공통, 위반은 리뷰 블로커)

| # | 법칙 |
|---|---|
| L1 | **어휘=단계**: 선언 전용 동사군 4종 — `with*`(슬롯 설정/교체) · `add*`(컬렉션 추가) · `on*`(라이프사이클 훅 등록, append) · `without*`(선언 구조 제거). 전부 chainable(`this`). `set*`/동사형(save/delete/reload/validate)은 런타임 전용 — store/FormMutator/FormRuntime에만. **EntityForm에 `set*` 0개, 두 단계에 걸친 동명 메서드 0개.** |
| L2 | **camelCase 통일**: `readOnly`(schema-core `readonly` 프로퍼티/메타 포함 전면 개명), `placeholder`(`placeHolder` 개명). 대소문자만 다른 동명 API 금지. |
| L3 | **polymorphic this**: 모든 chainable은 `this` 반환 타입(`clone(): this` 포함) — 서브클래스 체인이 좁혀지지 않는다(gjcu `as any` 286회 근본 원인 중 하나). |
| L4 | **undefined = 해제**: 모든 옵션 setter는 `T \| undefined`를 받고 `undefined`는 명시적 해제(`withMin(undefined)` 합법). 옵션 객체 프로퍼티는 `p?: T \| undefined` 형(exactOptionalPropertyTypes-safe)만. |
| L5 | **정책은 데이터**(C2): 조건부 boolean은 전부 기존 `ConditionalBooleanValue`(= `boolean \| OptionalBoolean \| ValuedBoolean`, schema-core `field/conditional.ts` 기존 정의)로 통일. 새 conditional 타입 발명 금지 — 본 스펙의 조건부 표기는 전부 이 타입을 가리킨다. |
| L6 | **schema-core React 0**(ADR-0003): ReactNode는 type-only import까지만(`ConditionalReactNodeValue` 선례). 렌더 소관(슬롯/커스텀 렌더)은 react 계층 prop/레지스트리 또는 type-only 렌더 fn 슬롯으로. |
| L7 | **훅 실행은 엔진 소유**: 라이프사이클 훅을 뷰 컴포넌트가 직접 실행하지 않는다(구 client-ext의 headless 갭 재현 금지). 실행 지점은 initializeFormStore·FormController·list-store뿐. |
| L8 | **구 결함 재현 금지**: 카탈로그 Cross-Cutting §1~9(값 setter 5종 파편화·getTitle `''`·reload no-op·shallow-Map 누수·label-키 에러맵·이중 정렬 스킴·onInitialize 이중 발화 등)는 설계상 표현 불가능해야 한다. |

## 2. 패키지 계약

단일 배포 패키지 `@rchemist/listgrid` + subpath exports (내부 워크스페이스 `@listgrid/*` ↔ 빌드 시 매핑):

| Subpath | 내부 패키지 | 내용 | peer |
|---|---|---|---|
| `.` (루트) | react | 컴포넌트·훅·프로바이더·레지스트리 + 상용 schema 심볼 재수출 | react, react-dom |
| `/schema` | schema-core | EntityForm·필드·검증·SearchForm·권한·adapter 계약·**FormRuntime 인터페이스** | (없음) |
| `/state` | state | form-store·list-store·initializeFormStore·**createFormController**(FormRuntime 구현) | (없음) |
| `/ui-default` | ui-default | 참조 프리미티브 17종 + `defaultUIComponents` | react |
| `/backend-rcm` `/backend-rest` | backend-* | BackendAdapter 구현 | (없음) |
| `/next` | next | NextRouterProvider | next, react |
| `/excel` | (신설) | DataExporter/Importer 런타임 | xlsx-js-style·file-saver (둘 다 optional) |
| `/presets` `/presets/rcm` | presets-* | 제네릭/도메인 필드 프리셋(감사필드 헬퍼 등) | (없음) |

- **headless 계약**: `/schema`+`/state`만 import → React/UI peer 0으로 빌드(테스트 고정). showcase 사례(§감사 6-2)의 1급화.
- sideEffects:false·ESM-first(ADR-0001)·`import type` 강제. 공개 심볼 수 CI 계수(§10 게이트 2의 계수 규칙): 루트 ≤120, `/schema` ≤190 (임계값 도출은 §10-A).
- 멀티테넌트류 요청 컨텍스트(§감사 6-4): `RcmAdapterOptions.headers`를 `Record<string,string> | () => Record<string,string>`로 — 헤더 지연 평가가 1급.

## 3. EntityForm — 선언 표면 (전 45 소비자 멤버 — 계수 규칙·기계 계수 도출은 §10 게이트 2 / §10-A)

`class EntityForm` (`/schema`). 선언+구조 질의만. 런타임 상태·실행 없음.

### 3.1 정체성·구성 (14)

| 멤버 | 시그니처 | 비고 |
|---|---|---|
| `constructor` | `(name: string, url: string)` | url=백엔드 컬렉션 endpoint(trailing slash 정규화 저장). menuUrl 없음(→M2O 필드 옵션) |
| `name` / `url` | `readonly string` ×2 | public readonly 프로퍼티 — 구 getName()/getUrl() 중복 제거(§9: `.name`/`.url` codemod) |
| `withId` | `(id: string \| undefined): this` | renderType 판별자 |
| `getId` | `(): string \| undefined` | — |
| `getRenderType` | `(): RenderType` | `'update'` iff id 설정 |
| `withTitle` | `(title: string \| { text?: string \| undefined; fromField?: string \| undefined }): this` | ReactNode 없음(→react slots.title). **#W4-1b(2026-07-12)**: 재호출=**replace**(L1 기본·title은 스칼라·withCapabilities/withMeta의 merge와 의도적으로 다름) |
| `getTitle` | `(values?: Record<string, unknown>): string` | **항상 해석된 문자열**: text → fromField의 values값 → `name` 필드 값 → id → **`this.name`**(엔티티 이름·생성자 보장 non-empty). 구 `''` 반환 금지. **#W4-1a(2026-07-12)**: 최종 폴백은 renderType별 카피("새 X"/"X 수정")를 **발명하지 않고** this.name — 대면 카피는 소비자 소관(withTitle/slots.title) |
| `withReadOnly` | `(readOnly?: boolean \| undefined): this` | **폼 전체 읽기전용 선언**(기본 true, undefined=해제). 선언에 실리므로 M2O 자식 폼 임베드에 그대로 전파(gjcu `UserEntityForm(true)` 변형 패턴 1:1). 의미론: store `formReadOnly` seed → 전 필드 effective readOnly OR + **Save 어포던스 숨김**(**#W3-5b(2026-07-12): 빌트인 Save + `replaces:'save'` 커스텀 액션 둘 다** — 교체 액션도 Save 슬롯을 점유하므로 숨긴다. Delete·`replaces:'delete'`·일반 커스텀 액션은 무관, §6.1 Save 전용). **데이터 쓰기 차단이 목적이면 `withCapabilities({update:false})`** — withReadOnly는 표시/편집 어포던스 계약(의도 명시, 검증 coverage-4) |
| `getReadOnly` | `(): boolean` | withReadOnly 리더 쌍(W3-5 with/get 쌍 보완 — 선언된 formReadOnly seed 질의). §3.6 리스트 순수질의와 무관 |
| `withMeta` | `(patch: Record<string, unknown>): this` | **유일한** escape hatch(구 attribute bag 9종 대체). **shallow-merge**(replace 아님 — 프리셋/래퍼 다중 호출 시 last-write-wins 클로버 방지, 검증 dx-6). 키에 `undefined` 대입=키 제거(L4) |
| `getMeta` | `(): Record<string, unknown>` | 기본 `{}` |
| `withRevision` | `(entityName: string \| undefined): this` | C6. 설정 시에만 save/delete payload에 주입 |
| `getRevisionEntityName` | `(): string \| undefined` | **정직한 undefined**(구 always-truthy 폴백 금지) |

### 3.2 구조 (17)

| 멤버 | 시그니처 | 비고 |
|---|---|---|
| `addFields` | `({ items: EntityField[]; tab?: TabInput; group?: GroupInput }): this` | `fieldGroup`→`group` 개명. TabInput/GroupInput은 `{id, label?, order?, hidden?, requiredPermissions?}` — **탭/그룹 권한 선언(EG3)이 여기 승차** |
| `withoutField` | `(name: string): this` | 선언 시점 구조 제거(공유 추상 폼 변형 — 구 removeField 13). 런타임 제거는 mutator.removeField — **동명 충돌 없음(L1 without* 군)** |
| `withoutTab` | `(tabId: string): this` | 탭 **구조 제거**(구 removeTab/removeTabs 3 — 의미론 보존, hide 다운그레이드 아님. 검증 coverage-2). 숨김만 원하면 withTab(id,{hidden}) |
| `withTab` | `(tabId: string, patch: { label?; order?; hidden?: ConditionalBooleanValue; requiredPermissions?: string[] }): this` | 선언 후 탭 조정. `hidden`은 조건부 허용(C2) |
| `withGroup` | `(tabId: string, groupId: string, patch: { label?; order?; open?; requiredPermissions?: string[] }): this` | 구 withFieldGroupConfig 흡수 |
| `withSteps` | `(steps: StepDef[] \| undefined): this` | C6 생성 위저드. `StepDef {id, label, order?, fields: string[], description?, hidden?: ConditionalBooleanValue}`. clone이 hidden step을 **드롭하지 않음**(구 버그 fix) |
| `getSteps` | `(): StepDef[]` | 선언 그대로(hidden 필터링은 렌더 시 조건 해석) |
| `getFields` / `getField` / `hasField` | 질의 3 | 현행 유지(order 정렬) |
| `getTabs` / `getTab` / `hasTab` / `getFieldGroups` / `getGroupFields` / `getTabFields` | 질의 6 | getTabFields(tabId) 신설 유지(위저드 조합 실사용 5) |
| `clone` | `(includeValues?: boolean): this` | **`this` 반환(L3** — 서브클래스 변형 보존, 검증 dx-5**)**. 깊은 복제 — 공유 참조 0(훅 배열·steps·meta 포함), 구 shallow-Map 누수 구조 불가 |

**위저드 hidden 해석 (D2 #W4-2a·#W4-6a 확정 2026-07-12)**:
- **#W4-6a — step-hidden vs 필드-hidden 분기는 의도**: step 가시성은 `actionRenderType`(id-based·"create 위저드=NEW 레코드 여부"·W3-6 Fix#3)로, 그 step **내부 필드** 가시성은 store `renderType`으로 해석한다. 둘은 다른 관심사(스텝=위저드/CRUD 모드, 필드=폼 렌더 모드)이므로 분기 유지가 정확 — 통일하지 않는다. prefill(id 없이 fetchedData/initialData로 store renderType='update')+renderType-keyed 필드-hidden의 좁은 발산은 각 관심사 내에서 일관되므로 수용.
- **#W4-2a — 전 step hidden = graceful**: create 위저드에서 선언된 전 step이 hidden으로 해석되면 step content/nav 없이 **액션바만** 렌더(크래시 없음). degenerate(오설정) 케이스이므로 graceful fallback 채택 — "전체 폼 fallback" 같은 서프라이즈를 발명하지 않는다.

### 3.3 라이프사이클 훅 (8) — §4가 계약 정의

`onInit` · `onChange` · `onBeforeSave` · `onAfterSave` · `onBeforeDelete` · `onAfterDelete` · `onBeforeListFetch` · `onAfterListFetch` — 전부 `(handler): this`, append(등록 순서=실행 순서), 대응 `get*Handlers()` 질의는 배럴 비공개(엔진 내부).

### 3.4 능력·액션 (4)

| 멤버 | 시그니처 | 비고 |
|---|---|---|
| `withCapabilities` | `(caps: { create?: ConditionalBooleanValue \| undefined; update?: ConditionalBooleanValue \| undefined; delete?: ConditionalBooleanValue \| undefined }): this` | 기본 전부 true. 구 manageEntityForm+withCreatable/Updatable/Deletable+**withNeverDelete(→delete:false)** 대체. 조건부 허용 — role 게이트가 선언으로(§감사 6-3 buttonGuard 해소). (시그니처 적법화 — 검증 dx-4) |
| `getCapabilities` | `(): Capabilities` | 해석은 엔진(controller/뷰) |
| `addAction` | `(action: FormAction): this` | 아래 FormAction 계약. 빌트인 Save/Delete는 capabilities에서 파생, `replaces`로 교체 |
| `getActions` | `(): FormAction[]` | order 정렬 |

```ts
interface FormAction {
  id: string
  label?: string | undefined            // render 부재 시 필수(런타임 검증)
  variant?: 'primary' | 'secondary' | 'danger' | undefined
  className?: string | undefined        // 스타일 escape hatch (구 withClassName — 검증 consumer-5)
  order?: number | undefined
  visible?: ConditionalBooleanValue | undefined
  enabled?: ConditionalBooleanValue | undefined
  replaces?: 'save' | 'delete' | undefined
  run?: ((ctx: ActionContext) => void | Promise<void>) | undefined
  render?: ActionRender | undefined     // 완전 커스텀 버튼(구 ReactNode 버튼 — 검증 consumer-4).
                                        // type-only ReactNode fn (ConditionalReactNodeValue 선례, L6).
                                        // 존재 시 react가 order/visible/enabled 인프라 안에서 렌더, run/label 무시 가능
}
interface ActionContext {
  controller: FormRuntime               // schema-core의 구조적 인터페이스(§6.2) — 계층 위반 없음(검증 feasibility-1)
  mutator: FormMutator
  values: Readonly<Record<string, unknown>>
  session?: Session | undefined
}
type ActionRender = (ctx: ActionContext) => ReactNode
// ReactNode는 type-only import(L6, ConditionalReactNodeValue 선례) — 해석·렌더는 react 계층
```

**ActionContext.controller 필수 vs ViewEntityForm.controller? 옵셔널 (D2 #W3-3 확정 2026-07-12)**: `ActionContext.controller: FormRuntime`은 **required 유지** — 커스텀 액션의 `run(ctx)`는 런타임(save/delete/reload/validate)을 가진다고 보장받는다(옵셔널화하면 액션 작성자마다 null-check 필요=흔한 케이스 열화). `ViewEntityForm.controller?`는 **옵셔널 유지**(§7) — 표시전용/host-owned-save(C7) 뷰가 유효. **상호작용(현 코드 동작 = 의도)**: controller 없는 뷰는 controller-의존 어포던스(빌트인 Delete·커스텀 액션·render 슬롯)를 **omit**하고 빌트인 Save만 legacy onSave 경로로 동작한다. 그래서 `replaces:'save'`+no-controller = Save 버튼 없음 = **정직한 결과**(교체 액션이 실행할 controller가 없음). 커스텀 액션은 controller를 전제한다 — 두 타입 모두 불변(코드 변경 없음).

### 3.5 데이터 전송 (2)

`withDataTransfer({ export?: { fields?: DataFieldSpec[]; fileName? }, import?: { fields?: DataFieldSpec[] } }): this` / `getDataTransfer()`. import 폴백은 **import.fields를 검사**(구 :448 copy-paste 구조 불가 — export/import 대칭 코드 공유). 런타임은 `/excel`.

**W6 entry-brief 확정 (2026-07-12 opus — 위 시그니처의 `DataFieldSpec`·반환형 명세)**:

```ts
// /schema — 선언 전용(L6: schema-core React/런타임 0). 값 변환 로직은 /excel 런타임이 type로 파생.
interface DataFieldSpec {
  name: string
  label?: string | undefined      // 미지정 시 필드 getLabel()에서 파생
  type?: FieldType | undefined     // 미지정 시 선언 필드의 type에서 파생 — /excel 값변환 스위치의 키
}
// getDataTransfer() 반환형(해석 완료 — auto-derive 반영, fields 항상 존재)
interface DataTransferSpec {
  export?: { fields: DataFieldSpec[]; fileName?: string | undefined } | undefined
  import?: { fields: DataFieldSpec[] } | undefined
}
```

- **auto-derive(구 getDataFieldsFromFields 계승·순수 schema)**: `export`/`import` 있으나 `fields` 미지정/빈 배열이면 `this.getFields()`를 **선언 순서**로 스냅샷해 `DataFieldSpec[]` 파생; 명시 `fields`는 verbatim. `getDataTransfer()`는 **동기**(구 `Promise`는 `isRequired()` await 때문 — 신 `DataFieldSpec`은 `required` 미보유, import 검증은 /excel 런타임이 필드 질의). :448 fix = export/import **대칭 헬퍼 공유**로 "import 폴백이 export.fields를 검사"가 구조적으로 불가능.
- **복합 타입 auto-derive 제외 원칙**: 평면 셀 표현이 없는 타입(정확 목록·warn 정책은 W6-2 구현·§Needs Review 소비자 검증)은 auto-derive에서 제외 — 소비자가 `export.fields`에 명시하면 포함. 구 switch(select/multiselect·date/datetime·boolean·html/markdown)는 /excel 런타임 소관(§2 `/excel`, xlsx optional peer).
- **미이관(문서화 이연·charter C6=export/import 코어 밖)**: 비밀번호 export(officecrypto)·excelDownloadHistory 로깅·DataImportSample 템플릿·DataImportResultView·DynamicDataImporter — 소비자 요구 시 /excel 확장(§9 MIGRATION 기재).

### 3.6 존재하지 않는 것 (설계상 금지)

`set*` 전부 · client-ext 10종 · alert 6종 · attribute bag 9종(→withMeta) · 폼-레벨 필드 sugar(withReadonly(name)/withRequired(name)/withHidden(name)/withOptions(name)/withHelpText(name)/withTooltip(name) — **name-키 런타임 sugar 전 계열**: 선언은 필드 빌더, 런타임은 setMeta 경유. gjcu 실사용 774+118회의 정준 이관은 §4.1 InitContext.setMeta/§9) · withShouldReload · merge/copyEntityFormToInnerFields · reload(→controller) · cacheKeyFunc/version · getName/getUrl(→`.name`/`.url` prop) · withUrl/withMenuUrl · withFieldToLayout · onSave 전체 오버라이드(→뷰 onSave prop/addAction(replaces)) · getViewableTabs/getVisibleFields류(엔진 내부 파생) · **리스트 순수 질의 계열**(getListFields/getFilterableFields/getListableFieldOrder/getViewOrder/getAdvancedSearchFields — 소비자 사용 0 실증, 엔진 내부화. 단 **withListConfig(199)/withFilterable(5)/withExcludeListFields(8)는 실사용 있음** — withList/withFilter로 이관, §9. 검증 coverage-3 정정).

## 4. 라이프사이클 훅 계약

### 4.1 컨텍스트 타입 (`/schema`)

```ts
interface InitContext {
  form: EntityForm                          // draft — addFields/withoutField 등 구조 변경 허용
  data?: Record<string, unknown>            // fetched payload (update 모드에서 존재)
  values: {
    get(name: string): unknown
    set(name: string, value: unknown): void         // hook override — fetched/default를 이김 (EF7)
    setFetched(name: string, value: unknown): void  // dirty 기준선 교정
  }
  setMeta(name: string, patch: FieldMetaOverride): void
  // ↑ (blocker fix — 검증 consumer-1) onInit에서 hidden/required/readOnly/options 토글의 정준 경로.
  //   store build 시 초기 meta override로 seed — mutator.setMeta와 동일 계약(EF1).
  //   gjcu 774+118 콜사이트의 1:1 이식: 구 `ef.withHidden('x', true)` → `ctx.setMeta('x', { hidden: true })`
  session?: Session
  renderType: RenderType
}
type InitHandler = (ctx: InitContext) => void | Promise<void>

interface BeforeSaveContext {
  data: Record<string, unknown>             // toSaveData 결과 — 프로퍼티 변형 가능
  setData(next: Record<string, unknown>): void
  values: Readonly<Record<string, unknown>>
  renderType: RenderType
  session?: Session
  cancel(reason?: string): void             // 저장 중단 — reason은 store.messages(severity:'info')로
}
interface AfterSaveContext {                 // 성공 시에만
  result: unknown; data: Record<string, unknown>
  renderType: RenderType; session?: Session; mutator: FormMutator
}
interface BeforeDeleteContext { ids: string[]; session?: Session; cancel(reason?: string): void }
interface AfterDeleteContext  { ids: string[]; session?: Session }        // 성공 시에만(구 무조건 발화 폐기 — 의도적 divergence)
interface BeforeListFetchContext {
  searchForm: SearchForm                    // 현재 검색 상태(불변 — SearchForm 빌더는 새 인스턴스 반환)
  setSearchForm(next: SearchForm): void     // 실제 주입 경로 — fetch는 마지막 set된 인스턴스 사용 (검증 feasibility-4)
  session?: Session
}
interface AfterListFetchContext { rows: unknown[]; totalElements: number; setRows(rows: unknown[]): void; session?: Session }
// 제네릭 없음 — EntityForm.onAfterListFetch 등록부에 T 바인딩 지점이 없어 unknown[]로 고정, 핸들러가 좁힌다

```

### 4.2 실행 의미론

- **순차·append 순서·per-handler try/catch**(EF3 계승: throw→log+skip, 나머지 계속). `onBeforeSave`/`onBeforeDelete`의 `cancel()`만 흐름 중단.
- `onInit`: initializeFormStore step 4~5 위치(BIND 후, store build 전) — 구 onInitialize+onFetchData 통합. `ctx.data` 유무로 분기(구 onFetchData 실사용 6). **save 후 재발화 없음**(구 이중 발화 폐기). 값은 `ctx.values`, 메타는 `ctx.setMeta`, 구조는 `ctx.form`.
- `onChange`: EF2 계약(FormMutator, changedField) — 이름만 `withOnChanges`→`onChange`. **FormMutator에 `getRenderType()`/`getSession()` 추가**(EF2 상위집합, additive — 구 훅 본문의 renderType 분기 실사용이 이식 불가였던 비대칭 해소, 검증 consumer-3. §6.1).
- `onBeforeSave`/`onAfterSave`: FormController.save 내부(§6.2) — 구 withOverrideSubmitData·withPostSave·PRE/POST_CREATE/UPDATE 전부 흡수. **EF6 `withSubmitTransform`은 onBeforeSave로 대체·제거 — 단, EF6은 0.4에 이미 출하됨**(entity-form.ts:168 + submit-transform.test.ts 7건 + store.test.ts EF6 2건 + apps/sample collabo.ts:374): 제거 비용(테스트/샘플 onBeforeSave 재작성)은 W2 스코프에 명시 계상(검증 feasibility-2 — "미출시 무비용" 정정. 외부 소비자는 0이므로 마이그레이션 부담은 여전히 내부 한정).
- `onBeforeDelete`/`onAfterDelete`: FormController.delete 내부 — 구 postDelete·PRE/POST_DELETE 흡수.
- `onBeforeListFetch`/`onAfterListFetch`: list-store.fetch 내부 — 구 onFetchListData·PRE/POST_FETCH_LIST 흡수. list-store 옵션에 `entityForm?` 추가(훅 소스). 필터 주입은 `ctx.setSearchForm(ctx.searchForm.addAndFilter(...))` 형태.

## 5. FormField — 필드 계약과 확장 (1급)

### 5.1 빌더 (현행 유지 + 법칙 적용)

유지: `withLabel/withRequired/withReadOnly/withHidden/withHelpText/withTooltip/withHideLabel/withDefaultValue/withValue/withValidations/withDependsOn/withRenderedBy/withRequiredPermissions/withViewPreset/withForm/withOrder` + 타입별(withMin/withMax/withRange/withLimit/withOptions/**withComboType**(Checkbox — 실사용 5, EA-A 이식분 유지. 검증 coverage-1)…). 개명: `withPlaceHolder`→`withPlaceholder`, 프로퍼티 `readonly`→`readOnly`(FieldMetaOverride 포함). 프리셋 sugar 유지: `withModifyOnly/withAddOnly/withViewOnly/withViewHidden/withListOnly/withHasValueReadOnly`(실사용 상위권 — 각 `withViewPreset` 위임 1줄).

신설:
| 멤버 | 시그니처 | 비고 |
|---|---|---|
| `withList` | `(config?: FieldListConfig \| false): this` | 리스트 참여 선언(opt-in). `FieldListConfig {order?, label?, align?, width?, sortable?}`. `false`=명시 제외. 구 useListField/withListConfig/useListFields/withExcludeListFields 대체. **마법 폴백 없음**: withList 0건이면 빈 컬럼+dev 경고(구 "첫 Listable 필드 자동 채택" 폐기) |
| `withFilter` | `(config?: FieldFilterConfig \| false): this` | 고급검색 참여. `FieldFilterConfig {operator?, order?, label?}` |

### 5.2 확장 seam (커스텀 필드 계약 — §감사 6-5 해소)

- `type: FieldType \| (string & {})` — **열린 타입**: 커스텀 필드가 자기 타입 문자열 등록 가능(`'studentEvaluationAnswer' as any` 소멸). 레지스트리도 string 키.
- protected seam 3종을 공개 계약으로 문서화·고정:
  - `serializeValue(value: TValue, ctx: FieldEvalContext): Record<string, unknown>` — save payload 기여. **항상 keyed 기여 맵을 반환**하고 toSaveData가 병합(모호성 제거 — 검증 feasibility-3): 기본 구현 `{ [this.name]: value }`, ManyToOne은 `{ [idFieldName]: id }`(구 `<name>Id` 평탄화를 여기서 구현 → **toSaveData의 duck-typed `getIdField` 캐스트 제거**, 현 form-store.ts:583). dotted-name 중첩은 병합 후 toSaveData가 일괄 처리
  - `bindValue(raw: unknown): TValue` — fetch 바인딩 변환(dotted-path 해석 후 호출)
  - `getDisplayValue(value: TValue): string` — 리스트 셀/엑셀 기본 표현
- 추상 베이스 공개 고정: `FormField` · `OptionsField` · `MultiOptionsField` (+`AbstractDateField`). 문서 EXTENSIONS.md에 "필드 신설=클래스1+렌더러1"(C4) 케이스 스터디.
- **FormField 빌더는 in-place mutate + `return this`**(0.4 현행)를 공개 계약으로 명문화 — `ctx.form.getField('x')?.withHidden(true)`가 draft 단계에서 유효(재등록 불요). 단 store 생성 후 필드 인스턴스 직접 변형은 무효(stale) — 런타임은 setMeta 경유(Handoff Do-NOT ⑤와 정합).

### 5.3 AsyncValidation (구 CheckButtonValidation 재설계 — EG6)

```ts
class AsyncValidation extends ValidationItem {
  constructor(check: (value: unknown, ctx: FieldEvalContext) => Promise<ValidateResult>,
              opts?: { trigger?: 'change' | 'button'; buttonLabel?: string; debounceMs?: number })
}
```
`withValidations()`에 승차(C5 단일 채널 — 별도 필드 클래스 불필요). 필드 slice에 `asyncState?: 'unchecked'|'checking'|'valid'|'invalid'`(store 관리), 렌더러가 button trigger 시 확인 버튼 어포던스. 구 tri-state·중복확인(Alias/ExternalId/Slug) capability 충족. 소비자가 "시도 후 포기"한 구 API(주석 처리 1건)의 원인 — 전용 필드 클래스 강제 — 를 제거.

**save-gating (#W4-3a 확정 2026-07-12 — AsyncValidation = 일반 validation)**: `validateAll`은 AsyncValidation 보유 필드가 **dirty이면서 `asyncState !== 'valid'`**(unchecked/checking/invalid)이면 그 필드를 invalid로 판정 → **save 차단** + 필드 에러메시지. 규범:
- **네트워크 없음**: sync `validate()`는 중립 유지(`check` 미호출·항상 success), `validateAll`은 store에 저장된 tri-state만 읽는다 — validate/save가 조용히 네트워크 라운드트립되지 않는다.
- **dirty 게이트**: 미변경(persisted) 값은 이미 확정이므로 재확인 불요 → update 폼 미터치 필드는 통과. 값 되돌림(`resetValue` → 'unchecked', dirty=false)도 비차단.
- **값 변경 시 tri-state 'unchecked' 리셋**: 값이 바뀌면 prior 확인은 무효 → 'change' 트리거는 debounce로 재확인, 'button' 트리거는 재확인 전까지 차단(확인 후 값 변경으로 게이트를 우회하던 구멍 봉인).
- **in-flight stale 가드**: `check` 진행 중 값이 바뀌면 그 결과는 폐기(stale valid/invalid 부활 방지).
- **게이트 메시지**: 저장 차단 시 문구는 asyncState별 결정적 기본값(unchecked/checking/invalid)이며, check 고유 메시지는 확인 시점(runAsyncValidation)에 노출된다.

## 6. 런타임 — store · FormController

### 6.1 form-store·FormMutator 변경점 (그 외 현행 유지)

| 변경 | 내용 |
|---|---|
| `formErrors: string[]` → `messages: FormMessage[]` | `FormMessage {key, severity: 'error'\|'warning'\|'info', text, field?, persistent?}` + 액션 `addMessage/removeMessage(key)/clearMessages({includePersistent?})`. **폼 배너 단일 채널**: 서버 entity 에러(EG5)+구 alertMessages(EG17)+cancel reason 전부 여기. 구 inert `formErrors` 해소 |
| `formReadOnly: boolean` 신설 | EntityForm.withReadOnly 선언의 seed. FieldRenderer가 effective readOnly에 OR, 빌트인 Save 어포던스 숨김. **controller.save는 하드 게이트하지 않음**(쓰기 차단은 capabilities 소관 — §3.1 의도 명시) |
| `fetchedData?: Readonly<Record<string,unknown>>` 노출 | 구 getFetchedEntity 실사용 10 대응 — EntityField로 모델링 안 된 프로퍼티 접근 |
| casing | `FieldMetaOverride.readonly`→`readOnly`(L2) |
| `toSaveData` | field.serializeValue keyed-맵 병합으로 재작성(§5.2) — 권한 제외(EG1)·exceptOnSave 유지 |
| **FormMutator 확장(additive)** | `getRenderType(): RenderType` + `getSession(): Session \| undefined` 추가(검증 consumer-3). 그 외 EF2 계약 무변경(getValue/getValues/setValue/setMeta/addField/removeField/setTabHidden) |

### 6.2 FormRuntime(schema) + FormController(state 구현)

**계층 규칙(검증 feasibility-1)**: `/schema`가 구조적 인터페이스 `FormRuntime`과 outcome 타입을 선언(FormMutator 선례와 동형 — schema는 타입만, 구현·store 의존은 /state). ActionContext 등 schema 타입은 FormRuntime만 참조한다.

```ts
// /schema — 구조적 계약(구현 없음)
interface FormRuntime {
  save(opts?: { skipValidation?: boolean }): Promise<SaveOutcome>
  delete(opts?: { ids?: string[] }): Promise<DeleteOutcome>   // 기본 [현재 id]
  reload(): Promise<void>       // 재fetch→재바인딩→onInit 재실행→같은 store에 반영 (구 no-op reload의 실동작 대체)
  validate(): Promise<boolean>
}
type SaveOutcome  = { ok: true; result: unknown }
  | { ok: false; reason: 'validation'|'cancelled'|'capability'|'error'; cancelled?: string; error?: BackendError }
type DeleteOutcome = SaveOutcome

// /state — 구현
function createFormController(opts: {
  entityForm: EntityForm; store: FormStore; adapter: BackendAdapter; session?: Session
}): FormRuntime
```

**save 플로우(정준)**: capability(create|update) 해석 → (skip 아니면) validateAll(첫 invalid 필드 정보 포함 — sync ValidationItem 채널 **+ W4-3a async save-gate**: dirty이며 `asyncState!=='valid'`인 AsyncValidation 필드=invalid, §5.3) → store.toSaveData() → `onBeforeSave` 순차(cancel 가능·data 변형) → revision 주입(설정 시) → adapter.create/update → **실패**: `BackendError.fieldErrors`→필드 slice errors(**name-키** — 구 label-키 버그 금지)+미매핑분은 messages(severity:'error'), generic 메시지는 fieldErrors 존재 시 억제(suppress-generic) → **성공**: 비persistent messages clear(clear-on-success) → `onAfterSave` 순차 → outcome.
**delete 플로우**: capability(delete) → `onBeforeDelete`(cancel) → adapter.remove(url, ids, revision?) → 성공 시 `onAfterDelete`.
ViewEntityForm의 Save/Delete 버튼과 headless 호스트가 **같은 controller를 호출**(L7). 호스트 소유 저장(C7)도 여전히 가능 — controller는 편의 오케스트레이터지 강제 아님.

**SaveOutcome.reason 판별자 (D2 #W2-5/#W3-2 확정 2026-07-12)**: 실패(`ok:false`)는 `reason`으로 네 원인을 구별한다 — `'validation'`(validateAll 실패·필드 slice errors 세팅)·`'cancelled'`(onBefore* 핸들러 `cancel(reason?)`·`cancelled`에 사유; **reason 없는 cancel도 `reason:'cancelled'`** = 구 exactOptional `cancelled:undefined` 불가로 validation과 구별불가였던 #W2-5 해소)·`'capability'`(CAP-06 거부·silent block=adapter 미호출·메시지 없음·#W3-2)·`'error'`(adapter throw·`error`=매핑된 BackendError). 소비자는 `ok`로 흐름제어, headless 호스트(C7)는 `reason`으로 분기(store 내부 미조회). 신 export 0(SaveOutcome 인라인 union 확장).

## 7. react 표면

| 항목 | 내용 |
|---|---|
| `useEntityForm(opts)` | `{entityForm, id?, adapter?, session?, initialData?, validateOnChange?}` → `{store, entityForm, controller, loading, error}`. 현 useEntityFormInitializer 계승+controller 동봉(단일 진입) |
| `ViewEntityForm` | `{entityForm, store, controller?, onSave?, readOnly?, slots?: { title?, header?, actions? }}` — slots는 ReactNode/렌더 fn(구 headerArea·title.view의 렌더 소관 착지, L6). `readOnly` prop은 **뷰-레벨 런타임 오버라이드**(페이지 조건부) — 선언-레벨 재사용 변형은 `EntityForm.withReadOnly()`(§3.1, M2O 전파 포함. 검증 consumer-7). 빌트인 버튼: capabilities 파생+addAction 병합, 액션 visible/enabled/render 해석 |
| `ViewListGrid` | `{entityForm, store, onRowClick?, selection?, toolbar?, columns?}` — 컬럼은 field.withList에서 파생(C1). 고급검색 패널은 withFilter 파생 |
| 레지스트리 3종 | `registerFieldRenderer(type: string, comp)`(현행) + `registerListCellRenderer(type, comp)` + `registerFilterRenderer(type, comp)`(EG23/24) — string 키(열린 타입) |
| `ListGridProvider` | `{ui?, adapter, session?, router?, messages?, customOptions?}` 원샷 편의(개별 프로바이더 존치). 프로바이더 6종 나열 부담 해소 |
| 배럴 정비 | **react 배럴 추가**: useFieldMeta·useReferenceResolver(현 미수출 실책). **schema 배럴 제거**(schema-core index.ts — W1-6): PermissionPolicy(사용 0 중복)·SCHEMA_CORE_VERSION(P1 잔재)·isEquals/isEqualCollection(외부 소비 0 — 내부화) |

## 8. 커버리지 매트릭스 (CAP-ID — 빈 행 금지, 구현 태스크는 소화하는 ID를 명시)

| ID | Capability (blueprint/감사) | 신 API 착지 |
|---|---|---|
| CAP-01 | EG1 save 권한 제외 · EG2 렌더 하드게이트 | ✅ 출하됨(유지) — toSaveData/FieldRenderer |
| CAP-02 | EG3 탭/그룹 권한 선언 | addFields TabInput/GroupInput.requiredPermissions + withTab/withGroup |
| CAP-03 | EG4 권한 가시성 파생(hasVisibleContent) | 엔진 내부(ViewEntityForm 파생) — 공개 API 아님 |
| CAP-04 | EG5 서버에러→필드+배너 | FormController save 플로우 + store.messages (name-키·suppress-generic·clear-on-success) |
| CAP-05 | EG6 중복확인 | AsyncValidation(trigger:'button') §5.3 |
| CAP-06 | EG7 CRUD 플래그 | withCapabilities(조건부 허용) |
| CAP-07 | EG8 revision write-path | withRevision + controller 주입 |
| CAP-08 | EG9 delete flow | controller.delete + 빌트인 Delete(capability 파생) |
| CAP-09 | EG10 커스텀 액션/헤더 | addAction(replaces/render/className) + slots.header |
| CAP-10 | EG11 위저드 | withSteps(clone 무손실) |
| CAP-11 | EG12~14 client-ext | onBefore/After{Save,Delete,ListFetch} 8훅 통합(L7 엔진 실행) |
| CAP-12 | EG15 sugar/dead 원장 | §3.6 금지 목록 + hasField/hasTab/getTabFields/withoutField/withoutTab 유지 |
| CAP-13 | EG16 title | withTitle/getTitle(항상 해석) + slots.title |
| CAP-14 | EG17 alerts | store.messages 단일 채널 |
| CAP-15 | EG18 helpText/tooltip | 필드 빌더+렌더러 resolver(현행) — 폼-레벨 sugar 미도입 |
| CAP-16 | EG19 data-transfer 표면 | withDataTransfer(:448 구조적 fix) |
| CAP-17 | EG20 Excel 런타임 | `/excel` subpath(xlsx optional peer) |
| CAP-18 | EG21~22 필드 list-config·폼 list 질의 | withList/withFilter — **순수 get* 질의만** 내부화(사용 0), withListConfig/Filterable/Exclude는 §9 이관(검증 coverage-3) |
| CAP-19 | EG23 컬럼 파생+list-cell | ViewListGrid 파생 + registerListCellRenderer |
| CAP-20 | EG24 고급검색+filter 레지스트리 | withFilter 파생 + registerFilterRenderer |
| CAP-21 | 감사 inert #1 formErrors | store.messages로 배선(controller가 writer) |
| CAP-22 | 감사 inert #3 neverDelete | withCapabilities({delete:false}) — 정직한 의미론 |
| CAP-23 | 감사 GAP 6 sugar·GAP 7 중복확인 | §3.6 큐레이션 / §5.3 |
| CAP-24 | 멀티테넌트 헤더(§감사 6-4) | adapter headers 함수형(§2) |
| CAP-25 | headless(§감사 6-2) | `/schema`+`/state` 계약(§2) + FormRuntime(§6.2) |
| CAP-26 | 훅 내 메타 토글(구 name-키 sugar 774+118) | InitContext.setMeta + mutator.setMeta(검증 consumer-1) |
| CAP-27 | 폼 읽기전용 변형·M2O 전파(구 setReadOnly 26) | EntityForm.withReadOnly + store.formReadOnly(검증 consumer-7/coverage-4) |
| CAP-28 | 헌장 C1~C9 | C1 선언=화면(withList 파생) · C2 조건부(L5) · C3 관계(현행 M2O/SubColl) · C4 카탈로그+확장(§5) · C5 검증(AsyncValidation 포함 단일 채널) · C6 탭/그룹/스텝/엑셀/리비전(§3) · C7 주입(§2/7) · C8 어댑터(§6.2) · C9 리스트 세트(CAP-18~20) |
| CAP-29 | **명시 descope** | 자동저장(이탈 복구, C6) — 0.4 GA 밖, 로드맵 후속(§Backlog 유지). RuleField/XrefPrice/ContentAsset — EA-D/EA-C 결정 유지(dead) |

## 9. 마이그레이션 표 (0.3 실사용 116멤버 전수 — 그룹 압축)

| 구 (사용량) | 신 | 방식 |
|---|---|---|
| **필드 선언 빌더** 동일군: withLabel(2946)/withRequired(1914·필드)/withHidden(1184·필드)/withReadOnly(749)/withHelpText(512)/withDefaultValue(315)/withTooltip/withHideLabel/withValidations/withOrder/withValue/withMin/withMax/withRange/withLimit/withOptions(필드)/withComboType(5) | 동일 | 무변경 |
| **EntityForm-레벨 name-키 sugar**(훅 안 런타임): withHidden(name,·gjcu 774)/withRequired(name,·118)/withReadonly(name,148)/withOptions(name,49)/withHelpText(name)/withTooltip(name) | onInit: `ctx.setMeta(name,{…})` · onChange: `mutator.setMeta(name,{…})` · 순수 선언: 필드 빌더 | **수동**(1:1 대응표 — 검증 consumer-2. 예: `ef.withHidden('x',true)` → `ctx.setMeta('x',{hidden:true})`) |
| withModifyOnly(323)/withAddOnly(175)/withViewPreset(172)/withViewHidden(41)/withListOnly(11) | 동일(sugar 유지) | 무변경 |
| `useListField`(985)/`withListConfig`(199)/`useListFields` | `withList(config?)` | codemod: `.useListField()`→`.withList()` |
| `withExcludeListFields`(8) | 필드 조회 후 개별 `withList(false)` | **수동**(런타임 계산 배열 → 필드별 호출. 검증 consumer-6) |
| `withPlaceHolder`(15) | `withPlaceholder` | codemod |
| `addFields`(891)/`addCollections`(73) | `addFields`(group 키 개명) | codemod: fieldGroup→group, addCollections→addFields |
| `withOnInitialize`(132)/`withOnFetchData`(6) | `onInit(ctx)` | 수동: (ef,session)→ctx.form/ctx.session; 값 ef.setValue→ctx.values.set; 메타 토글→ctx.setMeta |
| `withOnChanges`(100) | `onChange` | 수동: (ef)→(mutator) — renderType 분기는 mutator.getRenderType() |
| `setValue`(165)/`changeValue`/`setFetchedValue`(23)/`setFetchedValues`/`resetValue` | 훅 안: ctx.values.set/setFetched · 런타임: mutator.setValue | 수동(1:1 표) |
| `getValue`(802)/`getValues`/`getCurrentValue`(32) | 훅: mutator.getValue/ctx.values.get · 컴포넌트: useFieldValue | 수동 |
| `withOverrideSubmitData`(11) | `onBeforeSave`(ctx.data 변형) | 수동 |
| `withOnSave`(4) | ViewEntityForm onSave prop 또는 addAction(replaces:'save') | 수동 |
| `withPostSave`(4)/`withPostDelete`(1) | `onAfterSave`/`onAfterDelete` | 준-기계적 |
| `withOnPostFetchListData`(3) | `onAfterListFetch` | 준-기계적 |
| client-ext 8종(1파일) | onBefore/After{Save,Delete,ListFetch} | 수동(1파일) |
| `withButtons`(26)/`withHeaderArea`(2) | `addAction`(선언 버튼=label/run·커스텀 컴포넌트 버튼=render·클래스=className) / slots.header | 수동 — visible/enabled 조건부가 buttonGuard 패턴 대체 |
| `withNeverDelete`(21) | `withCapabilities({delete:false})` (+active 필드 패턴은 `/presets/rcm`) | 준-기계적 |
| `setReadOnly`(26) | 선언 변형: `EntityForm.withReadOnly()`(M2O 전파 포함) · 페이지 조건부: ViewEntityForm `readOnly` prop | 준-기계적(검증 consumer-7) |
| `withShouldReload`(224) | **삭제**(store 반응성이 대체) | codemod: 호출 제거 |
| `withTitle`(210) | 동일(객체형은 {text, fromField}) | 준-기계적 |
| `getRenderType`(197)/`getField`(209)/`getTabs`(3)/`getTab`/`getTabFields`(5)/`getLabel`(3)/`getId`(7) | 동일/`getField(n)?.getLabel()` | 무변경/준-기계적 |
| `getName`(22)/`getUrl`(≤2) | `.name`/`.url` (public readonly prop) | codemod |
| `withId`(160)/`withSession`(4)/`getSession`(16) | withId 동일 · session은 useEntityForm/controller 옵션+ctx.session/mutator.getSession() | 수동(선언에서 제거) |
| `getFetchedEntity`(10) | store.fetchedData / ctx.data | 준-기계적 |
| `getFetchUrl`(3)/`isAbleFetch` | adapter.getOne 내부화 — 삭제 | 수동(직접 fetch는 adapter 호출) |
| `withDataTransferConfig`(15) | `withDataTransfer` | 준-기계적 |
| `withCreatedAndUpdatedAtFields`(30)/중복 별칭 2종 | `/presets` 감사필드 헬퍼(addFields({items: auditFields()})) | codemod |
| `withCheckButtonValidation`(17)/`withCheckButtonLabel`(3) | AsyncValidation(trigger:'button') | 수동 |
| `withAttributes`(2)/`getAttributes`(18)/`hasAttribute`(1) | `withMeta`(merge)/`getMeta` | 준-기계적 |
| `removeField`(13)/`removeTabs`(3)/`removeTab` | `withoutField`/`withoutTab`(구조 제거 의미론 보존) | codemod |
| `withCreateStep`(1) | `withSteps` | 준-기계적 |
| `isDirty`(14)/`isRequired`(19)/`isBlank` | store.isDirty / 필드 predicate(현행) | 준-기계적 |
| `getSaveValue`(4) | serializeValue override | 수동(커스텀 필드) |
| `withOverrideRenderListItem`(30)/`withOverrideRender`(5)/`withDisplayFunc`(10)/`useChip`(3)/`withCardIcon`/`withLineBreak`(5) | list-cell 레지스트리/ViewListGrid columns override/getDisplayValue | 수동(렌더 소관 — react 계층) |
| `withLayout`(17) | 동일(필드) — `withFieldToLayout`(6)은 삭제(필드별로) | 준-기계적 |
| `withSortable`(6)/`withFilterable`(5) | withList({sortable})/withFilter() | codemod |
| SearchForm군: withFilter(20)/withSort(5)/withPage(16)/withPageSize(25)/quickSearch | SearchForm 존치(wire format, 불변 빌더) | 무변경 |
| `ListGrid`+`withSearchForm`(37)/`getSearchForm`(1) | createListStore({initialSearch}) | 수동 |
| `ViewEntityFormWrapper`(249)/`ViewListGridWrapper`(138) | ViewEntityForm/ViewListGrid+호스트 페이지 셸(W5에 페이지 컴포지션 포함) | 수동 — MIGRATION 최대 항목, 전용 절 필수 |
| `withMaskedValue`/`withSaveValue`/`withParentId`/`withMenuUrl`/기타 ≤2회 34종 | 필드별 대응(M2O 옵션/serializeValue/…) — MIGRATION 부록 전수표 | 수동 |

## 10. 검증 게이트 (설계→구현 공통)

1. **커버리지**: §8 CAP-01~29 빈 행 0 — 각 구현 태스크는 소화하는 CAP-ID를 명시하고, wave 종료 게이트에서 매트릭스 대조(전 ID 소화 or 명시 이월). 누락 검출은 기억이 아니라 표 대조.
2. **표면 계수(규칙 고정 — 임계값은 §10-A 최종 인벤토리 기준)**: *atomic public member* = public 인스턴스 메서드·getter·public 프로퍼티 각 1(생성자 포함, 묶음 행은 전개 계수). **EntityForm ≤55 · 루트 배럴 ≤120 · `/schema` ≤190** (CI: `scripts/count-public-surface.mjs`). 계수 **규칙**은 고정 — 숫자 맞추려 규칙 완화 금지, 표면을 줄여라. **임계값**은 §10-A 최종 설계 인벤토리+소폭 마진에서 도출(원 45/180은 W2 훅·전 타입 인벤토리 설계 이전 추정이라 최종 설계에 미달했던 것을 정정 — 임의 완화 아님, 재산정 2026-07-11). **wave-entry 규칙(W5~W7)**: 각 wave 브리핑 pass는 신규 심볼을 §10-A 표에 추가하고, 합계가 임계값에 근접/초과하면 같은 entry 커밋에서 표 근거와 함께 임계값을 재산정한다.
3. **법칙 준수**: L1~L8 — 특히 `set*` 0개+2단계 동명 0개(EntityForm), 훅 실행 뷰 코드 0(L7), camelCase(L2), 조건부 타입 단일(`ConditionalBooleanValue`, L5).
4. **발명 금지 게이트**(harness team-conventions §설계 산출물): 구현 브리핑은 본 스펙 §번호를 인용해야 하며, 스펙이 결정하지 않은 설계 판단이 나오면 구현하지 말고 §Open Questions/needs_decision으로 — 스펙 개정이 먼저다.
5. **headless 빌드**: `/schema`+`/state`만 import하는 fixture가 React 없이 tsc+실행 green.
6. **구 결함 원장**: 카탈로그 §1~9 각각에 "신 표면에서 불가능한 이유" 1행(재현 테스트 또는 타입 증명).
7. 기존 게이트: type-check && typecheck:packages && test && lint && format:check && build + E2E 16+.

## 10-A. 표면 계수 최종 인벤토리 (임계값 도출 근거 — 2026-07-11 W4 착수 전 재산정)

원 임계값 45/120/180은 W1 시점 추정 — W2 훅 시스템(get*Handlers ×8)과 W4~W6 신규 타입 인벤토리 설계 이전 값이라 최종 설계에 미달(§Open Question "초기 추정 미달, 임의완화 아님"의 정정). 아래 최종 인벤토리 + 소폭 마진에서 재산정한다. 계수 규칙(§10 게이트 2) 자체는 무변경.

**EntityForm 최종 = 53 → 임계값 55 (+2 마진)**
- 소비자 선언 멤버 **45** = §3.1 14(getReadOnly 포함) + §3.2 17 + §3.3 8(on* 훅) + §3.4 4 + §3.5 2.
- + **엔진 내부 `get*Handlers` ×8**(§3.3 — 배럴 비공개이나 public 메서드라 기계 계수됨; 훅당 1 자동 파생).
- = 53. 마진 +2 = wave 내 with*/get* 비대칭 중간상태 흡수. **W4 궤적**: 41(현재)→W4-2 steps +2→W4-4 revision +2→W4-5 meta +2 = 47, 이후 §3.2 질의(hasField/getTab/hasTab/getTabFields)+§3.5 = 53.

**`/schema` 배럴 최종 ≈ 186 → 임계값 190 (+4 마진)**

| wave | 신규 배럴 타입 | Δ | 누계 |
|---|---|---|---|
| ~W3(현재) | — | — | 180 |
| W4 | `StepDef`(§3.2) · `AsyncValidation`(§5.3) | +2 | 182 |
| W5 | `FieldListConfig` · `FieldFilterConfig`(§5.1) | +2 | 184 |
| W6 | `DataFieldSpec` · `DataTransferSpec`(§3.5 W6-entry 확정) | +2 | 186 |
| W7 | 패키징 — schema 타입 0 | 0 | 186 |

- 마진 +4 = W5/W6 미분해 세부 타입(필터 operator 유니온·list align/width 헬퍼·DataTransfer 하위 spec 등). W5/W6 entry pass에서 실측이 190 근접 시 위 wave-entry 규칙으로 재산정.

**루트 배럴 실측 57 → 임계값 120 무변경** — 원 projection 49 base + **W5 실측 +8**(list-cell renderer export 4 + filter renderer export 4 — registry 헬퍼 전개 계수; 고급검색 패널 자체는 ViewListGrid 내장·별도 export 아님, W5 entry-brief 결정 3-내장). ⚠️ 원 W5 projection은 +2로 과소추정 — **실측 57이 정본**(count-public-surface.mjs, 2026-07-12). W6 root +0(toolbar seam 재사용). 대폭 여유이나 성장 상한으로 유지(축소 목적 아님).

## 11. 구현 wave (요약 — 실행 계약은 [waves 브리프](./entityform-api-implementation-waves.md))

| Wave | 내용 | CAP |
|---|---|---|
| W1 표면 정비 | 명명 법칙 일괄(readOnly/placeholder/fieldGroup→group/getName·getUrl→prop)·배럴 큐레이션·EntityForm set* 제거·without* 신설·계수 스크립트. **0.4 내부 이관 비용 포함**: EF7 값세터→InitContext(entity-form-value.test.ts+init 파이프 재배선 — 검증 feasibility-5) | CAP-12 일부 |
| W2 훅+컨트롤러 | onInit/onChange 개명·onBefore/After 6훅 신설·InitContext(setMeta 포함)·FormRuntime/FormController·messages 채널·serializeValue seam·FormMutator getRenderType/getSession. **EF6 대체 비용 포함**(submit-transform.test.ts 7+store.test.ts 2+collabo 샘플 → onBeforeSave 재작성 — 검증 feasibility-2) | CAP-04·07(주입점)·11·14·21·25·26 |
| W3 권한·능력·액션 | TabInput/GroupInput 권한·가시성 파생·withCapabilities·addAction(render/className)+빌트인·delete flow E2E·withReadOnly/formReadOnly | CAP-02·03·06·08·09·22·27 |
| W4 폼 완결 | withTitle/getTitle·withSteps 위저드·AsyncValidation·withRevision·withMeta(merge) | CAP-05·07·10·13·23 |
| W5 list-track | withList/withFilter·컬럼/검색 파생·list-cell/filter 레지스트리·페이지 셸(Wrapper 상당 컴포지션 가이드) | CAP-18·19·20 |
| W6 data-transfer | withDataTransfer·`/excel` subpath·ViewListGrid 툴바 opt-in | CAP-16·17 |
| W7 패키징+마이그레이션 | subpath exports·peers 재선언·headless fixture·MIGRATION.md 0.3→0.4 전수표+codemod | CAP-24·25 |

각 wave: 설계 스펙 대비 리뷰 게이트(§10) → full gate+E2E → 커밋. hot-file(entity-form.ts·form-store.ts·ViewEntityForm) 순차 원칙은 blueprint 교차 리스크 §2 유지.
**wave 미할당 CAP(대조 계정)**: CAP-01·CAP-15 = 기출하/현행 유지 — 매 wave 회귀 게이트로 검증. CAP-28 = GA 헌장 대조표 pass에서 대조(W7 뒤). CAP-29 = 명시 descope(구현 대상 없음).

## 12. Open (비크리티컬 — 진행 중 판단, §PROGRESS Open Questions 후보 아님)

- `/presets` 감사필드 헬퍼의 정확한 필드 구성(createdAt/updatedAt/createdBy…)은 GJCU 관례 재확인 후 W5에서 확정.
- Wrapper-급 페이지 셸을 W5 산출물(컴포넌트)로 낼지 문서 가이드로 낼지는 W5 착수 시 sample 요구로 판정.
