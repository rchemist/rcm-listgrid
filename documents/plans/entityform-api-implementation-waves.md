# EntityForm API 구현 wave 브리프 (실행급 — opus/sonnet 세션 실행 계약)

> **지위**: [공개 API 스펙](./entityform-public-api-spec.md)(규범)의 **실행 계약**. 이 문서의 태스크는 하위 티어 세션이 재유도 없이 실행 가능해야 한다(harness team-conventions §설계 산출물 = 실행급 계약). **스펙 §번호를 인용할 수 없는 판단이 나오면 구현 금지** — §Open Questions로 올리고 스펙 개정이 먼저다(스펙 §10 게이트 4).
> **작성**: 2026-07-11 (fable). W1~W4 = 태스크 단위 완전 명세. W5~W7 = 계약 수준 + **wave-entry 브리핑 pass 필수**(아래 §W5 규칙).
> **파일 경로 주의**: 인용 file:line은 2026-07-11 HEAD 기준 — 착수 시 재확인(선행 wave가 옮겼을 수 있음).

## 전역 규칙 (모든 wave·태스크 공통)

- **게이트**: 태스크마다 `npm run type-check && npm run typecheck:packages && npm test && npm run lint && npm run format:check && npm run build`; wave 종료 시 +E2E 16+ 및 **CAP 대조**(이 wave가 선언한 CAP-ID 전부 소화 or §Progress notes에 명시 이월).
- **hot-file 직렬화**: `packages/schema-core/src/entity-form.ts` · `packages/state/src/form-store.ts` · `packages/react/src/components/ViewEntityForm.tsx`를 건드리는 태스크는 **같은 wave 안에서 순차**(병렬 fan-out 금지).
- **전역 Do-NOT**(PROGRESS Handoff 승계): ① 훅/빌더가 store 직접 수신 금지(FormMutator 경유) ② 동적 mutation 후 `entityForm.getFields()` 직접 읽기 금지(store.fieldDefs) ③ exactOptionalPropertyTypes 조건 spread 트랩 — 옵션 프로퍼티는 `p?: T | undefined`로 선언하고 조건 spread 대신 명시 대입 ④ SOUND 내부(store/EF1-7/seam) 재작성 금지 — 공개 표면 재설계임 ⑤ 검증 없는 ✅ 금지(증거 1줄).
- **테스트 정책**: 기존 테스트의 *이름 변경 동반 수정*은 허용(rename wave 특성), **행동 약화 금지** — 기대값을 바꾸는 수정은 스펙 §를 인용해야 한다.

## W1 — 표면 정비 (rename·큐레이션·계수) · CAP-12 일부

| id | 태스크 | 파일 | before → after | 증명 | Do-NOT |
|---|---|---|---|---|---|
| W1-1 | `readonly`→`readOnly` 전면 개명 (스펙 L2) | `packages/schema-core/src/field/{form-field.ts:49, field-meta.ts:13, entity-field.ts}` + 전 필드 클래스 + `packages/state/src/form-store.ts`(meta 접근) + react 소비처 + 테스트 | `readonly?: ReadOnlyType` → `readOnly?: ReadOnlyType` · `FieldMetaOverride.readonly` → `.readOnly` · `isReadonly()` → `isReadOnly()` | full gate — 잔존 `\breadonly\??:` grep 0 (TS 키워드 `readonly` 수식어는 제외) | 행동 변경 0 — 식별자 개명만. `withReadOnly` 빌더는 이미 대문자(무변경) |
| W1-2 | `placeHolder`→`placeholder` 개명 (L2) | `form-field.ts`(prop+`withPlaceHolder`), 렌더러들, ui-default `TextInputProps` 인접 | `placeHolder?` → `placeholder?` · `withPlaceHolder` → `withPlaceholder` | full gate — `placeHolder` grep 0 | — |
| W1-3 | EntityForm 정체성 정리 (스펙 §3.1) | `packages/schema-core/src/entity-form.ts:93-95,129,265-268` + 호출처(`packages/state/src/initialize-form-store.ts`, apps/sample) | ctor `(name, fetchUrl)` → `(name, url)`(trailing slash 정규화 저장) · `getName()/getUrl()` 삭제 · `readonly name/url` public 유지 | full gate — `getName\(\)\|getUrl\(\)` 리포 grep 0 | `getFetchUrl` 부활 금지(스펙 §3.6) |
| W1-4 | addFields 입력 개명 (§3.2) | `entity-form.ts:82-88` AddFieldsInput + 전 사용처(sample entities 다수) | `fieldGroup?:` → `group?:` (TabInput/GroupInput에 `requiredPermissions?: string[] \| undefined` 슬롯 추가 — 소비는 W3-1) | full gate | requiredPermissions **소비 로직은 W3-1** — 여기선 타입만 |
| W1-5 | `withoutField`/`withoutTab`/`withTab`/`withGroup` 신설 + `EntityForm.setTabHidden` 제거 (§3.2, L1) | `entity-form.ts`(setTabHidden :227 제거) + 테스트 | 신설 4 멤버 — 시그니처는 스펙 §3.2 표 그대로. setTabHidden 사용처는 `withTab(id,{hidden})`으로 | 신규 unit: withoutTab이 getTabs()에서 구조 제거·withTab({hidden})은 유지+숨김 구분 | mutator/store의 `setTabHidden`(런타임)은 **유지** — 제거는 EntityForm 것만 |
| W1-6 | 배럴 큐레이션 (§7) | `packages/schema-core/src/index.ts:226`(SCHEMA_CORE_VERSION), `permission.ts:58`(PermissionPolicy), `index.ts:94`(isEquals/isEqualCollection) 제거 · `packages/react/src/index.ts`에 useFieldMeta(`providers/form-store.tsx:58`)/useReferenceResolver(`providers/adapter.tsx:81`) 추가 · `apps/sample/app/page.tsx:13` 수정 | export 4건 -, 2건 + | full gate + 계수 스크립트(W1-7) 통과 | isEquals 등 **내부 사용은 유지**(배럴만 제거) |
| W1-7 | 공개 표면 계수 스크립트+CI (§10 게이트 2) | `scripts/count-public-surface.mjs`(신설) + CI 워크플로 | atomic member 규칙(§10) 구현 — EntityForm ≤45·루트 ≤120·`/schema` ≤180 초과 시 fail | CI green + 현재값 기록 | 계수 규칙 임의 완화 금지 |

**W1 종료 게이트**: full gate + E2E 16 + `grep -rn "getName()\|placeHolder\|SCHEMA_CORE_VERSION"` 0 + 계수 리포트 커밋.

## W2 — 훅 통합 + FormRuntime/FormController · CAP-04·07(주입점)·11·14·21·25·26

> hot-file 3종 전부 관통 — **전 태스크 순차**, fan-out 금지.

| id | 태스크 | 파일 | before → after | 증명 | Do-NOT |
|---|---|---|---|---|---|
| W2-1 | 훅 개명+`InitContext` 도입+EF7 값세터 이전 | `entity-form.ts:149-166,187-235`(withOnChanges/OnFetchData/OnInitialize→onChange/onInit 통합, setValue/setFetchedValue 제거) · `packages/state/src/initialize-form-store.ts:105-182`(step 4~5를 InitContext 기반으로: `{form, data?, values{get/set/setFetched}, setMeta, session?, renderType}`) · `packages/schema-core/src/__tests__/entity-form-value.test.ts` 재작성 | 스펙 §4.1 InitContext 그대로. onFetchData+onInitialize → `onInit` 1종(ctx.data 분기). **ctx.setMeta는 store 초기 meta seed로 축적**(createFormStore options에 `initialMeta?` 추가) | 기존 EF3/EF7 테스트의 행동 등가 재작성(초기화 순서·override 우선순위 hook.set > fetched > default 보존) + 신규: onInit에서 setMeta({hidden})→store.getMeta 반영 | **BIND→hooks→REBIND→build 순서 불변**(EF7 회귀 재현 금지). onInit는 save 후 재발화하지 않음 |
| W2-2 | FormMutator additive 확장 (§6.1) | `packages/schema-core/src/field/form-mutator.ts` + `packages/state/src/form-store.ts`(구현) | +`getRenderType(): RenderType` +`getSession(): Session \| undefined` | unit: onChange 핸들러에서 renderType 분기 | 기존 7멤버 시그니처 무변경 |
| W2-3 | `messages` 채널 (§6.1) | `form-store.ts:82,142`(formErrors→messages+3액션) · `ViewEntityForm.tsx:117,210-216`(배너 렌더) | `formErrors: string[]` → `messages: FormMessage[]` — 스펙 §6.1 형 그대로 | unit: add/remove/clear({includePersistent}) round-trip + 배너 렌더 테스트 | messages를 **필드 에러 저장소로 쓰지 않음**(필드 에러는 slice.errors) |
| W2-4 | `serializeValue` seam (§5.2) | `form-field.ts`(기본 구현 `{[name]: value}`) · `many-to-one-field.ts:55 인접`(override `{[idField]: id}`) · `form-store.ts:565-600` toSaveData 재작성(duck-cast :583 제거) | 스펙 §5.2 — **항상 keyed 맵 반환**, toSaveData는 병합+dotted 중첩만 | 기존 toSaveData 특성화 전량 green(M2O 평탄화·exceptOnSave·권한 제외 CAP-01 불변) + 신규: 커스텀 필드 serializeValue override | InlineMap/Datetime 등 객체값 필드의 자기-이름 중첩이 M2O 분기와 충돌하지 않음을 테스트로 고정 |
| W2-5 | `FormRuntime`(schema)+`createFormController`(state)+save/delete 훅 축+EF6 대체 | 신설 `packages/schema-core/src/form-runtime.ts`(FormRuntime/SaveOutcome/DeleteOutcome — adapter.ts의 BackendError 참조) · 신설 `packages/state/src/form-controller.ts` · `entity-form.ts`(onBeforeSave/onAfterSave/onBeforeDelete/onAfterDelete 4훅+**withSubmitTransform :168,297 제거**) · `packages/schema-core/src/__tests__/submit-transform.test.ts`(7건)+`packages/state/src/__tests__/store.test.ts:108,122` onBeforeSave로 재작성 · `apps/sample/lib/entities/collabo.ts:374`+`app/collabo/new/page.tsx` 이관 | 스펙 §6.2 플로우 **그대로**(순서: capability→validate→toSaveData→onBeforeSave→revision→adapter→에러매핑(name-키·suppress-generic)/성공(clear-on-success)→onAfterSave) | controller unit(성공/검증실패/cancel/서버 fieldErrors 매핑/suppress-generic/clear-on-success 각 1) + collabo E2E 유지 | schema가 /state를 import하지 않음(**FormRuntime은 schema 소유**, 검증 feasibility-1). onSave 전체 오버라이드 부활 금지 |
| W2-6 | list 훅 축 (§4) | `entity-form.ts`(onBeforeListFetch/onAfterListFetch) · `packages/state/src/list-store.ts:24,42-`(옵션 `entityForm?` + fetch 파이프에 훅 dispatch + `setSearchForm` 경로) | 스펙 §4.1 BeforeListFetchContext(**setSearchForm이 실주입 경로** — 검증 feasibility-4) | unit: onBeforeListFetch의 setSearchForm(filter 추가)가 adapter.list 도달 body에 반영 · onAfterListFetch setRows 반영 | SearchForm 불변성 유지(변형은 새 인스턴스) |
| W2-7 | `useEntityForm` (react, §7) | 신설 `packages/react/src/hooks/use-entity-form.ts`(기존 use-entity-form-initializer 계승+controller 동봉) + barrel + sample 페이지 전환 | `{store, entityForm, controller, loading, error}` 반환 | 렌더 테스트(cancellation-safe 계약 유지) + sample college 페이지가 controller.save 사용 | 기존 initializer 훅은 @deprecated 유지 1-wave 후 제거 |
| W2-8 | changeSelectOptions 배열-clause 레이스 fix (§Needs Review 처분 #27 전환) | `packages/schema-core/src/onchanges/change-select-options.ts` + 테스트 | 동일 필드를 겨냥한 2 clause에서 **unmatched revert가 matched apply를 clobber하지 못하게** — clause 평가를 2-pass(match 판정 후 일괄 적용, matched 필드는 revert 대상 제외)로 재작성 | unit: clause 순서 뒤집어도 settled options 동일(레이스 재현 테스트 red→green) | 빌더 공개 시그니처 무변경 |

**W2 종료 게이트**: full gate+E2E + CAP-04/11/14/21/25/26 대조 + "구 결함 원장 §1~9 중 이 wave가 봉인한 항목"(값세터 파편화·이중발화·view-실행 훅·inert formErrors) 각 1줄 증거.

## W3 — 권한·능력·액션 · CAP-02·03·06·08·09·22·27

| id | 태스크 | 핵심 파일 | 계약(스펙 §) | 증명 |
|---|---|---|---|---|
| W3-1 | 탭/그룹 requiredPermissions 소비+가시성 파생 | entity-form.ts(TabInput/GroupInput→TabDef/FieldGroupDef 보존) · ViewEntityForm(deriveTabs: isPermitted+hasVisibleContent — sync 근사는 blueprint 사전판정 GO) | §3.2, CAP-02·03 | unit: 무권한 탭/그룹/빈그룹 숨김 + E2E 1 |
| W3-2 | withCapabilities/getCapabilities+해석 | entity-form.ts · form-controller.ts(save/delete 게이트) · ViewEntityForm(빌트인 어포던스) | §3.4, CAP-06·22 | unit: 조건부(delete:(ctx)=>role) create/update/delete 각 게이트 |
| W3-3 | addAction/getActions+FormAction(render/className)+액션 바+slots | entity-form.ts · ViewEntityForm(빌트인 Save/Delete 파생+replaces 병합+visible/enabled 해석+render 슬롯) · slots {title,header,actions} | §3.4·§7, CAP-09 | unit: replaces:'save' 교체·visible 조건 숨김·render 커스텀 노드 + E2E 커스텀 버튼 1 |
| W3-4 | delete flow E2E | form-controller(이미 W2-5)+ViewEntityForm Delete 버튼+confirm(messages registry) | §6.2, CAP-08 | **E2E: College create→delete→목록에서 소멸** |
| W3-5 | withReadOnly+formReadOnly | entity-form.ts(§3.1) · form-store(seed) · FieldRenderer(effective OR) · M2O 자식 전파 | §3.1·§6.1, CAP-27 | unit: 전 필드 readOnly+Save 숨김 · **M2O 임베드된 child readOnly 폼 유지 테스트**(gjcu 패턴) — save 하드게이트 없음을 명시 테스트 |

## W4 — 폼 완결 · CAP-05·07·10·13·23

| id | 태스크 | 계약(스펙 §) | 증명 |
|---|---|---|---|
| W4-1 | withTitle/getTitle(항상 해석)+slots.title | §3.1 해석 체인 text→fromField→name필드→id→기본문구 | unit: 무인자 호출이 항상 비어있지 않은 문자열(구 `''` 버그 봉인) |
| W4-2 | withSteps 위저드+Stepper UI(create 모드) | §3.2 StepDef · clone 무손실(hidden step 보존) | unit: clone 후 getSteps 동일 + E2E 3-step 생성 흐름 1 |
| W4-3 | AsyncValidation+asyncState+버튼 어포던스 | §5.3 | unit: trigger 'change'(debounce)/'button' tri-state + E2E 중복확인 1 |
| W4-4 | withRevision 주입 | §3.1 — save payload+`adapter.remove(url, ids, revision?)` 시그니처 확장 | unit: 설정 시에만 주입·미설정 undefined(구 always-truthy 봉인) |
| W4-5 | withMeta/getMeta (merge) | §3.1 — shallow-merge·undefined 키 제거 | unit: 프리셋 2회 호출 합성(클로버 없음 — 검증 dx-6 봉인) |

## W5~W7 — 계약 수준 (wave-entry 브리핑 pass 필수)

**규칙**: W5~W7은 규모(구 list 생태계 ~10.3k LOC)와 선행 의존 때문에 지금 태스크 분해하면 스펙-드리프트가 생긴다. 각 wave 착수 시 **entry 브리핑 pass**(스펙 §5.1·§7·§2·§3.5 + [8그룹 map](../analysis/2026-07-11/eg-group-capability-maps.md)의 해당 그룹 인용)로 이 문서에 W3/W4급 태스크 표를 **먼저 추가·커밋**한 뒤 실행한다. 스펙에 없는 판단이 필요하면 스펙 개정이 선행(§10 게이트 4).

- **W5 list-track** (CAP-18·19·20): withList/withFilter(필드) → ViewListGrid 컬럼/정렬/필터 파생 → registerListCellRenderer/registerFilterRenderer → 고급검색 패널 → 페이지 셸 가이드(Wrapper 대응 — 마이그레이션 최대 항목). 참조 map: `LIST-TRACK`·구 ViewListGrid/AdvancedSearchForm.
- **W6 data-transfer** (CAP-16·17): withDataTransfer 표면(schema) → `/excel` subpath(DataExporter/Importer, xlsx optional) → ViewListGrid 툴바 opt-in. :448 대칭 코드 공유로 구조적 fix. 참조 map: `DATA TRANSFER/EXCEL`.
- **W7 패키징+마이그레이션** (CAP-24·25): `@rchemist/listgrid` subpath exports 맵·peers 재선언·headless fixture(React 0 빌드 테스트)·MIGRATION.md 0.3→0.4 전수표(스펙 §9 확장)+codemod 스크립트·adapter headers 함수형.

## 완료 정의 (전 wave)

스펙 §10 게이트 1~7 전부 + §8 CAP-01~29 전 행 소화/명시 이월 + 구 결함 원장 §1~9 봉인 증거표. GA 게이트(헌장 대조표)는 W7 뒤 별도 pass.
**wave 미할당 CAP 계정**: CAP-01·CAP-15(기출하/현행 유지 — 매 wave 회귀 게이트) · CAP-28(GA 대조표 pass) · CAP-29(descope — 대상 없음). 이 4행은 대조 시 "이월 아님·계정 완료"로 처리한다.
