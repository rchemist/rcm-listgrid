# ADR-0002 — 폼 상태: 인스턴스별 store + 셀렉터 구독 (값/메타 분리)

**Status**: accepted · **Date**: 2026-07-10 · **선행**: ADR-0007의 특성화 테스트 그물(P2), ADR-0003과 상호 참조
**근거**: raw/critique-architecture §2(3후보 비교 전문), raw/map-form-runtime · 검증: high 확정 (공수 수치는 의견)
**PRD 조건 C3의 절반.** 분석 판정: *"성패는 폼 상태 모델 재설계 하나에 달렸다."*

## Context — 문제의 정확한 좌표

폼 상태에 "저장소"가 없다. 화면 하나의 값·에러·dirty·탭이 전부 `useEntityFormLogic.ts:31`의 `useState<EntityForm>()` **가변 클래스 참조 하나**에 얹혀 있고, 반응형이 되려면 참조를 갈아야 한다. 세 트리거가 겹쳐 **"키 1타 = 폼 전체 재계산"**:

- (a) `FieldRenderer.tsx:86,250` — onChange마다 `entityForm.clone(true)` → `cloneWithEntityForm`(EntityForm.tsx:43-119)이 tabs/fields/collections 전체 딥클론 (필드 100개면 1타에 100개 인스턴스)
- (b) `ViewTabPanel.tsx:62` — `unmount={false}`로 비활성 탭 필드 상시 마운트
- (c) `FieldRenderer.tsx:178-350` — 주 useEffect deps가 `[entityForm]`이라 무관 필드까지 5개 안팎의 async 재계산(isRequired/isReadonly/tooltip/helpText/view)

**props drilling과 리렌더 폭발은 같은 뿌리다** — 상태 전파 채널이 참조 하나뿐이라, 드릴링은 그 참조를 손으로 나르는 것이고 리렌더 폭발은 모두가 그 참조를 구독하는 것이다. 중첩 재진입(ManyToOne 팝업/SubCollection 모달)은 매번 `useEntityFormLogic` 재초기화 + 재fetch.

## Decision — 후보 A 채택

**`createFormStore()` 팩토리로 폼 인스턴스마다 격리된 store**(zustand vanilla `createStore` — 이미 의존성에 있음)를 만들고 React Context로 서브트리에 주입한다.

1. **값/메타 분리 (선결 핵심)**: store에는 **값 슬라이스만** 담는다 — `fields: Record<name, {current, fetched, default, errors, dirty}>` + 폼 수준 상태(tabIndex, initialized, saving…). 필드 **메타**(validations/type/conditional 함수/렌더 정보)는 기존 클래스 인스턴스에 남긴다(거의 불변).
2. **셀렉터 구독**: `FieldRenderer`는 `useFormStore(s => s.fields[name])`으로 **자기 필드만** 구독. onChange는 `store.setValue(name, v)`로 해당 슬라이스만 immutable 갱신 — `clone(true)` 경로 소멸.
3. **드릴링 제거**: `entityForm`/`setEntityForm` prop 체인(ViewTabPanel:76 → ViewFieldGroup:73,300 → FieldRenderer:41)을 store Context로 대체.
4. **중첩 격리 계승**: 모달 재진입 시 자식은 자기 store를 새로 만든다(현행 "완전 독립 서브트리" 장점 유지). 부모 store를 **캐시로 전달**해 관련 엔티티 재fetch를 제거한다. 부모↔자식 통신은 현행 콜백 프로토콜(postSave) 유지.
5. **EntityForm 클래스의 역할 축소**: 선언 빌더(정의 시점) + 서버 I/O 오케스트레이션은 유지하되, **런타임 상태 보관자 역할을 store로 이관**. `clone()`은 선언 복제용으로만 남는다.

## 기각한 대안 (Do-NOT — 재론 금지)

- **후보 C: SubViewEntityForm 분리(유지보수자 원안)** — 렌더 분기를 컴포넌트 경계로 옮길 뿐, 딥클론·탭 마운트·광역 구독·드릴링·재진입 refetch 중 **어느 것도 해결하지 못한다**(적대적 검증 확정). A의 컴포넌트 정리 단계에서 부산물로 흡수.
- **후보 B: xstate 폼 상태 머신** — 수십 개 필드값은 "상태"가 아니라 "데이터"라 머신에 부적합. 값 store가 결국 따로 필요해 A와 중복, ROI 낮음(12~16pw). 흐름 제어(스텝 위저드/autoSave 분기)가 실제로 아플 때 A **위에** 선택 도입.
- **react-hook-form/TanStack Form 도입** — 폼 값만이 아니라 탭/서브컬렉션/권한/조건부 로직이 EntityForm 메타와 결합돼 있어 어댑팅 비용이 자체 store보다 큼. 값 슬라이스 설계는 이들의 구독 모델을 참고만 한다.

## Consequences

- (b) `unmount={false}`는 **유지해도 된다** — 셀렉터 구독으로 리렌더가 격리되면 마운트 비용만 남고 재계산이 사라진다(입력 상태 보존이라는 정당 사유도 있음).
- `executeOnChanges`(폼 수준 연쇄 로직)·검증은 store 액션 내부에서 메타 클래스에 위임 — 호스트가 보는 `OnChangeEntityForm` 시그니처는 유지한다(폼 표현 객체를 인자로 재구성해 전달).
- FieldRenderer의 async view() 재계산 useEffect는 "자기 필드 값 + 참조하는 조건 필드 값"만 deps로 갖도록 재작성 — 조건부 표시(다른 필드 의존)는 명시적 의존 필드 선언(`dependsOn`) 또는 폼 수준 파생 셀렉터로 해결.
- B3(FieldRenderer onChange 2벌 복제)는 이 재설계에서 자연 소멸 — P0에서 임시 통합만 해두면 됨.

## 구현 계획 (단계별 — opus 설계 감리 + sonnet 실행)

| 단계 | 작업 | 규모 |
|---|---|---|
| 0 | **특성화 테스트 그물**: useEntityFormLogic/FieldRenderer/저장 플로우의 현행 동작을 렌더 테스트로 고정 (현재 0건 — ADR-0007) | 2~3pw |
| 1 | `createFormStore()` + `FormStoreProvider` + `useFormStore` 셀렉터 훅 신설 (`src/listgrid/store/formStore.ts`) — 값 슬라이스 스키마 확정 | 1pw |
| 2 | 값/메타 분리: `FormField.value{current,fetched,default}` 읽기/쓰기를 store 경유로 전환하는 어댑터 계층 → EntityForm.initialize/setFetchedValues가 store를 채우도록 | 3~4pw |
| 3 | FieldRenderer 구독 전환 + onChange를 store 액션으로 + 드릴링 제거 | 2~3pw |
| 4 | 중첩 재진입: 자식 store 생성 + 부모 캐시 전달, ManyToOneView/SubCollectionModal 전환 | 1pw |
| 5 | 사후 정리: ViewEntityForm 컴포넌트 분해(후보 C 흡수), 죽은 setEntityForm 경로 제거 | 1pw |

합계 8~12pw (의견 — 실측으로 갱신할 것). 각 단계는 특성화 테스트 green을 유지한 채 독립 머지 가능해야 한다.

## 수용 기준

- [ ] 100필드 폼에서 키 입력 1회당 리렌더되는 FieldRenderer 수 = 1 (+파생 의존 필드) — 렌더 카운터 테스트로 고정
- [ ] onChange 경로에서 `EntityForm.clone` 호출 0회 (프로파일/스파이 테스트)
- [ ] 중첩 ManyToOne 팝업 열기 시 부모가 이미 가진 엔티티의 재fetch 0회
- [ ] 특성화 테스트 전량 green (동작 동등성) + 기존 930 테스트 green
- [ ] `entityForm`/`setEntityForm` props가 ViewTabPanel/ViewFieldGroup/FieldRenderer 시그니처에서 제거됨
