# EntityForm 공개 API 정상동작 감사 (신엔진 vs 구엔진)

> **생성 주체**: EntityForm API 감사 스카우트(sonnet, read-only, 2026-07-11). 사용자 지시 "EntityForm 제공 API 전수 정상동작"에 대한 갭 매트릭스. 구엔진 표면은 5개 mixin(EntityForm/EntityFormBase/Validation/Data/Actions/Extensions, ~130 공개 멤버) 전독. 인용 file:line은 이식 시 재확인.
> **Conductor 라우팅(이 문서 하단)**: inert 3건 즉시 수정(EF7 배치) · GAP-port는 사용자 결정 대기(delete flow·CRUD 플래그 등) · charter-GA 미슬라이스는 문서화 defer.

## 핵심 발견 — declared-but-INERT (사용자 지시 직접 위반)

| # | API | 선언 위치 | 실태 | 라우팅 |
|---|-----|----------|------|--------|
| 1 | **`formErrors`** | FormStoreState `form-store.ts:82`, 렌더 `ViewEntityForm.tsx:117,210-216` | `:372`에서 `[]` 초기화 후 **어디서도 assign 안 됨**(전 packages grep) — 폼레벨/서버 에러 UX 불능 | **GAP-fix** EF7배치 |
| 2 | **`EntityField.isPermitted()`** | 전 필드 `entity-field.ts:58-59`·`form-field.ts:105-106`, backing `permission.ts` | FieldRenderer는 isHidden/isRequired/isReadonly만 resolve(`:62-71`), **isPermitted 절대 호출 안 함**(react/state grep 0) → **권한 기반 필드/탭 숨김 전무**(보안 관련 — 목적 빌트 primitive가 죽어있음) | **GAP-fix** EF7배치 |
| 3 | **`withNeverDelete()`/`isNeverDelete()`** | `entity-form.ts:139-142,234-236` | 구는 real behavior(active 필드 제거+modify-only 재추가+onInitialize hide 훅, `EntityFormActions.tsx:510-533`). 신은 boolean set/get만·side effect 0 | **honest 처리** — delete flow(미구현) gate 개념과 묶어 문서화(가짜 구현 대신) |

## EF7 갭 — **EF3 파이프 순서 회귀 (내가 만든 것, 사용자 지적 2026-07-11)**

**정정**: 최초 "setValue는 아키텍처상 불가·withFetchDataTransform 신설"은 **틀림**. 실제:
- `EntityForm.setValue`/`setFetchedValue`는 **구 EntityForm에 존재**(EntityForm.tsx:135,534) — 이식 누락일 뿐.
- 구 `initialize()`(EntityForm.tsx:162-306) 순서 = **fetch → setFetchedValues(:181, 값 바인딩) → onInitialize(:257, 바인딩값 override 가능) → 동적필드 rebind(:268-302) → build**. onInitialize가 fetched를 override하는 게 정상.
- EF3가 이를 **hooks→build→hydrate(clobber)**로 뒤집어(`initialize-form-store.ts:99-115`) onInitialize가 값을 못 이기게 만든 **회귀**. "fetched wins 충돌"이란 기각 논리도 오류 — onInitialize는 override 수단이라 이겨야 정상.

**올바른 수정(구 순서 복원)**: ① `EntityForm.setValue(name,value)`/`setFetchedValue` 이식. ② 파이프 재정렬 — clone(true) → fetch(data) → **값 바인딩(fetched가 선언 default override)** → onFetchData(ef,data)[setValue 가능] → onInitialize(ef,session)[setValue로 override] → 동적필드 rebind(retained data) → createFormStore(최종 값 seed, data 보존=EF4 런타임 addField용). ③ init 경로에서 clobbering hydrate 제거(hydrate() public 메서드는 명시적 재hydration용으로 존치). 우선순위 **hook.setValue > fetched > default**(바인딩을 hooks 앞에 둠). **withFetchDataTransform 신설 안 함** — onFetchData/onInitialize를 실제 값-변형 가능하게 만드는 것으로 대체.

## GAP-port (미이식·필요 — 임팩트순, **사용자 결정 대기**)

1. **Delete flow** — `BackendAdapter.remove` 선언(`adapter.ts:37`)이나 **콜사이트 0**(library·sample 전무). ViewEntityForm에 delete 버튼/onDelete prop 없음. 최고 임팩트 미구현 CRUD.
2. **manageEntityForm CRUD 플래그** (`isCreatable/isUpdatable/isDeletable`, `Validation.tsx:121-151`) — Save/Delete 어포던스 role/state gate. 현재 Save 무조건 제공.
3. **탭/필드그룹 권한 가시성** (`getViewableTabs`/`isViewableFieldGroup` 상당) — GAP-fix #2(isPermitted 배선) 선행 의존.
4. **서버 검증 에러→필드 매핑** (`withErrors`/`getErrorMap` 상당, `Validation.tsx:37-119`) — save 실패가 필드에 안 실림.
5. **`withButtons`/`headerArea`** — ViewEntityForm이 Save 단일 하드코딩(`:218-220`). 커스텀 액션 불가.
6. sugar: `withHelpText(name,)`/`withTooltip(name,)`(필드레벨 존재·폼 one-liner만 부재)·`withUrl`/`withMenuUrl`·`hasField`/`hasTab` — 저효율, 우회 존재.
7. `withCheckDuplicate`/`CheckButtonValidationField` — 미이식(Link/중복확인 필드 EA wave 시).

## OK (superseded — 정상, 재확인)

save(host-owned, charter C7 — page가 adapter 직접 호출, `college/[id]/page.tsx:39-42`)·validate(validateField/All)·withOverrideSubmitData(→EF6)·withRequired/Readonly/Options/Hidden(→store.setMeta EF1, 더 강력)·SubCollection(단일 fields 배열 통합)·session 스레딩·withShouldReload(**dead 확인** — structureVersion 대체, grep 0)·isAbleFetch/getFetchUrl(→adapter.getOne gating).

## defer-documented (미이식·charter/스코프 밖 — 정직한 부재)

- **Data transfer/Excel** (`withDataTransferConfig`+) — charter **C6** named, E-track 슬라이스 밖(필드-parity+라이프사이클만).
- **List-track** (`getListFields`/advanced-search/`onFetchListData`) — ViewListGrid 자체 별도 슬라이스("Deliberately minimal... not this V0.4 slice").
- **Client extension system** (14멤버 withClientPre/Post*) — charter 무명명, EF2/3/6이 문서화 확장면 커버. 실사용 확인 후 판단.
- **Multi-step wizard**(`withCreateStep`)·**revision**(`withRevisionEntityName`) — charter **C6** named, 미구현 — charter 갭으로 로그.
- **Alert messages**·**attribute bags** — charter 무명명 escape hatch, 소비자 니즈 시.
- `withFieldToLayout` — cosmetic, 후속 없음.

## Conductor 결정

- **즉시(EF7 배치, sonnet 위임)**: inert 1·2 배선(formErrors·isPermitted end-to-end) + EF7 seam(withFetchDataTransform) + neverDelete honest 문서화. → 신엔진이 **현재 노출한** 라이프사이클/권한/에러 API가 실제 동작하게 만드는 것 = 지시의 직역.
- **사용자 결정 대기**: GAP-port(delete flow·CRUD 플래그·buttons·서버에러매핑) — "노출 안 된" 기능 신설이라 스코프 확장. 임팩트순 백로그 제시.
- **문서화 defer**: charter-GA 미슬라이스(data-transfer·wizard·revision·list-track·client-ext) — 정직한 부재로 §Backlog 로그.
